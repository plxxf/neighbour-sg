const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroModelFrame = document.querySelector('.hero-model');
let heroModelLeft = null;

function fitHeroTitleToModel() {
  const title = document.querySelector('.hero-copy-panel h1');
  const wordmark = title?.querySelector('.hero-wordmark');
  if (!title) return;
  if (window.innerWidth <= 900 || document.documentElement.lang !== 'en' || !wordmark || heroModelLeft === null) {
    title.style.removeProperty('font-size');
    return;
  }
  const titleRect = title.getBoundingClientRect();
  const wordmarkRect = wordmark.getBoundingClientRect();
  const modelRect = heroModelFrame.getBoundingClientRect();
  const contentWidth = wordmarkRect.right - titleRect.left;
  const availableWidth = modelRect.left + heroModelLeft - titleRect.left - 12;
  const currentSize = parseFloat(getComputedStyle(title).fontSize);
  if (contentWidth <= 0 || availableWidth <= 0 || !Number.isFinite(currentSize)) return;
  const fittedSize = Math.max(72, Math.min(120, currentSize * availableWidth / contentWidth));
  title.style.fontSize = `${fittedSize}px`;
}

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.source !== heroModelFrame?.contentWindow || event.data?.type !== 'neighbour-model-bounds') return;
  heroModelLeft = Number(event.data.left);
  if (Number.isFinite(heroModelLeft)) requestAnimationFrame(fitHeroTitleToModel);
});

window.addEventListener('resize', () => requestAnimationFrame(fitHeroTitleToModel));

const introSequence = [
  document.querySelector('.nav-shell'),
  document.querySelector('.hero-copy-panel .eyebrow'),
  document.querySelector('.hero-copy-panel h1'),
  document.querySelector('.hero-copy-panel .hero-copy'),
  document.querySelector('.hero-model-wrap')
].filter(Boolean);

introSequence.forEach((element, index) => {
  element.classList.add('intro-reveal');
  element.style.setProperty('--intro-delay', `${80 + index * 105}ms`);
});

const scrollRevealElements = document.querySelectorAll([
  '.trust-line',
  '.section-heading',
  '.feature-card',
  '.community-grid > *',
  '.quote-card',
  '.cta-content',
  '.footer > *'
].join(','));

scrollRevealElements.forEach((element, index) => {
  element.classList.add('scroll-reveal');
  element.style.setProperty('--reveal-order', String(index % 3));
});

requestAnimationFrame(() => requestAnimationFrame(() => {
  document.documentElement.classList.add('page-ready');
}));

if (reducedMotion || !('IntersectionObserver' in window)) {
  scrollRevealElements.forEach(element => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
  scrollRevealElements.forEach(element => revealObserver.observe(element));
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('is-open', !open);
});

document.querySelector('.postcode-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  const button = event.currentTarget.querySelector('button');
  input.setCustomValidity('');
  if (!input.validity.valid) {
    input.setCustomValidity(document.documentElement.lang === 'zh-CN'
      ? '请输入有效的邮箱地址。'
      : 'Please enter a valid email address.');
    input.reportValidity();
    return;
  }
  input.setCustomValidity('');
  button.textContent = document.documentElement.lang === 'zh-CN'
    ? '谢谢，我们会尽快联系你 ✓'
    : 'Thanks — we’ll be in touch ✓';
});

const langToggle = document.querySelector('.lang-toggle');
const translations = [
  ['.nav-links a:nth-child(1)', 'Our standard', '产品标准'],
  ['.nav-links a:nth-child(2)', 'Why Neighbour', '为什么选择 Neighbour'],
  ['.nav-cta', 'Work with us <span>↗</span>', '与我们合作 <span>↗</span>'],
  ['.eyebrow', '<span class="status-dot"></span> A software company from Singapore', '<span class="status-dot"></span> 一家来自新加坡的软件公司'],
  ['.hero-copy-panel h1', 'Hi, I\'m <img class="hero-wordmark" src="assets/neighbour-logo.svg?v=approved-1" alt="Neighbour">', '你好，<br>欢迎来到<span>邻里</span>'],
  ['.hero-copy-panel .hero-copy', 'As your neighbour, we’re always happy to help.<br>Whenever you need us, we’ll be right here.', '作为你的邻居，我们乐意为你提供帮助。<br>当你需要我们的时候，我们一直在这里。'],
  ['.trust-line > span', 'Designing useful software across industries', '为不同领域设计真正有用的软件'],
  ['#how .kicker', 'THE NEIGHBOUR STANDARD', 'NEIGHBOUR 产品标准'],
  ['#how .section-heading h2', 'Refined time and again,<br>just to bring this care to you.', '千锤百炼，<br>只为了将这份心意带给你。'],
  ['#how .section-heading p', 'Every piece of software made by Neighbour is held to a high standard.', 'Neighbour出品的每一个软件都贯彻高标准。'],
  ['.feature-large h3', 'Focus on the<br>real problem.', '聚焦真正的问题。'],
  ['.feature-large .feature-copy > p', 'The problems that keep troubling you are exactly the ones we’re committed to solving.', '那些一直困扰着你的问题，是我们致力于解决的目标。'],
  ['.mini-message b', 'Clear by default', '清晰，是默认设置'],
  ['.mini-message small', 'Focused · Useful · Considered', '聚焦 · 实用 · 克制'],
  ['.mini-reply b', 'Built around evidence', '尊重真实的用户证据'],
  ['.mini-reply small', 'Research · Testing · Real use', '研究 · 测试 · 真实使用'],
  ['.feature-card:nth-child(2) h3', 'Experience comes first', '体验优先'],
  ['.feature-card:nth-child(2) p', 'Software should feel clear, stable, natural and responsive — for different people, devices and ways of using it.', '软件应当清晰、稳定、自然、响应迅速，并平等地服务不同的人。'],
  ['.feature-card:nth-child(3) h3', 'Your information, protected', '重视用户信息安全'],
  ['.feature-card:nth-child(3) p', 'We protect user information with appropriate encryption, access controls, backups and recovery checks throughout the product lifecycle.', '我们在产品全生命周期重视用户信息安全，落实必要的数据加密、权限控制、备份与恢复验证。'],
  ['#stories .kicker', 'WHY NEIGHBOUR', '为什么叫 NEIGHBOUR'],
  ['#stories .section-heading h2', 'Not everything.<br>Just what matters.', '不追求无所不能，<br>只做好真正重要的事。'],
  ['.quote-card blockquote', 'When you need us, you can come to us. When you return, we will still be here.', '当你有需要时，可以来找我们。当你再次回来时，我们依然在这里。'],
  ['.quote-person b', 'The Neighbour promise', 'Neighbour 的承诺'],
  ['.quote-person small', 'Restrained · Inclusive · Honest', '克制 · 包容 · 诚实'],
  ['#join .kicker', 'COME SAY HELLO', '欢迎来敲门'],
  ['#join h2', 'A good neighbour<br>is never far away.', '远亲不如近邻。'],
  ['#join .cta-content > p', 'Curious about Neighbour, our products or what we are building next? We would be glad to hear from you.', '想了解 Neighbour、我们的产品，或我们接下来要做的事？欢迎随时来找我们。'],
  ['#join .postcode-form button', 'Talk to our team <span>↗</span>', '联系我们 <span>↗</span>'],
  ['#join .form-note', 'Based in Singapore. Building for everyone.', '立足新加坡，为每个人创造。'],
  ['.footer > p', 'That’s what neighbours are for.', '邻里之间，本应如此。'],
  ['.footer > div a:nth-child(2)', 'Contact', '联系我们'],
  ['.footer > div a:nth-child(3)', 'Privacy', '隐私政策'],
  ['.footer > div a:nth-child(4)', 'Terms', '使用条款']
];

