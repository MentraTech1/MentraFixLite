// المسار: components/Finances/FinancesHeader.js
window.FinancesHeader = function({ activeTab, searchText, handleSearchChange, dateFrom, handleDateFromChange, dateTo, handleDateToChange, clearDateFilters, openAddExpense }) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-view">
            <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600"><i className="fa-solid fa-file-invoice-dollar"></i></div>
                        الحسابات والمصروفات
                    </h2>
                    <p className="text-slate-500 text-sm font-bold mt-2">تتبع إيرادات أوامر الشغل، سجل المصروفات، وابحث بالنطاق الزمني.</p>
                </div>
                <button onClick={openAddExpense} className="bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0">
                    <i className="fa-solid fa-plus"></i> تسجيل مصروف
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                <div className="relative flex-1">
                    <input type="text" placeholder={activeTab === 'invoices' ? "بحث برقم الفاتورة أو العميل..." : "بحث في المصروفات..."} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-cyan-500 transition-all font-bold" value={searchText} onChange={handleSearchChange} />
                    <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                </div>
                
                <div className="flex flex-row gap-2 flex-1 md:flex-none">
                    <div className="relative w-full md:w-36">
                        <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">من تاريخ</span>
                        <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold" value={dateFrom} onChange={handleDateFromChange} />
                    </div>
                    <div className="relative w-full md:w-36">
                        <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">إلى تاريخ</span>
                        <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold" value={dateTo} onChange={handleDateToChange} />
                    </div>
                    {(dateFrom || dateTo) && (
                        <button onClick={clearDateFilters} className="w-12 shrink-0 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="مسح التواريخ"><i className="fa-solid fa-xmark"></i></button>
                    )}
                </div>
            </div>
        </div>
    );
};