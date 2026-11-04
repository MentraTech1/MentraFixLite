// المسار: components/Backup/BackupHeader.js
window.BackupHeader = function({ lastBackup }) {
    return (
        <div className="bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden animate-view">
            <i className="fas fa-database absolute -left-4 -bottom-10 text-9xl opacity-10"></i>
            <h2 className="text-xl md:text-2xl font-black mb-2 relative z-10">مركز النسخ الاحتياطي</h2>
            <p className="text-white/90 text-xs md:text-sm font-bold relative z-10 max-w-xl leading-relaxed">
                هذا النظام يعمل بدون إنترنت على جهازك فقط. لتجنب ضياع بيانات عملائك أوامر الشغل والفواتير، نرجو تحميل نسخة احتياطية يومياً.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold relative z-10 shadow-sm border border-white/10">
                <i className="fas fa-clock"></i>
                آخر نسخة: <span dir="ltr" className="ml-1 text-white font-black">{lastBackup}</span>
            </div>
        </div>
    );
};