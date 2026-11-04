// المسار: components/Finances/FinancesPayModal.js
window.FinancesPayModal = function({ setShowPayModal, selectedInvoice, paymentMethod, setPaymentMethod, handlePaySubmit, isUpdating }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPayModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-view border border-slate-100">
                <div className="p-5 border-b border-slate-100 bg-emerald-50/50 text-center relative">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto mb-3"><i className="fa-solid fa-hand-holding-dollar text-xl"></i></div>
                    <h3 className="text-lg font-black text-emerald-800">تحصيل قيمة الفاتورة</h3>
                    <button onClick={() => setShowPayModal(false)} className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <form onSubmit={handlePaySubmit} className="p-6 space-y-6">
                    <div className="text-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h2 className="text-3xl font-black text-cyan-600 mt-2">{Number(selectedInvoice.final_amount || selectedInvoice.total_amount).toLocaleString()} <span className="text-sm font-bold">ج.م</span></h2>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 text-center">اختر طريقة التحصيل والدفع</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['كاش', 'فيزا', 'محفظة إلكترونية', 'تحويل بنكي'].map(method => (
                                <div key={method} onClick={() => setPaymentMethod(method)} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === method ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-[1.02]' : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'}`}>
                                    <span className="text-xs font-black">{method}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full bg-gradient-to-l from-emerald-500 to-emerald-600 text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 text-base">
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-double"></i>} تأكيد تسجيل التحصيل
                    </button>
                </form>
            </div>
        </div>
    );
};