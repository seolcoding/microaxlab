const menuButton = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-site-nav]');
const header = document.querySelector('[data-header]');

if (menuButton && navigation && header) {
  const mobile = window.matchMedia('(max-width: 860px)');
  const setMenu = (open, restoreFocus = false) => {
    const expanded = mobile.matches && open;
    navigation.hidden = mobile.matches && !expanded;
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.setAttribute('aria-label', expanded ? '메뉴 닫기' : '메뉴 열기');
    header.classList.toggle('menu-open', expanded);
    if (restoreFocus) menuButton.focus();
  };
  const syncMenu = () => {
    menuButton.hidden = !mobile.matches;
    setMenu(false);
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const wasMobile = mobile.matches;
    setMenu(false);
    if (wasMobile && link.hash) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', (event) => {
    if (menuButton.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener('change', syncMenu);
  syncMenu();
}

const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('[data-copy-status]');
if (copyButton && copyStatus && navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copyEmail);
      copyStatus.textContent = '이메일 주소를 복사했습니다.';
    } catch {
      copyStatus.textContent = '위 이메일 주소를 선택해 복사해 주세요.';
    }
  });
}

// Two previews should never play over one another, including with keyboard controls.
const videos = [...document.querySelectorAll('video')];
for (const current of videos) {
  current.addEventListener('play', () => {
    for (const other of videos) {
      if (other !== current) other.pause();
    }
  });
}
