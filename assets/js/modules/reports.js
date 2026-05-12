window.ReportsUI={
  modal(){
    const title='تقرير تشغيل وضخ المياه '+Format.date(Format.today());
    const body='<form class="form-grid" onsubmit="ReportsUI.submit(event)">'+
      Components.field({label:'عنوان التقرير',name:'title',value:title,full:true})+
      Components.field({label:'التاريخ',name:'reportDate',type:'date',value:Format.today()})+
      Components.field({label:'ساعات التشغيل',name:'totalRunHours',placeholder:'7:30'})+
      Components.field({label:'وقود مستخدم',name:'fuelConsumed',type:'number'})+
      Components.field({label:'الإنتاج اليومي',name:'dailyProduction',type:'number'})+
      Components.field({label:'المياه المعبأة',name:'filledWater',type:'number'})+
      Components.field({label:'عدد السيارات',name:'carsCount',type:'number'})+
      Components.field({label:'العادم',name:'rejectWater',type:'number'})+
      '<label class="field full"><span>ملاحظات</span><textarea name="notes"></textarea></label>'+
      '<div class="form-actions full"><button class="btn primary" type="submit">حفظ</button><button class="btn" type="button" onclick="App.closeModal(\'reportModal\')">إلغاء</button></div></form>';
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
