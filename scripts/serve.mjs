import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const option = (name, fallback) => {
  const position = process.argv.indexOf(`--${name}`);
  return position < 0 ? fallback : process.argv[position + 1];
};
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(projectRoot, process.env.SERVE_ROOT || option('root', 'dist'));
const port = Number(process.env.PORT || option('port', '4188'));
const basePath = `/${(process.env.BASE_PATH || option('base', '/')).replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };

function sendFile(req, res, file, info, status = 200) {
  const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
  let start = 0;
  let end = info.size - 1;
  if (req.headers.range && status === 200) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
    } else start = info.size;
    if (start > end || start < 0 || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      res.writeHead(416, { ...headers, 'Content-Range': `bytes */${info.size}` });
      res.end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1);
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || info.size === 0) res.end();
  else createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (basePath !== '/' && pathname === basePath.slice(0, -1)) {
      res.writeHead(308, { Location: `${basePath}${url.search}` });
      res.end();
      return;
    }
    if (!pathname.startsWith(basePath)) throw new Error('base path');
    const target = path.resolve(root, pathname.slice(basePath.length));
    if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const directory = (await stat(target)).isDirectory();
    if (directory && !pathname.endsWith('/')) {
      res.writeHead(308, { Location: `${url.pathname}/${url.search}` });
      res.end();
      return;
    }
    const file = await realpath(directory ? path.join(target, 'index.html') : target);
    const resolvedRoot = await realpath(root);
    if (!file.startsWith(resolvedRoot + path.sep)) { res.writeHead(403); res.end(); return; }
    sendFile(req, res, file, await stat(file));
  } catch {
    try {
      const file = path.join(root, '404.html');
      sendFile(req, res, file, await stat(file), 404);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : '페이지를 찾을 수 없습니다.');
    }
  }
});
server.on('error', error => { console.error(`✖ 로컬 서버 | ${error.code} | PORT=다른포트로 다시 실행하세요.`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`✔ [1/1] 로컬 미리보기: http://127.0.0.1:${port}${basePath} (${path.relative(projectRoot, root)})`));
