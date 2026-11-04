// المسار: components/Pos/Module_POS_Container.js
window.PosMainContainer = function(props) {
    const { useState } = React;
    const { DirectSale, InvoiceHistory } = window;

    const [activeTab, setActiveTab] = useState('sale'); 

    return (
        <div className="space-y-6 h-full flex flex-col animate-view">
            <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 max-w-sm mx-auto w-full shrink-0">
                <button onClick={() => setActiveTab('sale')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'sale' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                    <i className={`fas fa-store text-lg ${activeTab === 'sale' ? 'text-[#06B6D4]' : ''}`}></i> بيع قطع الغيار
                </button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                    <i className={`fas fa-receipt text-lg ${activeTab === 'history' ? 'text-[#06B6D4]' : ''}`}></i> سجل الفواتير
                </button>
            </div>

            <div className="flex-1 w-full">
                {activeTab === 'sale' && <DirectSale {...props} />}
                {activeTab === 'history' && <InvoiceHistory {...props} />}
            </div>
        </div>
    );
};