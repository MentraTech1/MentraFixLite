// المسار: components/Customers/DeviceEditModal.js
window.DeviceEditModal = function({ showModal, setShowModal, formData, setFormData, handleSubmit, isUpdating }) {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-view border border-slate-100">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <i className="fa-solid fa-pen-to-square text-blue-500"></i>
                        تعديل بيانات الجهاز
                    </h3>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all"><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الجهاز <span className="text-rose-500">*</span></label>
                        <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white" value={formData.device_type || ''} onChange={(e) => setFormData({...formData, device_type: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">الماركة (Brand)</label>
                            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white" value={formData.brand || ''} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">الموديل</label>
                            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white" value={formData.model || ''} onChange={(e) => setFormData({...formData, model: e.target.value})} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الرقم التسلسلي (S/N)</label>
                        <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white text-left" dir="ltr" value={formData.serial_number || ''} onChange={(e) => setFormData({...formData, serial_number: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الضمان</label>
                        <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white appearance-none" value={formData.warranty_status || 'out_of_warranty'} onChange={(e) => setFormData({...formData, warranty_status: e.target.value})}>
                            <option value="out_of_warranty">خارج الضمان</option>
                            <option value="in_warranty">داخل الضمان (ساري)</option>
                        </select>
                    </div>
                    
                    <div className="pt-2 flex gap-3">
                        <button type="submit" disabled={isUpdating} className="flex-1 bg-gradient-to-l from-blue-500 to-indigo-600 hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-md">
                            {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} حفظ التعديلات
                        </button>
                        <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors text-sm">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};