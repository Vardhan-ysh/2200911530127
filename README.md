URL Shortener Microservice (Backend Track)

## Steps

1. Install dependencies:
	npm install

2. Build the project:
	npm run build

3. Start the server:
	npm start

4. Test endpoints (e.g. with Postman or curl):
	- Health: `GET http://localhost:3000/`
	- Create: `POST http://localhost:3000/shorturls`
	- Stats: `GET http://localhost:3000/shorturls/:shortcode`
	- Redirect: `GET http://localhost:3000/:shortcode`