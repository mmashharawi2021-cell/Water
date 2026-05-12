window.App={
  state:{reports:[],fuelEntries:[],user:null},
  start(){
    const ok=FirebaseService.init();
    if(!ok){this.renderError('تعذر الاتصال بالإعدادات');return;}
    this.render();
    FirebaseService.onAuth(user=>{
      this.state.user=user;
      if(user) this.listen();
      else this.renderLogin();
    });
  },
  listen(){
    FirebaseService.listenReports(reports=>{this.state.reports=reports;this.render();});
    FirebaseService.listenFuelEntries(entries=>{this.state.fuelEntries=entries;this.render();});
  },
  render(){
    document.getElementById('app').innerHTML=DashboardUI.render(this.state);
  },
  renderLogin(){
    document.getElementById('app').innerHTML='<main class="app-shell"><div class="container"><section class="section glass"><h3>تسجيل الدخول</h3><p class="muted">أدخل بيانات النظام.</p><form class="form-grid" onsubmit="App.login(event)"><label class="field full"><span>البريد</span><input name="email" type="email"></label><label class="field full"><span>كلمة المرور</span><input name="password" type="password"></label><div class="form-actions full"><button class="btn primary">دخول</button></div></form></section></div></main>';
  },
  async login(event){
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.target).entries());
    await FirebaseService.signIn(data.email,data.password);
  },
  openModal(id){document.getElementById(id)?.classList.add('open')},
  closeModal(id){document.getElementById(id)?.classList.remove('open')},
  renderError(message){document.getElementById('app').innerHTML='<main class="app-shell"><div class="container"><section class="section glass"><h3>خطأ</h3><p>'+message+'</p></section></div></main>'}
};

document.addEventListener('DOMContentLoaded',()=>App.start());
