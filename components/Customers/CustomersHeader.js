// المسار: components/Customers/CustomersHeader.js
window.CustomersHeader = function({ searchQuery, setSearchQuery, handleSearch, openAddModal }) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center animate-view">
            <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600"><i className="fa-solid fa-users"></i></div>
                    إدارة العملاء
                </h2>
                <p className="text-slate-500 text-sm font-bold mt-2">سجل بيانات عملائك وأجهزتهم لسهولة استخراج الفواتير وأوامر الشغل.</p>
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                    <input type="text" placeholder="بحث بالاسم أو رقم الهاتف..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors w-8 h-8 flex items-center justify-center"><i className="fa-solid fa-magnifying-glass"></i></button>
                </form>
                <button onClick={openAddModal} className="bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 shrink-0">
                    <i className="fa-solid fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>
        </div>
    );
};