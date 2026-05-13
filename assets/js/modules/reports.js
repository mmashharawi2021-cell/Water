window.ReportsUI={
  stepper(){
    return '<div class="wizard-card"><div class="wizard-steps"><div class="wizard-step" data-step="1"><div class="wizard-dot">1</div><span>بيانات</span></div><div class="wizard-step" data-step="2"><div class="wizard-dot">2</div><span>تشغيل</span></div><div class="wizard-step" data-step="3"><div class="wizard-dot">3</div><span>مياه</span></div><div class="wizard-step" data-step="4"><div class="wizard-dot">4</div><span>حفظ</span></div><div class="wizard-line"><span></span></div></div></div>';
  },
  modal(){
    const title='تقرير تشغيل وضخ المياه '+Format.date(Format.today());
    const body='<form id="reportWizard" class="form-grid wizard-form" data-step="1" onsubmit="ReportsUI.submit(event)">'+
      this.stepper()+
      '<section class="wizard-page" data-step="1"><div class="wizard-section-title">بيانات التقرير</div>'+
      Components.field({label:'عنوان التقرير',name:'title',value:title,full:true})+
      Components.field({label:'التاريخ',name:'reportDate',type:'date',value:Format.today()})+'</section>'+
      '<section class="wizard-page" data-step="2"><div class="wizard-section-title">التشغيل والوقود</div>'+
      Components.field({label:'ساعات التشغيل',name:'totalRunHours',placeholder:'7:30'})+
      Components.field({label:'وقود مستخدم',name:'fuelConsumed',type:'number'})+'</section>'+
      '<section class="wizard-page" data-step="3"><div class="wizard-section-title">المياه</div>'+
      Components.field({label:'الإنتاج اليومي',name:'dailyProduction',type:'number'})+
      Components.field({label:'المياه المعبأة',name:'filledWater',type:'number'})+
      Components.field({label:'عدد السيارات',name:'carsCount',type:'number'})+
      Components.field({label:'العادم',name:'rejectWater',type:'number'})+'</section>'+
      '<section class="wizard-page" data-step="4"><div class="wizard-section-title">المراجعة والملاحظات</div>'+
      Components.textarea({label:'ملاحظات',name:'notes'})+'</section>'+
      '<div class="wizard-actions"><button class="btn" type="button" data-prev onclick="Wizard.prev(\'reportWizard\')">السابق</button><button class="btn primary" type="button" data-next onclick="Wizard.next(\'reportWizard\')">التالي</button><button class="btn primary" type="submit" data-submit>حفظ التقرير</button><button class="btn" type="button" onclick="App.closeModal(\'reportModal\')">إلغاء</button></div></form><script>Wizard.init("reportWizard")</script>';
    return Components.modal('reportModal','إضافة تقرير',body);
  },
  async submit(event){
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.target).entries());
    const report={title:data.title,reportDate:data.reportDate,generator:{totalRunHours:data.totalRunHours},fuel:{consumedDaily:Format.number(data.fuelConsumed)},water:{dailyProduction:Format.number(data.dailyProduction),filledWater:Format.number(data.filledWater),carsCount:Format.number(data.carsCount),rejectWater:Format.number(data.rejectWater)},notes:data.notes};
    await FirebaseService.saveReport(report);
    event.target.reset();
    App.closeModal('reportModal');
  }
};
