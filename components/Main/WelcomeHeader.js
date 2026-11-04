// المسار: components/Main/WelcomeHeader.js
window.MainWelcomeHeader = function({ sessionData, setActiveModule }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-view">
            <div>
                <h2 className="text-2xl font-black text-slate-800">مرحباً بعودتك، {sessionData.name.split(' ')[0]} 👋</h2>
                <p className="text-slate-500 text-sm font-bold mt-1">إليك ملخص سريع لما يحدث في مركز الصيانة الخاص بك اليوم.</p>
            </div>
            
            {/* أزرار التنقل السريع */}
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => setActiveModule('requests')} className="flex-1 md:flex-none bg-gradient-to-l from-cyan-500 to-blue-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-plus"></i> أمر شغل جديد
                </button>
                <button onClick={() => setActiveModule('customers')} className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-user-plus"></i> عميل جديد
                </button>
                <button onClick={() => setActiveModule('finances')} className="flex-1 md:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 hidden sm:flex">
                    <i className="fa-solid fa-file-invoice-dollar"></i> الحسابات
                </button>
            </div>
        </div>
    );
};