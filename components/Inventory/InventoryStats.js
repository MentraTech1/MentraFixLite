// المسار: components/Inventory/InventoryStats.js

window.InventoryStats = function({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-view" style={{ animationDelay: '0.1s' }}>
            
            {/* الكارت الأول: إجمالي الأصناف */}
            <div className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-[0_15px_40px_-10px_rgba(6,182,212,0.15)] transition-all duration-300 group overflow-hidden">
                {/* دائرة ديكور في الخلفية تظهر عند الهوفر */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out opacity-50 pointer-events-none"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-[11px] font-black tracking-wider mb-1.5">إجمالي الأصناف المسجلة</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.total_items}</h3>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/30 group-hover:rotate-12 transition-transform duration-300 shrink-0">
                        <i className="fa-solid fa-boxes-stacked"></i>
                    </div>
                </div>
            </div>
            
            {/* الكارت الثاني: إجمالي التكلفة (تصميم داكن VIP) */}
            <div className="relative bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden group">
                {/* إضاءة خضراء تظهر عند الهوفر */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-[11px] font-black tracking-wider mb-1.5">إجمالي تكلفة المخزون (رأس المال)</p>
                        <h3 className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5 mt-1">
                            {stats.total_value.toLocaleString()} 
                            <span className="text-emerald-400 text-sm font-bold">ج.م</span>
                        </h3>
                    </div>
                    <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <i className="fa-solid fa-vault"></i>
                    </div>
                </div>
            </div>

            {/* الكارت الثالث: النواقص (ذكي: يتغير لونه حسب الحالة) */}
            <div className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-[0_15px_40px_-10px_rgba(244,63,94,0.1)] transition-all duration-300 group overflow-hidden">
                {/* شريط سفلي يوضح الحالة */}
                <div className={`absolute bottom-0 left-0 w-full h-1.5 transition-colors duration-500 ${stats.low_stock > 0 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-[11px] font-black tracking-wider mb-1.5">تنبيهات نواقص المخزون</p>
                        <div className="flex items-center gap-3">
                            <h3 className={`text-4xl font-black tracking-tight ${stats.low_stock > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                {stats.low_stock}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 shadow-sm">الرصيد أقل من 5</span>
                        </div>
                    </div>
                    <div className="relative shrink-0">
                        {/* تأثير النبض يظهر فقط إذا كان هناك نواقص */}
                        {stats.low_stock > 0 && <div className="absolute inset-0 bg-rose-400 rounded-2xl animate-ping opacity-25"></div>}
                        
                        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${stats.low_stock > 0 ? 'bg-rose-50 text-rose-500 border border-rose-100 group-hover:-rotate-12' : 'bg-slate-50 text-slate-300 border border-slate-100 group-hover:scale-110'}`}>
                            <i className={`fa-solid ${stats.low_stock > 0 ? 'fa-triangle-exclamation' : 'fa-check-double'}`}></i>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};