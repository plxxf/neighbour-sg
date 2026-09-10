const interFont=document.createElement('link');interFont.rel='stylesheet';interFont.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';document.head.appendChild(interFont);
document.documentElement.classList.add('page-ready');
const toggle=document.querySelector('.lang-toggle');
function setLanguage(language){const zh=language==='zh-CN';document.documentElement.lang=zh?'zh-CN':'en';document.querySelectorAll('[data-en][data-zh]').forEach(el=>{el.innerHTML=zh?el.dataset.zh:el.dataset.en});toggle.textContent=zh?'EN':'中文';toggle.setAttribute('aria-label',zh?'Switch to English':'切换为中文');const title=document.querySelector('h1')?.textContent.trim();if(title)document.title=`${title} — Neighbour`;localStorage.setItem('neighbour-language',zh?'zh-CN':'en')}
const contactHeading=document.querySelector('.contact-form')?document.querySelector('.page-hero h1'):null;
const contactIntro=document.querySelector('.contact-form')?document.querySelector('.page-hero p'):null;
if(contactHeading)contactHeading.dataset.zh='一起创造对这个世界有影响力的产品。';
if(contactIntro)contactIntro.dataset.zh='造梦的路上，你不是孤单一个人';
setLanguage(localStorage.getItem('neighbour-language')==='zh-CN'?'zh-CN':'en');
toggle.addEventListener('click',()=>setLanguage(document.documentElement.lang==='zh-CN'?'en':'zh-CN'));
const form=document.querySelector('.contact-form');if(form)form.addEventListener('submit',event=>{event.preventDefault();const status=form.querySelector('.form-status');status.textContent=document.documentElement.lang==='zh-CN'?'谢谢，我们已经收到你的留言，会尽快联系你。':'Thanks — we have received your message and will be in touch soon.';form.reset()});
document.querySelectorAll('a[href="mailto:hello@neighbour.sg"]').forEach(link=>{link.href='mailto:contact@neighbour.sg';link.textContent='contact@neighbour.sg'});
