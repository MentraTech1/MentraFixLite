// المسار: components/Customers/CustomerAddEditModal.js
window.CustomerAddEditModal = function({ showModal, setShowModal, modalMode, formData, setFormData, handleFormSubmit, isUpdating }) {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-view border border-slate-100">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <i className={`fa-solid ${modalMode === 'add' ? 'fa-user-plus text-cyan-500' : 'fa-user-pen text-blue-500'}`}></i>
                        {modalMode === 'add' ? 'إضافة عميل جديد' : 'تعديل بيانات العميل'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم العميل <span className="text-rose-500">*</span></label>
                        <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white" placeholder="الاسم ثلاثي أو اسم الشركة" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف <span className="text-rose-500">*</span></label>
                            <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white text-left" dir="ltr" placeholder="01xxxxxxxxx" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم هاتف بديل</label>
                            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white text-left" dir="ltr" placeholder="اختياري" value={formData.alt_phone} onChange={(e) => setFormData({...formData, alt_phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العميل <span className="text-rose-500">*</span></label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm transition-all ${formData.customer_type === 'individual' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="c_type" value="individual" className="hidden" checked={formData.customer_type === 'individual'} onChange={(e) => setFormData({...formData, customer_type: e.target.value})} />
                                <i className="fa-solid fa-user"></i> فرد (شخصي)
                            </label>
                            <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm transition-all ${formData.customer_type === 'company' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="c_type" value="company" className="hidden" checked={formData.customer_type === 'company'} onChange={(e) => setFormData({...formData, customer_type: e.target.value})} />
                                <i className="fa-solid fa-building"></i> شركة / مؤسسة
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان</label>
                        <textarea rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all bg-slate-50 focus:bg-white resize-none" placeholder="اكتب العنوان بالتفصيل..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="submit" disabled={isUpdating} className="flex-1 bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-lg shadow-cyan-500/25">
                            {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} {modalMode === 'add' ? 'حفظ العميل' : 'تحديث البيانات'}
                        </button>
                        <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors text-sm">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};