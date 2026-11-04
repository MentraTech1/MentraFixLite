// المسار: components/Finances/Module_Finances_Container.js
window.Module_Finances_Container = function(props) {
    const { useState, useEffect } = React;
    const { 
        FinancesStats, 
        FinancesChart, 
        FinancesTabs, 
        FinancesProBanner, 
        Finances_InvoicesTab, 
        Finances_PosTab, 
        Finances_ExpensesTab, 
        Finances_PurchasesTab 
    } = window;
    
    // التبويب الرئيسي (إحصائيات vs سجلات)
    const [mainTab, setMainTab] = useState('overview'); // 'overview' | 'records'
    
    // التبويب الفرعي داخل قسم السجلات
    const [activeRecordTab, setActiveRecordTab] = useState('invoices'); 

    // دوال التواريخ الافتراضية (أول يوم في الشهر الحالي وحتى اليوم)
    const getFirstDayOfMonth = () => {
        const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
    };
    const getToday = () => new Date().toISOString().split('T')[0];

    // ==========================================
    // فلاتر التاريخ الخاصة بقسم "المؤشرات والتحليل المالي"
    // ==========================================
    const [overviewDateFrom, setOverviewDateFrom] = useState(getFirstDayOfMonth());
    const [overviewDateTo, setOverviewDateTo] = useState(getToday());
    
    const [stats, setStats] = useState({ 
        revenue: 0, 
        posSales: 0, 
        expenses: 0, 
        purchases: 0, 
        netProfit: 0, 
        cashInDrawer: 0 
    });

    // دالة فحص نطاق التاريخ
    const isInDateRange = (dateStr) => {
        if (!dateStr) return true;
        const d = dateStr.split('T')[0];
        if (overviewDateFrom && d < overviewDateFrom) return false;
        if (overviewDateTo && d > overviewDateTo) return false;
        return true;
    };

    // =========================================================================
    // الحسابات المالية المحاسبية الدقيقة
    // =========================================================================
    const fetchGlobalStats = async () => {
        try {
            // 1. خريطة أسعار تكلفة القطع بالمخزن
            const allParts = await window.db.inventory_parts.toArray();
            const partsCostMap = {}; 
            allParts.forEach(p => {
                partsCostMap[p.id] = Number(p.purchase_price || p.cost_price || 0);
            });

            // 2. إيرادات الصيانة المحصلة كاش خلال الفترة
            const allPayments = await window.db.payments.toArray();
            const maintenanceRevenue = allPayments
                .filter(p => isInDateRange(p.created_at || p.date || p.payment_date))
                .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            
            // 3. مبيعات قطع الغيار (POS خلال الفترة)
            let posSales = 0;
            if (window.db.pos_invoices) {
                const pos = await window.db.pos_invoices.toArray();
                posSales = pos
                    .filter(p => isInDateRange(p.date || p.created_at))
                    .reduce((sum, p) => sum + Number(p.netAmount || p.total_amount || 0), 0);
            }

            // 4. المصروفات التشغيلية فقط (مستبعد منها مشتريات البضاعة لعدم التكرار)
            const allExpenses = await window.db.expenses.toArray();
            const totalExpenses = allExpenses
                .filter(e => e.expense_type !== 'مشتريات بضاعة' && isInDateRange(e.date || e.expense_date || e.created_at))
                .reduce((sum, e) => sum + Number(e.amount || 0), 0);
            
            // 5. المشتريات النقدية الفعلية (التي خرجت كاش من الدرج فقط واستبعاد الرصيد الافتتاحي والتسويات)
            let totalPurchases = 0;
            if (window.db.stock_movements) {
                const allMovements = await window.db.stock_movements.toArray();
                const purchaseMovements = allMovements.filter(m => {
                    const type = String(m.movement_type || '');
                    // شرط الشراء الفعلي: وارد أو شراء مع استبعاد الرصيد الافتتاحي والتسويات والمرتجعات
                    const isActualCashPurchase = (type.includes('شراء') || type.includes('وارد') || type.includes('توريد')) 
                                              && !type.includes('افتتاحي') 
                                              && !type.includes('تسوية')
                                              && !type.includes('استرجاع')
                                              && !type.includes('إرجاع');
                    return isActualCashPurchase && isInDateRange(m.created_at);
                });

                // تجميع تكلفة المشتريات الفعلية
                purchaseMovements.forEach(m => {
                    const qty = Number(m.quantity) || 1;
                    const fallbackPrice = Number(partsCostMap[m.part_id] || 0);
                    const movementCost = Number(m.total_cost) || (qty * fallbackPrice);
                    totalPurchases += movementCost;
                });
            }

            // 6. تكلفة قطع الغيار المستهلكة في الصيانة والمبيعات (لحساب صافي الربح الحقيقي)
            let totalPartsCost = 0;
            const allUsedItems = await window.db.used_items.toArray();
            allUsedItems
                .filter(item => isInDateRange(item.created_at))
                .forEach(item => {
                    if (item.item_type === 'part' && partsCostMap[item.part_id]) {
                        totalPartsCost += (Number(item.quantity) * partsCostMap[item.part_id]);
                    }
                });

            if (window.db.pos_items) {
                const allPosItems = await window.db.pos_items.toArray();
                allPosItems
                    .filter(item => isInDateRange(item.created_at || item.date))
                    .forEach(item => {
                        if (partsCostMap[item.part_id]) {
                            totalPartsCost += (Number(item.qtySold) * partsCostMap[item.part_id]);
                        }
                    });
            }

            // 7. الخصومات في الفترة
            const allInvoices = await window.db.invoices.toArray();
            const totalMaintenanceDiscounts = allInvoices
                .filter(inv => isInDateRange(inv.created_at || inv.date))
                .reduce((sum, inv) => sum + Number(inv.discount || 0), 0);

            // 8. الحسابات الصافية النهائية:
            const totalRevenue = maintenanceRevenue + posSales;
            // كاش الدرج = الداخل كاش - الخارج كاش فعلي للمصروفات والمشتريات
            const cashInDrawer = totalRevenue - totalExpenses - totalPurchases;
            // صافي الربح = الإيرادات - تكلفة البضاعة المباعة - المصروفات - الخصومات
            const netProfit = totalRevenue - totalPartsCost - totalExpenses - totalMaintenanceDiscounts;

            setStats({ 
                revenue: maintenanceRevenue, 
                posSales, 
                expenses: totalExpenses, 
                purchases: totalPurchases, 
                netProfit, 
                cashInDrawer 
            });
        } catch (e) { 
            console.error("Error calculating global stats:", e); 
        }
    };

    // إعادة الحساب تلقائياً عند تغيير نطاق التاريخ أو التبويب
    useEffect(() => { 
        fetchGlobalStats(); 
    }, [activeRecordTab, mainTab, overviewDateFrom, overviewDateTo]);

    return (
        <div className="space-y-6 relative pb-10 max-w-7xl mx-auto">
            
            {/* =========================================================================
                شريط التبديل العلوي الرئيسي (المؤشرات والتحليل vs السجلات والدفاتر)
               ========================================================================= */}
            <div className="flex bg-slate-200/70 p-1.5 rounded-2xl max-w-md mx-auto shadow-inner border border-slate-300/60 animate-view">
                <button
                    type="button"
                    onClick={() => setMainTab('overview')}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                        mainTab === 'overview'
                            ? 'bg-white text-cyan-700 shadow-md scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <i className="fa-solid fa-chart-pie text-sm sm:text-base"></i>
                    <span>المؤشرات والتحليل المالي</span>
                </button>

                <button
                    type="button"
                    onClick={() => setMainTab('records')}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                        mainTab === 'records'
                            ? 'bg-white text-cyan-700 shadow-md scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <i className="fa-solid fa-receipt text-sm sm:text-base"></i>
                    <span>السجلات والدفاتر المالية</span>
                </button>
            </div>

            {/* =========================================================================
                التبويب الأول: لوحة المؤشرات والتحليل المالي (مع فلتر التاريخ المستقل)
               ========================================================================= */}
            {mainTab === 'overview' && (
                <div className="space-y-6 animate-view">
                    
                    {/* شريط فلترة التواريخ والأزرار السريعة */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shrink-0">
                                <i className="fa-solid fa-calendar-check"></i>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm">نطاق التحليل المالي</h4>
                                <p className="text-[11px] font-bold text-slate-400">تحديث المؤشرات والرسم البياني بناءً على الفترة المختارة</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                <div className="relative">
                                    <span className="absolute -top-2 right-2 bg-white px-1 text-[9px] font-bold text-slate-400">من</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent text-xs font-bold text-slate-700 px-2 py-1.5 outline-none font-mono" 
                                        value={overviewDateFrom} 
                                        onChange={(e) => setOverviewDateFrom(e.target.value)} 
                                    />
                                </div>
                                <span className="text-slate-300 font-bold">-</span>
                                <div className="relative">
                                    <span className="absolute -top-2 right-2 bg-white px-1 text-[9px] font-bold text-slate-400">إلى</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent text-xs font-bold text-slate-700 px-2 py-1.5 outline-none font-mono" 
                                        value={overviewDateTo} 
                                        onChange={(e) => setOverviewDateTo(e.target.value)} 
                                    />
                                </div>
                            </div>

                            {/* أزرار اختصارات الفترات السريعة */}
                            <div className="flex items-center gap-1.5">
                                <button 
                                    type="button" 
                                    onClick={() => { setOverviewDateFrom(getToday()); setOverviewDateTo(getToday()); }}
                                    className="px-3 py-2 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 rounded-xl text-xs font-black transition-colors"
                                >
                                    اليوم
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setOverviewDateFrom(getFirstDayOfMonth()); setOverviewDateTo(getToday()); }}
                                    className="px-3 py-2 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 rounded-xl text-xs font-black transition-colors"
                                >
                                    الشهر الحالي
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setOverviewDateFrom(''); setOverviewDateTo(''); }}
                                    className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-black transition-colors"
                                    title="عرض كافة الحسابات بدون تقييد بالتاريخ"
                                >
                                    الكل
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 1. بطاقات المؤشرات المالية الثلاثية (الآن ستظهر كاش الدرج بالموجب: 1,086 ج.م) */}
                    <FinancesStats stats={stats} />

                    {/* 2. الرسم البياني الدائري التفاعلي (المشتريات = 33 ج.م فقط) */}
                    {FinancesChart && <FinancesChart stats={stats} />}

                    {/* كارت توجيه سريع لفتح السجلات */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-6 border border-cyan-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-center sm:text-right">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-cyan-500/20">
                                <i className="fa-solid fa-book-open"></i>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-base">هل ترغب في مراجعة فواتير العمليات بالتفصيل؟</h4>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">يمكنك الانتقال لدفاتر الفواتير، مبيعات القطع، المشتريات أو المصروفات.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMainTab('records')}
                            className="bg-white hover:bg-slate-50 text-cyan-700 border border-cyan-200 px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-sm shrink-0 flex items-center gap-2"
                        >
                            <span>فتح الدفاتر والسجلات</span>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* =========================================================================
                التبويب الثاني: السجلات والدفاتر المالية
               ========================================================================= */}
            {mainTab === 'records' && (
                <div className="space-y-4 animate-view">
                    {/* التبويبات الفرعية الأربعة */}
                    <FinancesTabs activeTab={activeRecordTab} setActiveTab={setActiveRecordTab} />
                    
                    {/* عرض الشاشة الفرعية المختارة */}
                    <div className="bg-slate-50/50 p-1 sm:p-2 rounded-3xl border border-slate-200 shadow-inner">
                        {activeRecordTab === 'invoices' && (
                            <Finances_InvoicesTab {...props} refreshGlobalStats={fetchGlobalStats} />
                        )}
                        {activeRecordTab === 'pos' && (
                            <Finances_PosTab {...props} refreshGlobalStats={fetchGlobalStats} />
                        )}
                        {activeRecordTab === 'purchases' && (
                            <Finances_PurchasesTab {...props} />
                        )}
                        {activeRecordTab === 'expenses' && (
                            <Finances_ExpensesTab {...props} refreshGlobalStats={fetchGlobalStats} />
                        )}
                    </div>
                </div>
            )}

            {/* بانر النسخة السحابية */}
            <FinancesProBanner />
        </div>
    );
};