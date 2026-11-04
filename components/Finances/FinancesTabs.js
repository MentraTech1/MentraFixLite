// المسار: components/Finances/FinancesTabs.js
window.FinancesTabs = function({ activeTab, setActiveTab }) {
    return (
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto hide-scrollbar animate-view" style={{ animationDelay: '0.15s' }}>
            {/* 1. فواتير أوامر الشغل */}
            <button 
                onClick={() => setActiveTab('invoices')} 
                className={`px-6 py-3.5 font-black text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'invoices' 
                        ? 'border-cyan-500 text-cyan-600 bg-cyan-50/50 rounded-t-xl' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl'
                }`}
            >
                <i className="fa-solid fa-file-invoice mr-1.5"></i> فواتير أوامر الشغل
            </button>

            {/* 2. مبيعات قطع الغيار (POS) */}
            <button 
                onClick={() => setActiveTab('pos')} 
                className={`px-6 py-3.5 font-black text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'pos' 
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 rounded-t-xl' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl'
                }`}
            >
                <i className="fa-solid fa-store mr-1.5"></i> مبيعات قطع الغيار (POS)
            </button>

            {/* 3. فواتير المشتريات (تمت إضافتها هنا) */}
            <button 
                onClick={() => setActiveTab('purchases')} 
                className={`px-6 py-3.5 font-black text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'purchases' 
                        ? 'border-orange-500 text-orange-600 bg-orange-50/50 rounded-t-xl' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl'
                }`}
            >
                <i className="fa-solid fa-truck-ramp-box mr-1.5"></i> فواتير المشتريات
            </button>

            {/* 4. سجل المصروفات */}
            <button 
                onClick={() => setActiveTab('expenses')} 
                className={`px-6 py-3.5 font-black text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'expenses' 
                        ? 'border-rose-500 text-rose-600 bg-rose-50/50 rounded-t-xl' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl'
                }`}
            >
                <i className="fa-solid fa-receipt mr-1.5"></i> سجل المصروفات
            </button>
        </div>
    );
};