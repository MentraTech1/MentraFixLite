// المسار: components/Requests/RequestsHeader.js
window.RequestsHeader = function({ searchQuery, setSearchQuery, handleSearch, openAddModal }) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center animate-view">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-wrench"></i>
                </div>
                <div>
                    <h2 className="font-black text-slate-800 text-lg">إدارة أوامر الشغل</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400">تتبع وإضافة وتعديل طلبات الصيانة لعملائك.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                    <input type="text" placeholder="بحث برقم الطلب، العميل..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-blue-500 transition-all font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"><i className="fa-solid fa-magnifying-glass"></i></button>
                </form>
                
                <button onClick={openAddModal} className="bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-colors shadow-md flex items-center justify-center gap-2 shrink-0">
                    <i className="fa-solid fa-plus"></i> أمر شغل جديد
                </button>
            </div>
        </div>
    );
};