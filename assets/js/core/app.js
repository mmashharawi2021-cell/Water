window.App={
  state:{reports:[],fuelEntries:[],user:{displayName:'فحص الواجهة',role:'preview'},activeSection:'home'},
  unsubscribers:[],
  start(){
    const ok=FirebaseService.init();
    if(!ok){this.renderError('تعذر الاتصال بالإعدادات');return;}
    this.render();
    this.listen();
  },
  listen(){
    this.unsubscribers.forEach(unsubscribe=>{try{unsubscribe()}catch{}});
    this.unsubscribers=[];
    this.unsubscribers.push(FirebaseService.listenReports(reports=>{this.state.reports=reports;this.render();}));
    this.unsubscribers.push(FirebaseService.listenFuelEntries(entries=>{this.state.fuelEntries=entries;this.render();}));
  },
  render(){document.getElementById('app').innerHTML=DashboardUI.render(this.state)},
  renderLogin(){this.listen()},
  async login(event){event?.preventDefault?.()},
  openModal(id){document.getElementById(id)?.classList.add('open')},
  closeModal(id){document.getElementById(id)?.classList.remove('open')},
  goSection(section){
    this.state.activeSection=section;
    document.querySelectorAll('.bottom-nav button').forEach(button=>button.classList.toggle('active',button.dataset.nav===section));
    const target=section==='home'?document.querySelector('.app-shell'):document.getElementById(section);
    target?.scrollIntoView({behavior:'smooth',block:'start'});
  },
  openReport(id){
    const report=this.state.reports.find(item=>item.id===id);
    if(!report) return;
    const modal=document.getElementById('reportDetailsModal');
    if(!modal) return;
    modal.querySelector('.modal-body').innerHTML=this.reportDetailsHtml(report);
    modal.classList.add('open');
  },
  reportDetailsHtml(report){
    const text=ReportsUI.formatReport(report);
    return `<div class="details-stack report-text-view"><div class="form-actions"><button class="btn primary" onclick="App.copyReportText()">نسخ التقرير</button></div><pre id="officialReportText">${Components.esc(text)}</pre></div>`;
  },
  async copyReportText(){
    const text=document.getElementById('officialReportText')?.textContent||'';
    if(!text) return;
    try{await navigator.clipboard.writeText(text);alert('تم نسخ التقرير')}catch{alert('تعذر النسخ')}
  },
  renderError(message){document.getElementById('app').innerHTML='<main class="app-shell"><div class="container"><section class="section glass"><h3>خطأ</h3><p>'+message+'</p></section></div></main>'}
};

document.addEventListener('DOMContentLoaded',()=>App.start());
