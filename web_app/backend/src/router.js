import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello World from Resume Builder Backend!');
});

export default app;