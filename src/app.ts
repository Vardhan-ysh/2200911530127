
import express from 'express';
import urlRoutes from './routes/urlRoutes';
import { redirectHandler } from './controllers/urlController';
import { Logger, createRequestLogger } from '../logging-middleware/dist/index';

const AUTH_TOKEN = process.env.LOGGER_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ5YXNodmFyZGhhbnNpbmdoMTEyMjMzQGdtYWlsLmNvbSIsImV4cCI6MTc1NzQ5MjEyNywiaWF0IjoxNzU3NDkxMjI3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZmQ2ZDcyOTgtZmFmMS00MjY1LWE1ODUtN2JmYzRhNDZiNDlkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoieWFzaHZhcmRoYW4gc2luZ2ggY2hhbmRlbCIsInN1YiI6IjczYTdhZjY5LTVhODAtNGI3OC1iYmRiLTVkZDVkMzQ3NjQ2OSJ9LCJlbWFpbCI6Inlhc2h2YXJkaGFuc2luZ2gxMTIyMzNAZ21haWwuY29tIiwibmFtZSI6Inlhc2h2YXJkaGFuIHNpbmdoIGNoYW5kZWwiLCJyb2xsTm8iOiIyMjAwOTExNTMwMTI3IiwiYWNjZXNzQ29kZSI6Ik5Xa3RCdSIsImNsaWVudElEIjoiNzNhN2FmNjktNWE4MC00Yjc4LWJiZGItNWRkNWQzNDc2NDY5IiwiY2xpZW50U2VjcmV0IjoiQktNVFB4YnVuc2ZQcGJjTiJ9.qg_UdpKOlKbumRbgx5r0-hv-PvPOcu3aLXh956XD9Sg';

const logger = new Logger({ authToken: AUTH_TOKEN });

const app = express();
app.use(express.json());
app.use(createRequestLogger(logger));

// Mount /shorturls API
app.use('/shorturls', urlRoutes(logger));

// Redirection handler for /:shortcode
app.get('/:shortcode', redirectHandler(logger));

// Health check
app.get('/', (req, res) => res.json({ status: 'ok' }));

// Start server if run directly
if (require.main === module) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		logger.log('backend','info','service',`Server started on port ${PORT}`);
		// eslint-disable-next-line no-console
		// console.log(`Server running on port ${PORT}`);
	});
}

export default app;
