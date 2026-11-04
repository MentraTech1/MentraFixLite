// المسار: components/Requests/RequestsPartsModal.js
window.RequestsPartsModal = function({ 
    showPartsModal, setShowPartsModal, selectedOrderForParts, isPartsLoading,
    handleAddPart, partDropdownRef, partForm, setPartForm, partSearchText, 
    handlePartSearchChange, partSearchResults, showPartDropdown, setShowPartDropdown,
    selectPart, isSearchingParts, isUpdating, usedParts, handleRemovePart
}) {
    if (!showPartsModal || !selectedOrderForParts) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPartsModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl z-10 overflow-hidden animate-view flex flex-col max-h-[90vh]">
                
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
                    <div>
                        <h3 className="text-lg font-black text-purple-800">صرف قطع غيار - طلب #{selectedOrderForParts.id}</h3>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">العميل: {selectedOrderForParts.customer_name} | {selectedOrderForParts.device_type}</p>
                    </div>
                    <button onClick={() => setShowPartsModal(false)} className="w-8 h-8 rounded-full bg-white text-slate-500 hover:bg-rose-500 hover:text-white shadow-sm border border-slate-200 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto relative bg-slate-50 flex-1">
                    {isPartsLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-3xl text-purple-600"></i></div>}

                    <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm mb-6">
                        <h4 className="text-xs font-black text-slate-800 mb-3"><i className="fa-solid fa-hand-holding-box text-purple-600"></i> سحب قطعة من المخزن وإضافتها للطلب:</h4>
                        <form onSubmit={handleAddPart} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative" ref={partDropdownRef}>
                                <input 
                                    type="text" required 
                                    className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500 pr-10 ${partForm.part_id ? 'border-green-500 bg-green-50' : 'bg-slate-50'}`}
                                    placeholder="ابحث عن قطعة (حرفين على الأقل)..."
                                    value={partSearchText} onChange={handlePartSearchChange}
                                    onFocus={() => { if(partSearchResults?.length > 0) setShowPartDropdown(true); }}
                                />
                                <i className={`fa-solid ${isSearchingParts ? 'fa-spinner fa-spin text-purple-500' : (partForm.part_id ? 'fa-check text-green-500' : 'fa-magnifying-glass text-slate-400')} absolute left-3 top-1/2 -translate-y-1/2`}></i>
                                
                                {showPartDropdown && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                        {partSearchResults?.length > 0 ? (
                                            partSearchResults.map(p => {
                                                const pPrice = Number(p.selling_price) || Number(p.price) || 0;
                                                return (
                                                    <li key={p.id} onMouseDown={() => selectPart(p)} className="p-3 hover:bg-purple-50 cursor-pointer flex flex-col transition-colors text-right">
                                                        <span className="font-bold text-slate-800 text-sm">{p.part_name}</span>
                                                        <span className="text-[10px] text-emerald-600 font-bold mt-1">السعر: {pPrice.toLocaleString()} ج.م | المتوفر: <span className={p.stock_quantity > 0 ? 'text-blue-500' : 'text-rose-500'}>{p.stock_quantity}</span></span>
                                                    </li>
                                                )
                                            })
                                        ) : <li className="p-3 text-center text-sm font-bold text-slate-400">لا توجد قطع مطابقة بالمخزن</li>}
                                    </ul>
                                )}
                            </div>

                            <div className="w-full md:w-32">
                                <input type="number" min="1" max={partForm.max_qty || 1} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-center text-slate-700 focus:outline-none focus:border-purple-500 bg-slate-50" placeholder="الكمية" value={partForm.quantity} onChange={(e) => setPartForm({...partForm, quantity: e.target.value})} />
                            </div>
                            <button type="submit" disabled={isUpdating} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md disabled:opacity-70 whitespace-nowrap text-sm">
                                صرف وإضافة <i className="fa-solid fa-plus mr-1"></i>
                            </button>
                        </form>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 mb-3 px-1"><i className="fa-solid fa-list-check text-emerald-600"></i> القطع التي تم تركيبها بالفعل:</h4>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[11px]">
                                <tr>
                                    <th className="p-3 whitespace-nowrap">اسم القطعة</th>
                                    <th className="p-3 whitespace-nowrap text-center">الكمية</th>
                                    <th className="p-3 whitespace-nowrap text-center">سعر الوحدة</th>
                                    <th className="p-3 whitespace-nowrap text-center">الإجمالي</th>
                                    <th className="p-3 whitespace-nowrap text-center">إرجاع</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {usedParts?.length > 0 ? usedParts.map(up => (
                                    <tr key={up.id}>
                                        <td className="p-3 font-bold text-slate-800 text-xs">{up.part_name}</td>
                                        <td className="p-3 font-black text-slate-600 text-center text-xs">{up.quantity}</td>
                                        <td className="p-3 font-bold text-slate-500 text-center text-xs">{Number(up.price).toLocaleString()}</td>
                                        <td className="p-3 font-black text-emerald-600 text-center text-xs">{Number(up.total_price).toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleRemovePart(up)} disabled={isUpdating} className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" title="حذف وإرجاع للمخزن">
                                                <i className="fa-solid fa-trash-can text-[10px]"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="p-6 text-center text-slate-400 font-bold text-xs">لم يتم سحب أي قطع غيار لهذا الطلب حتى الآن.</td></tr>}
                            </tbody>
                            {usedParts?.length > 0 && (
                                <tfoot className="bg-slate-50 border-t border-slate-200 font-black">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-left text-slate-600 text-xs">إجمالي قطع الغيار المُضافة للطلب:</td>
                                        <td className="p-3 text-center text-emerald-600 text-base">{usedParts.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toLocaleString()} <span className="text-[9px]">ج.م</span></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};