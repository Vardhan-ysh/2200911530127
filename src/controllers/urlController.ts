import { Request, Response } from 'express';
import { UrlService } from '../services/urlService';
import type { Logger } from '../../logging-middleware/src/index';

export function createShortUrlHandler(logger: Logger) {
  const svc = new UrlService(logger);
  return async (req: Request, res: Response) => {
    try {
      const { url, validity, shortcode } = req.body || {};
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const result = await svc.create({ url, validity, shortcode }, baseUrl);
      res.status(201).json({ shortLink: result.shortLink, expiry: result.expiry });
    } catch (e: any) {
      const status = e?.status || 500;
      const message = e?.msg || 'internal error';
      await logger.log('backend','error','handler',`create_shorturl_failed status=${status} msg=${message}`);
      res.status(status).json({ error: message, code: e?.code || 'INTERNAL' });
    }
  };
}

export function getStatsHandler(logger: Logger) {
  const svc = new UrlService(logger);
  return async (req: Request, res: Response) => {
    try {
      const { shortcode } = req.params as { shortcode: string };
      const stats = await svc.getStats(shortcode);
      res.json(stats);
    } catch (e: any) {
      const status = e?.status || 500;
      const message = e?.msg || 'internal error';
      await logger.log('backend','error','handler',`get_stats_failed status=${status} code=${e?.code}`);
      res.status(status).json({ error: message, code: e?.code || 'INTERNAL' });
    }
  };
}

export function redirectHandler(logger: Logger) {
  const svc = new UrlService(logger);
  return async (req: Request, res: Response) => {
    try {
      const { shortcode } = req.params as { shortcode: string };
      const ref = req.get('referer') || req.get('referrer') || undefined;
    
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
      const location = ip ? `ip:${ip.substring(0, 7)}*` : undefined;
      const url = await svc.resolveAndTrack(shortcode, ref, location);
      res.redirect(302, url);
    } catch (e: any) {
      const status = e?.status || 500;
      const message = e?.msg || 'internal error';
      await logger.log('backend','warn','handler',`redirect_failed status=${status} code=${e?.code}`);
      res.status(status).json({ error: message, code: e?.code || 'INTERNAL' });
    }
  };
}
