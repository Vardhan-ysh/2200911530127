
export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type Pkg = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service' | 'auth' | 'config' | 'middleware' | 'utils';

export interface LoggerConfig {
  authToken: string; 
  endpoint?: string;
}

export class Logger {
  private endpoint: string;
  private token: string;

  constructor(cfg: LoggerConfig) {
    this.endpoint = cfg.endpoint ?? 'http://20.244.56.144/evaluation-service/logs';
    this.token = cfg.authToken;
  }

  async log(stack: Stack, level: Level, pkg: Pkg, message: string): Promise<void> {

    const validStacks: Stack[] = ['backend', 'frontend'];
    const validLevels: Level[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const validPkgs: Pkg[] = ['cache','controller','cron_job','db','domain','handler','repository','route','service','auth','config','middleware','utils'];

    if (!validStacks.includes(stack)) throw new Error('invalid stack');
    if (!validLevels.includes(level)) throw new Error('invalid level');
    if (!validPkgs.includes(pkg)) throw new Error('invalid package');

    try {
  const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ stack, level, package: pkg, message })
      });

      if (!res.ok) {
        
      }
    } catch {
     
    }
  }
}


export function createRequestLogger(logger: Logger) {
  return function requestLogger(req: any, res: any, next: any) {
    const start = Date.now();
    const id = Math.random().toString(36).slice(2, 10);
    logger.log('backend','info','middleware',`req ${id} ${req.method} ${req.originalUrl}`);
    res.on('finish', () => {
      const ms = Date.now() - start;
      logger.log('backend','info','middleware',`res ${id} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  };
}

export default Logger;
