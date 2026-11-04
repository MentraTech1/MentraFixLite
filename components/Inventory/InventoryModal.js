// المسار: components/Inventory/InventoryModal.js
window.InventoryModal = function({ showModal, setShowModal, modalMode, formData, setFormData, handleFormSubmit, isUpdating }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl z-10 overflow-hidden animate-view border border-slate-100 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <i className={`fa-solid ${modalMode === 'add' ? 'fa-box-open text-cyan-500' : 'fa-pen-to-square text-blue-500'}`}></i>
                        {modalMode === 'add' ? 'إضافة قطعة جديدة' : 'تعديل بيانات القطعة'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all"><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                <div className="overflow-y-auto p-6">
                    <form id="itemForm" onSubmit={handleFormSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم القطعة <span className="text-rose-500">*</span></label>
                                <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white" value={formData.part_name} onChange={(e) => setFormData({...formData, part_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">الكود (SKU)</label>
                                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white text-left font-mono" dir="ltr" placeholder="اختياري" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">الماركة (Brand)</label>
                                <input type="text" placeholder="مثال: Samsung, Original..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">مكان القطعة بالرف (Location)</label>
                            <input type="text" placeholder="مثال: رف 3، درج A" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white" value={formData.location_in_store} onChange={(e) => setFormData({...formData, location_in_store: e.target.value})} />
                        </div>

                        {modalMode === 'add' && (
                            <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100">
                                <label className="block text-xs font-bold text-cyan-800 mb-1.5">الرصيد الافتتاحي (الكمية الحالية) <span className="text-rose-500">*</span></label>
                                <input type="number" min="0" required className="w-full border border-cyan-200 rounded-xl px-4 py-3 text-sm font-black text-cyan-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
                                <p className="text-[10px] text-cyan-600 font-bold mt-2"><i className="fa-solid fa-circle-info mr-1"></i> لتعديل الرصيد لاحقاً، استخدم زر "التسوية" من الجدول.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر الشراء (التكلفة) <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input type="number" step="0.01" min="0" required className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-black text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">ج.م</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر البيع للعميل <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input type="number" step="0.01" min="0" required className="w-full border border-cyan-200 rounded-xl px-4 py-3 pl-10 text-sm font-black text-cyan-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-cyan-50" value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 text-xs font-bold">ج.م</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-5 border-t border-slate-100 flex gap-3 bg-slate-50 shrink-0">
                    <button type="submit" form="itemForm" disabled={isUpdating} className="flex-1 bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-lg shadow-cyan-500/25">
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} {modalMode === 'add' ? 'إضافة للمخزن' : 'تحديث البيانات'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors text-sm">إلغاء</button>
                </div>
            </div>
        </div>
    );
};