// المسار: components/Finances/FinancesEditInvoiceModal.js

window.FinancesEditInvoiceModal = function({ 
    setShowEditInvoiceModal, selectedInvoice, maintenanceTicket,
    usedParts, laborCost, setLaborCost, discountAmount, setDiscountAmount,
    handleAddPartToInvoice, handleRemovePartFromInvoice, handleSaveInvoiceFinancials,
    isUpdating
}) {
    const { useState, useEffect, useRef } = React;

    const [partForm, setPartForm] = useState({ part_id: '', quantity: 1, max_qty: 1, price: 0 });
    const [partSearchText, setPartSearchText] = useState('');
    const [partSearchResults, setPartSearchResults] = useState([]);
    const [isSearchingParts, setIsSearchingParts] = useState(false);
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const partDropdownRef = useRef(null);
    const partSearchTimeoutRef = useRef(null);

    // إغلاق قائمة البحث عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (partDropdownRef.current && !partDropdownRef.current.contains(e.target)) {
                setShowPartDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // البحث في المخزن مثل صفحة الصيانة
    const handlePartSearchChange = (e) => {
        const value = e.target.value;
        setPartSearchText(value);
        if (partForm.part_id) setPartForm({ ...partForm, part_id: '', price: 0 });

        if (value.trim().length < 2) {
            setPartSearchResults([]);
            setShowPartDropdown(false);
            return;
        }

        setIsSearchingParts(true);
        setShowPartDropdown(true);

        if (partSearchTimeoutRef.current) clearTimeout(partSearchTimeoutRef.current);
        partSearchTimeoutRef.current = setTimeout(async () => {
            try {
                const query = value.toLowerCase().trim();
                const parts = await window.db.inventory_parts.filter(p => {
                    const name = p.part_name ? String(p.part_name).toLowerCase() : '';
                    const code = p.part_code ? String(p.part_code).toLowerCase() : '';
                    return (name.includes(query) || code.includes(query)) && p.stock_quantity > 0;
                }).limit(5).toArray();
                setPartSearchResults(parts);
            } catch (error) {} finally {
                setIsSearchingParts(false);
            }
        }, 300);
    };

    const selectPart = (part) => {
        const actualPrice = Number(part.selling_price) || Number(part.price) || 0;
        setPartSearchText(`${part.part_name} - ${actualPrice} ج.م`);
        setPartForm({
            part_id: part.id,
            quantity: 1,
            max_qty: part.stock_quantity,
            price: actualPrice
        });
        setShowPartDropdown(false);
    };

    const onSubmitAddPart = (e) => {
        e.preventDefault();
        if (!partForm.part_id || partForm.quantity > partForm.max_qty) return;
        handleAddPartToInvoice(partForm.part_id, partForm.quantity, partForm.price);
        setPartForm({ part_id: '', quantity: 1, max_qty: 1, price: 0 });
        setPartSearchText('');
    };

    // الحسابات الفورية
    const partsTotal = usedParts.reduce((sum, item) => sum + (Number(item.total_price) || (Number(item.price) * Number(item.quantity)) || 0), 0);
    const subTotal = partsTotal + Number(laborCost || 0);
    const netTotal = Math.max(0, subTotal - Number(discountAmount || 0));

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditInvoiceModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden animate-view flex flex-col max-h-[92vh] border border-slate-100">
                
                {/* رأس المودال */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 shrink-0">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <i className="fa-solid fa-file-pen text-cyan-600"></i> تعديل الفاتورة وقطع الغيار
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1">
                            فاتورة رقم: <span className="font-mono text-cyan-700 font-black">{selectedInvoice?.display_invoice_number}</span> 
                            {maintenanceTicket && ` | العميل: ${selectedInvoice?.customer_name} (${maintenanceTicket.device_type} ${maintenanceTicket.brand || ''})`}
                        </p>
                    </div>
                    <button onClick={() => setShowEditInvoiceModal(false)} className="w-8 h-8 rounded-full bg-white text-slate-500 hover:bg-rose-500 hover:text-white shadow-sm border border-slate-200 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">
                    
                    {/* تحذير إذا كانت الفاتورة مدفوعة ومحصلة */}
                    {selectedInvoice?.status === 'مدفوعة' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-amber-800">
                            <i className="fa-solid fa-triangle-exclamation text-amber-500 text-lg shrink-0"></i>
                            <span>تنبيه: هذه الفاتورة مدفوعة ومحصلة مسبقاً. أي إضافة أو حذف لقطع الغيار سيقوم بإعادة حساب درج النقدية تلقائياً.</span>
                        </div>
                    )}

                    {/* شريط سحب القطعة وإضافتها للطلب فوراً (مطابق لـ RequestsPartsModal) */}
                    <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-sm">
                        <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-hand-holding-box text-cyan-600"></i> صرف قطعة من المخزن وإضافتها للفاتورة:
                        </h4>
                        
                        <form onSubmit={onSubmitAddPart} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative" ref={partDropdownRef}>
                                <input 
                                    type="text" required 
                                    className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 pr-10 ${partForm.part_id ? 'border-emerald-500 bg-emerald-50' : 'bg-slate-50'}`}
                                    placeholder="ابحث عن قطعة في المخزن (اسم أو كود)..."
                                    value={partSearchText} onChange={handlePartSearchChange}
                                    onFocus={() => { if(partSearchResults?.length > 0) setShowPartDropdown(true); }}
                                />
                                <i className={`fa-solid ${isSearchingParts ? 'fa-spinner fa-spin text-cyan-500' : (partForm.part_id ? 'fa-check text-emerald-500' : 'fa-magnifying-glass text-slate-400')} absolute left-3 top-1/2 -translate-y-1/2`}></i>
                                
                                {showPartDropdown && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                        {partSearchResults?.length > 0 ? (
                                            partSearchResults.map(p => {
                                                const pPrice = Number(p.selling_price) || Number(p.price) || 0;
                                                return (
                                                    <li key={p.id} onMouseDown={() => selectPart(p)} className="p-3 hover:bg-cyan-50 cursor-pointer flex flex-col transition-colors text-right">
                                                        <span className="font-bold text-slate-800 text-sm">{p.part_name}</span>
                                                        <span className="text-[10px] text-emerald-600 font-bold mt-1">
                                                            السعر: {pPrice.toLocaleString()} ج.م | المتوفر: <span className={p.stock_quantity > 0 ? 'text-blue-500 font-black' : 'text-rose-500'}>{p.stock_quantity}</span>
                                                        </span>
                                                    </li>
                                                );
                                            })
                                        ) : <li className="p-3 text-center text-sm font-bold text-slate-400">لا توجد قطع مطابقة بالمخزن</li>}
                                    </ul>
                                )}
                            </div>

                            <div className="w-full sm:w-28">
                                <input 
                                    type="number" min="1" max={partForm.max_qty || 1} required 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-center text-slate-700 focus:outline-none focus:border-cyan-500 bg-slate-50" 
                                    placeholder="الكمية" 
                                    value={partForm.quantity} 
                                    onChange={(e) => setPartForm({...partForm, quantity: e.target.value})} 
                                />
                            </div>

                            <button type="submit" disabled={isUpdating || !partForm.part_id} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 whitespace-nowrap text-sm flex items-center justify-center gap-2">
                                {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plus"></i>} صرف وإضافة
                            </button>
                        </form>
                    </div>

                    {/* جدول قطع الغيار المخصومة حالياً مع زر الحذف والإرجاع الفوري */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-100/70 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <i className="fa-solid fa-list-check text-cyan-600"></i> القطع المسجلة بالفاتورة:
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">أي حذف يُرجع القطعة للمخزن فوراً</span>
                        </div>

                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[11px]">
                                <tr>
                                    <th className="p-3">اسم القطعة</th>
                                    <th className="p-3 text-center">الكمية</th>
                                    <th className="p-3 text-center">سعر الوحدة</th>
                                    <th className="p-3 text-center">الإجمالي</th>
                                    <th className="p-3 text-center">إرجاع للمخزن</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {usedParts?.length > 0 ? usedParts.map(up => (
                                    <tr key={up.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 font-bold text-slate-800 text-xs">{up.part_name}</td>
                                        <td className="p-3 font-black text-slate-600 text-center text-xs">{up.quantity}</td>
                                        <td className="p-3 font-bold text-slate-500 text-center text-xs">{Number(up.price).toLocaleString()}</td>
                                        <td className="p-3 font-black text-emerald-600 text-center text-xs">{Number(up.total_price || (up.price * up.quantity)).toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => handleRemovePartFromInvoice(up)} 
                                                disabled={isUpdating} 
                                                className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" 
                                                title="حذف وإرجاع للمخزن"
                                            >
                                                <i className="fa-solid fa-trash-can text-[11px]"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="p-6 text-center text-slate-400 font-bold text-xs">لا توجد قطع غيار مسجلة بالفاتورة حتى الآن.</td></tr>}
                            </tbody>
                            {usedParts?.length > 0 && (
                                <tfoot className="bg-slate-50 border-t border-slate-200 font-black">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-left text-slate-600 text-xs">إجمالي قطع الغيار:</td>
                                        <td className="p-3 text-center text-emerald-600 text-base">{partsTotal.toLocaleString()} <span className="text-[9px]">ج.م</span></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* قسم المصنعية والخصم والصافي النهائي */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">أجور الصيانة (المصنعية / يد العامل)</label>
                                <div className="relative">
                                    <input 
                                        type="number" min="0" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-cyan-400 font-black text-lg focus:outline-none focus:border-cyan-500 text-center" 
                                        value={laborCost} 
                                        onChange={(e) => setLaborCost(e.target.value)} 
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ج.م</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">قيمة الخصم للعميل</label>
                                <div className="relative">
                                    <input 
                                        type="number" min="0" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-rose-400 font-black text-lg focus:outline-none focus:border-rose-500 text-center" 
                                        value={discountAmount} 
                                        onChange={(e) => setDiscountAmount(e.target.value)} 
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ج.م</span>
                                </div>
                            </div>

                            <div className="text-center md:text-left md:border-r md:border-slate-800 md:pr-4">
                                <span className="text-xs font-bold text-slate-400 block mb-1">الصافي الإجمالي المطلوب:</span>
                                <h3 className="text-3xl font-black text-emerald-400 font-mono">
                                    {netTotal.toLocaleString()} <span className="text-xs font-bold text-white">ج.م</span>
                                </h3>
                            </div>

                        </div>
                    </div>

                </div>

                {/* أزرار الإجراءات السفلية */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={() => setShowEditInvoiceModal(false)} 
                        className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                        إلغاء
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleSaveInvoiceFinancials(laborCost, discountAmount)} 
                        disabled={isUpdating} 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white px-8 py-2.5 rounded-xl font-black transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-double"></i>} حفظ وتثبيت الفاتورة
                    </button>
                </div>

            </div>
        </div>
    );
};