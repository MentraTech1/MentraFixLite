// المسار: components/Settings/SettingsCenterTab.js
window.SettingsCenterTab = function({ centerInfo, isEditingCenter, setIsEditingCenter, centerFormData, setCenterFormData, handleSaveCenterInfo }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10 animate-view flex flex-col items-center max-w-2xl mx-auto relative overflow-hidden">
            {!isEditingCenter && (
                <button onClick={() => setIsEditingCenter(true)} className="absolute top-6 left-6 bg-slate-50 hover:bg-[#06B6D4] text-slate-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-100 flex items-center gap-2"><i className="fas fa-pen"></i> تعديل</button>
            )}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-4xl shadow-xl mb-6 shrink-0"><i className="fas fa-store"></i></div>

            {!isEditingCenter ? (
                <div className="text-center w-full">
                    <h2 className="text-2xl font-black text-slate-800 mb-1">{centerInfo.centerName}</h2>
                    <p className="text-slate-500 font-bold mb-8">نظام إدارة محلي (Offline-First)</p>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 mb-1">المدير المسؤول / المالك</p><p className="text-sm font-black text-slate-800">{centerInfo.ownerName}</p></div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 mb-1">رقم الهاتف الأساسي</p><p className="text-sm font-black text-slate-800" dir="ltr">{centerInfo.phone}</p></div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 sm:col-span-2"><p className="text-[10px] font-bold text-slate-400 mb-1">المُعرف التقني لقاعدة البيانات (لا يمكن تغييره)</p><code className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded border border-cyan-100">{centerInfo.dbName}</code></div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSaveCenterInfo} className="w-full mt-2 space-y-4 animate-view text-right">
                    <div><label className="block text-xs font-black text-slate-500 mb-1">اسم مركز الصيانة</label><input type="text" required value={centerFormData.centerName} onChange={e => setCenterFormData({...centerFormData, centerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-[#06B6D4]" /></div>
                    <div><label className="block text-xs font-black text-slate-500 mb-1">اسم المدير المسئول</label><input type="text" required value={centerFormData.ownerName} onChange={e => setCenterFormData({...centerFormData, ownerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-[#06B6D4]" /></div>
                    <div><label className="block text-xs font-black text-slate-500 mb-1">رقم هاتف المركز (للتواصل والدخول)</label><input type="tel" required dir="ltr" value={centerFormData.phone} onChange={e => setCenterFormData({...centerFormData, phone: e.target.value})} className="w-full text-left bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-[#06B6D4]" /></div>
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                        <button type="submit" className="flex-1 bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] text-white font-black py-3 rounded-xl shadow-lg hover:opacity-90 transition-all text-sm"><i className="fas fa-save mr-1"></i> حفظ التعديلات</button>
                        <button type="button" onClick={() => {setIsEditingCenter(false); setCenterFormData({centerName: centerInfo.centerName, ownerName: centerInfo.ownerName, phone: centerInfo.phone});}} className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-black py-3 rounded-xl transition-all text-sm">إلغاء</button>
                    </div>
                </form>
            )}
        </div>
    );
};