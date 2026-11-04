// المسار: components/Purchases/PurchasesStats.js

window.PurchasesStats = function({ stats, dateFilter }) {
    const isNetPositive = (stats.net_flow || 0) >= 0;

    return (
        <div className="space-y-3 animate-view" style={{ animationDelay: '0.1s' }}>
            {/* بار مؤشر الفترة الذكي */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-chart-line text-cyan-600"></i>
                    تحليل الحركات للفترة من: <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200" dir="ltr">{dateFilter.from}</span> 
                    إلى: <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200" dir="ltr">{dateFilter.to}</span>
                </span>
                <span className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                    إجمالي الحركات: {stats.movements_count} حركة
                </span>
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. تكلفة المشتريات للفترة */}
                <div className="bg-gradient-to-br from-[#0B1120] to-slate-800 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden flex items-center justify-between border border-slate-700">
                    <i className="fa-solid fa-money-bill-transfer absolute -left-2 -bottom-2 text-7xl opacity-10"></i>
                    <div className="relative z-10">
                        <p className="text-slate-400 text-xs font-bold mb-1">تكلفة الشراء (الفترة المحددة)</p>
                        <h3 className="text-2xl font-black text-emerald-400">
                            {Number(stats.total_purchases_cost || 0).toLocaleString()} <span className="text-xs font-bold">ج.م</span>
                        </h3>
                    </div>
                    <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center relative z-10">
                        <i className="fa-solid fa-file-invoice-dollar text-lg text-emerald-300"></i>
                    </div>
                </div>

                {/* 2. إجمالي الوارد */}
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-emerald-600 text-xs font-bold mb-1">إجمالي الوارد (توريد)</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            {stats.items_in} <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">قطعة</span>
                        </h3>
                    </div>
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <i className="fa-solid fa-arrow-down text-lg"></i>
                    </div>
                </div>

                {/* 3. إجمالي المنصرف */}
                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-rose-600 text-xs font-bold mb-1">المنصرف (للصيانة/البيع)</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            {stats.items_out} <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">قطعة</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">معدل: {stats.daily_avg_out} قطعة/يوم</p>
                    </div>
                    <div className="w-11 h-11 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                        <i className="fa-solid fa-arrow-up text-lg"></i>
                    </div>
                </div>

                {/* 4. صافي التدفق المخزني الذكي */}
                <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${isNetPositive ? 'bg-cyan-50/40 border-cyan-100' : 'bg-amber-50/40 border-amber-200'}`}>
                    <div>
                        <p className="text-slate-600 text-xs font-bold mb-1">صافي حركة المخزون</p>
                        <h3 className={`text-2xl font-black ${isNetPositive ? 'text-cyan-700' : 'text-amber-700'}`}>
                            {isNetPositive ? `+${stats.net_flow}` : stats.net_flow} <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">قطعة</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                            {isNetPositive ? 'نمو في رصيد المخزن' : 'سحب أعلى من التوريد'}
                        </p>
                    </div>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isNetPositive ? 'bg-cyan-100 text-cyan-600' : 'bg-amber-100 text-amber-600'}`}>
                        <i className={`fa-solid ${isNetPositive ? 'fa-boxes-packing' : 'fa-dolly'} text-lg`}></i>
                    </div>
                </div>
            </div>
        </div>
    );
};