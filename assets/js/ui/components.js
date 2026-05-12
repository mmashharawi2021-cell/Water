window.Components={
  esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))},
  kpi({icon,label,value,hint,accent=false}){
    return `<article class="kpi glass ${accent?'accent':''}"><div class="icon">${icon}</div><span>${this.esc(label)}</span><strong>${this.esc(value)}</strong><small>${this.esc(hint||'')}</small></article>`;
  },
  modal(id,title,body){
    return `<div class="modal" id="${id}"><section class="modal-panel glass"><div class="modal-head"><div><h3>${this.esc(title)}</h3></div><button class="close" onclick="App.closeModal('${id}')">×</button></div>${body}</section></div>`;
  },
  field({label,name,type='text',value='',full=false,placeholder=''}){
    return `<label class="field ${full?'full':''}"><span>${this.esc(label)}</span><input type="${type}" name="${name}" value="${this.esc(value)}" placeholder="${this.esc(placeholder)}"></label>`;
  }
};
