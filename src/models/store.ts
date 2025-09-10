export interface ClickEvent {
  ts: string; 
  referrer?: string;
  location?: string;
}

export interface UrlRecord {
  shortcode: string;
  url: string;
  createdAt: string; 
  expiresAt: string; 
  clicks: ClickEvent[];
}

class InMemoryStore {
  private byCode: Map<string, UrlRecord> = new Map();

  get(code: string) { return this.byCode.get(code); }
  has(code: string) { return this.byCode.has(code); }
  set(rec: UrlRecord) { this.byCode.set(rec.shortcode, rec); }
}

export const store = new InMemoryStore();
