// المسار: components/Customers/CustomersStats.js
window.CustomersStats = function({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-view" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-[#0B1120] to-slate-800 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden flex items-center justify-between">
                <i className="fa-solid fa-users absolute -left-2 -bottom-2 text-7xl opacity-10"></i>
                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold mb-1">إجمالي العملاء</p>
                    <h3 className="text-3xl font-black">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center relative z-10"><i className="fa-solid fa-chart-simple text-cyan-400 text-xl"></i></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-xs font-bold mb-1">أفراد (شخصي)</p>
                    <h3 className="text-3xl font-black text-slate-800">{stats.individuals}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><i className="fa-solid fa-user text-xl"></i></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-xs font-bold mb-1">شركات / مؤسسات</p>
                    <h3 className="text-3xl font-black text-slate-800">{stats.companies}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center"><i className="fa-solid fa-building text-xl"></i></div>
            </div>
        </div>
    );
};