import { copyFile, lstat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { checkOutputFiles, checkPublic, getSiteUrl, projectRoot, publicAssets, publicRoot } from './check-public.mjs';

try {
  const siteUrl = getSiteUrl();
  const { launchPage } = await import('../src/launch-page.mjs');
  const html = launchPage({ siteUrl });
  const copies = [
    ...publicAssets.map(name => [`src/assets/${name}`, `assets/${name}`]),
    ['src/styles/launch.css', 'assets/launch.css'],
    ['src/launch.js', 'assets/launch.js'],
  ];
  for (const [source] of copies) {
    if (!(await lstat(path.join(projectRoot, source))).isFile()) throw new Error(`일반 소스 파일이 아닙니다: ${source}`);
  }
  await checkOutputFiles(publicRoot, { complete: false });
  console.log('✔ [1/4] 공개 소스와 출력 허용 목록 확인');

  await mkdir(path.join(publicRoot, 'assets'), { recursive: true });
  for (const [source, destination] of copies) await copyFile(path.join(projectRoot, source), path.join(publicRoot, destination));
  console.log(`✔ [2/4] 공개 자산 ${copies.length}개 복사`);

  const homePath = new URL(siteUrl).pathname.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  await writeFile(path.join(publicRoot, 'index.html'), html);
  await writeFile(path.join(publicRoot, '404.html'), `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>페이지를 찾을 수 없습니다 · MicroAXLab</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f3e8;color:#142f24;font-family:system-ui,sans-serif}main{max-width:32rem;padding:2rem}p{line-height:1.7}a{display:inline-block;margin-top:1rem;color:inherit;font-weight:700}</style></head><body><main><p>MicroAXLab</p><h1>페이지를 찾을 수 없습니다.</h1><p>주소가 바뀌었거나 잘못 입력되었을 수 있습니다.<br>홈페이지에서 가게에 필요한 도움을 살펴보세요.</p><a href="${homePath}">홈페이지로 돌아가기 →</a></main></body></html>\n`);
  await writeFile(path.join(publicRoot, '.nojekyll'), '');
  await writeFile(path.join(publicRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
  await writeFile(path.join(publicRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
  console.log('✔ [3/4] 홈페이지 · 404 · 검색용 파일 생성');

  const result = await checkPublic({ siteUrl });
  console.log(`✔ [4/4] 공개 파일 ${result.files}개 · 참조 ${result.references}개 확인 — out/public`);
} catch (error) {
  console.error(`✖ 프로덕션 빌드 | ${error.message} | 누락된 소스나 출력 경로를 확인한 뒤 다시 실행하세요.`);
  process.exitCode = 1;
}
