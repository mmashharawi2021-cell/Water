window.DashboardUI={
  icons:{
    reports:'<svg viewBox="0 0 24 24"><path d="M7 3h7l3 3v15H7z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/></svg>',
    clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>',
    fuel:'<svg viewBox="0 0 24 24"><path d="M7 3h8v18H7z"/><path d="M9 7h4"/><path d="M15 8h2l2 2v8a2 2 0 0 1-2 2"/><path d="M19 10h-2"/></svg>',
    flame:'<svg viewBox="0 0 24 24"><path d="M12 21c4 0 7-3 7-7 0-3-2-5-4-7 0 3-2 4-3 5 0-4-2-6-4-8 0 5-3 7-3 10 0 4 3 7 7 7z"/></svg>',
    box:'<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8"/><path d="M12 12v8"/></svg>',
    water:'<svg viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>',
    truck:'<svg viewBox="0 0 24 24"><path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    chart:'<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l3-3 3 2 5-7"/></svg>'
  },
  render(state){
    const c=Components;
    const i=this.icons;
    const active=state.activeSection||'home';
    const reportSummary=Calculations.reportSummary(state.reports);
    const fuelSummary=Calculations.fuelSummary(state.reports,state.fuelEntries);
    const lossPercent=reportSummary.waterProduction?((reportSummary.reject/reportSummary.waterProduction)*100):0;
    const today=new Date().toLocaleDateString('ar',{weekday:'long',year:'numeric',month:'2-digit',day:'2-digit'});
    return `<main class="app-shell"><div class="container">
      <header class="topbar">
        <div class="identity"><div class="logo">م</div><div class="title-block"><h1>${c.esc(WATER_CONFIG.app.name)}</h1><p>${c.esc(WATER_CONFIG.app.user)} · ${c.esc(WATER_CONFIG.app.role)}</p></div></div>
        <div class="actions"><button class="btn primary" onclick="App.openModal('reportModal')">إضافة تقرير</button><button class="btn" onclick="App.openModal('fuelModal')">إضافة وقود</button><button class="btn" onclick="Exports.exportReports()">تصدير</button></div>
      </header>
      <section class="hero glass"><div><span class="hero-label">${today}</span><h2>ملخص التشغيل</h2><p>${c.esc(WATER_CONFIG.app.station)}</p></div></section>
      <section class="grid grid-4 summary-grid" id="home">
        ${c.kpi({icon:i.reports,label:'التقارير',value:reportSummary.count,hint:'سجل يومي',accent:true})}
        ${c.kpi({icon:i.clock,label:'ساعات التشغيل',value:Format.pretty(reportSummary.runHours),hint:'إجمالي'})}
        ${c.kpi({icon:i.fuel,label:'وقود وارد',value:Format.pretty(fuelSummary.incoming),hint:'سجل الوقود'})}
        ${c.kpi({icon:i.flame,label:'وقود مستخدم',value:Format.pretty(fuelSummary.used),hint:fuelSummary.startDate?`من ${Format.date(fuelSummary.startDate)}`:'لا يوجد وارد'})}
        ${c.kpi({icon:i.box,label:'وقود متبقي',value:Format.pretty(fuelSummary.remaining),hint:'الوارد - المستخدم'})}
        ${c.kpi({icon:i.water,label:'إنتاج المياه',value:Format.pretty(reportSummary.waterProduction),hint:'كوب'})}
        ${c.kpi({icon:i.truck,label:'المياه المعبأة',value:Format.pretty(reportSummary.waterFilled),hint:'كوب'})}
        ${c.kpi({icon:i.chart,label:'نسبة الفاقد',value:`${Format.pretty(lossPercent)}%`,hint:'محسوبة'})}
      </section>
      ${this.reportsSection(state.reports)}
      ${FuelUI.section(state.fuelEntries)}
      ${this.modals()}
      <nav class="bottom-nav"><button data-nav="home" class="${active==='home'?'active':''}" onclick="App.goSection('home')">الرئيسية</button><button data-nav="reports" class="${active==='reports'?'active':''}" onclick="App.goSection('reports')">التقارير</button><button data-nav="add" class="${active==='add'?'active':''}" onclick="App.state.activeSection='add';App.render();App.openModal('reportModal')">إضافة</button><button data-nav="fuel" class="${active==='fuel'?'active':''}" onclick="App.goSection('fuel')">الوقود</button></nav>
    </div></main>`;
  },
  reportsSection(reports){
    const rows=reports.slice(0,8).map(r=>`<button class="report-card" onclick="App.openReport('${r.id}')"><span class="badge">${Format.date(r.reportDate)}</span><h4>${Components.esc(r.title||'تقرير يومي')}</h4><div class="meta"><span>وقود ${Format.pretty(r.fuel?.consumedDaily)} لتر</span><span>مياه ${Format.pretty(r.water?.filledWater)} كوب</span><span>${Format.pretty(r.water?.carsCount)} سيارة</span></div></button>`).join('');
    return `<section class="section glass" id="reports"><div class="section-head"><div><h3>التقارير</h3><p>آخر السجلات</p></div></div><div class="table-list">${rows||'<div class="empty">لا توجد تقارير</div>'}</div></section>`;
  },
  modals(){
    return `${ReportsUI.modal()}${FuelUI.modal()}${Components.modal('reportDetailsModal','تفاصيل التقرير','<div class="modal-body"></div>')}`;
  }
};
