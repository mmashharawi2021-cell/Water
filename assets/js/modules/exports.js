window.Exports={
  exportReports(){
    const rows=(App.state?.reports||[]).map(r=>({
      'التاريخ':r.reportDate||'',
      'العنوان':r.title||'',
      'ساعات التشغيل':r.generator?.totalRunHours||'',
      'وقود مستخدم':r.fuel?.consumedDaily||0,
      'الإنتاج':r.water?.dailyProduction||0,
      'المعبأ':r.water?.filledWater||0,
      'السيارات':r.water?.carsCount||0
    }));
    if(!rows.length){alert('لا توجد بيانات');return;}
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Reports');
    XLSX.writeFile(wb,'water-reports.xlsx');
  }
};
