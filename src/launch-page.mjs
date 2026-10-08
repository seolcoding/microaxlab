import { content } from './launch-content.mjs';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const lines = (value) => escape(value).replace(/\r?\n/g, '<br> ');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowUp = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const check = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 10 3 3 7-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brand = '<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="brand-name">Micro<span>AX</span>Lab<span class="brand-period">.</span></span>';

function video({ id, file, poster, label, caption }) {
  return `<div class="video-frame">
    <video id="${id}" controls playsinline preload="none" poster="./assets/${poster}" aria-label="${escape(label)}" aria-describedby="${id}-caption">
      <source src="./assets/${file}" type="video/mp4">
      <p>이 브라우저에서는 영상을 재생할 수 없습니다. <a href="./assets/${file}">영상 파일 열기</a></p>
    </video>
  </div><p class="media-note" id="${id}-caption">${escape(caption)}</p>`;
}

export function launchPage({ siteUrl = 'https://microaxlab.com/' } = {}) {
  const canonical = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).href;
  const absolute = (path) => new URL(path, canonical).href;
  const title = 'MicroAXLab | 우리 가게를 위한 작은 AI 도움';
  const description = '가게의 작은 불편부터, 현장에서 함께. 부산의 소상공인을 위한 짧은 홍보영상과 한 가지 업무 개선을 준비합니다. 대표 설코딩이 직접 찾아가 듣겠습니다.';
  const email = content.contact.email;
  const mailto = `mailto:${email}?subject=${encodeURIComponent('[MicroAXLab] 우리 가게 이야기')}`;
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MicroAXLab',
    url: canonical,
    logo: absolute('./assets/favicon.svg'),
    email,
    description,
    founder: { '@type': 'Person', name: '설동헌', alternateName: '설코딩' },
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f1e8">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <link rel="canonical" href="${escape(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="MicroAXLab">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(canonical)}">
  <meta property="og:image" content="${escape(absolute('./assets/social-preview.jpg'))}">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:alt" content="MicroAXLab, 우리 가게를 위한 작은 AI 도움. 음식 사진은 AI 생성 연출 예시입니다.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  <meta name="twitter:image" content="${escape(absolute('./assets/social-preview.jpg'))}">
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="./assets/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="./assets/launch.css">
  <script src="./assets/launch.js" defer></script>
  <script type="application/ld+json">${schema}</script>
</head>
<body>
  <a class="skip-link" href="#main">본문으로 바로 가기</a>
  <header class="site-header" data-header>
    <div class="header-inner container">
      <a class="brand" href="./" aria-label="MicroAXLab 홈">${brand}</a>
      <nav class="site-nav" id="site-navigation" aria-label="주 메뉴" data-site-nav>
        <a href="#examples">영상 예시</a>
        <a href="#services">받을 수 있는 도움</a>
        <a href="#process">진행 방법</a>
        <a href="#about">대표 소개</a>
      </nav>
      <a class="header-contact" href="#contact">이야기 나누기 ${arrowUp}</a>
      <button class="menu-toggle" type="button" aria-controls="site-navigation" aria-expanded="false" aria-label="메뉴 열기" data-menu-toggle hidden>
        <span></span><span></span>
      </button>
    </div>
  </header>

  <main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-grid container">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>${escape(content.hero.eyebrow)}</p>
          <h1 id="hero-title">${content.hero.title.map((line) => `<span>${lines(line)}</span>`).join('\n')}</h1>
          <p class="hero-description">${lines(content.hero.body)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#contact">${escape(content.hero.primaryAction)} ${arrowUp}</a>
            <a class="text-link" href="#examples">${escape(content.hero.secondaryAction)} ${arrow}</a>
          </div>
          <p class="hero-note">${lines(content.hero.note)}</p>
        </div>
        <figure class="hero-figure">
          <div class="hero-photo">
            <img src="./assets/gukbap-kitchen.jpg" alt="국밥을 준비하는 바쁜 주방을 표현한 AI 생성 연출 이미지" width="1672" height="941" fetchpriority="high">
            <div class="photo-message" aria-hidden="true"><span>매일 정성을 다하는 가게에</span><strong>작은 도움이 닿도록.</strong></div>
          </div>
          <figcaption>AI 생성 연출 이미지 · 실제 가게나 고객 사례가 아닙니다.</figcaption>
        </figure>
      </div>
      <div class="hero-foot container">
        <p><span class="status-dot" aria-hidden="true"></span>부산 부전시장, 첫 10개 점포 시범 운영 준비 중</p>
        <a href="#intro">가게의 하루에서 시작합니다 <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <section class="intro section" id="intro" aria-labelledby="intro-title">
      <div class="container intro-grid">
        <div>
          <p class="eyebrow">${escape(content.intro.eyebrow)}</p>
          <h2 id="intro-title">${lines(content.intro.title)}</h2>
        </div>
        <div class="intro-body"><p>${lines(content.intro.body)}</p><span class="intro-rule" aria-hidden="true"></span></div>
      </div>
    </section>

    <section class="examples section" id="examples" aria-labelledby="examples-title">
      <div class="container">
        <div class="section-heading">
          <div><p class="eyebrow">${escape(content.example.eyebrow)}</p><h2 id="examples-title">${lines(content.example.title)}</h2></div>
          <p class="section-description">${lines(content.example.body)}</p>
        </div>
        <div class="example-flow">
          <figure class="example-input">
            <div class="example-label"><span>01</span><h3>시작은, 메뉴 사진 한 장</h3></div>
            <div class="example-image"><img src="./assets/gukbap-bowl.jpg" alt="돼지국밥 한 상을 담은 AI 생성 예시 이미지" width="1672" height="941" loading="lazy"></div>
            <figcaption class="media-note">AI 생성 연출 이미지 · 실제 가게 사진이 아닙니다.</figcaption>
          </figure>
          <div class="flow-arrow" aria-hidden="true">${arrow}</div>
          <div class="example-output">
            <div class="example-label"><span>02</span><h3>손님에게 보여줄 짧은 영상으로</h3></div>
            ${video({ id: 'example-video', file: 'gukbap_promo.mp4', poster: 'gukbap_promo_poster.jpg', label: '돼지국밥 사진으로 만든 8초 무음 홍보영상 예시', caption: '8초 · 무음 · AI 생성 연출 예시이며 실제 점포 광고가 아닙니다.' })}
          </div>
        </div>
        <div class="example-note"><span class="note-icon" aria-hidden="true">${check}</span><p>${lines(content.example.note)}</p></div>
        <div class="food-story">
          <div class="food-story-heading"><h3>국밥 한 그릇, 김밥 한 줄.<br>매일 만드는 음식부터.</h3><p>가게마다 다른 맛과 이야기가<br>손님에게 잘 전해질 수 있도록.</p></div>
          <div class="food-grid">
            <figure><img src="./assets/gukbap-bowl.jpg" alt="돼지국밥 한 상을 표현한 AI 생성 이미지" width="1672" height="941" loading="lazy"><figcaption><span>국밥집</span><p>뜨끈한 한 끼를 보여주고</p></figcaption></figure>
            <figure><img src="./assets/gimbap-plate.jpg" alt="썰어 놓은 김밥을 표현한 AI 생성 이미지" width="1672" height="941" loading="lazy"><figcaption><span>김밥집</span><p>한 줄에 담은 정성을 전하고</p></figcaption></figure>
            <figure><img src="./assets/jokbal-board.jpg" alt="족발 한 상을 표현한 AI 생성 이미지" width="1672" height="941" loading="lazy"><figcaption><span>족발집</span><p>함께 먹을 저녁을 소개합니다</p></figcaption></figure>
          </div>
          <p class="media-note">위 음식 사진은 모두 AI 생성 연출 예시입니다.</p>
        </div>
      </div>
    </section>

    <section class="services section" id="services" aria-labelledby="services-title">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">지금 필요한 만큼만</p><h2 id="services-title">첫 영상부터 시작하고,<br>다음 도움은 필요할 때.</h2></div><p class="section-description">혼자 운영하는 작은 가게부터,<br>함께 시작하려는 상인회와 기관까지.</p></div>
        <div class="service-list">
          ${content.services.map((service, index) => `<article class="service-item">
            <span class="service-number" aria-hidden="true">0${index + 1}</span>
            <div class="service-name"><p class="service-tag">${escape(service.tag)}</p><h3>${lines(service.title)}</h3></div>
            <div class="service-description"><p>${lines(service.body)}</p><p class="service-detail">${lines(service.detail)}</p></div>
            <a class="service-link" href="#contact" aria-label="${escape(String(service.title).replace(/\n/g, ' '))} 문의하기">${arrowUp}</a>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="process section" id="process" aria-labelledby="process-title">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">가게 일을 멈추고 공부할 필요 없이</p><h2 id="process-title">${lines(content.process.title)}</h2></div><p class="section-description">${lines(content.process.body)}</p></div>
        <ol class="process-list">${content.process.steps.map((step, index) => `<li><span class="step-number" aria-hidden="true">0${index + 1}</span><div><h3>${lines(step.title)}</h3><p>${lines(step.body)}</p></div></li>`).join('\n')}</ol>
      </div>
    </section>

    <section class="about section" id="about" aria-labelledby="founder-title">
      <div class="container">
        <div class="founder-grid">
          <aside class="founder-profile" aria-label="대표 프로필">
            <figure><div class="founder-image"><img src="./assets/founder.jpg" alt="MicroAXLab 대표 설동헌, 설코딩의 실제 프로필 사진" width="413" height="531" loading="lazy"></div><figcaption>대표 실제 프로필 사진</figcaption></figure>
            <p class="founder-name">설동헌 <span>설코딩</span></p><p class="founder-role">MicroAXLab 대표</p>
            <a class="text-link" href="https://www.seolcoding.com/" target="_blank" rel="noopener noreferrer">설코딩의 작업 더 보기 ${arrowUp}<span class="sr-only"> (새 창)</span></a>
          </aside>
          <div class="founder-copy">
            <p class="eyebrow">${escape(content.founder.eyebrow)}</p><h2 id="founder-title">${lines(content.founder.title)}</h2>
            <div class="founder-story">${content.founder.paragraphs.map((paragraph) => `<p>${lines(paragraph)}</p>`).join('\n')}</div>
            <div class="founder-credentials">${content.founder.credentials.map((credential) => `<div><h3>${escape(credential.title)}</h3><p>${lines(credential.body)}</p></div>`).join('\n')}</div>
          </div>
        </div>
        <div class="brand-film" aria-labelledby="film-title">
          <div class="brand-film-copy"><p class="eyebrow">25초로 만나는 MicroAXLab</p><h3 id="film-title">가게의 하루에서,<br>우리의 일을 찾습니다.</h3><p>대표가 가게로 찾아가 듣고,<br>사진 한 장으로 작은 도움을 시작합니다.</p><p class="film-instruction">재생 버튼을 누르면 소개영상이 시작됩니다.</p></div>
          <div class="brand-film-player">${video({ id: 'brand-video', file: 'microaxlab_food_v2.mp4', poster: 'microaxlab_food_v2_poster.jpg', label: '가게의 하루에서 시작하는 MicroAXLab의 25초 무음 소개영상', caption: '25초 · 무음 · 음식·주방은 AI 생성 연출 예시, 대표 프로필은 실제 사진입니다.' })}</div>
        </div>
      </div>
    </section>

    <section class="operation section" id="operation" aria-labelledby="operation-title">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">사람에게 쓸 시간을 만들기 위해</p><h2 id="operation-title">${lines(content.operation.title)}</h2></div><p class="section-description">${lines(content.operation.body)}</p></div>
        <div class="roles-grid">
          <article class="role role-human"><p class="role-label"><span aria-hidden="true">01</span>사람이 하는 일</p><h3>만나고, 듣고,<br>책임지고 확인합니다.</h3><ul>${content.operation.human.map((item) => `<li>${check}<span>${lines(item)}</span></li>`).join('')}</ul></article>
          <article class="role role-ai"><p class="role-label"><span aria-hidden="true">02</span>AI가 돕는 일</p><h3>기록하고, 초안을 만들고,<br>다음 일을 정리합니다.</h3><ul>${content.operation.ai.map((item) => `<li>${check}<span>${lines(item)}</span></li>`).join('')}</ul></article>
        </div>
      </div>
    </section>

    <section class="mission section" aria-labelledby="mission-title">
      <div class="container mission-inner"><p class="eyebrow">${escape(content.mission.eyebrow)}</p><h2 id="mission-title">${lines(content.mission.title)}</h2><p>${lines(content.mission.body)}</p><span class="mission-mark brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
    </section>

    <section class="faq section" id="faq" aria-labelledby="faq-title">
      <div class="container faq-grid"><div><p class="eyebrow">자주 묻는 질문</p><h2 id="faq-title">시작하기 전에,<br>먼저 알려드릴게요.</h2></div><div class="faq-list">${content.faqs.map((faq) => `<details><summary><span>${escape(faq.question)}</span><span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-answer"><p>${lines(faq.answer)}</p></div></details>`).join('\n')}</div></div>
    </section>

    <section class="contact section" id="contact" aria-labelledby="contact-title">
      <div class="container contact-grid"><div><p class="eyebrow">${escape(content.contact.eyebrow)}</p><h2 id="contact-title">${lines(content.contact.title)}</h2><p class="contact-body">${lines(content.contact.body)}</p></div><div class="contact-action"><a class="button button-primary contact-button" href="${escape(mailto)}">이메일로 이야기 나누기 ${arrowUp}</a><div class="email-line"><a class="contact-email" href="${escape(mailto)}">${escape(email)}</a><button class="copy-email" type="button" data-copy-email="${escape(email)}" aria-label="이메일 주소 복사" hidden><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="1.6"/></svg></button></div><p class="contact-note">${lines(content.contact.note)}</p><p class="copy-status" role="status" aria-live="polite" data-copy-status></p></div></div>
    </section>
  </main>

  <footer class="site-footer"><div class="container"><div class="footer-top"><div><a class="brand" href="./" aria-label="MicroAXLab 홈">${brand}</a><p class="footer-description">${lines(content.footer.description)}</p></div><nav class="footer-nav" aria-label="하단 메뉴"><a href="#examples">영상 예시</a><a href="#about">대표 소개</a><a href="#faq">자주 묻는 질문</a><a href="#contact">문의하기</a></nav></div><div class="footer-bottom"><p>© ${new Date().getFullYear()} MicroAXLab</p><p>${escape(content.footer.status)}</p><a href="#main">맨 위로 <span aria-hidden="true">↑</span></a></div></div></footer>
</body>
</html>`;
}
