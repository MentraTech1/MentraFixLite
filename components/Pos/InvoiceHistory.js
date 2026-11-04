// المسار: components/Pos/InvoiceHistory.js
window.InvoiceHistory = function({ userId, showToast }) {
    const { useState, useEffect, useMemo } = React;
    const ITEMS_PER_PAGE = 5;

    const [invoicePage, setInvoicePage] = useState(1);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [editCart, setEditCart] = useState([]);
    
    const [searchInvoiceId, setSearchInvoiceId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const sales = window.useLiveQuery(() => window.db.pos_invoices.reverse().toArray(), []) || [];

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return num.toLocaleString('ar-EG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const printThermalReceipt = async (sale) => {
        try {
            const items = await window.db.pos_items.where('invoiceId').equals(sale.id).toArray();
            const cartItems = await Promise.all(items.map(async (item) => {
                 const product = await window.db.inventory_parts.get(item.part_id);
                 return { name: product ? product.part_name : 'قطعة محذوفة', qtySold: item.qtySold, sellPrice: item.sellPrice };
            }));

            const session = JSON.parse(localStorage.getItem('MentraFix_Session') || '{}');
            
            const printWindow = window.open('', '_blank');
            const printContent = `
                <html dir="rtl">
                <head>
                    <title>نسخة فاتورة #${sale.id}</title>
                    <style>
                        body { font-family: 'Tahoma', sans-serif; text-align: center; font-size: 13px; width: 300px; margin: 0 auto; color: #000; padding-top: 10px; }
                        .header { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                        .meta { font-size: 11px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                        th, td { text-align: right; border-bottom: 1px dotted #ccc; padding: 6px 0; font-size: 12px; }
                        th { border-bottom: 1px solid #000; font-weight: bold; }
                        .center { text-align: center; }
                        .totals { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; text-align: left; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">${session.center_name}</div>
                    <div class="meta">
                        <div>رقم الفاتورة: #${sale.id} <br>(نسخة مطبوعة)</div>
                        <div>التاريخ: ${new Date(sale.date).toLocaleString('ar-EG', {hour12: true})}</div>
                    </div>
                    <table>
                        <tr><th>الصنف</th><th class="center">الكمية</th><th style="text-align:left">السعر</th></tr>
                        ${cartItems.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="center">${item.qtySold}</td>
                                <td style="text-align:left">${formatCurrency(item.sellPrice * item.qtySold)}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <div class="totals">
                        ${sale.discount > 0 ? `<div>الخصم: ${formatCurrency(sale.discount)} ج.م</div>` : ''}
                        <div style="font-size: 16px; margin-top: 5px;">الإجمالي: ${formatCurrency(sale.netAmount)} ج.م</div>
                    </div>
                    <div class="footer" style="margin-top: 20px; font-size: 11px; text-align: center; border-top: 1px dashed #000; padding-top: 10px;">
                        شكراً لثقتكم بنا!<br>MentraFix Lite
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); }<\/script>
                </body>
                </html>
            `;
            printWindow.document.write(printContent);
            printWindow.document.close();
        } catch (err) {
            showToast('خطأ أثناء تحضير الطباعة', 'error');
        }
    };

    useEffect(() => { setInvoicePage(1); }, [searchInvoiceId, startDate, endDate]);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchId = searchInvoiceId ? sale.id.toString().includes(searchInvoiceId.trim()) : true;
            let matchDate = true;
            const saleDate = new Date(sale.date);
            saleDate.setHours(0,0,0,0);
            
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0,0,0,0);
                if (saleDate < start) matchDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23,59,59,999);
                if (saleDate > end) matchDate = false;
            }
            return matchId && matchDate;
        });
    }, [sales, searchInvoiceId, startDate, endDate]);

    const historyStats = useMemo(() => {
        const count = filteredSales.length;
        const totalAmount = filteredSales.reduce((sum, sale) => sum + (parseFloat(sale.netAmount) || 0), 0);
        return { count, totalAmount };
    }, [filteredSales]);

    const paginatedSales = useMemo(() => {
        const start = (invoicePage - 1) * ITEMS_PER_PAGE;
        return filteredSales.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSales, invoicePage]);

    const totalInvoicePages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE) || 1;

    const openInvoiceForEdit = async (sale) => {
        try {
            const items = await window.db.pos_items.where('invoiceId').equals(sale.id).toArray();
            const preparedCart = await Promise.all(items.map(async (item) => {
                const product = await window.db.inventory_parts.get(item.part_id);
                return {
                    id: item.id,
                    part_id: item.part_id,
                    name: product ? product.part_name : 'قطعة محذوفة',
                    sellPrice: parseFloat(item.sellPrice || 0),
                    qtySold: item.qtySold, 
                    originalQty: item.qtySold,
                    maxStock: product ? product.stock_quantity : 0
                };
            }));
            setEditCart(preparedCart);
            setEditingInvoice(sale);
        } catch (error) { showToast('خطأ في جلب تفاصيل الفاتورة', 'error'); }
    };

    const updateEditCartQty = (part_id, newQty) => {
        if (newQty < 1) return;
        const item = editCart.find(i => i.part_id === part_id);
        const allowedStock = item.maxStock + item.originalQty;
        
        if (newQty > allowedStock) {
            showToast('لا يوجد رصيد كافي في المخزن', 'error');
            return;
        }
        setEditCart(editCart.map(i => i.part_id === part_id ? { ...i, qtySold: newQty } : i));
    };

    // =========================================================================
    // التحديث الاحترافي لحفظ الفاتورة المعدلة (مع تدوين حركة المخزن)
    // =========================================================================
    const handleSaveInvoiceEdit = async () => {
        try {
            await window.db.transaction('rw', window.db.pos_invoices, window.db.pos_items, window.db.inventory_parts, window.db.stock_movements, async () => {
                let newTotalAmount = 0;
                let newTotalProfit = 0;

                for (let editItem of editCart) {
                    const product = await window.db.inventory_parts.get(editItem.part_id);
                    
                    const qtyDiff = editItem.qtySold - editItem.originalQty;

                    if (qtyDiff !== 0) {
                        if (qtyDiff > 0 && product.stock_quantity < qtyDiff) {
                            throw new Error(`رصيد ${product.part_name} لا يكفي.`);
                        }

                        await window.db.inventory_parts.update(product.id, { 
                            stock_quantity: product.stock_quantity - qtyDiff 
                        });

                        const movementType = qtyDiff > 0 ? 'سحب إضافي لمبيعات (تعديل)' : 'إرجاع من مبيعات (تعديل)';
                        await window.db.stock_movements.add({
                            part_id: product.id,
                            user_id: userId,
                            movement_type: movementType,
                            quantity: Math.abs(qtyDiff),
                            created_at: new Date().toISOString()
                        });
                    }

                    const costPrice = parseFloat(product.purchase_price || product.cost_price || 0);
                    const lineTotal = editItem.qtySold * editItem.sellPrice;
                    const lineProfit = (editItem.sellPrice - costPrice) * editItem.qtySold;
                    
                    newTotalAmount += lineTotal;
                    newTotalProfit += lineProfit;

                    await window.db.pos_items.update(editItem.id, { qtySold: editItem.qtySold });
                }

                const netAmount = newTotalAmount - editingInvoice.discount;
                const netProfit = newTotalProfit - editingInvoice.discount;
                
                await window.db.pos_invoices.update(editingInvoice.id, { 
                    totalAmount: newTotalAmount, 
                    netAmount: netAmount, 
                    profit: netProfit 
                });
            });

            showToast('تم تعديل الفاتورة وتحديث حركة المخزن بنجاح', 'success');
            setEditingInvoice(null);
        } catch (error) { showToast(error.message, 'error'); }
    };

    // =========================================================================
    // الدالة الجديدة: حذف الفاتورة بالكامل وإرجاع القطع للمخزن باحترافية
    // =========================================================================
    const handleDeleteInvoice = async (invoiceId) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفاتورة نهائياً؟\nسيتم إرجاع جميع القطع المباعة إلى رصيد المخزن تلقائياً.')) {
            return;
        }

        try {
            await window.db.transaction('rw', window.db.pos_invoices, window.db.pos_items, window.db.inventory_parts, window.db.stock_movements, async () => {
                // 1. جلب القطع المرتبطة بالفاتورة
                const invoiceItems = await window.db.pos_items.where('invoiceId').equals(invoiceId).toArray();

                // 2. إرجاع كل قطعة للمخزن وتسجيل الحركة
                for (let item of invoiceItems) {
                    const product = await window.db.inventory_parts.get(item.part_id);
                    if (product) {
                        // إعادة الكمية للرصيد
                        await window.db.inventory_parts.update(product.id, {
                            stock_quantity: product.stock_quantity + item.qtySold
                        });

                        // تسجيل حركة استرجاع
                        await window.db.stock_movements.add({
                            part_id: product.id,
                            user_id: userId,
                            movement_type: 'إلغاء فاتورة مبيعات - استرجاع',
                            quantity: item.qtySold,
                            created_at: new Date().toISOString()
                        });
                    }
                }

                // 3. حذف القطع من الفاتورة
                await window.db.pos_items.where('invoiceId').equals(invoiceId).delete();
                
                // 4. حذف الفاتورة نفسها
                await window.db.pos_invoices.delete(invoiceId);
            });

            showToast('تم حذف الفاتورة وإرجاع القطع للمخزن بنجاح', 'success');
        } catch (error) {
            console.error(error);
            showToast('حدث خطأ أثناء حذف الفاتورة', 'error');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-view mb-10">
            {!editingInvoice ? (
                <div>
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <input type="text" value={searchInvoiceId} onChange={(e) => setSearchInvoiceId(e.target.value)} placeholder="بحث برقم الفاتورة (#)" className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl outline-none focus:border-[#06B6D4] font-bold text-sm" />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            </div>
                            <div className="flex flex-1 gap-2">
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-[#06B6D4] text-sm font-bold text-slate-600" />
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-[#06B6D4] text-sm font-bold text-slate-600" />
                            </div>
                        </div>

                        <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex-1 flex items-center gap-3 border-l border-slate-200 pl-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><i className="fas fa-receipt"></i></div>
                                <div><p className="text-[10px] font-bold text-slate-400">عدد الفواتير</p><p className="font-black text-slate-700 leading-none">{historyStats.count}</p></div>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-100 text-[#06B6D4] flex items-center justify-center"><i className="fas fa-coins"></i></div>
                                <div><p className="text-[10px] font-bold text-slate-400">إجمالي المبيعات</p><p className="font-black text-[#06B6D4] leading-none">{formatCurrency(historyStats.totalAmount)} ج.م</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 whitespace-nowrap">رقم الفاتورة</th>
                                    <th className="p-4 whitespace-nowrap">التاريخ</th>
                                    <th className="p-4 whitespace-nowrap">الإجمالي</th>
                                    <th className="p-4 whitespace-nowrap text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedSales.length === 0 ? (
                                    <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-bold">لا توجد فواتير تطابق البحث</td></tr>
                                ) : (
                                    paginatedSales.map(sale => (
                                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 font-bold text-slate-700">#{sale.id}</td>
                                            <td className="p-4 text-slate-500 font-bold" dir="ltr">{new Date(sale.date).toLocaleString('ar-EG', {hour12: true, month:'numeric', day:'numeric'})}</td>
                                            <td className="p-4 font-black text-[#06B6D4]">{formatCurrency(sale.netAmount)} ج.م</td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button onClick={() => printThermalReceipt(sale)} className="bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors" title="طباعة"><i className="fas fa-print"></i></button>
                                                <button onClick={() => openInvoiceForEdit(sale)} className="bg-cyan-50 border border-cyan-100 text-cyan-600 hover:bg-cyan-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors" title="تعديل"><i className="fas fa-edit mr-1"></i> تعديل</button>
                                                <button onClick={() => handleDeleteInvoice(sale.id)} className="bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors" title="حذف الفاتورة وإرجاع القطع"><i className="fas fa-trash-alt mr-1"></i> حذف</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {totalInvoicePages > 1 && (
                        <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
                            <button onClick={() => setInvoicePage(prev => Math.max(prev - 1, 1))} disabled={invoicePage === 1} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-[#06B6D4] hover:text-white transition-colors flex items-center justify-center"><i className="fas fa-chevron-right"></i></button>
                            <span className="font-black text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-sm">صفحة {invoicePage} من {totalInvoicePages}</span>
                            <button onClick={() => setInvoicePage(prev => Math.min(prev + 1, totalInvoicePages))} disabled={invoicePage === totalInvoicePages} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-[#06B6D4] hover:text-white transition-colors flex items-center justify-center"><i className="fas fa-chevron-left"></i></button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-view">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h3 className="font-black text-slate-800 text-lg">تعديل فاتورة #{editingInvoice.id}</h3>
                        <button onClick={() => setEditingInvoice(null)} className="text-slate-400 hover:text-rose-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200"><i className="fas fa-times"></i></button>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-xs font-bold mb-4 flex gap-2 items-center">
                        <i className="fas fa-exclamation-triangle text-lg"></i>
                        <span>أي تعديل في الكميات هنا سيقوم بتحديث الرصيد في المخزن وتسجيل حركة (إضافة/سحب) بشكل أوتوماتيكي.</span>
                    </div>

                    <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-2">
                        {editCart.map(item => (
                            <div key={item.part_id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-black text-slate-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-[#06B6D4] font-bold mt-1">السعر: {formatCurrency(item.sellPrice)} ج.م</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
                                    <button onClick={() => updateEditCartQty(item.part_id, item.qtySold - 1)} className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 text-slate-600 font-bold hover:bg-rose-100 hover:text-rose-600 hover:border-rose-200 transition-colors">-</button>
                                    <span className="w-10 text-center font-black text-slate-800">{item.qtySold}</span>
                                    <button onClick={() => updateEditCartQty(item.part_id, item.qtySold + 1)} className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 text-slate-600 font-bold hover:bg-cyan-100 hover:text-cyan-600 hover:border-cyan-200 transition-colors">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={handleSaveInvoiceEdit} className="flex-1 bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex justify-center items-center gap-2 active:scale-95">
                            <i className="fas fa-save"></i> حفظ وتحديث المخزن
                        </button>
                        <button onClick={() => setEditingInvoice(null)} className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-black py-4 rounded-xl transition-all flex justify-center items-center gap-2">
                            <i className="fas fa-times"></i> إلغاء التعديل
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};