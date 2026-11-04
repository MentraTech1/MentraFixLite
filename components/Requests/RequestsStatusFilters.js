// المسار: components/Requests/RequestsStatusFilters.js
window.RequestsStatusFilters = function({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'الكل', text: 'جميع الطلبات', icon: 'fa-list' },
        { id: 'قيد الفحص', text: 'قيد الفحص', icon: 'fa-clock' },
        { id: 'جاري العمل', text: 'جاري العمل', icon: 'fa-spinner' },
        { id: 'بانتظار قطع غيار', text: 'بانتظار قطع', icon: 'fa-pause' },
        { id: 'تم الإصلاح', text: 'تم الإصلاح', icon: 'fa-check-double' },
        { id: 'تم التسليم', text: 'تم التسليم', icon: 'fa-handshake' }
    ];

    return (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 animate-view" style={{ animationDelay: '0.1s' }}>
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <i className={`fa-solid ${tab.icon}`}></i> {tab.text}
                </button>
            ))}
        </div>
    );
};