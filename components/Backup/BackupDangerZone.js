// المسار: components/Backup/BackupDangerZone.js
window.BackupDangerZone = function({ handleFactoryReset }) {
    return (
        <div className="bg-rose-50 rounded-3xl p-5 md:p-6 border border-rose-200 flex flex-col sm:flex-row items-center gap-4 justify-between text-center sm:text-right mt-2 animate-view" style={{ animationDelay: '0.2s' }}>
            <div>
                <h3 className="text-rose-700 font-black text-base md:text-lg mb-1 flex items-center justify-center sm:justify-start gap-2">
                    <i className="fas fa-exclamation-triangle"></i> منطقة الخطر (إعادة ضبط المصنع)
                </h3>
                <p className="text-rose-600/80 text-xs md:text-sm font-bold">هذا الإجراء سيقوم بمسح كافة البيانات من النظام تماماً ولا يمكن التراجع عنه.</p>
            </div>
            <button onClick={handleFactoryReset} className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 text-white text-sm font-black rounded-xl hover:bg-rose-700 transition-colors flex-shrink-0 shadow-md active:scale-95">
                مسح جميع البيانات
            </button>
        </div>
    );
};