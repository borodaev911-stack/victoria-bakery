import React, { useState, useEffect, useRef } from 'react';
import { works, photo, site, type Work } from './content';

function Icon({ name = 'arrow', ...props }: { name?: string } & React.SVGProps<SVGSVGElement>) {
 const paths: Record<string, React.ReactNode> = {
  arrow:<><path d="M4 12h15M13 6l6 6-6 6"/></>,
  close:<><path d="m6 6 12 12M6 18 18 6"/></>,
  plus:<><path d="M12 5v14M5 12h14"/></>,
  pause:<><path d="M9 5v14M15 5v14"/></>,
  play:<path d="m8 5 11 7-11 7Z"/>,
  menu:<><path d="M4 8h16M4 16h16"/></>,
  down:<><path d="M12 4v15m-6-6 6 6 6-6"/></>,
  flower:<><path d="M12 8c-6-10-12 1-4 4-10 6 1 12 4 4 6 10 12-1 4-4 10-6-1-12-4-4Z"/><circle cx="12" cy="12" r="2"/></>
 };
 return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
function Pill({children, href, light=false}: {children:React.ReactNode;href:string;light?:boolean}) {
 return <a className={`pill ${light?'light':''}`} href={href}>{children}<Icon/></a>;
}
function Flour({paused}: {paused:boolean}) {
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!; const ctx=canvas.getContext('2d'); if(!ctx)return;
  let width=0,height=0,frame=0,visible=false,clock=0;
  const seeds=Array.from({length:100},(_,i)=>({x:((i*37.71)%100)/100,y:((i*61.31)%100)/100,r:.5+(i%5)*.38,s:.3+(i%7)*.12}));
  function resize(){const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx!.setTransform(dpr,0,0,dpr,0,0);draw();}
  function draw(){ctx!.clearRect(0,0,width,height);for(const p of seeds){const x=((p.x*width+clock*p.s*9)%(width+30))-15;const y=p.y*height+Math.sin(clock*.22+p.x*12)*30;ctx!.beginPath();ctx!.arc(x,y,p.r,0,Math.PI*2);ctx!.fillStyle=`rgba(249,234,209,${.15+p.r*.13})`;ctx!.fill();}}
  let last=0;
  function tick(t:number){if(!visible||paused||document.hidden){frame=0;return;}clock+=Math.min((t-last)/1000,.04);last=t;draw();frame=requestAnimationFrame(tick);}
  function start(){if(visible&&!paused&&!document.hidden&&!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;start();});observer.observe(canvas);
  const ro=new ResizeObserver(resize);ro.observe(canvas);document.addEventListener('visibilitychange',start);resize();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();document.removeEventListener('visibilitychange',start);};
 },[paused]);
 return <canvas ref={ref} aria-hidden="true"/>;
}
function Gallery({work,onClose}: {work:Work|null;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);const [index,setIndex]=useState(0);const [failed,setFailed]=useState(false);const touch=useRef<number|null>(null);
 useEffect(()=>{setFailed(false)},[index,work]);
 useEffect(()=>{
  const dialog=ref.current!;if(!work)return;
  setIndex(0);const active=document.activeElement as HTMLElement;const y=window.scrollY;
  const before={position:document.body.style.position,top:document.body.style.top,width:document.body.style.width};
  document.body.style.position='fixed';document.body.style.top=`-${y}px`;document.body.style.width='100%';dialog.showModal();
  return()=>{dialog.close();Object.assign(document.body.style,before);window.scrollTo({top:y,behavior:'instant'});active?.focus({preventScroll:true});};
 },[work]);
 function move(delta:number){if(work)setIndex(i=>(i+delta+work.images.length)%work.images.length)}
 return <dialog ref={ref} className="gallery" aria-labelledby="gallery-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}} onKeyDown={e=>{if(e.key==='Tab'){const buttons=Array.from(ref.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}}}>
 {work&&<div className="gallery-inner"><button className="round gallery-close" aria-label="Закрыть галерею" onClick={onClose} autoFocus><Icon name="close"/></button><div className="gallery-image" onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current!==null){const delta=touch.current-e.changedTouches[0].clientX;if(Math.abs(delta)>45)move(delta>0?1:-1);touch.current=null;}}}>
 {!failed?<img key={`${work.id}-${index}`} src={photo(work.images[index])} alt={`${work.title}, фотография ${index+1}`} onError={()=>setFailed(true)}/>:<p>Не удалось загрузить фото. Попробуйте открыть галерею ещё раз.</p>}
 {work.images.length>1&&<><button className="round gallery-prev" aria-label="Предыдущее фото" onClick={()=>move(-1)}><Icon style={{transform:'rotate(180deg)'}}/></button><button className="round gallery-next" aria-label="Следующее фото" onClick={()=>move(1)}><Icon/></button></>}
 </div><div className="gallery-info"><div><h2 id="gallery-title">{work.title}</h2><p>{work.description}</p></div><span className="photo-count" aria-live="polite">{index+1} / {work.images.length}</span></div></div>}
 </dialog>
}
function WorkCard({work,onOpen}: {work:Work;onOpen:(w:Work)=>void}) {
 return <button className="work" onClick={()=>onOpen(work)} aria-label={`Открыть: ${work.title}`}><div className="work-image"><img src={photo(work.images[0])} alt={work.title} loading="lazy" width="1400" height="1600"/><span className="round work-open"><Icon name="plus"/></span>{work.images.length>1&&<span className="work-views">{work.images.length} фото · есть разрез</span>}</div><div className="work-caption"><h3>{work.title}</h3><Icon/></div><p>{work.description}</p></button>
}
export default function App(){
 const [gallery,setGallery]=useState<Work|null>(null);const [more,setMore]=useState(false);const [menu,setMenu]=useState(false);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);const [paused,setPaused]=useState(false);const motionPaused=reduced||paused;
 const video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const cb=()=>setReduced(media.matches);media.addEventListener('change',cb);return()=>media.removeEventListener('change',cb)},[]);
 useEffect(()=>{document.documentElement.dataset.paused=String(motionPaused);if(video.current){if(motionPaused)video.current.pause();else void video.current.play().catch(()=>{});}},[motionPaused]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[menu]);
 const cakes=works.filter(w=>w.category==='cakes');
 return <><a className="skip" href="#main">Перейти к содержимому</a><header><a className="brand" href="#" aria-label="Виктория — начало страницы">Виктория<span>торты & домашняя выпечка</span></a><nav aria-label="Основная навигация" className={menu?'nav open':'nav'}><a href="#works" onClick={()=>setMenu(false)}>Мои работы</a><a href="#about" onClick={()=>setMenu(false)}>Обо мне</a><a href="#contact" onClick={()=>setMenu(false)}>Связаться</a></nav><a className="header-contact" href="#contact">Написать Виктории<Icon/></a><button className="round menu-toggle" aria-label={menu?'Закрыть меню':'Открыть меню'} aria-expanded={menu} onClick={()=>setMenu(!menu)}><Icon name={menu?'close':'menu'}/></button></header>
 <main id="main"><section className="hero" aria-labelledby="hero-title"><div className="hero-photo"><img src={photo('hero')} alt="Торт Виктории с ягодами, ромашками и вафельным рожком" width="1400" height="1600" fetchPriority="high"/>{site.heroVideo&&<video ref={video} src={site.heroVideo} poster={photo('hero')} muted loop autoPlay={!motionPaused} playsInline aria-hidden="true"/>}</div><div className="hero-content"><h1 id="hero-title">Испечено<br/>с <em>любовью.</em></h1><p>Для больших праздников.<br/>И маленьких счастливых моментов.</p><Pill href="#works">Посмотреть работы</Pill><span className="hero-signature">От Виктории, с теплом</span></div><a href="#intro" className="scroll-note"><Icon name="down"/><span>Немного вкусного впереди</span></a><button className="round hero-motion" disabled={reduced} aria-label={motionPaused?'Включить движение фото':'Остановить движение фото'} aria-pressed={motionPaused} onClick={()=>setPaused(!paused)}><Icon name={motionPaused?'play':'pause'}/></button><div className="hero-caption">Настоящие работы.<br/>Маленькие истории.</div></section>
 <section className="intro section" id="intro"><Icon name="flower" className="intro-flower"/><h2>Есть вещи, которые<br/>делают день <em>теплее.</em></h2><p>Запах свежего хлеба. Печенье к чашке чая.<br className="desktop-break"/> Торт, вокруг которого собираются любимые.<br className="desktop-break"/> Для таких моментов я и пеку.</p></section>
 <section id="works" className="works-section section"><div className="section-heading"><h2>Для вашего<br/><em>особенного момента</em></h2><p>Большие и маленькие поводы<br/>собраться за одним столом.</p></div><nav className="category-nav" aria-label="Направления выпечки"><a className="selected" href="#cakes">Торты и десерты<Icon/></a><a href="#cookies">Печенье<Icon/></a><a href="#bread">Хлеб и выпечка<Icon/></a></nav><div id="cakes" className="work-grid">{cakes.slice(0,more?cakes.length:3).map(w=><WorkCard key={w.id} work={w} onOpen={setGallery}/>)}</div><div className="more-row"><button className="pill outline" onClick={()=>setMore(!more)} aria-expanded={more}>{more?'Свернуть подборку':'Ещё немного сладкого'}<Icon name={more?'close':'plus'}/></button><span>Нажмите на фото, чтобы рассмотреть детали</span></div></section>
 <section className="ingredient-scene" aria-labelledby="ingredient-title"><Flour paused={motionPaused}/><div className="chocolate-piece piece-one" aria-hidden="true"/><div className="chocolate-piece piece-two" aria-hidden="true"/><div className="ingredient-text"><h2 id="ingredient-title">Щепотка вдохновения.<br/><em>И много любви.</em></h2><p>Самое важное — в простых вещах.</p></div><button className="motion-toggle" disabled={reduced} onClick={()=>setPaused(!paused)} aria-label={motionPaused?'Включить анимацию':'Остановить анимацию'} aria-pressed={motionPaused}><Icon name={motionPaused?'play':'pause'}/><span>{reduced?'Движение уменьшено':paused?'Включить движение':'Остановить движение'}</span></button></section>
 <section id="cookies" className="cookie-section section"><div className="cookie-copy"><span className="handwritten">Поставим чайник?</span><h2>Счастье —<br/>в маленьком<br/><em>печенье.</em></h2><p>Для долгих разговоров на кухне,<br/>неожиданных гостей и минутки для себя.</p><button className="pill" onClick={()=>setGallery(works.find(w=>w.id==='cookies')!)}>Рассмотреть печенье<Icon/></button></div><button className="cookie-photo" onClick={()=>setGallery(works.find(w=>w.id==='cookies')!)} aria-label="Открыть: Печенье к чаю"><img src={photo('cookies')} alt="Ассорти печенья Виктории на тарелке" loading="lazy" width="1400" height="1340"/><span className="round"><Icon name="plus"/></span></button></section>
 <section id="bread" className="bread-section section"><div className="section-heading"><h2>Когда дома пахнет<br/><em>свежей выпечкой</em></h2><p>Хрустящая корочка. Золотистые слои.<br/>Повод никуда не спешить.</p></div><div className="bread-grid">{['bread','rolls','buns','seed-bread'].map(id=><WorkCard key={id} work={works.find(w=>w.id===id)!} onOpen={setGallery}/>)}</div></section>
 <section id="about" className="about-section section"><div className="portrait"><img src={photo('victoria')} alt="Виктория держит свой торт с ягодами у окна" loading="lazy" width="1100" height="1515"/><span className="portrait-note">Давайте знакомиться</span></div><div className="about-copy"><h2>Я Виктория.<br/><em>И я люблю печь.</em></h2><p>Для меня выпечка — способ позаботиться о близких и сделать обычный день немного теплее. Мне нравится всё: замешивать тесто, ждать, когда хлеб подрумянится, подбирать ягоды для украшения торта. Из этих маленьких деталей складывается то, чем хочется поделиться.</p><p>Я учусь сама, пробую, меняю, довожу до вкуса, который мне нравится. Хочу, чтобы торт радовал и первым взглядом, и первым кусочком. А за столом находился повод задержаться — налить ещё чаю, поговорить и взять добавку.</p><span className="signature">Виктория</span></div></section>
 <section id="contact" className="contact-section section"><Icon name="flower"/><h2>Для вашего праздника.<br/><em>И просто к чаю.</em></h2><p>У каждого повода может быть свой вкус.<br/>Буду рада придумать его вместе с вами.</p>{site.maxUrl?<Pill href={site.maxUrl}>Написать Виктории</Pill>:<><button className="pill" disabled>Написать Виктории<Icon/></button><span className="contact-note">Скоро здесь появится связь со мной в MAX.</span></>}</section></main>
 <footer><a className="brand" href="#">Виктория</a><p>Торты, печенье и хлеб. С теплом.</p><a href="#main">Наверх<Icon name="down" style={{transform:'rotate(180deg)'}}/></a></footer><Gallery work={gallery} onClose={()=>setGallery(null)}/></>
}


