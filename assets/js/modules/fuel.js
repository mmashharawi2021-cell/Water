window.FuelUI={
  section(entries){
    const unique=Calculations.uniqueFuelEntries(entries);
    const rows=unique.slice(0,6).map(item=>`<article class="fuel-card"><span class="badge">${Format.date(item.date)}</span><h4>${Components.esc(item.supplier||item.donor||'مورد')}</h4><div class="meta"><span>${Format.pretty(item.quantityLiters||item.quantity)} لتر</span><span>${Components.esc(item.fillingMethod||'')}</span><span>${Components.esc(item.deliveredBy||'')}</span></div></article>`).join('');
    return `<section class="section glass" id="fuel"><div class="section-head"><div><h3>الوقود</h3><p>الوارد المسجل</p></div><button class="btn primary" onclick="App.openModal('fuelModal')">إضافة وقود</button></div><div class="table-list">${rows||'<div class="empty">لا توجد عمليات وقود</div>'}</div></section>`;
  },
  modal(){
    return Components.modal('fuelModal','إضافة وقود',`<form class="form-grid" onsubmit="FuelUI.submit(event)">
      ${Components.field({label:'اليوم',name:'day',value:new Date().toLocaleDateString('ar',{weekday:'long'})})}
      ${Components.field({label:'التاريخ',name:'date',type:'date',value:Format.today()})}
      ${Components.field({label:'الوقت',name:'time',type:'time',value:Format.time()})}
      ${Components.field({label:'المورد',name:'supplier'})}
      ${Components.field({label:'الكمية باللتر',name:'quantityLiters',type:'number'})}
      <label class="field"><span>طريقة التعبئة</span><select name="fillingMethod"><option>فرد تعبئة</option><option>جالون جاهز</option><option>أخرى</option></select></label>
      ${Components.field({label:'المسلّم',name:'deliveredBy'})}
      <label class="field full"><span>ملاحظات</span><textarea name="notes"></textarea></label>
      <div class="form-actions full"><button class="btn primary" type="submit">حفظ</button><button class="btn" type="button" onclick="App.closeModal('fuelModal')">إلغاء</button></div>
    </form>`);
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
