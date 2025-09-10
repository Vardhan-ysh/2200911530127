import { prisma } from '../models/store';
import { generateShortcode, isValidShortcode } from '../utils/shortcode';
import type { Logger } from '../../logging-middleware/dist/index';

export interface CreateReq {
  url: string;
  validity?: number;
  shortcode?: string;
}

export class UrlService {
  constructor(private logger: Logger) {}

  private now() { return new Date(); }

  private expiryFromMinutes(mins?: number) {
    const m = (!mins || isNaN(mins) || mins <= 0) ? 30 : mins;
    return new Date(this.now().getTime() + m * 60 * 1000);
  }

  async create({ url, validity, shortcode }: CreateReq, baseUrl: string): Promise<{ shortLink: string; expiry: string; code: string; }>{
    try {
      try { new URL(url); } catch { throw { status: 400, code: 'INVALID_URL', msg: 'url must be a valid URL' }; }

      let code = shortcode?.trim();
      if (code) {
        if (!isValidShortcode(code)) throw { status: 400, code: 'INVALID_SHORTCODE', msg: 'shortcode must be alphanumeric 4-32 chars' };
        const exists = await prisma.url.findUnique({ where: { shortcode: code } });
        if (exists) throw { status: 409, code: 'SHORTCODE_TAKEN', msg: 'shortcode already in use' };
      } else {
        let tries = 0;
        do {
          code = generateShortcode();
          tries++;
        } while (await prisma.url.findUnique({ where: { shortcode: code! } }) && tries < 5);
        while (await prisma.url.findUnique({ where: { shortcode: code! } })) code = generateShortcode(8);
      }

      const expiresAt = this.expiryFromMinutes(validity);
      const created = await prisma.url.create({
        data: {
          shortcode: code!,
          url,
          createdAt: this.now(),
          expiresAt: expiresAt,
        },
      });
      await this.logger.log('backend','info','service',`created shortcode=${code}`);
      return { shortLink: `${baseUrl}/${code}`, expiry: expiresAt.toISOString(), code: code! };
    } catch (e: any) {
      await this.logger.log('backend','error','service',`create_failed ${(e && e.code) || 'ERR'} ${(e && e.msg) || e}`);
      if (e && e.status) throw e;
      throw { status: 500, code: 'INTERNAL', msg: 'internal error' };
    }
  }

  async getStats(code: string) {
    const rec = await prisma.url.findUnique({
      where: { shortcode: code },
      include: { clicks: true },
    });
    if (!rec) throw { status: 404, code: 'NOT_FOUND', msg: 'shortcode not found' };
    return {
      shortcode: rec.shortcode,
      originalUrl: rec.url,
      createdAt: rec.createdAt,
      expiry: rec.expiresAt,
      totalClicks: rec.clicks.length,
      clicks: rec.clicks.map(c => ({ ts: c.ts, referrer: c.referrer, location: c.location })),
    };
  }

  async resolveAndTrack(code: string, referrer?: string, location?: string) {
    const rec = await prisma.url.findUnique({ where: { shortcode: code } });
    if (!rec) throw { status: 404, code: 'NOT_FOUND', msg: 'shortcode not found' };
    if (rec.expiresAt < this.now()) throw { status: 410, code: 'EXPIRED', msg: 'link expired' };
    await prisma.click.create({
      data: {
        urlId: rec.id,
        ts: new Date(),
        referrer,
        location,
      },
    });
    const totalClicks = await prisma.click.count({ where: { urlId: rec.id } });
    await this.logger.log('backend','info','service',`redirect code=${code} clicks=${totalClicks}`);
    return rec.url;
  }
}
