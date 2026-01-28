import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'], // Adjust origins as needed
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.get('/', (c) => {
  return c.text('Hello World from Resume Builder Backend!');
});

export default app;