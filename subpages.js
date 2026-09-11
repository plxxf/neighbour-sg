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
const form=document.querySelector('.contact-form');if(form)form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const zh=document.documentElement.lang==='zh-CN';const name=String(data.get('name')||'').trim();const email=String(data.get('email')||'').trim();const company=String(data.get('company')||'').trim();const message=String(data.get('message')||'').trim();const subject=zh?`来自 ${name} 的网站留言`:`Website enquiry from ${name}`;const body=zh?`姓名：${name}\n工作邮箱：${email}\n公司：${company||'未填写'}\n\n留言：\n${message}`:`Name: ${name}\nWork email: ${email}\nCompany: ${company||'Not provided'}\n\nMessage:\n${message}`;const status=form.querySelector('.form-status');status.textContent=zh?'正在打开邮件应用…':'Opening your email app…';window.location.href=`mailto:contact@neighbour.sg?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`});
