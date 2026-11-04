// المسار: components/Purchases/PurchasesTable.js

window.PurchasesTable = function({ 
    movements, pagination, isLoading, 
    tableSearch, handleTableSearchChange, 
    dateFilter, setDateFilter, applyDateFilter, 
    fetchMovements,
    activeTab, handleTabChange, availableTypes, typeCounts 
}) {
    // دالة مساعدة لتحديد تصميم وأيقونة التبويب ونوع الحركة
    const getTypeMeta = (type) => {
        if (!type) return { icon: 'fa-tag', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
        if (type.includes('وارد') || type.includes('شراء')) {
            return { icon: 'fa-arrow-down', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', active: 'border-emerald-500 text-emerald-700 bg-emerald-50/60' };
        }
        if (type.includes('صيانة')) {
            return { icon: 'fa-screwdriver-wrench', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', active: 'border-rose-500 text-rose-700 bg-rose-50/60' };
        }
        if (type.includes('بيع') || type.includes('مبيعات')) {
            return { icon: 'fa-basket-shopping', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', active: 'border-blue-500 text-blue-700 bg-blue-50/60' };
        }
        return { icon: 'fa-boxes-stacked', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', active: 'border-cyan-500 text-cyan-700 bg-cyan-50/60' };
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative flex flex-col animate-view" style={{ animationDelay: '0.2s' }}>
            
            {/* ================= شريط التبويبات (TABS) ================= */}
            <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
                {/* 1. التبويب الأول: الكل */}
                <button
                    onClick={() => handleTabChange('ALL')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                        activeTab === 'ALL'
                            ? 'bg-white text-cyan-700 border-cyan-500 shadow-sm scale-100'
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60 hover:text-slate-800'
                    }`}
                >
                    <i className="fa-solid fa-list-check"></i>
                    <span>الكل</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === 'ALL' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                        {typeCounts['ALL'] || 0}
                    </span>
                </button>

                <div className="h-5 w-[1px] bg-slate-300 mx-1"></div>

                {/* 2. بقية تبويبات أنواع الحركة الديناميكية */}
                {availableTypes.map((type) => {
                    const meta = getTypeMeta(type);
                    const isActive = activeTab === type;
                    const count = typeCounts[type] || 0;

                    return (
                        <button
                            key={type}
                            onClick={() => handleTabChange(type)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                                isActive
                                    ? `bg-white shadow-sm ${meta.active}`
                                    : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60 hover:text-slate-800'
                            }`}
                        >
                            <i className={`fa-solid ${meta.icon} text-xs`}></i>
                            <span>{type}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                isActive ? `${meta.bg} ${meta.color}` : 'bg-slate-200/80 text-slate-600'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ================= شريط البحث وفلاتر التاريخ ================= */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col lg:flex-row gap-4 items-center justify-between shrink-0">
                <div className="relative w-full lg:w-1/3">
                    <input 
                        type="text" 
                        placeholder="بحث باسم القطعة أو الكود..." 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-bold shadow-sm" 
                        value={tableSearch} 
                        onChange={handleTableSearchChange} 
                    />
                    <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                </div>

                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 px-2"><i className="fa-solid fa-calendar-days text-cyan-600 mr-1"></i> من</span>
                        <input 
                            type="date" 
                            className="bg-white rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-slate-200" 
                            value={dateFilter.from} 
                            onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">إلى</span>
                        <input 
                            type="date" 
                            className="bg-white rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-slate-200" 
                            value={dateFilter.to} 
                            onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})} 
                        />
                    </div>
                    <button 
                        onClick={applyDateFilter} 
                        className="bg-cyan-600 text-white hover:bg-cyan-700 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm shadow-cyan-600/30 ml-1"
                    >
                        تطبيق الفلترة
                    </button>
                </div>
            </div>

            {/* حالة التحميل */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center mt-28">
                    <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* ================= جدول البيانات ================= */}
            <div className="overflow-x-auto hide-scrollbar flex-1">
                <table className="w-full text-right text-sm min-w-[700px]">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-4 whitespace-nowrap">التاريخ والوقت</th>
                            <th className="p-4 whitespace-nowrap">القطعة (الكود)</th>
                            <th className="p-4 whitespace-nowrap">نوع الحركة (البيان)</th>
                            <th className="p-4 whitespace-nowrap text-center">الكمية</th>
                            <th className="p-4 whitespace-nowrap">المسؤول</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {movements?.length > 0 ? movements.map((mov, index) => {
                            const dateTime = mov.created_at.split('T');
                            const meta = getTypeMeta(mov.movement_type);

                            return (
                                <tr key={mov.id || index} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600" dir="ltr">{dateTime[0]}</span>
                                            {dateTime[1] && (
                                                <span className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <i className="fa-regular fa-clock"></i> {dateTime[1].substring(0, 5)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{mov.part_name}</p>
                                        {mov.sku && (
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded" dir="ltr">
                                                <i className="fa-solid fa-barcode mr-1"></i>{mov.sku}
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="p-4">
                                        <div>
                                            <span className={`${meta.bg} ${meta.color} border ${meta.border} px-2.5 py-1 rounded-lg text-[11px] font-black inline-flex items-center gap-1.5`}>
                                                <i className={`fa-solid ${meta.icon}`}></i> 
                                                {mov.movement_type}
                                            </span>
                                            {mov.total_cost > 0 && (
                                                <p className="text-[10px] font-bold text-slate-500 mt-1.5 bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                                                    التكلفة: <span className="text-slate-700 font-black">{Number(mov.total_cost).toLocaleString()} ج.م</span>
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center justify-center min-w-[3.2rem] px-2 py-1 rounded-xl font-black text-lg ${
                                            mov.is_in ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                            <span className="text-[11px] mr-1 opacity-70">{mov.is_in ? '+' : '-'}</span>
                                            {mov.quantity}
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 text-[11px] font-bold text-slate-500">
                                        <i className="fa-solid fa-user-tie mr-1 text-cyan-600 bg-cyan-50 p-1.5 rounded-lg border border-cyan-100"></i> {mov.user_name}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <i className="fa-solid fa-clipboard-list text-2xl text-slate-300"></i>
                                    </div>
                                    لا توجد حركات مسجلة تحت هذا التبويب أو خلال هذه الفترة.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= شريط ترقيم الصفحات (Pagination) ================= */}
            {pagination.total_records > 0 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <span className="text-[11px] font-bold text-slate-500">
                        صفحة {pagination.current_page} من {pagination.last_page} 
                        <span className="mr-2 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                            إجمالي: {pagination.total_records}
                        </span>
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => fetchMovements(pagination.current_page + 1)} 
                            disabled={pagination.current_page === pagination.last_page || isLoading} 
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-40 transition-all shadow-sm"
                        >
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                        <button 
                            onClick={() => fetchMovements(pagination.current_page - 1)} 
                            disabled={pagination.current_page === 1 || isLoading} 
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-40 transition-all shadow-sm"
                        >
                            <i className="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};