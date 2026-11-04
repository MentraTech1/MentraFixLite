// المسار: components/Finances/Tabs/Finances_PosTab.js
window.Finances_PosTab = function({ userId, showToast, refreshGlobalStats }) {
    const { useState, useEffect, useRef, useMemo } = React;
    const ITEMS_PER_PAGE = 3;

    const [isLoading, setIsLoading] = useState(false);
    const [salesList, setSalesList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // فلاتر البحث والتواريخ
    const [searchInvoiceId, setSearchInvoiceId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const searchTimeoutRef = useRef(null);

    // حالات تعديل الفاتورة
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [editCart, setEditCart] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const safeFormatDate = (d) => { try { return d.split('T')[0]; } catch(e){ return '-'; } };
    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return num.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    // جلب فواتير المبيعات
    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (!window.db.pos_invoices) return;
            let rawData = await window.db.pos_invoices.toArray();
            rawData.reverse();
            setSalesList(rawData);
        } catch (error) {
            showToast("حدث خطأ أثناء جلب فواتير المبيعات", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchInvoiceId, dateFrom, dateTo]);

    // الفلترة الذكية
    const filteredSales = useMemo(() => {
        return salesList.filter(sale => {
            const saleIdStr = String(sale.id);
            const invNum = sale.invoice_number ? String(sale.invoice_number) : '';
            const matchSearch = searchInvoiceId.trim() === '' || 
                saleIdStr.includes(searchInvoiceId.trim()) || 
                invNum.includes(searchInvoiceId.trim());

            let matchDate = true;
            const saleDate = safeFormatDate(sale.date || sale.created_at);
            if (dateFrom && saleDate < dateFrom) matchDate = false;
            if (dateTo && saleDate > dateTo) matchDate = false;

            return matchSearch && matchDate;
        });
    }, [salesList, searchInvoiceId, dateFrom, dateTo]);

    // إحصائيات سريعة للنتائج المعروضة
    const summaryStats = useMemo(() => {
        const count = filteredSales.length;
        const totalSales = filteredSales.reduce((sum, s) => sum + (Number(s.netAmount || s.total_amount || 0)), 0);
        return { count, totalSales };
    }, [filteredSales]);

    // تقسيم الصفحات (Pagination)
    const paginatedSales = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSales.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSales, currentPage]);

    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE) || 1;

    // ==========================================
    // 1. فتح الفاتورة للتعديل (مثل InvoiceHistory)
    // ==========================================
    const openInvoiceForEdit = async (sale) => {
        setIsLoading(true);
        try {
            const items = await window.db.pos_items.where('invoiceId').equals(sale.id).toArray();
            const preparedCart = await Promise.all(items.map(async (item) => {
                const product = await window.db.inventory_parts.get(Number(item.part_id));
                return {
                    id: item.id,
                    part_id: item.part_id,
                    name: product ? product.part_name : 'قطعة محذوفة',
                    sellPrice: parseFloat(item.sellPrice || 0),
                    qtySold: Number(item.qtySold), 
                    originalQty: Number(item.qtySold),
                    maxStock: product ? Number(product.stock_quantity) : 0
                };
            }));

            setEditCart(preparedCart);
            setEditingInvoice(sale);
        } catch (error) { 
            showToast('خطأ في جلب تفاصيل الفاتورة', 'error'); 
        } finally {
            setIsLoading(false);
        }
    };

    // تعديل كمية صنف بالفاتورة مع حماية رصيد المخزن
    const updateEditCartQty = (part_id, newQty) => {
        if (newQty < 1) return;
        const item = editCart.find(i => i.part_id === part_id);
        if (!item) return;

        const allowedStock = item.maxStock + item.originalQty;
        if (newQty > allowedStock) {
            showToast(`الرصيد المتاح بالمخزن (${allowedStock}) قطعة فقط`, 'error');
            return;
        }

        setEditCart(editCart.map(i => i.part_id === part_id ? { ...i, qtySold: newQty } : i));
    };

    // ==========================================
    // 2. حفظ التعديل وتحديث المخزن والدرج
    // ==========================================
    const handleSaveInvoiceEdit = async () => {
        setIsUpdating(true);
        try {
            await window.db.transaction('rw', [
                window.db.pos_invoices, 
                window.db.pos_items, 
                window.db.inventory_parts, 
                window.db.stock_movements
            ], async () => {
                let newTotalAmount = 0;
                let newTotalProfit = 0;

                for (let editItem of editCart) {
                    const product = await window.db.inventory_parts.get(Number(editItem.part_id));
                    const qtyDiff = editItem.qtySold - editItem.originalQty;

                    if (qtyDiff !== 0 && product) {
                        if (qtyDiff > 0 && product.stock_quantity < qtyDiff) {
                            throw new Error(`رصيد الصنف "${product.part_name}" لا يكفي للزيادة.`);
                        }

                        // تحديث المخزن
                        await window.db.inventory_parts.update(product.id, { 
                            stock_quantity: product.stock_quantity - qtyDiff 
                        });

                        // تسجيل حركة المخزن
                        const movementType = qtyDiff > 0 ? 'سحب إضافي لمبيعات (تعديل فاتورة)' : 'إرجاع من مبيعات (تعديل فاتورة)';
                        await window.db.stock_movements.add({
                            part_id: product.id,
                            user_id: userId,
                            movement_type: movementType,
                            quantity: Math.abs(qtyDiff),
                            created_at: new Date().toISOString()
                        });
                    }

                    const costPrice = parseFloat(product?.purchase_price || product?.cost_price || 0);
                    const lineTotal = editItem.qtySold * editItem.sellPrice;
                    const lineProfit = (editItem.sellPrice - costPrice) * editItem.qtySold;
                    
                    newTotalAmount += lineTotal;
                    newTotalProfit += lineProfit;

                    await window.db.pos_items.update(editItem.id, { qtySold: editItem.qtySold });
                }

                const discount = Number(editingInvoice.discount || 0);
                const netAmount = Math.max(0, newTotalAmount - discount);
                const netProfit = newTotalProfit - discount;
                
                await window.db.pos_invoices.update(editingInvoice.id, { 
                    totalAmount: newTotalAmount, 
                    netAmount: netAmount, 
                    profit: netProfit 
                });
            });

            showToast('تم تعديل الفاتورة وتحديث المخزن بنجاح', 'success');
            setEditingInvoice(null);
            fetchData();
            refreshGlobalStats();
        } catch (error) { 
            showToast(error.message || 'حدث خطأ أثناء تعديل الفاتورة', 'error'); 
        } finally {
            setIsUpdating(false);
        }
    };

    // ==========================================
    // 3. حذف الفاتورة واسترجاع القطع للمخزن فوراً
    // ==========================================
    const handleDeleteInvoice = async (invoiceId) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفاتورة نهائياً؟\nسيتم إرجاع جميع القطع المباعة إلى رصيد المخزن تلقائياً.')) {
            return;
        }

        try {
            await window.db.transaction('rw', [
                window.db.pos_invoices, 
                window.db.pos_items, 
                window.db.inventory_parts, 
                window.db.stock_movements
            ], async () => {
                const invoiceItems = await window.db.pos_items.where('invoiceId').equals(invoiceId).toArray();

                for (let item of invoiceItems) {
                    const product = await window.db.inventory_parts.get(Number(item.part_id));
                    if (product) {
                        await window.db.inventory_parts.update(product.id, {
                            stock_quantity: product.stock_quantity + Number(item.qtySold)
                        });

                        await window.db.stock_movements.add({
                            part_id: product.id,
                            user_id: userId,
                            movement_type: 'إلغاء فاتورة مبيعات - استرجاع للمخزن',
                            quantity: Number(item.qtySold),
                            created_at: new Date().toISOString()
                        });
                    }
                }

                await window.db.pos_items.where('invoiceId').equals(invoiceId).delete();
                await window.db.pos_invoices.delete(invoiceId);
            });

            showToast('تم حذف الفاتورة وإرجاع الأصناف للمخزن بنجاح', 'success');
            fetchData();
            refreshGlobalStats();
        } catch (error) {
            console.error(error);
            showToast('حدث خطأ أثناء حذف الفاتورة', 'error');
        }
    };

    // ==========================================
    // 4. طباعة الإيصال الحراري المتطابق مع شاشة المبيعات
    // ==========================================
    const printThermalReceipt = async (sale) => {
        showToast("جاري التجهيز للطباعة...", "success");
        try {
            const items = await window.db.pos_items.where('invoiceId').equals(sale.id).toArray();
            const cartItems = await Promise.all(items.map(async (item) => {
                const product = await window.db.inventory_parts.get(Number(item.part_id));
                return { 
                    name: product ? product.part_name : 'قطعة محذوفة', 
                    qtySold: item.qtySold, 
                    sellPrice: Number(item.sellPrice || 0) 
                };
            }));

            const session = JSON.parse(localStorage.getItem('MentraFix_Session') || '{}');
            const printWindow = window.open('', '_blank');
            const printContent = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>فاتورة مبيعات #${sale.id}</title>
                    <style>
                        body { font-family: 'Tahoma', 'Cairo', sans-serif; text-align: center; font-size: 13px; width: 300px; margin: 0 auto; color: #000; padding-top: 10px; }
                        .header { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
                        .meta { font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                        th, td { text-align: right; border-bottom: 1px dotted #ccc; padding: 5px 0; font-size: 12px; }
                        th { border-bottom: 1px solid #000; font-weight: bold; }
                        .center { text-align: center; }
                        .totals { border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; text-align: left; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">${session.center_name || 'مركز الصيانة والمبيعات'}</div>
                    <div class="meta">
                        <div>فاتورة مبيعات قطع غيار #${sale.id}</div>
                        <div>التاريخ: ${new Date(sale.date || sale.created_at || Date.now()).toLocaleString('ar-EG', { hour12: true })}</div>
                    </div>
                    <table>
                        <thead>
                            <tr><th>الصنف</th><th class="center">الكمية</th><th style="text-align:left">السعر</th></tr>
                        </thead>
                        <tbody>
                            ${cartItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td class="center">${item.qtySold}</td>
                                    <td style="text-align:left">${formatCurrency(item.sellPrice * item.qtySold)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        ${Number(sale.discount) > 0 ? `<div>الخصم: ${formatCurrency(sale.discount)} ج.م</div>` : ''}
                        <div style="font-size: 15px; margin-top: 4px;">الإجمالي الصافي: ${formatCurrency(sale.netAmount || sale.total_amount)} ج.م</div>
                    </div>
                    <div style="margin-top: 15px; font-size: 11px; text-align: center; border-top: 1px dashed #000; padding-top: 8px;">
                        شكراً لتعاملكم معنا!<br>MentraFix Lite
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); };<\/script>
                </body>
                </html>
            `;
            printWindow.document.write(printContent);
            printWindow.document.close();
        } catch (err) {
            showToast('خطأ أثناء تجهيز الطباعة', 'error');
        }
    };

    return (
        <div className="space-y-4">
            
            {!editingInvoice ? (
                <div>
                    {/* الهيدر المخصص لمبيعات قطع الغيار (بدون كلمة المصروفات) */}
                    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-view">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <i className="fa-solid fa-store"></i>
                                    </div>
                                    سجل فواتير مبيعات قطع الغيار (POS)
                                </h2>
                                <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">
                                    متابعة مبيعات الصالة، طباعة الإيصالات، وتعديل كميات القطع المباعة.
                                </p>
                            </div>
                        </div>

                        {/* شريط البحث والتواريخ */}
                        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder="بحث برقم الفاتورة (#)..." 
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-emerald-500 transition-all font-bold" 
                                    value={searchInvoiceId} 
                                    onChange={(e) => setSearchInvoiceId(e.target.value)} 
                                />
                                <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                            </div>
                            
                            <div className="flex flex-row gap-2 flex-1 md:flex-none">
                                <div className="relative w-full md:w-36">
                                    <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">من تاريخ</span>
                                    <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-emerald-500 transition-all font-bold" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                </div>
                                <div className="relative w-full md:w-36">
                                    <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">إلى تاريخ</span>
                                    <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-emerald-500 transition-all font-bold" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                </div>
                                {(dateFrom || dateTo || searchInvoiceId) && (
                                    <button onClick={() => { setDateFrom(''); setDateTo(''); setSearchInvoiceId(''); }} className="w-12 shrink-0 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="مسح الفلاتر">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* بطاقات الإحصائيات السريعة (مطابقة لـ InvoiceHistory) */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-receipt"></i>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400">عدد الفواتير</p>
                                    <p className="font-black text-slate-800 text-lg font-mono">{summaryStats.count}</p>
                                </div>
                            </div>
                            
                            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm shadow-emerald-500/20">
                                    <i className="fa-solid fa-coins"></i>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-emerald-600">إجمالي مبيعات القطع</p>
                                    <p className="font-black text-emerald-700 text-lg font-mono">{formatCurrency(summaryStats.totalSales)} <span className="text-xs font-bold">ج.م</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* جدول المبيعات الفعلي */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-4 animate-view">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-emerald-50/50 text-emerald-800 font-bold border-b border-emerald-100 text-xs">
                                    <tr>
                                        <th className="p-4 whitespace-nowrap">رقم الفاتورة</th>
                                        <th className="p-4 whitespace-nowrap">تاريخ البيع</th>
                                        <th className="p-4 whitespace-nowrap">إجمالي المبيعات</th>
                                        <th className="p-4 whitespace-nowrap text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedSales.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-slate-400 font-bold">
                                                <div className="w-14 h-14 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <i className="fa-solid fa-store text-2xl"></i>
                                                </div>
                                                لا توجد فواتير مبيعات تطابق البحث
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedSales.map(sale => (
                                            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 font-black text-slate-700 font-mono" dir="ltr">#{sale.id}</td>
                                                <td className="p-4 text-xs font-bold text-slate-500" dir="ltr">
                                                    {new Date(sale.date || sale.created_at || Date.now()).toLocaleString('ar-EG', { hour12: true, month: 'numeric', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 font-black text-emerald-600 text-base font-mono">
                                                    {formatCurrency(sale.netAmount || sale.total_amount)} <span className="text-[10px] text-slate-400 font-bold">ج.م</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => printThermalReceipt(sale)} 
                                                            className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center shadow-sm" 
                                                            title="طباعة الفاتورة"
                                                        >
                                                            <i className="fa-solid fa-print text-xs"></i>
                                                        </button>
                                                        <button 
                                                            onClick={() => openInvoiceForEdit(sale)} 
                                                            className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center shadow-sm" 
                                                            title="تعديل الفاتورة والكميات"
                                                        >
                                                            <i className="fa-solid fa-pen text-xs"></i>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteInvoice(sale.id)} 
                                                            className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" 
                                                            title="حذف الفاتورة وإرجاع الأصناف للمخزن"
                                                        >
                                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* الترقيم */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-[11px] font-bold text-slate-500">
                                    صفحة {currentPage} من {totalPages} (إجمالي: {filteredSales.length})
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-sm">
                                        <i className="fa-solid fa-chevron-right text-xs"></i>
                                    </button>
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-sm">
                                        <i className="fa-solid fa-chevron-left text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* شاشة تعديل كميات الفاتورة (مطابقة لـ InvoiceHistory) */
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-view">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg">
                                <i className="fa-solid fa-file-pen"></i>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg">تعديل فاتورة مبيعات #{editingInvoice.id}</h3>
                                <p className="text-xs font-bold text-slate-400">تعديل كميات الأصناف المباعة وإعادة موازنة المخزون تلقائياً</p>
                            </div>
                        </div>
                        <button onClick={() => setEditingInvoice(null)} className="text-slate-400 hover:text-rose-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-xs font-bold mb-6 flex gap-3 items-center">
                        <i className="fa-solid fa-triangle-exclamation text-xl shrink-0 text-amber-500"></i>
                        <span>أي تغيير في الكميات المباعة سيقوم بتحديث الرصيد بالمخزن مباشرة وتسجيل حركة (سحب إضافي / إرجاع للمخزن) تلقائياً.</span>
                    </div>

                    <div className="space-y-3 mb-6 max-h-[380px] overflow-y-auto pr-1">
                        {editCart.map(item => (
                            <div key={item.part_id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-black text-slate-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-emerald-600 font-bold mt-1">السعر: {formatCurrency(item.sellPrice)} ج.م</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                                    <button onClick={() => updateEditCartQty(item.part_id, item.qtySold - 1)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 font-black hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                        -
                                    </button>
                                    <span className="w-8 text-center font-black text-slate-800 font-mono text-base">{item.qtySold}</span>
                                    <button onClick={() => updateEditCartQty(item.part_id, item.qtySold + 1)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleSaveInvoiceEdit} 
                            disabled={isUpdating}
                            className="flex-1 bg-gradient-to-l from-emerald-500 to-teal-600 hover:opacity-90 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                            حفظ وتحديث المخزن والدرج
                        </button>
                        <button 
                            onClick={() => setEditingInvoice(null)} 
                            className="px-6 py-3.5 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-black rounded-xl transition-all"
                        >
                            إلغاء التعديل
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};