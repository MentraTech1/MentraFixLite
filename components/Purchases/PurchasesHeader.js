// المسار: components/Purchases/PurchasesHeader.js
window.PurchasesHeader = function({ setShowPurchaseModal, setSelectedPart, setSearchKeyword }) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center animate-view">
            <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600"><i className="fa-solid fa-cart-flatbed"></i></div>
                    المشتريات وحركة المخزن
                </h2>
                <p className="text-slate-500 text-sm font-bold mt-2">سجل مشتريات البضاعة (الوارد) والمسحوبات لأوامر الشغل (المنصرف).</p>
            </div>
            <button onClick={() => { setShowPurchaseModal(true); setSelectedPart(null); setSearchKeyword(''); }} className="bg-gradient-to-l from-emerald-500 to-emerald-600 hover:opacity-90 text-white shadow-lg shadow-emerald-500/30 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
                <i className="fa-solid fa-truck-ramp-box"></i> شراء وتوريد بضاعة
            </button>
        </div>
    );
};