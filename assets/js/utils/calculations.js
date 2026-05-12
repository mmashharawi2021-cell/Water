window.Calculations={
  fuelSummary(reports=[],fuelEntries=[]){
    const unique=this.uniqueFuelEntries(fuelEntries);
    const incoming=unique.reduce((sum,item)=>sum+Format.number(item.quantityLiters||item.quantity),0);
    const dates=unique.map(item=>item.date).filter(Boolean).sort();
    const startDate=dates[0]||'';
    const used=startDate?reports.reduce((sum,report)=>{
      if(!report.reportDate||report.reportDate<startDate) return sum;
      return sum+Format.number(report.fuel?.consumedDaily);
    },0):0;
    return {incoming,used,remaining:incoming-used,startDate};
  },
  uniqueFuelEntries(entries=[]){
    const seen=new Set();
    return entries.filter(item=>{
      const key=[item.date||'',item.time||'',item.supplier||item.donor||'',item.quantityLiters||item.quantity||'',item.fillingMethod||'',item.deliveredBy||''].join('|');
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
  reportSummary(reports=[]){
    return reports.reduce((acc,report)=>{
      acc.count+=1;
      acc.runHours+=this.hoursToDecimal(report.generator?.totalRunHours);
      acc.waterProduction+=Format.number(report.water?.dailyProduction);
      acc.waterFilled+=Format.number(report.water?.filledWater);
      acc.cars+=Format.number(report.water?.carsCount);
      acc.reject+=Format.number(report.water?.rejectWater);
      return acc;
    },{count:0,runHours:0,waterProduction:0,waterFilled:0,cars:0,reject:0});
  },
  hoursToDecimal(value){
    if(!value) return 0;
    if(String(value).includes(':')){
      const [h,m='0']=String(value).split(':');
      return Format.number(h)+(Format.number(m)/60);
    }
    return Format.number(value);
  }
};
