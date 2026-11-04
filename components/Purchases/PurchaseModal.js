// المسار: components/Purchases/PurchaseModal.js
window.PurchaseModal = function({ setShowPurchaseModal, searchKeyword, handlePurchaseSearch, searchResults, selectedPart, selectPart, purchaseForm, setPurchaseForm, handlePurchaseSubmit, setSearchKeyword, setSelectedPart, isUpdating }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPurchaseModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden animate-view border border-slate-100 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50 shrink-0">
                    <h3 className="text-lg font-black text-emerald-800 flex items-center gap-2"><i className="fa-solid fa-truck-ramp-box text-emerald-500"></i> شراء وتوريد بضاعة</h3>
                    <button onClick={() => setShowPurchaseModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form id="purchaseForm" onSubmit={handlePurchaseSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">ابحث عن القطعة (المسجلة مسبقاً) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input type="text" placeholder="اسم القطعة أو الكود..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-all pr-10" value={searchKeyword} onChange={handlePurchaseSearch} required={!selectedPart} disabled={!!selectedPart} />
                                <i className="fa-solid fa-search absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"></i>
                            </div>
                            
                            {searchResults.length > 0 && !selectedPart && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-50">
                                    {searchResults.map(part => (
                                        <div key={part.id} onClick={() => selectPart(part)} className="p-3 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer flex justify-between items-center transition-colors group">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">{part.part_name}</p>
                                                {part.sku && <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1">{part.sku}</p>}
                                            </div>
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 border border-slate-200 group-hover:border-emerald-200">الرصيد: {part.stock_quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedPart && (
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 animate-view">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30"><i className="fa-solid fa-check"></i></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-600 mb-0.5">تم اختيار القطعة:</p>
                                        <p className="text-sm font-black text-emerald-900 leading-tight">{selectedPart.part_name}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => {setSelectedPart(null); setSearchKeyword('');}} className="w-8 h-8 rounded-full bg-white border border-emerald-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-sm"><i className="fa-solid fa-rotate-left text-xs"></i></button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">الكمية المشتراة <span className="text-rose-500">*</span></label>
                                <input type="number" min="1" required className="w-full border border-slate-200 rounded-xl px-3 py-3 text-xl text-center font-black text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({...purchaseForm, quantity: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر الوحدة <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input type="number" step="0.01" min="0" required className="w-full border border-emerald-200 rounded-xl px-3 py-3 text-xl text-center font-black text-emerald-700 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" value={purchaseForm.unit_price} onChange={(e) => setPurchaseForm({...purchaseForm, unit_price: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        
                        <label className="flex items-start gap-3 cursor-pointer bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input type="checkbox" className="w-5 h-5 accent-emerald-600 rounded cursor-pointer" checked={purchaseForm.add_to_expenses} onChange={(e) => setPurchaseForm({...purchaseForm, add_to_expenses: e.target.checked})} />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-800">تسجيل كمصروف تلقائي في الحسابات</span>
                                <span className="block text-[10px] text-slate-500 font-semibold mt-1">سيتم خصم إجمالي التكلفة من أرباحك في التقارير.</span>
                            </div>
                        </label>
                    </form>
                </div>
                
                <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button type="submit" form="purchaseForm" disabled={isUpdating || !selectedPart} className="w-full bg-gradient-to-l from-emerald-500 to-emerald-600 hover:opacity-90 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/30 text-base">
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-double"></i>} تأكيد توريد البضاعة
                    </button>
                </div>
            </div>
        </div>
    );
};