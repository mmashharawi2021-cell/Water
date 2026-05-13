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
  render(){
    document.getElementById('app').innerHTML=DashboardUI.render(this.state);
  },
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
    const title=Components.esc(report.title||'تقرير يومي');
    const date=Format.date(report.reportDate);
    const fuel=Format.pretty(report.fuel?.consumedDaily);
    const production=Format.pretty(report.water?.dailyProduction);
    const filled=Format.pretty(report.water?.filledWater);
    const cars=Format.pretty(report.water?.carsCount);
    const reject=Format.pretty(report.water?.rejectWater);
    const hours=Components.esc(report.generator?.totalRunHours||'');
    const notes=Components.esc(report.notes||'لا توجد ملاحظات');
    return `<div class="details-stack"><span class="badge">${date}</span><h3>${title}</h3><div class="detail-grid"><article><span>ساعات التشغيل</span><strong>${hours||'_'}</strong></article><article><span>وقود مستخدم</span><strong>${fuel} لتر</strong></article><article><span>الإنتاج</span><strong>${production} كوب</strong></article><article><span>المعبأ</span><strong>${filled} كوب</strong></article><article><span>السيارات</span><strong>${cars}</strong></article><article><span>العادم</span><strong>${reject} كوب</strong></article></div><div class="notes-box"><span>ملاحظات</span><p>${notes}</p></div></div>`;
  },
  renderError(message){document.getElementById('app').innerHTML='<main class="app-shell"><div class="container"><section class="section glass"><h3>خطأ</h3><p>'+message+'</p></section></div></main>'}
};

document.addEventListener('DOMContentLoaded',()=>App.start());
