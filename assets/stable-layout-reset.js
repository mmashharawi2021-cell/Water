(() => {

  /* ============================================================
     نظام التنقل بالتبويبات — كل تبويب يُظهر قسمه فقط
     ============================================================ */

  // --- Helpers ---
  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  }
  function n(v) { return window.ReportUtils?.number ? window.ReportUtils.number(v) : (Number(v || 0) || 0); }
  function fmt(v, d = 2) { const x = +Number(v).toFixed(d); return Number.isInteger(x) ? String(x) : String(x); }
  function hours(v) { if (!v) return 0; const p = String(v).split(':').map(Number); return p.length >= 2 ? (p[0] || 0) + ((p[1] || 0) / 60) : n(v); }

  function can(p) {
    if (!window.AuthUsers) return true;
    const u = window.AuthUsers.currentUser?.();
    if (!u || u.role === 'superAdmin') return true;
    return window.AuthUsers.hasPermission?.(p) === true;
  }
  function btn(perm, html) { return can(perm) ? html : ''; }

  function summary(list) {
    const latestFuel = [...list].filter(r => n(r?.fuel?.currentBalance) > 0).sort((a, b) => String(b.reportDate).localeCompare(String(a.reportDate)))[0];
    const d = list.reduce((a, r) => {
      a.runHours += hours(r?.generator?.totalRunHours);
      a.fuelConsumed += n(r?.fuel?.consumedDaily);
      a.fuelSupplied += n(r?.fuel?.addedDaily) + n(r?.fuel?.municipalSupplied);
      a.waterProduction += n(r?.water?.dailyProduction);
      a.rejectWater += n(r?.water?.rejectWater);
      a.filledWater += n(r?.water?.filledWater);
      a.cars += n(r?.water?.carsCount);
      return a;
    }, { runHours: 0, fuelConsumed: 0, fuelSupplied: 0, waterProduction: 0, rejectWater: 0, filledWater: 0, cars: 0 });
    d.lossPercentage = d.waterProduction ? (d.rejectWater / d.waterProduction) * 100 : 0;
    d.stock = latestFuel ? n(latestFuel.fuel?.currentBalance) : 0;
    d.stockDate = latestFuel?.reportDate || '';
    return d;
  }

  // --- KPI card ---
  function kpi(icon, label, value, hint = '') {
    return `<article class="kpi-card"><div class="kpi-icon">${icon}</div><span>${esc(label)}</span><strong>${esc(value)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}</article>`;
  }

  // --- Report card ---
  function card(report, activeId) {
    const r = window.ReportUtils?.recalc ? window.ReportUtils.recalc(report) : report;
    const date = window.ReportUtils?.displayDate ? window.ReportUtils.displayDate(r.reportDate) : (r.reportDate || '-');
    const warns = Array.isArray(r.warnings) ? r.warnings.length : 0;
    const badge = warns ? `<b class="card-badge warn">${warns} تنبيه</b>` : `<b class="card-badge ok">مكتمل</b>`;
    return `<button class="report-card ${r.id === activeId ? 'active' : ''}" onclick="App.select('${esc(r.id)}')">`
      + `<span>${date} ${badge}</span>`
      + `<strong>${esc(r.title || 'تقرير تشغيل وضخ المياه')}</strong>`
      + `<small>${esc(r.stationName || '-')} • تشغيل ${esc(r.generator?.totalRunHours || '-')} • وقود ${fmt(n(r.fuel?.consumedDaily))} لتر</small>`
      + `<em>${fmt(n(r.water?.filledWater))} كوب معبأ • ${fmt(n(r.water?.carsCount), 0)} سيارة</em>`
      + `</button>`;
  }

  // --- Report detail panel ---
  function detail(report) {
    if (!report) return `<section id="reportDetails" class="details empty-state details-placeholder"><div class="empty-icon">📄</div><h2>اختر تقريرًا من الأرشيف</h2><p>عند الضغط على أي كرت ستظهر تفاصيله هنا.</p></section>`;
    const r = window.ReportUtils?.recalc ? window.ReportUtils.recalc(report) : report;
    const date = window.ReportUtils?.displayDate ? window.ReportUtils.displayDate(r.reportDate) : (r.reportDate || '-');
    const warnings = (r.warnings || []).length ? `<div class="notice warn">${r.warnings.map(w => `<p>${esc(w)}</p>`).join('')}</div>` : '';
    const actions = [
      btn('editReports', `<button class="btn primary action-float" onclick="App.openEdit('${esc(r.id)}')">✏️ تعديل</button>`),
      btn('shareWhatsapp', `<button class="btn action-float" onclick="App.copyWhatsApp('${esc(r.id)}')">🟢 واتساب</button>`),
      btn('exportPdf', `<button class="btn action-float" onclick="App.exportPdf('${esc(r.id)}')">📄 PDF</button>`),
      btn('exportExcel', `<button class="btn action-float" onclick="App.exportOneExcel('${esc(r.id)}')">📊 Excel</button>`),
      btn('deleteReports', `<button class="btn danger" onclick="App.deleteReport('${esc(r.id)}')">🗑️ حذف</button>`)
    ].join('');
    return `<section id="reportDetails" class="details details-reveal">
      <div class="section-head details-title"><div><p class="eyebrow">تفاصيل التقرير</p><h2>${esc(r.title || '')}</h2></div></div>
      ${warnings}
      <div class="detail-grid">
        <article><span>التاريخ</span><strong>${date}</strong></article>
        <article><span>المحطة</span><strong>${esc(r.stationName || '-')}</strong></article>
        <article><span>ساعات التشغيل</span><strong>${esc(r.generator?.totalRunHours || '-')}</strong></article>
        <article><span>الوقود المستهلك</span><strong>${fmt(n(r.fuel?.consumedDaily))} لتر</strong></article>
        <article><span>الرصيد السابق</span><strong>${fmt(n(r.fuel?.previousBalance))} لتر</strong></article>
        <article><span>الرصيد الحالي</span><strong>${fmt(n(r.fuel?.currentBalance))} لتر</strong></article>
        <article><span>الإنتاج اليومي</span><strong>${fmt(n(r.water?.dailyProduction))} كوب</strong></article>
        <article><span>المعبأ</span><strong>${fmt(n(r.water?.filledWater))} كوب</strong></article>
        <article><span>العادم</span><strong>${fmt(n(r.water?.rejectWater))} كوب</strong></article>
        <article><span>السيارات</span><strong>${fmt(n(r.water?.carsCount), 0)}</strong></article>
        <article><span>نسبة الفاقد</span><strong>${fmt(n(r.water?.lossPercentage))}%</strong></article>
        <article><span>الكلور الحر</span><strong>${esc(r.tests?.freeChlorine || '-')}</strong></article>
      </div>
      <div class="report-actions-panel">${actions}</div>
    </section>`;
  }

  // --- Modals (unchanged) ---
  function reportModal() {
    return `<div id="reportModal" class="modal"><div class="modal-backdrop" onclick="App.closeModal()"></div><div class="modal-panel large"><button class="close" onclick="App.closeModal()">×</button><div class="modal-title"><span>📋</span><div><h2>إضافة / تعديل تقرير</h2><p>استخدم التعبئة التلقائية أو عدّل الحقول يدويًا قبل الحفظ.</p></div></div><div class="auto-box"><button class="btn primary action-float" onclick="App.togglePaste()">تعبئة تلقائية من نص التقرير</button><textarea id="pasteText" class="smart-input hidden" placeholder="الصق تقرير واتساب الكامل هنا..."></textarea><div class="actions"><button id="parseBtn" class="btn hidden" onclick="App.parseText()">تحليل النص وملء الحقول</button></div></div><div id="formHost"></div><div class="actions modal-actions"><button class="btn primary big action-float" onclick="App.saveReport()">حفظ التقرير</button><button class="btn" onclick="App.closeModal()">إلغاء</button></div></div></div>`;
  }

  function settingsModal(settings) {
    if (window.AppUI?.settingsModal) return window.AppUI.settingsModal(settings || {});
    return '';
  }

  function usersModal() {
    if (!can('manageUsers')) return '';
    return `<div id="usersModal" class="modal"><div class="modal-backdrop" onclick="UsersUI.close()"></div><div class="modal-panel users-panel"><button class="close" onclick="UsersUI.close()">×</button><div class="modal-title"><span>👥</span><div><h2>إدارة المستخدمين والصلاحيات</h2><p>إضافة مستخدمين وتحديد صلاحياتهم.</p></div></div><div id="usersContent"></div></div></div>`;
  }

  // --- Bottom Nav (Mobile) ---
  function bottomNav() {
    return `<nav class="bottom-nav">
      ${btn('viewReports', `<button onclick="DashTabs.show('home')"><span>🏠</span><b>الرئيسية</b></button>`)}
      ${btn('viewReports', `<button onclick="DashTabs.show('reports')"><span>📋</span><b>التقارير</b></button>`)}
      ${btn('createReports', `<button class="main" onclick="App.openNew()"><span>＋</span><b>إضافة</b></button>`)}
      <button onclick="DashTabs.show('fuel')"><span>⛽</span><b>الوقود</b></button>
      ${btn('manageSettings', `<button onclick="App.openSettings()"><span>⚙️</span><b>الإعدادات</b></button>`)}
    </nav>`;
  }

  // --- MAIN LAYOUT ---
  function stableLayout(state, settings = {}) {
    const reports = (state?.reports || []).map(r => window.ReportUtils?.recalc ? window.ReportUtils.recalc(r) : r);
    const active = reports.find(r => r.id === state?.currentId) || null;
    const s = summary(reports);
    const user = window.AuthUsers?.currentUser?.();

    return `
<!-- Legacy shell (hidden) -->
<main class="app-shell legacy-shell-hidden" style="display:none !important;">
  <section class="stats dashboard-totals"></section>
  <section id="reports" class="cards-section"></section>
</main>

<!-- ===================== CORPORATE DASHBOARD ===================== -->
<div class="dashboard-container">

  <!-- ===== SIDEBAR ===== -->
  <aside class="corporate-sidebar">
    <div class="sidebar-logo">
      <span class="logo-icon">💧</span>
      <div>
        <h2>إدارة المياه</h2>
        <small>نظام التشغيل اليومي</small>
      </div>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">ص</div>
      <div class="user-info">
        <strong>${esc(user?.fullName || 'صالح الدحنون')}</strong>
        <span>${esc(user?.roleLabel || 'مدير النظام')}</span>
      </div>
    </div>

    <nav class="sidebar-menu">
      <a class="menu-link" data-tab="home" onclick="DashTabs.show('home')">
        <span class="menu-icon">🏠</span><span>الرئيسية</span>
      </a>
      <a class="menu-link" data-tab="reports" onclick="DashTabs.show('reports')">
        <span class="menu-icon">📋</span><span>أرشيف التقارير</span>
      </a>
      ${btn('createReports', `<a class="menu-link menu-action" onclick="App.openNew()">
        <span class="menu-icon">➕</span><span>إضافة تقرير</span>
      </a>`)}
      <a class="menu-link" data-tab="fuel" onclick="DashTabs.show('fuel')">
        <span class="menu-icon">⛽</span><span>الوقود الوارد</span>
      </a>
      <a class="menu-link" data-tab="export" onclick="DashTabs.show('export')">
        <span class="menu-icon">📤</span><span>مركز التصدير</span>
      </a>
      ${can('manageUsers') ? `<a class="menu-link" onclick="UsersUI.open()">
        <span class="menu-icon">👥</span><span>المستخدمون</span>
      </a>` : ''}
      <a class="menu-link" onclick="App.openSettings()">
        <span class="menu-icon">⚙️</span><span>الإعدادات</span>
      </a>
      <a class="menu-link menu-logout" onclick="App.logout()">
        <span class="menu-icon">🚪</span><span>تسجيل الخروج</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="system-badge">🟢 النظام نشط</div>
      <small>© 2026 صالح الدحنون</small>
    </div>
  </aside>

  <!-- ===== WORKSPACE ===== -->
  <div class="corporate-workspace">

    <!-- ── VIEW: HOME (الرئيسية) ── -->
    <div class="dash-view" id="view-home">
      <header class="workspace-header">
        <div class="header-title">
          <h1>لوحة التحكم الرئيسية</h1>
          <p>نظرة شاملة على أداء المحطة — إنتاج المياه، الوقود، وساعات التشغيل</p>
        </div>
        <div class="header-quick-actions">
          ${btn('createReports', `<button class="btn primary action-float" onclick="App.openNew()">➕ إضافة تقرير</button>`)}
          <button class="btn" onclick="App.openSummary()">📈 تقارير تجميعية</button>
          ${btn('createReports', `<button class="btn" onclick="App.duplicateLastReport()">⧉ تكرار آخر تقرير</button>`)}
        </div>
      </header>

      <section class="stats dashboard-totals kpi-grid">
        <article class="kpi-wide">
          <div class="kpi-head"><span>ملخص ساعات التشغيل</span><b>${reports.length} تقرير</b></div>
          <strong>${fmt(s.runHours, 1)}</strong>
          <small>إجمالي ساعات التشغيل</small>
        </article>
        ${kpi('⛽', 'وقود مستهلك', fmt(s.fuelConsumed), 'لتر')}
        ${kpi('📦', 'مخزون السولار', s.stock ? fmt(s.stock) : '—', s.stockDate ? `آخر رصيد ${window.ReportUtils?.displayDate ? window.ReportUtils.displayDate(s.stockDate) : s.stockDate}` : 'لا يوجد رصيد')}
        ${kpi('📥', 'سولار مستلم', fmt(s.fuelSupplied), 'المضاف + المورد')}
        ${kpi('💧', 'مياه معبأة', fmt(s.filledWater), 'كوب')}
        ${kpi('🚚', 'عدد السيارات', fmt(s.cars, 0), 'سيارة')}
        ${kpi('🏭', 'إجمالي الإنتاج', fmt(s.waterProduction), 'كوب')}
        ${kpi('♻️', 'إجمالي العادم', fmt(s.rejectWater), 'كوب')}
        ${kpi('📉', 'نسبة الفاقد', `${fmt(s.lossPercentage)}%`, 'محسوبة تلقائيًا')}
      </section>

      <!-- آخر 3 تقارير في الرئيسية -->
      <div class="home-recent">
        <div class="home-recent-header">
          <h3>📋 آخر التقارير</h3>
          <button class="btn sm" onclick="DashTabs.show('reports')">عرض الكل ←</button>
        </div>
        <div class="recent-cards">
          ${reports.slice(0, 3).map(r => card(r, active?.id)).join('') || '<div class="empty-mini">لا توجد تقارير محفوظة بعد.</div>'}
        </div>
      </div>
    </div>

    <!-- ── VIEW: REPORTS (أرشيف التقارير) ── -->
    <div class="dash-view" id="view-reports" style="display:none">
      <header class="workspace-header">
        <div class="header-title">
          <h1>أرشيف التقارير اليومية</h1>
          <p>كل تقارير التشغيل والضخ المحفوظة — اضغط على أي كرت لعرض تفاصيله</p>
        </div>
        <div class="header-quick-actions">
          ${btn('createReports', `<button class="btn primary action-float" onclick="App.openNew()">➕ تقرير جديد</button>`)}
          ${btn('createReports', `<button class="btn" onclick="App.duplicateLastReport()">⧉ تكرار آخر تقرير</button>`)}
          ${btn('exportExcel', `<button class="btn" onclick="App.exportAllExcel()">📊 Excel شامل</button>`)}
        </div>
      </header>

      <div class="reports-split-view">
        <section id="reports" class="cards-section reports-list-panel">
          <div class="cards reports-grid">
            ${reports.map(r => card(r, active?.id)).join('') || '<div class="empty-mini">لا توجد تقارير محفوظة.</div>'}
          </div>
        </section>
        <div class="details-wrapper-panel">
          ${detail(active)}
        </div>
      </div>
    </div>

    <!-- ── VIEW: FUEL (الوقود الوارد) ── -->
    <div class="dash-view" id="view-fuel" style="display:none">
      <header class="workspace-header">
        <div class="header-title">
          <h1>سجل الوقود الوارد</h1>
          <p>جميع عمليات استلام الوقود — التواريخ، الكميات، المورّدون</p>
        </div>
        <div class="header-quick-actions">
          <button class="btn primary action-float" onclick="window.WaterFuel?.openAddFuel?.()">➕ إضافة توريد وقود</button>
        </div>
      </header>
      <!-- يُملأ بواسطة incoming-fuel-v2.js -->
      <div id="incomingFuelSection" class="incoming-fuel-inner"></div>
    </div>

    <!-- ── VIEW: EXPORT (مركز التصدير) ── -->
    <div class="dash-view" id="view-export" style="display:none">
      <header class="workspace-header">
        <div class="header-title">
          <h1>مركز التصدير</h1>
          <p>تصدير البيانات بصيغة Excel أو PDF — اختر الفترة والنوع ثم ابدأ التحميل</p>
        </div>
      </header>
      <!-- يُملأ بواسطة direct-export-center.js -->
      <section id="exportCenterSection" class="export-center-section"></section>
    </div>

  </div><!-- /corporate-workspace -->
</div><!-- /dashboard-container -->

${reportModal()}
${settingsModal(settings)}
${usersModal()}
${bottomNav()}`;
  }

  // =========================================================
  //  DashTabs — نظام التبديل بين التبويبات
  // =========================================================
  window.DashTabs = {
    views: ['home', 'reports', 'fuel', 'export'],
    current: 'home',

    show(tab) {
      this.current = tab;

      // إخفاء كل الـ views
      this.views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.style.display = 'none';
      });

      // إظهار الـ view المطلوب
      const target = document.getElementById(`view-${tab}`);
      if (target) {
        target.style.display = 'block';
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // تحديث الـ active class في الشريط الجانبي
      document.querySelectorAll('.sidebar-menu .menu-link[data-tab]').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tab);
      });

      // إذا فتح مركز التصدير: تهيئته
      if (tab === 'export') {
        setTimeout(() => {
          if (window.DirectExportCenter) {
            window.DirectExportCenter.boot();
            // اعرض محتوى مركز التصدير مباشرة
            const sec = document.getElementById('exportCenterSection');
            if (sec && !sec.innerHTML.trim()) {
              window.DirectExportCenter.open();
            }
          } else if (window.ExportV4) {
            window.ExportV4.open();
          }
        }, 80);
      }

      // إذا فتح الوقود: اجبر إعادة الرندر
      if (tab === 'fuel') {
        setTimeout(() => {
          if (window.WaterFuel?.refresh) window.WaterFuel.refresh();
          else if (window.WaterFuelV2?.refresh) window.WaterFuelV2.refresh();
        }, 80);
      }
    },

    // يُستدعى بعد render الصفحة لضبط الحالة الأولية
    init() {
      this.show(this.current);
      // الزر الأول في الشريط يكون active
      const homeLink = document.querySelector('.menu-link[data-tab="home"]');
      if (homeLink) homeLink.classList.add('active');
    }
  };

  // =========================================================
  //  Patch AppUI.layout + تشغيل DashTabs.init بعد الرندر
  // =========================================================
  function patch() {
    if (!window.AppUI) return;
    window.AppUI.layout = stableLayout;
    window.AppUI.__layoutResetPatched = true;

    // Hook بعد كل render لتهيئة DashTabs
    const origRender = window.AppUI.render?.bind(window.AppUI);
    if (origRender && !window.AppUI.__dashTabsHooked) {
      window.AppUI.__dashTabsHooked = true;
      window.AppUI.render = function (...args) {
        origRender(...args);
        setTimeout(() => window.DashTabs?.init(), 120);
      };
    }
  }

  patch();
  window.addEventListener('DOMContentLoaded', patch);

  // Patch incoming-fuel لربطه بالـ view الصحيح
  // (بدلاً من إدراجه بعد .stats، يجد #incomingFuelSection داخل view-fuel)
  const _origEnsureFuel = window.WaterFuel?.ensureFuelSection;

})();