const principles = [
  {
    en: ['When you need us, you can come to us. When you return, we will still be here.', 'The Neighbour promise', 'Restrained · Inclusive · Honest'],
    zh: ['当你有需要时，可以来找我们。当你再次回来时，我们依然在这里。', 'Neighbour 的承诺', '克制 · 包容 · 诚实']
  },
  {
    en: ['Simple, never simplistic.<br>Beautiful, never showy.<br>Smooth, dependable and made to last.', 'The Neighbour standard', 'Simple · Beautiful · Reliable'],
    zh: ['简单，但不简陋；<br>优美，但不炫技；<br>流畅、可靠，并且值得长期使用。', 'Neighbour 的产品标准', '简单 · 优美 · 可靠']
  },
  {
    en: ['Neighbour values your experience. We welcome all your feedback and suggestions.', 'The Neighbour decision', 'Experience · Respect · Trust'],
    zh: ['Neighbour重视你的体验，欢迎给我们提出任何意见和建议。', 'Neighbour 的选择', '体验 · 尊重 · 信任']
  }
];
let principleIndex = 0;
const quoteCard = document.querySelector('.quote-card');
const quoteText = quoteCard?.querySelector('blockquote');
const quoteTitle = quoteCard?.querySelector('.quote-person b');
const quoteMeta = quoteCard?.querySelector('.quote-person small');
const quoteCount = quoteCard?.querySelector('.quote-nav span');

function renderPrinciple(animate = false) {
  if (!quoteCard) return;
  const language = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
  const [text, title, meta] = principles[principleIndex][language];
  if (animate && !reducedMotion) quoteCard.classList.add('is-changing');
  window.setTimeout(() => {
    quoteText.innerHTML = text;
    quoteTitle.textContent = title;
    quoteMeta.textContent = meta;
    quoteCount.textContent = `${String(principleIndex + 1).padStart(2, '0')} / ${String(principles.length).padStart(2, '0')}`;
    quoteCard.classList.remove('is-changing');
  }, animate && !reducedMotion ? 140 : 0);
}

quoteCard?.querySelector('[aria-label="Previous principle"]')?.addEventListener('click', () => {
  principleIndex = (principleIndex - 1 + principles.length) % principles.length;
  renderPrinciple(true);
});
quoteCard?.querySelector('[aria-label="Next principle"]')?.addEventListener('click', () => {
  principleIndex = (principleIndex + 1) % principles.length;
  renderPrinciple(true);
});

function setLanguage(language) {
  const isChinese = language === 'zh-CN';
  document.documentElement.lang = isChinese ? 'zh-CN' : 'en';
  document.title = isChinese ? 'Neighbour — 小而精，值得信赖的软件' : 'Neighbour — Thoughtful software, made to last';
  translations.forEach(([selector, english, chinese]) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = isChinese ? chinese : english;
  });
  const email = document.querySelector('#email');
  if (email) email.placeholder = isChinese ? '你的工作邮箱' : 'Your work email';
  langToggle.textContent = isChinese ? 'EN' : '中文';
  langToggle.setAttribute('aria-label', isChinese ? 'Switch to English' : '切换为中文');
  localStorage.setItem('neighbour-language', isChinese ? 'zh-CN' : 'en');
  renderPrinciple();
  requestAnimationFrame(fitHeroTitleToModel);
}

const savedLanguage = localStorage.getItem('neighbour-language');
setLanguage(savedLanguage === 'zh-CN' ? 'zh-CN' : 'en');
langToggle.addEventListener('click', () => setLanguage(document.documentElement.lang === 'zh-CN' ? 'en' : 'zh-CN'));
