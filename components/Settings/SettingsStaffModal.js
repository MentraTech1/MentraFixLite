// المسار: components/Settings/SettingsStaffModal.js
window.SettingsStaffModal = function({ setIsModalOpen, editingStaffId, formData, setFormData, handleSubmit, userId }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 flex flex-col max-h-[90vh] animate-view border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-[2rem]">
                    <h3 className="text-lg font-black text-slate-800"><i className={`fas ${editingStaffId ? 'fa-pen' : 'fa-user-plus'} text-[#06B6D4] ml-2`}></i> {editingStaffId ? 'تعديل بيانات الموظف' : 'إضافة مستخدم للنظام'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto hide-scrollbar">
                    <div><label className="block text-xs font-black text-slate-500 mb-1.5">الاسم بالكامل</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#06B6D4] transition-colors" placeholder="مثال: بشمهندس أحمد" /></div>
                    <div><label className="block text-xs font-black text-slate-500 mb-1.5">رقم الهاتف (لتسجيل الدخول)</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required dir="ltr" className="w-full text-left bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#06B6D4] transition-colors" placeholder="01xxxxxxxxx" /></div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 mb-1.5">{editingStaffId ? 'كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)' : 'كلمة المرور المؤقتة'}</label>
                        <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingStaffId} dir="ltr" className="w-full text-left bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#06B6D4] transition-colors" placeholder={editingStaffId ? '••••••••' : 'يستخدمها الموظف لتسجيل الدخول'} />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 mb-1.5">صلاحية النظام</label>
                        <div className="relative">
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={editingStaffId === parseInt(userId)} className={`w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl pl-4 pr-10 py-3 outline-none focus:bg-white focus:border-[#06B6D4] appearance-none transition-colors ${editingStaffId === parseInt(userId) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <option value="technician">مهندس / فني (صلاحية الورشة والمخزن)</option>
                                <option value="reception">استقبال (صلاحية العملاء والأجهزة)</option>
                                <option value="admin">مدير المركز (صلاحية كاملة)</option>
                            </select>
                            <i className="fas fa-chevron-down absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                        {editingStaffId === parseInt(userId) && <p className="text-[10px] font-bold text-amber-500 mt-1.5"><i className="fas fa-exclamation-triangle"></i> لا يمكنك تغيير صلاحية حسابك الشخصي حالياً.</p>}
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] text-white font-black py-4 rounded-xl shadow-lg mt-2 transition-transform active:scale-95 flex items-center justify-center gap-2 text-base"><i className="fas fa-save"></i> حفظ بيانات المستخدم</button>
                </form>
            </div>
        </div>
    );
};