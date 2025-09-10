import { Router } from 'express';
import { createShortUrlHandler, getStatsHandler } from '../controllers/urlController';
import type { Logger } from '../../logging-middleware/src/index';

export default function urlRoutes(logger: Logger) {
  const router = Router();
  router.post('/', createShortUrlHandler(logger));
  router.get('/:shortcode', getStatsHandler(logger));
  return router;
}
