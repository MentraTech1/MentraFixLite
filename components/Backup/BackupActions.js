// المسار: components/Backup/BackupActions.js
window.BackupActions = function({ handleExport, triggerImport, handleImport, fileInputRef }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-view" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-cyan-200 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-[#06B6D4] flex items-center justify-center text-2xl mb-4 shadow-sm border border-cyan-100">
                    <i className="fas fa-download"></i>
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">أخذ نسخة احتياطية</h3>
                <p className="text-slate-500 text-xs md:text-sm font-bold mb-6">يقوم بتحميل ملف يحتوي على جميع بيانات العملاء، الأجهزة، المخزن، والمالية لحفظها على جهازك أو الفلاشة.</p>
                <button onClick={handleExport} className="w-full mt-auto bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-colors flex justify-center items-center gap-2 active:scale-95 shadow-lg">
                    <i className="fas fa-save"></i> تحميل النسخة الآن
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-blue-200 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center text-2xl mb-4 shadow-sm border border-blue-100">
                    <i className="fas fa-upload"></i>
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">استرجاع نسخة سابقة</h3>
                <p className="text-slate-500 text-xs md:text-sm font-bold mb-6">قم برفع ملف النسخة الاحتياطية الذي قمت بتحميله مسبقاً لاستعادة البيانات. (سيتم استبدال بياناتك الحالية).</p>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
                <button onClick={triggerImport} className="w-full mt-auto border-2 border-slate-200 text-slate-700 font-black py-4 rounded-2xl hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-blue-50 transition-all flex justify-center items-center gap-2 active:scale-95">
                    <i className="fas fa-folder-open"></i> اختيار ملف النسخة
                </button>
            </div>
        </div>
    );
};