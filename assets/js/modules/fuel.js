window.FuelUI={
  section(entries){
    const unique=Calculations.uniqueFuelEntries(entries);
    const rows=unique.slice(0,6).map(item=>`<article class="fuel-card"><span class="badge">${Format.date(item.date)}</span><h4>${Components.esc(item.supplier||item.donor||'مورد')}</h4><div class="meta"><span>${Format.pretty(item.quantityLiters||item.quantity)} لتر</span><span>${Components.esc(item.fillingMethod||'')}</span><span>${Components.esc(item.deliveredBy||'')}</span></div></article>`).join('');
    return `<section class="section glass" id="fuel"><div class="section-head"><div><h3>الوقود</h3><p>الوارد المسجل</p></div><button class="btn primary" onclick="App.openModal('fuelModal')">إضافة وقود</button></div><div class="table-list">${rows||'<div class="empty">لا توجد عمليات وقود</div>'}</div></section>`;
  },
  stepper(){
    return '<div class="wizard-card"><div class="wizard-steps"><div class="wizard-step" data-step="1"><div class="wizard-dot">1</div><span>تاريخ</span></div><div class="wizard-step" data-step="2"><div class="wizard-dot">2</div><span>مورد</span></div><div class="wizard-step" data-step="3"><div class="wizard-dot">3</div><span>كمية</span></div><div class="wizard-step" data-step="4"><div class="wizard-dot">4</div><span>حفظ</span></div><div class="wizard-line"><span></span></div></div></div>';
  },
  modal(){
    return Components.modal('fuelModal','إضافة وقود',`<form id="fuelWizard" class="form-grid wizard-form" data-step="1" onsubmit="FuelUI.submit(event)">
      ${this.stepper()}
      <section class="wizard-page" data-step="1"><div class="wizard-section-title">التاريخ والوقت</div>
      ${Components.field({label:'اليوم',name:'day',value:new Date().toLocaleDateString('ar',{weekday:'long'})})}
      ${Components.field({label:'التاريخ',name:'date',type:'date',value:Format.today()})}
      ${Components.field({label:'الوقت',name:'time',type:'time',value:Format.time()})}</section>
      <section class="wizard-page" data-step="2"><div class="wizard-section-title">المورد</div>
      ${Components.field({label:'المورد',name:'supplier',full:true})}
      ${Components.field({label:'المسلّم',name:'deliveredBy',full:true})}</section>
      <section class="wizard-page" data-step="3"><div class="wizard-section-title">بيانات الوقود</div>
      ${Components.field({label:'الكمية باللتر',name:'quantityLiters',type:'number'})}
      <label class="field floating-field"><select name="fillingMethod"><option>فرد تعبئة</option><option>جالون جاهز</option><option>أخرى</option></select><span>طريقة التعبئة</span></label></section>
      <section class="wizard-page" data-step="4"><div class="wizard-section-title">الملاحظات</div>
      ${Components.textarea({label:'ملاحظات',name:'notes'})}</section>
      <div class="wizard-actions"><button class="btn" type="button" data-prev onclick="Wizard.prev('fuelWizard')">السابق</button><button class="btn primary" type="button" data-next onclick="Wizard.next('fuelWizard')">التالي</button><button class="btn primary" type="submit" data-submit>حفظ الوقود</button><button class="btn" type="button" onclick="App.closeModal('fuelModal')">إلغاء</button></div>
    </form><script>Wizard.init("fuelWizard")</script>`);
  },
  async submit(event){
    event.preventDefault();
    const form=event.target;
    const data=Object.fromEntries(new FormData(form).entries());
    data.quantityLiters=Format.number(data.quantityLiters);
    await FirebaseService.addFuelEntry(data);
    form.reset();
    App.closeModal('fuelModal');
  }
};
