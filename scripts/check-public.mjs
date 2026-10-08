import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const publicRoot = path.join(projectRoot, 'out/public');
export const publicAssets = [
  'PretendardVariable.woff2', 'Pretendard-LICENSE.txt', 'favicon.svg',
  'founder.jpg', 'gukbap-kitchen.jpg', 'gukbap-bowl.jpg',
  'gimbap-plate.jpg', 'jokbal-board.jpg',
  'microaxlab_food_v2.mp4', 'microaxlab_food_v2_poster.jpg',
  'gukbap_promo.mp4', 'gukbap_promo_poster.jpg', 'social-preview.jpg',
];
const publicFiles = new Set([
  'index.html', '404.html', '.nojekyll', 'robots.txt', 'sitemap.xml',
  'assets/launch.css', 'assets/launch.js',
  ...publicAssets.map(name => `assets/${name}`),
]);

export function getSiteUrl(value = process.env.SITE_URL || 'https://seolcoding.github.io/microaxlab/') {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL은 쿼리나 계정 정보가 없는 http(s) 주소여야 합니다.');
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url.href;
}

// 허용하지 않은 파일은 삭제하지 않고 중단합니다. 배포 폴더에 다른 자료가 섞이지 않게 합니다.
export async function checkOutputFiles(root = publicRoot, { complete = true } = {}) {
  const found = [];
  async function walk(relative = '') {
    const directory = path.join(root, relative);
    const info = await lstat(directory).catch(error => {
      if (error.code === 'ENOENT' && !relative && !complete) return null;
      throw error;
    });
    if (!info) return;
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`출력 폴더가 일반 폴더가 아닙니다: ${relative || 'out/public'}`);
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory() && name === 'assets') {
        await walk(name);
      } else if (entry.isFile() && publicFiles.has(name)) {
        found.push(name);
        if (complete && name !== '.nojekyll' && (await lstat(path.join(root, name))).size === 0) {
          throw new Error(`빈 공개 파일: ${name}`);
        }
      } else {
        throw new Error(`허용 목록 밖의 파일 또는 링크: ${name}. 이 항목을 출력 폴더 밖으로 옮긴 뒤 다시 빌드하세요.`);
      }
    }
  }
  await walk();
  if (complete) {
    const missing = [...publicFiles].filter(name => !found.includes(name));
    if (missing.length) throw new Error(`공개 파일 누락: ${missing.join(', ')}`);
  }
  return found;
}

const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(match => [match[1].toLowerCase(), decode(match[3])]));
}

export async function checkPublic({ root = publicRoot, siteUrl = getSiteUrl() } = {}) {
  const files = await checkOutputFiles(root);
  const base = new URL(siteUrl);
  const documents = new Map();
  let references = 0;
  for (const name of ['index.html', '404.html', 'assets/launch.css', 'assets/launch.js', 'robots.txt', 'sitemap.xml']) {
    const content = await readFile(path.join(root, name), 'utf8');
    if (/(?:\/Users\/|file:\/\/|_workspace\/|brag-output|\.agents\/|videos\/|dist\/|motion-review|concepts\/|tangerines_demo|shop_story_motion|microaxlab_brand_motion)/i.test(content)) {
      throw new Error(`내부 작업 경로나 이전 검수 자료 참조가 있습니다: ${name}`);
    }
    documents.set(name, content);
  }

  function checkReference(reference, from) {
    if (!reference || /^(?:mailto:|tel:|data:)/i.test(reference)) return;
    const target = new URL(reference, new URL(from, base));
    if (!['https:', 'http:'].includes(target.protocol)) throw new Error(`지원하지 않는 참조: ${from} → ${reference}`);
    if (target.origin !== base.origin) return;
    if (!target.pathname.startsWith(base.pathname)) throw new Error(`프로젝트 하위 경로를 벗어난 참조: ${from} → ${reference}`);
    let local = decodeURIComponent(target.pathname.slice(base.pathname.length));
    if (!local || local.endsWith('/')) local += 'index.html';
    if (!files.includes(local)) throw new Error(`참조 파일 누락: ${from} → ${reference}`);
    if (target.hash && local.endsWith('.html')) {
      const ids = [...documents.get(local).matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)].map(match => match[2]);
      if (!ids.includes(decodeURIComponent(target.hash.slice(1)))) throw new Error(`이동할 섹션 누락: ${from} → ${reference}`);
    }
    references++;
  }

  for (const name of ['index.html', '404.html']) {
    for (const tag of documents.get(name).match(/<[^!][^>]*>/g) || []) {
      const attrs = attributes(tag);
      for (const key of ['href', 'src', 'poster']) if (attrs[key]) checkReference(attrs[key], name);
      if (attrs.srcset) for (const item of attrs.srcset.split(',')) checkReference(item.trim().split(/\s+/)[0], name);
    }
  }
  for (const match of documents.get('assets/launch.css').matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
    checkReference(match[1], 'assets/launch.css');
  }

  const html = documents.get('index.html');
  const tags = (html.match(/<(?:meta|link)\b[^>]*>/gi) || []).map(attributes);
  const meta = (key, value) => tags.find(tag => tag[key] === value)?.content;
  if (!/<html\b[^>]*\blang=["']ko["']/i.test(html) || !/<title>[^<]+<\/title>/i.test(html)) throw new Error('한국어 문서 언어 또는 페이지 제목이 없습니다.');
  if (!meta('name', 'description') || !meta('name', 'viewport')) throw new Error('description 또는 viewport 메타가 없습니다.');
  if (tags.find(tag => tag.rel === 'canonical')?.href !== siteUrl || meta('property', 'og:url') !== siteUrl) throw new Error('canonical 또는 og:url이 SITE_URL과 다릅니다.');
  if (!meta('property', 'og:title') || !meta('property', 'og:description')) throw new Error('공유용 제목 또는 설명이 없습니다.');
  const shareImage = meta('property', 'og:image');
  if (shareImage !== new URL('assets/social-preview.jpg', base).href) throw new Error('공유 이미지의 절대 주소가 올바르지 않습니다.');
  checkReference(shareImage, 'index.html');
  if (/noindex|nofollow/i.test(meta('name', 'robots') || '')) throw new Error('공개 홈페이지에 검색 제외 메타가 남아 있습니다.');
  if (!documents.get('sitemap.xml').includes(`<loc>${siteUrl}</loc>`)) throw new Error('사이트맵 주소가 SITE_URL과 다릅니다.');
  if (!documents.get('robots.txt').includes(`Sitemap: ${new URL('sitemap.xml', base).href}`)) throw new Error('robots.txt의 사이트맵 주소가 올바르지 않습니다.');
  return { files: files.length, references, siteUrl };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await checkPublic();
    console.log(`✔ [1/1] 공개 파일 ${result.files}개 · 참조 ${result.references}개 · 메타/하위 경로 확인`);
  } catch (error) {
    console.error(`✖ 공개 산출물 검사 | ${error.message} | 소스를 수정한 뒤 npm run build를 다시 실행하세요.`);
    process.exitCode = 1;
  }
}
