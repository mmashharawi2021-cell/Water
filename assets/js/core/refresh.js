(() => {
  function showNote(text){
    document.querySelectorAll('.refresh-note').forEach(el=>el.remove());
    const note=document.createElement('div');
    note.className='refresh-note';
    note.textContent=text;
    document.body.appendChild(note);
    setTimeout(()=>note.remove(),1600);
  }

  async function hardRefresh(){
    const btn=document.querySelector('.hard-refresh');
    btn?.classList.add('loading');
    showNote('جاري التحديث...');
    try{
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.map(key=>caches.delete(key)));
      }
    }catch(error){console.warn('cache clear skipped',error)}
    const url=new URL(window.location.href);
    url.searchParams.set('r',Date.now().toString());
    window.location.replace(url.toString());
  }

  function init(){
    if(document.querySelector('.hard-refresh')) return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='hard-refresh';
    btn.title='تحديث قوي';
    btn.setAttribute('aria-label','تحديث قوي');
    btn.textContent='↻';
    btn.addEventListener('click',hardRefresh);
    document.body.appendChild(btn);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
