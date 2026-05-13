window.ReportsUI={
  stepper(){
    return '<div class="wizard-card"><div class="wizard-steps steps-6"><div class="wizard-step" data-step="1"><div class="wizard-dot">1</div><span>بيانات</span></div><div class="wizard-step" data-step="2"><div class="wizard-dot">2</div><span>تشغيل</span></div><div class="wizard-step" data-step="3"><div class="wizard-dot">3</div><span>وقود</span></div><div class="wizard-step" data-step="4"><div class="wizard-dot">4</div><span>مياه</span></div><div class="wizard-step" data-step="5"><div class="wizard-dot">5</div><span>فحوصات</span></div><div class="wizard-step" data-step="6"><div class="wizard-dot">6</div><span>حفظ</span></div><div class="wizard-line"><span></span></div></div></div>';
  },
  modal(){
    const date=Format.today();
    const title='تقرير تشغيل وضخ المياه '+Format.date(date);
    const body='<form id="reportWizard" class="form-grid wizard-form" data-step="1" onsubmit="ReportsUI.submit(event)">'+
      this.stepper()+
      '<section class="wizard-page" data-step="1"><div class="wizard-section-title">بيانات التقرير</div>'+
      Components.field({label:'عنوان التقرير',name:'title',value:title,full:true})+
      Components.field({label:'التاريخ',name:'reportDate',type:'date',value:date})+
      Components.field({label:'المحطة',name:'station',value:'المحطة الرئيسية'})+'</section>'+
      '<section class="wizard-page" data-step="2"><div class="wizard-section-title">تشغيل المولد</div>'+
      Components.field({label:'البداية',name:'generatorStart',type:'time'})+
      Components.field({label:'الإيقاف',name:'generatorEnd',type:'time'})+
      Components.field({label:'ساعات التشغيل',name:'totalRunHours',placeholder:'12:00'})+
      Components.field({label:'الحالة',name:'generatorStatus',value:'يعمل'})+'</section>'+
      '<section class="wizard-page" data-step="3"><div class="wizard-section-title">الوقود</div>'+
      Components.field({label:'المضاف يومياً',name:'fuelAddedDaily',type:'number'})+
      Components.field({label:'المستهلك يومياً',name:'fuelConsumed',type:'number'})+
      Components.field({label:'المورد من البلدية',name:'fuelMunicipality',type:'number'})+
      Components.field({label:'الرصيد السابق',name:'fuelPrevious',type:'number'})+
      Components.field({label:'الرصيد الحالي',name:'fuelCurrent',type:'number'})+
      Components.field({label:'الفرق/الفاقد',name:'fuelLoss',type:'number'})+'</section>'+
      '<section class="wizard-page" data-step="4"><div class="wizard-section-title">كميات المياه</div>'+
      Components.field({label:'إنتاج الغاطس كوب/ساعة',name:'wellRate',type:'number'})+
      Components.field({label:'بعد الفلترة كوب/ساعة',name:'filteredRate',type:'number'})+
      Components.field({label:'الإنتاج اليومي',name:'dailyProduction',type:'number'})+
      Components.field({label:'العادم',name:'rejectWater',type:'number'})+
      Components.field({label:'نسبة الفاقد %',name:'lossPercent',type:'number'})+
      Components.field({label:'المعبأ للجهات',name:'filledWater',type:'number'})+
      Components.field({label:'عدد السيارات',name:'carsCount',type:'number'})+
      Components.field({label:'متوسط السيارة',name:'carAverage',type:'number'})+'</section>'+
      '<section class="wizard-page" data-step="5"><div class="wizard-section-title">فحوصات المياه</div>'+
      Components.field({label:'PH بعد التحلية',name:'phFiltered',type:'number'})+
      Components.field({label:'PH مياه الغاطس',name:'phWell',type:'number'})+
      Components.field({label:'TDS مياه محلاة',name:'tdsFiltered',type:'number'})+
      Components.field({label:'TDS بئر',name:'tdsWell',type:'number'})+
      Components.field({label:'TDS عادم',name:'tdsReject',type:'number'})+
      Components.field({label:'الكلور الحر',name:'freeChlorine',type:'number'})+'</section>'+
      '<section class="wizard-page" data-step="6"><div class="wizard-section-title">الجهات والملاحظات</div>'+
      Components.textarea({label:'الجهات المستفيدة: الاسم | الكمية | السيارات',name:'beneficiariesText'})+
      Components.textarea({label:'ملاحظات',name:'notes'})+'</section>'+
      '<div class="wizard-actions"><button class="btn" type="button" data-prev onclick="Wizard.prev(\'reportWizard\')">السابق</button><button class="btn primary" type="button" data-next onclick="Wizard.next(\'reportWizard\')">التالي</button><button class="btn primary" type="submit" data-submit>حفظ التقرير</button><button class="btn" type="button" onclick="App.closeModal(\'reportModal\')">إلغاء</button></div></form><script>Wizard.init("reportWizard")</script>';
    return Components.modal('reportModal','إضافة تقرير',body);
  },
  parseBeneficiaries(text){
    return String(text||'').split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{
      const parts=line.split('|').map(part=>part.trim());
      return {name:parts[0]||'',quantity:Format.number(parts[1]),cars:Format.number(parts[2])};
    }).filter(item=>item.name);
  },
  formatTime(value){
    if(!value) return '_';
    const parts=String(value).split(':');
    let hour=Number(parts[0]||0);
    const minute=parts[1]||'00';
    const suffix=hour>=12?'م':'ص';
    hour=hour%12||12;
    return `${String(hour).padStart(2,'0')}:${minute} ${suffix}`;
  },
  value(value,unit){
    const raw=value===undefined||value===null||value===''?'_':Format.pretty(value);
    return unit&&raw!=='_'?`${raw} ${unit}`:raw;
  },
  formatReport(report){
    const date=Format.date(report.reportDate);
    const b=(report.beneficiaries||[]).map(item=>`▪️ ${item.name}\nالكمية/ ${this.value(item.quantity,'كوب')} ، عدد السيارات/ ${this.value(item.cars)}`).join('\n\n')||'_';
    return `*${report.title||'تقرير تشغيل وضخ المياه '+date}*\n\n📅 التاريخ: ${date}\n📍 المحطة: ${report.station||'المحطة الرئيسية'}\n\n⏱️ تشغيل المولد:\n▪️ البداية: ${this.formatTime(report.generator?.startTime)}\n▪️ الإيقاف: ${this.formatTime(report.generator?.endTime)}\n▪️ ساعات التشغيل: ${report.generator?.totalRunHours||'_'}\n▪️ الحالة: ${report.generator?.status||'_'}\n\n⛽ الوقود:\n▪️ المضاف يومياً: ${this.value(report.fuel?.addedDaily,'لتر')}\n▪️ المستهلك يومياً: ${this.value(report.fuel?.consumedDaily,'لتر')}\n▪️ المورد من البلدية: ${this.value(report.fuel?.municipalitySupply,'لتر')}\n▪️ الرصيد السابق: ${this.value(report.fuel?.previousBalance,'لتر')}\n▪️ الرصيد الحالي: ${this.value(report.fuel?.currentBalance,'لتر')}\n▪️ الفرق/الفاقد: ${this.value(report.fuel?.loss,'لتر')}\n\n💧 كميات المياه:\n▪️ إنتاج الغاطس: ${this.value(report.water?.wellRate,'كوب/ساعة')}\n▪️ بعد الفلترة: ${this.value(report.water?.filteredRate,'كوب/ساعة')}\n▪️ الإنتاج اليومي: ${this.value(report.water?.dailyProduction,'كوب')}\n▪️ العادم: ${this.value(report.water?.rejectWater,'كوب')}\n▪️ نسبة الفاقد: ${this.value(report.water?.lossPercent,'%')}\n▪️ المعبأ للجهات: ${this.value(report.water?.filledWater,'كوب')}\n▪️ عدد السيارات: ${this.value(report.water?.carsCount)}\n▪️ متوسط السيارة: ${this.value(report.water?.carAverage,'كوب')}\n\n🧪 فحوصات المياه:\n▪️ PH بعد التحلية: ${this.value(report.tests?.phFiltered)}\n▪️ PH مياه الغاطس: ${this.value(report.tests?.phWell)}\n▪️ TDS مياه محلاة: ${this.value(report.tests?.tdsFiltered)}\n▪️ TDS بئر: ${this.value(report.tests?.tdsWell)}\n▪️ TDS عادم: ${this.value(report.tests?.tdsReject)}\n▪️ الكلور الحر: ${this.value(report.tests?.freeChlorine)}\n\n🚚 الجهات المستفيدة:\n${b}\n\n📝 ملاحظات:\n${report.notes||'_'}`;
  },
  async submit(event){
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.target).entries());
    const report={
      title:data.title,reportDate:data.reportDate,station:data.station||'المحطة الرئيسية',
      generator:{startTime:data.generatorStart,endTime:data.generatorEnd,totalRunHours:data.totalRunHours,status:data.generatorStatus},
      fuel:{addedDaily:Format.number(data.fuelAddedDaily),consumedDaily:Format.number(data.fuelConsumed),municipalitySupply:Format.number(data.fuelMunicipality),previousBalance:Format.number(data.fuelPrevious),currentBalance:Format.number(data.fuelCurrent),loss:Format.number(data.fuelLoss)},
      water:{wellRate:Format.number(data.wellRate),filteredRate:Format.number(data.filteredRate),dailyProduction:Format.number(data.dailyProduction),rejectWater:Format.number(data.rejectWater),lossPercent:Format.number(data.lossPercent),filledWater:Format.number(data.filledWater),carsCount:Format.number(data.carsCount),carAverage:Format.number(data.carAverage)},
      tests:{phFiltered:Format.number(data.phFiltered),phWell:Format.number(data.phWell),tdsFiltered:Format.number(data.tdsFiltered),tdsWell:Format.number(data.tdsWell),tdsReject:Format.number(data.tdsReject),freeChlorine:Format.number(data.freeChlorine)},
      beneficiaries:this.parseBeneficiaries(data.beneficiariesText),notes:data.notes
    };
    await FirebaseService.saveReport(report);
    event.target.reset();
    App.closeModal('reportModal');
  }
};
