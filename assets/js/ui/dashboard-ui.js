window.DashboardUI={
  render(state){
    const c=Components;
    const reportSummary=Calculations.reportSummary(state.reports);
    const fuelSummary=Calculations.fuelSummary(state.reports,state.fuelEntries);
    const lossPercent=reportSummary.waterProduction?((reportSummary.reject/reportSummary.waterProduction)*100):0;
    return `<main class="app-shell"><div class="container">
      <header class="topbar">
        <div class="identity"><div class="logo">💧</div><div class="title-block"><h1>${c.esc(WATER_CONFIG.app.name)}</h1><p>${c.esc(WATER_CONFIG.app.user)} · ${c.esc(WATER_CONFIG.app.role)}</p></div></div>
        <div class="actions"><button class="btn primary" onclick="App.openModal('reportModal')">إضافة تقرير</button><button class="btn" onclick="App.openModal('fuelModal')">إضافة وقود</button><button class="btn" onclick="Exports.exportReports()">تصدير</button></div>
      </header>
      <section class="hero glass"><h2>لوحة التشغيل</h2><p>التقارير، الوقود، المياه، والجهات المستفيدة.</p></section>
      <section class="grid grid-4">
        ${c.kpi({icon:'📄',label:'التقارير',value:reportSummary.count,hint:'سجل يومي',accent:true})}
        ${c.kpi({icon:'⏱️',label:'ساعات التشغيل',value:Format.pretty(reportSummary.runHours),hint:'إجمالي'})}
        ${c.kpi({icon:'⛽',label:'وقود وارد',value:Format.pretty(fuelSummary.incoming),hint:'من سجل الوقود'})}
        ${c.kpi({icon:'🔥',label:'وقود مستخدم',value:Format.pretty(fuelSummary.used),hint:fuelSummary.startDate?`من ${Format.date(fuelSummary.startDate)}`:'لا يوجد وارد'})}
        ${c.kpi({icon:'📦',label:'وقود متبقي',value:Format.pretty(fuelSummary.remaining),hint:'الوارد - المستخدم'})}
        ${c.kpi({icon:'🏭',label:'إنتاج المياه',value:Format.pretty(reportSummary.waterProduction),hint:'كوب'})}
        ${c.kpi({icon:'🚚',label:'المياه المعبأة',value:Format.pretty(reportSummary.waterFilled),hint:'كوب'})}
        ${c.kpi({icon:'📉',label:'نسبة الفاقد',value:`${Format.pretty(lossPercent)}%`,hint:'محسوبة'})}
      </section>
      ${this.reportsSection(state.reports)}
      ${FuelUI.section(state.fuelEntries)}
      ${this.modals()}
      <nav class="bottom-nav"><button class="active">الرئيسية</button><button onclick="document.getElementById('reports').scrollIntoView()">التقارير</button><button onclick="App.openModal('reportModal')">إضافة</button><button onclick="document.getElementById('fuel').scrollIntoView()">الوقود</button></nav>
    </div></main>`;
  },
  reportsSection(reports){
    const rows=reports.slice(0,8).map(r=>`<button class="report-card"><span class="badge">${Format.date(r.reportDate)}</span><h4>${Components.esc(r.title||'تقرير يومي')}</h4><div class="meta"><span>وقود ${Format.pretty(r.fuel?.consumedDaily)} لتر</span><span>مياه ${Format.pretty(r.water?.filledWater)} كوب</span><span>${Format.pretty(r.water?.carsCount)} سيارة</span></div></button>`).join('');
    return `<section class="section glass" id="reports"><div class="section-head"><div><h3>التقارير</h3><p>آخر السجلات اليومية</p></div></div><div class="table-list">${rows||'<div class="empty">لا توجد تقارير</div>'}</div></section>`;
  },
  modals(){
    return `${ReportsUI.modal()}${FuelUI.modal()}`;
  }
};
