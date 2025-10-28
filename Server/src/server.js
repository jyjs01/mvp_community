import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';

const server = createServer(app);
server.listen(env.PORT, () => console.log(`서버 실행 : http://localhost:${env.PORT}`));
