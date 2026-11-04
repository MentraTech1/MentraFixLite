// المسار: components/Finances/Tabs/Finances_ExpensesTab.js
window.Finances_ExpensesTab = function({ refreshGlobalStats, showToast }) {
    const { useState, useEffect, useRef, useMemo } = React;
    const { FinancesExpenseModal } = window;
    const ITEMS_PER_PAGE = 3;
    
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [expensesList, setExpensesList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // فلاتر البحث والتواريخ
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // حالات مودال إضافة وتعديل المصروف
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseModalMode, setExpenseModalMode] = useState('add'); 
    const initialExpenseForm = { 
        id: null, 
        expense_type: 'other', 
        description: '', 
        amount: '', 
        expense_date: new Date().toISOString().split('T')[0] 
    };
    const [expenseForm, setExpenseForm] = useState(initialExpenseForm);

    const safeFormatDate = (d) => { try { return d.split('T')[0]; } catch(e){ return '-'; } };
    const formatCurrency = (amount) => Number(amount || 0).toLocaleString('ar-EG');

    // أسماء وألوان وأيقونات أنواع المصروفات
    const expenseTypeConfig = {
        'rent': { text: 'إيجار', icon: 'fa-building', color: 'bg-purple-50 text-purple-700 border-purple-100' },
        'salaries': { text: 'رواتب وأجور', icon: 'fa-user-group', color: 'bg-blue-50 text-blue-700 border-blue-100' },
        'utilities': { text: 'مرافق (كهرباء/ماء/نت)', icon: 'fa-bolt', color: 'bg-amber-50 text-amber-700 border-amber-100' },
        'equipment': { text: 'معدات وأدوات', icon: 'fa-screwdriver-wrench', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
        'transportation': { text: 'انتقالات وشحن', icon: 'fa-car', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        'other': { text: 'أخرى ونثريات', icon: 'fa-receipt', color: 'bg-slate-100 text-slate-700 border-slate-200' }
    };

    const getExpenseTypeUI = (type) => {
        return expenseTypeConfig[type] || { text: type, icon: 'fa-tag', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    // ==========================================
    // جلب المصروفات التشغيلية فقط (واستبعاد مشتريات البضاعة)
    // ==========================================
    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (!window.db.expenses) return;
            let rawData = await window.db.expenses.toArray();
            rawData.reverse();

            // تصفية: المصروفات التشغيلية فقط لا غير
            rawData = rawData.filter(exp => exp.expense_type !== 'مشتريات بضاعة');
            setExpensesList(rawData);
        } catch (error) { 
            showToast("حدث خطأ أثناء تحميل المصروفات", "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchText, dateFrom, dateTo]);

    // الفلترة بالبحث والتواريخ
    const filteredExpenses = useMemo(() => {
        return expensesList.filter(exp => {
            const lowerSearch = searchText.toLowerCase().trim();
            const desc = (exp.description || '').toLowerCase();
            const typeConfig = expenseTypeConfig[exp.expense_type];
            const typeLabel = (typeConfig?.text || exp.expense_type || '').toLowerCase();

            const matchSearch = lowerSearch === '' || desc.includes(lowerSearch) || typeLabel.includes(lowerSearch);

            let matchDate = true;
            const expDate = safeFormatDate(exp.date || exp.expense_date);
            if (dateFrom && expDate < dateFrom) matchDate = false;
            if (dateTo && expDate > dateTo) matchDate = false;

            return matchSearch && matchDate;
        });
    }, [expensesList, searchText, dateFrom, dateTo]);

    // إحصائيات سريعة للنتائج المعروضة
    const stats = useMemo(() => {
        const count = filteredExpenses.length;
        const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return { count, totalAmount };
    }, [filteredExpenses]);

    // تقسيم الصفحات
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredExpenses.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredExpenses, currentPage]);

    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE) || 1;

    // حفظ المصروف (إضافة أو تعديل)
    const handleExpenseSubmit = async (e) => {
        e.preventDefault(); 
        setIsUpdating(true);
        try {
            if (expenseModalMode === 'add') {
                await window.CenterQueries.addExpense(
                    expenseForm.amount, 
                    expenseForm.expense_type, 
                    expenseForm.description, 
                    expenseForm.expense_date
                );
                showToast("تم تسجيل المصروف بنجاح", "success");
            } else {
                await window.db.expenses.update(expenseForm.id, { 
                    expense_type: expenseForm.expense_type, 
                    amount: Number(expenseForm.amount), 
                    date: expenseForm.expense_date, 
                    description: expenseForm.description 
                });
                showToast("تم تحديث المصروف بنجاح", "success");
            }

            setShowExpenseModal(false); 
            fetchData(); 
            refreshGlobalStats();
        } catch (e) { 
            showToast("حدث خطأ أثناء حفظ المصروف", "error"); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    // حذف المصروف
    const handleDeleteExpense = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا المصروف نهائياً؟")) return;
        try {
            await window.db.expenses.delete(id);
            showToast("تم حذف المصروف بنجاح", "success");
            fetchData();
            refreshGlobalStats();
        } catch (err) {
            showToast("حدث خطأ أثناء حذف المصروف", "error");
        }
    };

    // فتح مودال التعديل
    const openEditExpense = (exp) => {
        setExpenseModalMode('edit');
        setExpenseForm({
            id: exp.id,
            expense_type: exp.expense_type || 'other',
            description: exp.description || '',
            amount: exp.amount,
            expense_date: safeFormatDate(exp.date || exp.expense_date)
        });
        setShowExpenseModal(true);
    };

    return (
        <div className="space-y-4">
            
            {/* الهيدر المخصص للمصروفات التشغيلية فقط */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-view">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                <i className="fa-solid fa-receipt"></i>
                            </div>
                            سجل المصروفات التشغيلية
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">
                            متابعة المصروفات اليومية والشهرية (إيجار، رواتب، مرافق، نثريات).
                        </p>
                    </div>

                    <button 
                        onClick={() => {
                            setExpenseModalMode('add');
                            setExpenseForm(initialExpenseForm);
                            setShowExpenseModal(true);
                        }}
                        className="bg-gradient-to-l from-rose-500 to-rose-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto active:scale-95"
                    >
                        <i className="fa-solid fa-plus"></i> تسجيل مصروف جديد
                    </button>
                </div>

                {/* شريط البحث والتواريخ */}
                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="بحث في الوصف، البيان، أو نوع المصروف..." 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-rose-500 transition-all font-bold" 
                            value={searchText} 
                            onChange={(e) => setSearchText(e.target.value)} 
                        />
                        <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                    </div>
                    
                    <div className="flex flex-row gap-2 flex-1 md:flex-none">
                        <div className="relative w-full md:w-36">
                            <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">من تاريخ</span>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-rose-500 transition-all font-bold" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div className="relative w-full md:w-36">
                            <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">إلى تاريخ</span>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-rose-500 transition-all font-bold" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                        {(dateFrom || dateTo || searchText) && (
                            <button onClick={() => { setDateFrom(''); setDateTo(''); setSearchText(''); }} className="w-12 shrink-0 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="مسح الفلاتر">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* كروت الإحصائيات السريعة للمصروفات */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm shadow-rose-500/20">
                            <i className="fa-solid fa-money-bill-wave"></i>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-rose-600">إجمالي المصروفات التشغيلية</p>
                            <p className="font-black text-rose-800 text-lg font-mono">
                                {formatCurrency(stats.totalAmount)} <span className="text-xs font-bold">ج.م</span>
                            </p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-lg shrink-0">
                            <i className="fa-solid fa-list-check"></i>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-500">عدد حركات الصرف</p>
                            <p className="font-black text-slate-800 text-lg font-mono">{stats.count}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* جدول المصروفات */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-view">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-rose-50/50 text-rose-800 font-bold border-b border-rose-100 text-xs">
                            <tr>
                                <th className="p-4 whitespace-nowrap">نوع المصروف (البند)</th>
                                <th className="p-4 whitespace-nowrap">البيان / الوصف</th>
                                <th className="p-4 whitespace-nowrap text-center">تاريخ الصرف</th>
                                <th className="p-4 whitespace-nowrap">المبلغ المنصرف</th>
                                <th className="p-4 whitespace-nowrap text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                                        <div className="w-14 h-14 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i className="fa-solid fa-receipt text-2xl"></i>
                                        </div>
                                        لا توجد مصروفات تشغيلية مسجلة تطابق البحث
                                    </td>
                                </tr>
                            ) : (
                                paginatedExpenses.map(exp => {
                                    const typeUI = getExpenseTypeUI(exp.expense_type);
                                    return (
                                        <tr key={exp.id} className="hover:bg-rose-50/20 transition-colors group">
                                            {/* نوع المصروف */}
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border shadow-sm ${typeUI.color}`}>
                                                    <i className={`fa-solid ${typeUI.icon} text-[10px]`}></i> {typeUI.text}
                                                </span>
                                            </td>

                                            {/* الوصف / البيان */}
                                            <td className="p-4 font-semibold text-slate-700 text-sm max-w-xs truncate" title={exp.description}>
                                                {exp.description || '-'}
                                            </td>

                                            {/* تاريخ الصرف */}
                                            <td className="p-4 text-xs font-bold text-slate-500 text-center font-mono" dir="ltr">
                                                {safeFormatDate(exp.date || exp.expense_date)}
                                            </td>

                                            {/* المبلغ المنصرف */}
                                            <td className="p-4 font-black text-rose-600 font-mono text-base">
                                                {formatCurrency(exp.amount)} <span className="text-[10px] text-slate-400 font-bold">ج.م</span>
                                            </td>

                                            {/* الإجراءات (تعديل وحذف) */}
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => openEditExpense(exp)} 
                                                        className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all flex items-center justify-center shadow-sm" 
                                                        title="تعديل المصروف"
                                                    >
                                                        <i className="fa-solid fa-pen text-xs"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteExpense(exp.id)} 
                                                        className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" 
                                                        title="حذف المصروف"
                                                    >
                                                        <i className="fa-solid fa-trash-can text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* الترقيم */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[11px] font-bold text-slate-500">
                            صفحة {currentPage} من {totalPages} (إجمالي: {filteredExpenses.length})
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition-all shadow-sm">
                                <i className="fa-solid fa-chevron-right text-xs"></i>
                            </button>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition-all shadow-sm">
                                <i className="fa-solid fa-chevron-left text-xs"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* مودال تسجيل وتعديل المصروف */}
            {showExpenseModal && (
                <FinancesExpenseModal 
                    setShowExpenseModal={setShowExpenseModal} 
                    expenseModalMode={expenseModalMode} 
                    expenseForm={expenseForm} 
                    setExpenseForm={setExpenseForm} 
                    handleExpenseSubmit={handleExpenseSubmit} 
                    isUpdating={isUpdating} 
                />
            )}

        </div>
    );
};