// المسار: components/Settings/SettingsHeader.js

window.SettingsHeader = function({ activeTab, setActiveTab, setIsEditingCenter }) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 animate-view">
            <div className="flex items-center gap-3 text-slate-800 font-black text-lg md:text-xl w-full xl:w-auto">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                    <i className="fas fa-cog text-slate-600"></i>
                </div>
                إعدادات النظام
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full xl:w-auto gap-1">
                <button 
                    onClick={() => setActiveTab('staff')} 
                    className={`flex-1 sm:w-32 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all ${
                        activeTab === 'staff' ? 'bg-white text-[#06B6D4] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <i className="fa-solid fa-users-gear ml-1.5"></i> طاقم العمل
                </button>

                <button 
                    onClick={() => { setActiveTab('centerInfo'); setIsEditingCenter(false); }} 
                    className={`flex-1 sm:w-32 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all ${
                        activeTab === 'centerInfo' ? 'bg-white text-[#06B6D4] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <i className="fa-solid fa-store ml-1.5"></i> بيانات المركز
                </button>

                <button 
                    onClick={() => { setActiveTab('security'); setIsEditingCenter(false); }} 
                    className={`flex-1 sm:w-32 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all ${
                        activeTab === 'security' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <i className="fa-solid fa-key ml-1.5"></i> مفتاح الأمان
                </button>

                {/* التبويب الجديد: استيراد قطع الغيار بالإكسيل */}
                <button 
                    onClick={() => { setActiveTab('import'); setIsEditingCenter(false); }} 
                    className={`flex-1 sm:w-36 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all ${
                        activeTab === 'import' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <i className="fa-solid fa-file-excel ml-1.5 text-emerald-500"></i> استيراد الإكسيل
                </button>
            </div>
        </div>
    );
};