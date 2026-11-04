// المسار: components/Finances/Tabs/Finances_PurchasesTab.js
window.Finances_PurchasesTab = function({ showToast }) {
    const { useState, useEffect, useRef, useMemo } = React;
    const ITEMS_PER_PAGE = 3;
    
    const [isLoading, setIsLoading] = useState(false);
    const [movements, setMovements] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // فلاتر البحث والتواريخ
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const searchTimeoutRef = useRef(null);

    const safeFormatDate = (d) => { try { return d.split('T')[0]; } catch(e){ return '-'; } };
    const formatCurrency = (amount) => Number(amount || 0).toLocaleString('ar-EG');

    // =========================================================================
    // جلب حركات المشتريات والتوريد من (stock_movements) مثل صفحة المشتريات تماماً
    // =========================================================================
    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (!window.db.stock_movements) return;
            
            // 1. جلب كل حركات المخزن مرتبة من الأحدث للأقدم
            let rawMovements = await window.db.stock_movements.reverse().toArray();

            // 2. فلترة حركات المشتريات والتوريد فقط (الوارد)
            rawMovements = rawMovements.filter(m => {
                const type = m.movement_type || '';
                return type.includes('شراء') || type.includes('وارد') || type.includes('توريد') || type.includes('افتتاحي');
            });

            // 3. ربط كل حركة ببيانات القطعة والمستخدم المسؤول
            let enrichedMovements = [];
            for (let m of rawMovements) {
                const part = await window.db.inventory_parts.get(Number(m.part_id));
                const user = m.user_id ? await window.db.users.get(Number(m.user_id)) : null;

                const qty = Number(m.quantity) || 1;
                const totalCost = Number(m.total_cost) || (qty * Number(part?.purchase_price || 0));
                const unitPrice = qty > 0 ? (totalCost / qty) : Number(part?.purchase_price || 0);

                enrichedMovements.push({
                    ...m,
                    part_name: part ? part.part_name : 'قطعة محذوفة',
                    sku: part?.sku || part?.part_code || '',
                    user_name: user ? user.name : 'المدير / النظام',
                    quantity: qty,
                    unit_price: unitPrice,
                    total_cost: totalCost,
                    display_date: m.created_at || new Date().toISOString()
                });
            }

            setMovements(enrichedMovements);
        } catch (error) { 
            console.error(error);
            showToast("حدث خطأ أثناء تحميل سجل المشتريات", "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchText, dateFrom, dateTo]);

    // الفلترة بالبحث والتواريخ
    const filteredMovements = useMemo(() => {
        return movements.filter(m => {
            const lowerSearch = searchText.toLowerCase().trim();
            const matchSearch = lowerSearch === '' || 
                m.part_name.toLowerCase().includes(lowerSearch) || 
                m.sku.toLowerCase().includes(lowerSearch) ||
                m.movement_type.toLowerCase().includes(lowerSearch) ||
                m.user_name.toLowerCase().includes(lowerSearch);

            let matchDate = true;
            const itemDate = safeFormatDate(m.display_date);
            if (dateFrom && itemDate < dateFrom) matchDate = false;
            if (dateTo && itemDate > dateTo) matchDate = false;

            return matchSearch && matchDate;
        });
    }, [movements, searchText, dateFrom, dateTo]);

    // إحصائيات المشتريات المفلترة لحظياً
    const stats = useMemo(() => {
        const count = filteredMovements.length;
        const totalCost = filteredMovements.reduce((sum, m) => sum + (Number(m.total_cost) || 0), 0);
        const totalItems = filteredMovements.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
        return { count, totalCost, totalItems };
    }, [filteredMovements]);

    // تقسيم الصفحات
    const paginatedMovements = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMovements.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredMovements, currentPage]);

    const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE) || 1;

    return (
        <div className="space-y-4">
            
            {/* الهيدر المخصص للمشتريات وحركة الوارد */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-view">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <i className="fa-solid fa-truck-ramp-box"></i>
                            </div>
                            سجل مشتريات وتوريد البضاعة للمخزن
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">
                            تتبع فواتير الوارد، أسعار الشراء، وتكلفة قطع الغيار الموردة للمركز.
                        </p>
                    </div>

                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs font-bold text-slate-500">
                        إجمالي الحركات: <span className="font-mono font-black text-slate-800">{filteredMovements.length}</span>
                    </div>
                </div>

                {/* شريط البحث والتواريخ */}
                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="بحث باسم القطعة، الكود (SKU)، أو المسؤول..." 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-orange-500 transition-all font-bold" 
                            value={searchText} 
                            onChange={(e) => setSearchText(e.target.value)} 
                        />
                        <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                    </div>
                    
                    <div className="flex flex-row gap-2 flex-1 md:flex-none">
                        <div className="relative w-full md:w-36">
                            <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">من تاريخ</span>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-orange-500 transition-all font-bold" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div className="relative w-full md:w-36">
                            <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">إلى تاريخ</span>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-orange-500 transition-all font-bold" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                        {(dateFrom || dateTo || searchText) && (
                            <button onClick={() => { setDateFrom(''); setDateTo(''); setSearchText(''); }} className="w-12 shrink-0 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="مسح الفلاتر">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* كروت الإحصائيات السريعة الثلاثية (مثل صفحة المشتريات) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm shadow-orange-500/20">
                            <i className="fa-solid fa-coins"></i>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-orange-600">إجمالي تكلفة المشتريات</p>
                            <p className="font-black text-orange-800 text-lg font-mono">{formatCurrency(stats.totalCost)} <span className="text-xs font-bold">ج.م</span></p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm shadow-emerald-500/20">
                            <i className="fa-solid fa-boxes-stacked"></i>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-emerald-600">إجمالي القطع المشتراة</p>
                            <p className="font-black text-emerald-800 text-lg font-mono">{stats.totalItems} <span className="text-xs font-bold">قطعة</span></p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-lg shrink-0">
                            <i className="fa-solid fa-receipt"></i>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-500">عدد عمليات التوريد</p>
                            <p className="font-black text-slate-800 text-lg font-mono">{stats.count}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* جدول حركات المشتريات المتطابق مع جدول صفحة المشتريات */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-view">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm min-w-[700px]">
                        <thead className="bg-orange-50/50 text-orange-800 font-bold border-b border-orange-100 text-xs">
                            <tr>
                                <th className="p-4 whitespace-nowrap">التاريخ والوقت</th>
                                <th className="p-4 whitespace-nowrap">القطعة (الكود)</th>
                                <th className="p-4 whitespace-nowrap">البيان</th>
                                <th className="p-4 whitespace-nowrap text-center">الكمية الواردة</th>
                                <th className="p-4 whitespace-nowrap">سعر الوحدة</th>
                                <th className="p-4 whitespace-nowrap">إجمالي التكلفة</th>
                                <th className="p-4 whitespace-nowrap">المسؤول</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedMovements.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-400 font-bold">
                                        <div className="w-14 h-14 bg-orange-50 text-orange-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i className="fa-solid fa-truck-ramp-box text-2xl"></i>
                                        </div>
                                        لا توجد مشتريات تطابق البحث في هذه الفترة
                                    </td>
                                </tr>
                            ) : (
                                paginatedMovements.map((mov, idx) => {
                                    const dateTime = (mov.display_date || '').split('T');
                                    return (
                                        <tr key={mov.id || idx} className="hover:bg-orange-50/20 transition-colors">
                                            {/* التاريخ والوقت */}
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700 font-mono" dir="ltr">{dateTime[0]}</span>
                                                    {dateTime[1] && (
                                                        <span className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                                                            <i className="fa-regular fa-clock text-[9px]"></i> {dateTime[1].substring(0, 5)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* القطعة والكود */}
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800 text-sm">{mov.part_name}</p>
                                                {mov.sku && (
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200" dir="ltr">
                                                        <i className="fa-solid fa-barcode mr-1 text-[9px]"></i>{mov.sku}
                                                    </span>
                                                )}
                                            </td>

                                            {/* البيان */}
                                            <td className="p-4">
                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg text-[11px] font-black inline-flex items-center gap-1">
                                                    <i className="fa-solid fa-arrow-down text-[10px]"></i> {mov.movement_type}
                                                </span>
                                            </td>

                                            {/* الكمية */}
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl font-black text-sm bg-emerald-50 text-emerald-600 border border-emerald-100 font-mono">
                                                    +{mov.quantity}
                                                </span>
                                            </td>

                                            {/* سعر الوحدة */}
                                            <td className="p-4 font-bold text-slate-500 font-mono text-xs">
                                                {formatCurrency(mov.unit_price)} <span className="text-[10px]">ج.م</span>
                                            </td>

                                            {/* إجمالي التكلفة */}
                                            <td className="p-4 font-black text-orange-600 font-mono text-base bg-orange-50/20">
                                                {formatCurrency(mov.total_cost)} <span className="text-[10px] font-bold text-slate-400">ج.م</span>
                                            </td>

                                            {/* المسؤول */}
                                            <td className="p-4 text-xs font-bold text-slate-600">
                                                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                                    <i className="fa-solid fa-user-tie text-[10px] text-cyan-600"></i> {mov.user_name}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ترقيم الصفحات */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[11px] font-bold text-slate-500">
                            صفحة {currentPage} من {totalPages} (إجمالي: {filteredMovements.length})
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 transition-all shadow-sm">
                                <i className="fa-solid fa-chevron-right text-xs"></i>
                            </button>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 transition-all shadow-sm">
                                <i className="fa-solid fa-chevron-left text-xs"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};