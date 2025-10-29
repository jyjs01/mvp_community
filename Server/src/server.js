import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';

function nowKST() {
  const d = new Date();
  const p = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).formatToParts(d);
  const g = Object.fromEntries(p.map(x => [x.type, x.value]));
  return `${g.year}-${g.month}-${g.day} ${g.hour}:${g.minute}:${g.second}`;
}


const server = createServer(app);
server.listen(env.PORT, () => console.log(`서버 실행 ${nowKST()}`));
