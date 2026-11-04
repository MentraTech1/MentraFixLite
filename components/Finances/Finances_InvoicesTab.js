// المسار: components/Finances/Tabs/Finances_InvoicesTab.js
window.Finances_InvoicesTab = function({ userId, showToast, refreshGlobalStats }) {
    const { useState, useEffect, useRef } = React;
    const { FinancesTable, FinancesPayModal, FinancesEditInvoiceModal } = window;
    
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [listData, setListData] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const searchTimeoutRef = useRef(null);

    // حالات الدفع والتحصيل
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('كاش');

    // حالات مودال التعديل الفوري
    const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
    const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(null);
    const [maintenanceTicket, setMaintenanceTicket] = useState(null);
    const [usedParts, setUsedParts] = useState([]);
    const [laborCost, setLaborCost] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);

    const safeFormatDate = (d) => { try { return d.split('T')[0]; } catch(e){return '-'} };

    // جلب قائمة الفواتير
    const fetchData = async (page = 1, search = searchText, from = dateFrom, to = dateTo) => {
        setIsLoading(true);
        try {
            let rawData = await window.db.invoices.toArray();
            rawData.reverse(); 

            for (let inv of rawData) {
                if (inv.customer_id) {
                    const customer = await window.db.customers.get(Number(inv.customer_id));
                    inv.customer_name = customer ? customer.name : 'عميل غير مسجل';
                    inv.customer_phone = customer ? customer.phone : '';
                } else { 
                    inv.customer_name = 'عميل غير مسجل'; 
                    inv.customer_phone = '';
                }

                if (inv.request_id) {
                    const req = await window.db.maintenance_requests.get(Number(inv.request_id));
                    inv.device_info = req ? `${req.device_type || 'جهاز'} ${req.brand || ''}` : '-';
                }

                inv.display_invoice_number = inv.invoice_number || `INV-${String(inv.id).padStart(4, '0')}`;
                inv.display_date = inv.created_at || inv.date || new Date().toISOString();
            }

            if (search.trim() !== '') {
                const lowerSearch = search.toLowerCase();
                rawData = rawData.filter(inv => 
                    (inv.display_invoice_number.toLowerCase().includes(lowerSearch)) || 
                    (inv.customer_name && inv.customer_name.toLowerCase().includes(lowerSearch)) ||
                    (inv.customer_phone && inv.customer_phone.includes(lowerSearch))
                );
            }

            if (from || to) {
                rawData = rawData.filter(item => {
                    const itemDate = item.display_date.split('T')[0];
                    if (from && itemDate < from) return false;
                    if (to && itemDate > to) return false;
                    return true;
                });
            }

            const perPage = 3;
            const total = rawData.length; 
            setListData(rawData.slice((page - 1) * perPage, page * perPage)); 
            setPagination({ current_page: page, last_page: Math.ceil(total / perPage) || 1, total });
        } catch (error) { 
            showToast("حدث خطأ أثناء تحميل الفواتير", "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => { fetchData(1, e.target.value, dateFrom, dateTo); }, 400);
    };

    // إعادة احتساب وتحديث الفاتورة لحظياً
    const recalculateInvoiceTotals = async (invoiceId, reqId, newLabor, newDiscount) => {
        const inv = await window.db.invoices.get(invoiceId);
        if (!inv) return;

        let partsTotal = 0;
        if (reqId) {
            const items = await window.db.used_items.where('request_id').equals(reqId).toArray();
            partsTotal = items.reduce((sum, item) => sum + (Number(item.total_price) || (Number(item.price) * Number(item.quantity)) || 0), 0);
        }

        const labor = newLabor !== undefined ? Number(newLabor) : (Number(inv.labor_cost) || 0);
        const discount = newDiscount !== undefined ? Number(newDiscount) : (Number(inv.discount) || 0);
        const subTotal = partsTotal + labor;
        const finalTotal = Math.max(0, subTotal - discount);

        await window.db.invoices.update(inv.id, {
            total_amount: subTotal,
            final_amount: finalTotal,
            discount: discount
        });

        if (reqId) {
            await window.db.maintenance_requests.update(reqId, {
                estimated_cost: labor,
                final_cost: finalTotal
            });
        }

        if (inv.status === 'مدفوعة') {
            const payments = await window.db.payments.where('invoice_id').equals(inv.id).toArray();
            if (payments.length > 0) {
                await window.db.payments.update(payments[0].id, { amount: finalTotal });
            }
        }

        refreshGlobalStats();
    };

    // جلب قطع الغيار
    const loadPartsData = async (requestId) => {
        if (!requestId) {
            setUsedParts([]);
            return;
        }
        try {
            const items = await window.db.used_items.where('request_id').equals(requestId).toArray();
            for (let item of items) {
                if (item.item_type === 'part') {
                    const part = await window.db.inventory_parts.get(Number(item.part_id));
                    item.part_name = part ? part.part_name : 'قطعة محذوفة';
                    item.part_code = part ? part.part_code : '';
                } else {
                    item.part_name = 'خدمة صيانة';
                }
            }
            setUsedParts(items);
        } catch (e) {
            console.error(e);
        }
    };

    // فتح مودال التعديل
    const openEditInvoice = async (inv) => {
        setIsLoading(true);
        try {
            setSelectedInvoiceForEdit(inv);
            setDiscountAmount(Number(inv.discount || 0));

            if (inv.request_id) {
                const req = await window.db.maintenance_requests.get(Number(inv.request_id));
                setMaintenanceTicket(req || null);
                setLaborCost(Number(req?.estimated_cost || 0));
                await loadPartsData(inv.request_id);
            } else {
                setMaintenanceTicket(null);
                setLaborCost(Number(inv.total_amount || 0));
                setUsedParts([]);
            }

            setShowEditInvoiceModal(true);
        } catch (e) {
            showToast("تعذر فتح تفاصيل الفاتورة", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // إضافة قطعة غيار
    const handleAddPartToInvoice = async (partId, qty, price) => {
        if (!selectedInvoiceForEdit || !selectedInvoiceForEdit.request_id) {
            showToast("هذه الفاتورة غير مرتبطة بأمر شغل صيانة لإضافة قطع إليها", "error");
            return;
        }

        setIsUpdating(true);
        try {
            const reqId = selectedInvoiceForEdit.request_id;
            await window.db.transaction('rw', [
                window.db.used_items, 
                window.db.inventory_parts, 
                window.db.stock_movements
            ], async () => {
                const quantity = parseInt(qty);
                const unitPrice = parseFloat(price) || 0;

                await window.db.used_items.add({
                    request_id: reqId,
                    item_type: 'part',
                    part_id: Number(partId),
                    service_id: null,
                    quantity: quantity,
                    price: unitPrice,
                    total_price: unitPrice * quantity,
                    created_at: new Date().toISOString()
                });

                const part = await window.db.inventory_parts.get(Number(partId));
                if (part) {
                    await window.db.inventory_parts.update(part.id, { 
                        stock_quantity: part.stock_quantity - quantity 
                    });
                    await window.db.stock_movements.add({
                        part_id: part.id,
                        user_id: userId,
                        movement_type: 'سحب لصيانة (تعديل فاتورة)',
                        quantity: quantity,
                        created_at: new Date().toISOString()
                    });
                }
            });

            await recalculateInvoiceTotals(selectedInvoiceForEdit.id, reqId, laborCost, discountAmount);
            await loadPartsData(reqId);
            showToast("تم خصم القطعة من المخزن وإضافتها للفاتورة", "success");
        } catch (e) {
            showToast(e.message || "حدث خطأ أثناء صرف القطعة", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // حذف قطعة غيار وإرجاعها للمخزن
    const handleRemovePartFromInvoice = async (usedItem) => {
        if (!confirm("هل أنت متأكد من حذف هذه القطعة وإرجاعها للمخزن فوراً؟")) return;

        setIsUpdating(true);
        try {
            const reqId = selectedInvoiceForEdit.request_id;
            await window.db.transaction('rw', [
                window.db.used_items, 
                window.db.inventory_parts, 
                window.db.stock_movements
            ], async () => {
                if (usedItem.item_type === 'part' && usedItem.part_id) {
                    const part = await window.db.inventory_parts.get(Number(usedItem.part_id));
                    if (part) {
                        await window.db.inventory_parts.update(part.id, { 
                            stock_quantity: part.stock_quantity + Number(usedItem.quantity) 
                        });
                        await window.db.stock_movements.add({
                            part_id: part.id,
                            user_id: userId,
                            movement_type: 'إرجاع من صيانة (تعديل فاتورة)',
                            quantity: Number(usedItem.quantity),
                            created_at: new Date().toISOString()
                        });
                    }
                }
                await window.db.used_items.delete(usedItem.id);
            });

            await recalculateInvoiceTotals(selectedInvoiceForEdit.id, reqId, laborCost, discountAmount);
            await loadPartsData(reqId);
            showToast("تم إرجاع القطعة للمخزن وتحديث الفاتورة", "success");
        } catch (e) {
            showToast("حدث خطأ أثناء إرجاع القطعة", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // حفظ المصنعية والخصم
    const handleSaveInvoiceFinancials = async (newLabor, newDiscount) => {
        setIsUpdating(true);
        try {
            setLaborCost(Number(newLabor));
            setDiscountAmount(Number(newDiscount));
            await recalculateInvoiceTotals(selectedInvoiceForEdit.id, selectedInvoiceForEdit.request_id, newLabor, newDiscount);
            showToast("تم حفظ وتحديث الحسابات بنجاح", "success");
            setShowEditInvoiceModal(false);
            fetchData();
        } catch (e) {
            showToast("خطأ أثناء تحديث الفاتورة", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // تحصيل الفاتورة
    const handlePaySubmit = async (e) => {
        e.preventDefault(); 
        setIsUpdating(true);
        try {
            const finalAmount = selectedInvoice.final_amount || selectedInvoice.total_amount;
            await window.CenterQueries.payInvoice(selectedInvoice.id, finalAmount, paymentMethod);
            showToast("تم تسجيل التحصيل بنجاح", "success");
            setShowPayModal(false); 
            refreshGlobalStats(); 
            fetchData();
        } catch (e) { 
            showToast("خطأ أثناء التحصيل", "error"); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    // ==========================================
    // دالة طباعة فاتورة الصيانة الاحترافية
    // ==========================================
    const handlePrintInvoice = async (invoiceOrId) => {
        showToast("جاري تجهيز الفاتورة للطباعة...", "success");
        try {
            let inv = invoiceOrId;
            if (typeof invoiceOrId === 'number' || typeof invoiceOrId === 'string') {
                inv = await window.db.invoices.get(Number(invoiceOrId));
            }
            if (!inv) throw new Error("تعذر العثور على الفاتورة");

            const session = JSON.parse(localStorage.getItem('MentraFix_Session') || '{}');
            
            // جلب العميل
            let customer = null;
            if (inv.customer_id) {
                customer = await window.db.customers.get(Number(inv.customer_id));
            }

            // جلب تفاصيل الطلب والجهاز وقطع الغيار
            let request = null;
            let device = null;
            let usedItems = [];
            if (inv.request_id) {
                request = await window.db.maintenance_requests.get(Number(inv.request_id));
                if (request && request.device_id) {
                    device = await window.db.devices.get(Number(request.device_id));
                }
                usedItems = await window.db.used_items.where('request_id').equals(inv.request_id).toArray();
                for (let item of usedItems) {
                    if (item.item_type === 'part') {
                        const p = await window.db.inventory_parts.get(Number(item.part_id));
                        item.name = p ? p.part_name : 'قطعة غيار';
                    } else {
                        const s = await window.db.service_catalog.get(Number(item.service_id));
                        item.name = s ? s.name : 'خدمة صيانة';
                    }
                }
            }

            const laborCostVal = Number(request?.estimated_cost || inv.labor_cost || 0);
            const discountVal = Number(inv.discount || 0);
            const totalAmountVal = Number(inv.total_amount || 0);
            const finalAmountVal = Number(inv.final_amount || (totalAmountVal - discountVal));
            const invoiceNum = inv.invoice_number || `INV-${String(inv.id).padStart(4, '0')}`;
            const dateStr = new Date(inv.created_at || inv.date || Date.now()).toLocaleString('ar-EG');

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>فاتورة صيانة #${invoiceNum}</title>
                    <style>
                        body { 
                            font-family: 'Tahoma', 'Cairo', sans-serif; 
                            font-size: 13px; 
                            line-height: 1.5; 
                            color: #0f172a; 
                            width: 320px; 
                            margin: 0 auto; 
                            padding: 10px; 
                        }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .border-b { border-bottom: 1px dashed #64748b; }
                        .border-t { border-top: 1px dashed #64748b; }
                        .my-2 { margin: 8px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
                        th { border-bottom: 1px solid #334155; padding: 4px 2px; }
                        td { padding: 4px 2px; }
                        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #334155; }
                        @media print {
                            body { width: 100%; margin: 0; padding: 0; }
                            @page { margin: 4mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <h2 style="margin: 0 0 4px 0; font-size: 18px;">${session.center_name || 'مركز الصيانة'}</h2>
                        <div style="font-size: 11px; color: #475569;">فاتورة صيانة واستلام جهاز</div>
                        <div class="border-b my-2"></div>
                    </div>

                    <div style="font-size: 12px;">
                        <div><b>رقم الفاتورة:</b> <span dir="ltr">${invoiceNum}</span></div>
                        <div><b>تاريخ الإصدار:</b> ${dateStr}</div>
                        <div><b>اسم العميل:</b> ${customer ? customer.name : (inv.customer_name || 'عميل غير مسجل')}</div>
                        ${customer && customer.phone ? `<div><b>رقم الهاتف:</b> <span dir="ltr">${customer.phone}</span></div>` : ''}
                        ${request ? `
                            <div class="border-t my-2"></div>
                            <div><b>الجهاز:</b> ${device ? `${device.device_type} ${device.brand || ''} ${device.model || ''}` : `${request.device_type || 'جهاز'} ${request.brand || ''}`}</div>
                            ${request.issue_description ? `<div><b>العطل:</b> ${request.issue_description}</div>` : ''}
                        ` : ''}
                    </div>

                    <div class="border-b my-2"></div>

                    <table>
                        <thead>
                            <tr>
                                <th class="text-right">البند / القطعة</th>
                                <th class="text-center">الكمية</th>
                                <th class="text-left">السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usedItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-left">${(Number(item.total_price || (item.price * item.quantity))).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            ${laborCostVal > 0 ? `
                                <tr>
                                    <td>أجور صيانة ومصنعية</td>
                                    <td class="text-center">1</td>
                                    <td class="text-left">${laborCostVal.toLocaleString()}</td>
                                </tr>
                            ` : ''}
                            ${usedItems.length === 0 && laborCostVal === 0 ? `
                                <tr><td colspan="3" class="text-center" style="color: #64748b;">صيانة وفحص شامل</td></tr>
                            ` : ''}
                        </tbody>
                    </table>

                    <div class="border-t my-2"></div>

                    <div style="font-size: 13px;">
                        <div style="display:flex; justify-content:space-between;">
                            <span>إجمالي الحساب:</span>
                            <span>${totalAmountVal.toLocaleString()} ج.م</span>
                        </div>
                        ${discountVal > 0 ? `
                            <div style="display:flex; justify-content:space-between; color: #dc2626;">
                                <span>قيمة الخصم:</span>
                                <span>-${discountVal.toLocaleString()} ج.م</span>
                            </div>
                        ` : ''}
                        <div style="display:flex; justify-content:space-between; font-size: 15px; font-weight: bold; margin-top: 4px; border-top: 1px solid #cbd5e1; padding-top: 4px;">
                            <span>الصافي المطلوب:</span>
                            <span>${finalAmountVal.toLocaleString()} ج.م</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size: 11px; margin-top: 6px;">
                            <span>حالة السداد:</span>
                            <span class="badge">${inv.status === 'مدفوعة' ? 'تم التحصيل (مدفوعة)' : 'غير مدفوعة (آجل)'}</span>
                        </div>
                    </div>

                    <div class="border-b my-2"></div>
                    <div class="text-center" style="font-size: 11px; color: #475569; margin-top: 8px;">
                        <div>شكراً لتعاملكم معنا!</div>
                        <div>برجاء الاحتفاظ بالفاتورة لأغراض الضمان والمتابعة.</div>
                    </div>

                    <script>
                        window.onload = function() {
                            window.focus();
                            window.print();
                            window.close();
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error(error);
            showToast("حدث خطأ أثناء إعداد الفاتورة للطباعة", "error");
        }
    };

    const getInvoiceStatusUI = (status) => {
        const maps = { 
            'غير مدفوعة': { text: 'غير مدفوعة', color: 'bg-rose-50 text-rose-600 border border-rose-100' }, 
            'مدفوعة': { text: 'مدفوعة', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' } 
        };
        return maps[status] || maps['غير مدفوعة'];
    };

    return (
        <div>
            {/* الهيدر المخصص للفواتير بدون زر تسجيل المصروفات */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-view">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                                <i className="fa-solid fa-file-invoice-dollar"></i>
                            </div>
                            فواتير أوامر الشغل والصيانة
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">
                            صرف وإرجاع قطع الغيار، تحصيل النقدية، وطباعة الفواتير.
                        </p>
                    </div>

                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs font-bold text-slate-500">
                        إجمالي الفواتير: <span className="font-mono font-black text-slate-800">{pagination.total}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="بحث برقم الفاتورة، اسم العميل، أو الهاتف..." 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-cyan-500 transition-all font-bold" 
                            value={searchText} 
                            onChange={handleSearchChange} 
                        />
                        <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                    </div>
                    
                    <div className="flex flex-row gap-2 flex-1 md:flex-none">
                        <div className="relative w-full md:w-36">
                            <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">من تاريخ</span>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); fetchData(1, searchText, e.target.value, dateTo); }} />
                        </div>
                        <div className="relative w-full md:w-36">
                            <span className="absolute -top-2.5 right-3 bg-white px-1 text-[10px] font-bold text-slate-400">إلى تاريخ</span>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold" value={dateTo} onChange={(e) => { setDateTo(e.target.value); fetchData(1, searchText, dateFrom, e.target.value); }} />
                        </div>
                        {(dateFrom || dateTo) && (
                            <button onClick={() => { setDateFrom(''); setDateTo(''); fetchData(1, searchText, '', ''); }} className="w-12 shrink-0 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="مسح التواريخ">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* جدول الفواتير مع زر الطباعة الفعال */}
            <div className="mt-4">
                <FinancesTable 
                    activeTab="invoices" 
                    listData={listData} 
                    isLoading={isLoading} 
                    pagination={pagination}
                    fetchData={(page) => fetchData(page)} 
                    searchText={searchText} 
                    getInvoiceStatusUI={getInvoiceStatusUI} 
                    safeFormatDate={safeFormatDate}
                    openPayModal={(inv) => { setSelectedInvoice(inv); setShowPayModal(true); }} 
                    openEditInvoice={openEditInvoice} 
                    handlePrintInvoice={handlePrintInvoice}
                />
            </div>
            
            {/* مودال التحصيل */}
            {showPayModal && (
                <FinancesPayModal 
                    setShowPayModal={setShowPayModal} 
                    selectedInvoice={selectedInvoice} 
                    paymentMethod={paymentMethod} 
                    setPaymentMethod={setPaymentMethod} 
                    handlePaySubmit={handlePaySubmit} 
                    isUpdating={isUpdating} 
                />
            )}

            {/* مودال تعديل الفاتورة وقطع الغيار المباشر */}
            {showEditInvoiceModal && (
                <FinancesEditInvoiceModal 
                    setShowEditInvoiceModal={setShowEditInvoiceModal} 
                    selectedInvoice={selectedInvoiceForEdit}
                    maintenanceTicket={maintenanceTicket}
                    usedParts={usedParts}
                    laborCost={laborCost}
                    setLaborCost={setLaborCost}
                    discountAmount={discountAmount}
                    setDiscountAmount={setDiscountAmount}
                    handleAddPartToInvoice={handleAddPartToInvoice}
                    handleRemovePartFromInvoice={handleRemovePartFromInvoice}
                    handleSaveInvoiceFinancials={handleSaveInvoiceFinancials}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
};