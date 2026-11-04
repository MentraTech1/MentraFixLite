// المسار: components/Finances/FinancesStats.js

window.FinancesStats = function({ stats }) {
    const totalRevenue = stats.revenue + stats.posSales;
    const isProfitPositive = stats.netProfit >= 0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-view" style={{ animationDelay: '0.1s' }}>
            
            {/* بطاقة الإيرادات الكلية */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between group hover:border-emerald-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-emerald-600 text-xs font-bold mb-1">إجمالي الإيرادات (صيانة + مبيعات)</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                            {totalRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span>
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                </div>
                <div className="flex gap-4 border-t border-slate-100 pt-3">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">من الصيانة</p>
                        <p className="text-sm font-black text-slate-700">{stats.revenue.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 border-r border-slate-100 pr-4">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">من المبيعات</p>
                        <p className="text-sm font-black text-slate-700">{stats.posSales.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* بطاقة المصروفات والمشتريات */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between group hover:border-rose-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-rose-600 text-xs font-bold mb-1">المصروفات والمشتريات (الخارج)</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                            {(stats.expenses + stats.purchases).toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span>
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-arrow-trend-down"></i>
                    </div>
                </div>
                <div className="flex gap-4 border-t border-slate-100 pt-3">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">مصروفات تشغيل</p>
                        <p className="text-sm font-black text-slate-700">{stats.expenses.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 border-r border-slate-100 pr-4">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">شراء بضاعة</p>
                        <p className="text-sm font-black text-slate-700">{stats.purchases.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* بطاقة الكاش وصافي الربح */}
            <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between border ${isProfitPositive ? 'bg-gradient-to-br from-[#0B1120] to-slate-800 border-slate-700 text-white' : 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-800 text-white'}`}>
                <i className="fa-solid fa-vault absolute -left-6 -bottom-6 text-8xl opacity-10 pointer-events-none"></i>
                
                <div className="relative z-10 flex items-start justify-between mb-4">
                    <div>
                        <p className="text-slate-400 text-xs font-bold mb-1">كاش الدرج الفعلي (السيولة)</p>
                        <h3 className={`text-3xl font-black tracking-tight ${isProfitPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stats.cashInDrawer.toLocaleString()} <span className="text-xs font-bold opacity-70">ج.م</span>
                        </h3>
                    </div>
                </div>
                
                <div className="relative z-10 border-t border-white/10 pt-3 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">صافي الربح التشغيلي</p>
                        <p className={`text-lg font-black ${isProfitPositive ? 'text-cyan-400' : 'text-rose-300'}`}>
                            {isProfitPositive ? '+' : ''}{stats.netProfit.toLocaleString()} ج.م
                        </p>
                    </div>
                    <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                        <span className="text-[10px] font-bold text-slate-300">
                            {isProfitPositive ? 'معدل جيد' : 'خسارة مالية'}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
};