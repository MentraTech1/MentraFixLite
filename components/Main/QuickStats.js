// المسار: components/Main/QuickStats.js
window.MainQuickStats = function({ stats }) {
    const cashColor = stats.cashInDrawer >= 0 ? 'text-emerald-400' : 'text-rose-400';
    const cardBg = stats.cashInDrawer >= 0 ? 'from-[#0F172A] to-slate-800' : 'from-rose-950 to-slate-900';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-view" style={{ animationDelay: '0.1s' }}>
            
            {/* البطاقة المالية الشاملة */}
            <div className={`lg:col-span-2 bg-gradient-to-br ${cardBg} p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-700/50 relative overflow-hidden flex flex-col justify-between`}>
                <i className="fa-solid fa-vault absolute -left-10 -bottom-10 text-[150px] opacity-5"></i>
                
                {/* الجزء العلوي: الكاش المتبقي في الدرج */}
                <div className="relative z-10 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                                <i className="fa-solid fa-cash-register mr-1"></i> كاش الدرج الفعلي
                            </span>
                            <h3 className="text-xs font-bold text-slate-300">السيولة النقدية المتبقية بعد حركة المشتريات</h3>
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-black ${cashColor} tracking-tight`}>
                            {stats.cashInDrawer.toLocaleString()} <span className="text-sm font-bold opacity-70">ج.م</span>
                        </h1>
                    </div>

                    {/* قيمة بضاعة المخزن المتبقية كأصل غير خاسر */}
                    <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-sm text-right">
                        <p className="text-[10px] font-bold text-slate-300 mb-0.5">بضاعة المخزن الحالية (رأس مال)</p>
                        <p className="text-sm md:text-base font-black text-cyan-400">{stats.inventoryValue.toLocaleString()} ج.م</p>
                    </div>
                </div>

                {/* الجزء السفلي: تفصيل التدفق المالي */}
                <div className="relative z-10 grid grid-cols-4 gap-2 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    {/* إيرادات صيانة */}
                    <div className="text-center md:text-right border-l border-white/10 pl-2">
                        <p className="text-[9px] md:text-xs font-bold text-emerald-400 mb-1"><i className="fa-solid fa-plus text-[8px] md:text-[10px]"></i> صيانة</p>
                        <p className="text-xs md:text-lg font-black text-white">{stats.revenue.toLocaleString()}</p>
                    </div>
                    {/* إيرادات مبيعات */}
                    <div className="text-center md:text-right border-l border-white/10 pl-2">
                        <p className="text-[9px] md:text-xs font-bold text-cyan-400 mb-1"><i className="fa-solid fa-plus text-[8px] md:text-[10px]"></i> مبيعات</p>
                        <p className="text-xs md:text-lg font-black text-white">{stats.posSalesRevenue.toLocaleString()}</p>
                    </div>
                    {/* المصروفات */}
                    <div className="text-center md:text-right border-l border-white/10 pl-2">
                        <p className="text-[9px] md:text-xs font-bold text-rose-400 mb-1"><i className="fa-solid fa-minus text-[8px] md:text-[10px]"></i> مصروفات</p>
                        <p className="text-xs md:text-lg font-black text-white">{stats.expenses.toLocaleString()}</p>
                    </div>
                    {/* المشتريات */}
                    <div className="text-center md:text-right pr-2">
                        <p className="text-[9px] md:text-xs font-bold text-orange-400 mb-1"><i className="fa-solid fa-minus text-[8px] md:text-[10px]"></i> مشتريات</p>
                        <p className="text-xs md:text-lg font-black text-white">{stats.totalPurchases.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* بطاقات العمليات التشغيلية (العمود الثالث) */}
            <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-600 text-xs font-bold mb-1">أوامر الشغل النشطة</p>
                            <h3 className="text-3xl font-black text-slate-800">{stats.active_jobs} <span className="text-[10px] font-bold text-slate-400">جهاز</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl shadow-inner">
                            <i className="fa-solid fa-screwdriver-wrench"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-colors flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-600 text-xs font-bold mb-1">إجمالي العملاء المسجلين</p>
                            <h3 className="text-3xl font-black text-slate-800">{stats.total_customers} <span className="text-[10px] font-bold text-slate-400">عميل</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center text-xl shadow-inner">
                            <i className="fa-solid fa-users"></i>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};