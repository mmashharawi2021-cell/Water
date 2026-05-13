window.Wizard={
  go:function(formId,step){
    var form=document.getElementById(formId);
    if(!form)return;
    var pages=[].slice.call(form.querySelectorAll('.wizard-page'));
    var max=pages.length;
    var next=Math.max(1,Math.min(step,max));
    form.dataset.step=String(next);
    pages.forEach(function(page){page.classList.toggle('active',Number(page.dataset.step)===next)});
    [].slice.call(form.querySelectorAll('.wizard-step')).forEach(function(item){
      var n=Number(item.dataset.step);
      item.classList.toggle('is-active',n===next);
      item.classList.toggle('is-done',n<next);
    });
    var progress=form.querySelector('.wizard-line span');
    if(progress)progress.style.width=((next/max)*100)+'%';
    [].slice.call(form.querySelectorAll('[data-prev]')).forEach(function(btn){btn.hidden=next===1});
    [].slice.call(form.querySelectorAll('[data-next]')).forEach(function(btn){btn.hidden=next===max});
    [].slice.call(form.querySelectorAll('[data-submit]')).forEach(function(btn){btn.hidden=next!==max});
  },
  next:function(formId){var form=document.getElementById(formId);this.go(formId,Number(form&&form.dataset.step||1)+1)},
  prev:function(formId){var form=document.getElementById(formId);this.go(formId,Number(form&&form.dataset.step||1)-1)},
  init:function(formId){var self=this;setTimeout(function(){self.go(formId,1)},0)}
};
