window.Format={
  number(value){
    const n=Number(String(value??'').replace(',', '.').replace(/[^0-9.\-]/g,''));
    if(!Number.isFinite(n)) return 0;
    return n;
  },
  pretty(value){
    const n=this.number(value);
    const r=+n.toFixed(2);
    return Number.isInteger(r)?String(r):String(r);
  },
  date(value){
    const parts=String(value||'').split('-');
    return parts.length===3?`${parts[2]}/${parts[1]}/${parts[0]}`:String(value||'');
  },
  today(){return new Date().toISOString().slice(0,10)},
  time(){return new Date().toTimeString().slice(0,5)}
};
