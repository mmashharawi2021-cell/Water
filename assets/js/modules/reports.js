window.ReportsUI={
  stepper(){
    return '<div class="wizard-card"><div class="wizard-steps"><div class="wizard-step is-done"><div class="wizard-dot">1</div><span>بيانات</span></div><div class="wizard-step is-done"><div class="wizard-dot">2</div><span>تشغيل</span></div><div class="wizard-step is-active"><div class="wizard-dot">3</div><span>مياه</span></div><div class="wizard-step"><div class="wizard-dot">4</div><span>حفظ</span></div><div class="wizard-line"><span></span></div></div></div>';
  },
  modal(){
    const title='تقرير تشغيل وضخ المياه '+Format.date(Format.today());
    const body='<form class="form-grid wizard-form" onsubmit="ReportsUI.submit(event)">'+
      this.stepper()+
      '<div class="wizard-section-title">بيانات التقرير</div>'+
      Components.field({label:'عنوان التقرير',name:'title',value:title,full:true})+
      Components.field({label:'التاريخ',name:'reportDate',type:'date',value:Format.today()})+
      '<div class="wizard-section-title">التشغيل والوقود</div>'+
      Components.field({label:'ساعات التشغيل',name:'totalRunHours',placeholder:'7:30'})+
      Components.field({label:'وقود مستخدم',name:'fuelConsumed',type:'number'})+
      '<div class="wizard-section-title">المياه</div>'+
      Components.field({label:'الإنتاج اليومي',name:'dailyProduction',type:'number'})+
      Components.field({label:'المياه المعبأة',name:'filledWater',type:'number'})+
      Components.field({label:'عدد السيارات',name:'carsCount',type:'number'})+
      Components.field({label:'العادم',name:'rejectWater',type:'number'})+
      '<label class="field full"><span>ملاحظات</span><textarea name="notes"></textarea></label>'+
      '<div class="form-actions full"><button class="btn primary" type="submit">حفظ التقرير</button><button class="btn" type="button" onclick="App.closeModal(\'reportModal\')">إلغاء</button></div></form>';
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
