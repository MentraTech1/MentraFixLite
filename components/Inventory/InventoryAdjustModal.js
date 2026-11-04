// المسار: components/Inventory/InventoryAdjustModal.js
window.InventoryAdjustModal = function({ showAdjustModal, setShowAdjustModal, adjustData, setAdjustData, handleAdjustSubmit, isUpdating }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdjustModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-view border border-slate-100">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 text-center relative">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 mx-auto mb-3">
                        <i className="fa-solid fa-boxes-packing text-xl"></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-800">تعديل رصيد الصنف</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1 bg-white inline-block px-3 py-1 rounded-lg border border-slate-200">{adjustData.part_name}</p>
                    <button onClick={() => setShowAdjustModal(false)} className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <form onSubmit={handleAdjustSubmit} className="p-6 space-y-6">
                    
                    <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-xs font-bold text-slate-500">الرصيد الحالي بالمخزن:</span>
                        <span className="bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-lg text-lg font-black shadow-sm">{adjustData.current_qty}</span>
                    </div>

                    <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1">
                        <button type="button" onClick={() => setAdjustData({...adjustData, adjust_type: 'add'})} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${adjustData.adjust_type === 'add' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                            <i className="fa-solid fa-plus"></i> إدخال بضاعة
                        </button>
                        <button type="button" onClick={() => setAdjustData({...adjustData, adjust_type: 'sub'})} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${adjustData.adjust_type === 'sub' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                            <i className="fa-solid fa-minus"></i> سحب بضاعة
                        </button>
                    </div>

                    <div>
                        <label className="block text-center text-xs font-bold text-slate-700 mb-2">
                            الكمية المُراد {adjustData.adjust_type === 'add' ? 'إضافتها للمخزن' : 'سحبها من المخزن'}
                        </label>
                        <input type="number" min="1" max={adjustData.adjust_type === 'sub' ? adjustData.current_qty : undefined} required className={`w-full text-center text-3xl font-black rounded-2xl px-4 py-4 focus:outline-none border-2 transition-colors ${adjustData.adjust_type === 'add' ? 'border-emerald-200 focus:border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-rose-200 focus:border-rose-500 text-rose-700 bg-rose-50/50'}`} value={adjustData.amount} onChange={(e) => setAdjustData({...adjustData, amount: e.target.value})} />
                    </div>

                    <button type="submit" disabled={isUpdating} className={`w-full py-3.5 rounded-xl font-black transition-all text-white disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg ${adjustData.adjust_type === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'}`}>
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-double"></i>} تأكيد التسوية
                    </button>
                </form>
            </div>
        </div>
    );
};