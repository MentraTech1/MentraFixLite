// المسار: components/Backup/BackupOverlayLoader.js
window.BackupOverlayLoader = function({ loadingText }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full animate-view border border-slate-100">
                <i className="fas fa-circle-notch fa-spin text-5xl text-[#06B6D4] mb-5"></i>
                <h3 className="font-black text-slate-800 text-lg mb-2">يرجى الانتظار</h3>
                <p className="font-bold text-slate-500 text-sm">{loadingText}</p>
                <p className="text-[10px] text-rose-500 mt-4 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-100">لا تقم بإغلاق المتصفح أو التطبيق</p>
            </div>
        </div>
    );
};