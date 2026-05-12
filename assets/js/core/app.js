window.App={
  state:{reports:[],fuelEntries:[],user:{displayName:'فحص الواجهة',role:'preview'}},
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
  renderLogin(){
    this.listen();
  },
  async login(event){
    event?.preventDefault?.();
  },
  openModal(id){document.getElementById(id)?.classList.add('open')},
  closeModal(id){document.getElementById(id)?.classList.remove('open')},
  renderError(message){document.getElementById('app').innerHTML='<main class="app-shell"><div class="container"><section class="section glass"><h3>خطأ</h3><p>'+message+'</p></section></div></main>'}
};

document.addEventListener('DOMContentLoaded',()=>App.start());
