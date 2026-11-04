// المسار: components/Finances/FinancesExpenseModal.js
window.FinancesExpenseModal = function({ setShowExpenseModal, expenseModalMode, expenseForm, setExpenseForm, handleExpenseSubmit, isUpdating }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-view border border-slate-100 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50 shrink-0">
                    <h3 className="text-lg font-black text-rose-700 flex items-center gap-2"><i className="fa-solid fa-money-bill-wave"></i> {expenseModalMode === 'add' ? 'تسجيل مصروف' : 'تعديل المصروف'}</h3>
                    <button onClick={() => setShowExpenseModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form id="expenseForm" onSubmit={handleExpenseSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع المصروف (البند)</label>
                            <select required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-500" value={expenseForm.expense_type} onChange={(e) => setExpenseForm({...expenseForm, expense_type: e.target.value})}>
                                <option value="rent">إيجار</option>
                                <option value="salaries">رواتب وأجور</option>
                                <option value="utilities">مرافق (كهرباء، ماء، إنترنت)</option>
                                <option value="equipment">معدات وأدوات</option>
                                <option value="transportation">انتقالات وشحن</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">المبلغ المُنصرف</label>
                            <div className="relative">
                                <input type="number" min="1" step="0.01" required className="w-full border border-rose-200 rounded-xl px-4 py-4 text-xl text-center font-black text-rose-700 bg-rose-50 focus:outline-none focus:border-rose-500" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-bold bg-white px-2 py-1 rounded border border-rose-100">ج.م</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">الوصف التفصيلي</label>
                            <textarea rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-500 resize-none" value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الصرف</label>
                            <input type="date" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-500" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})} />
                        </div>
                    </form>
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button type="submit" form="expenseForm" disabled={isUpdating} className="w-full bg-gradient-to-l from-rose-500 to-rose-600 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 text-base">
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} حفظ البيانات
                    </button>
                </div>
            </div>
        </div>
    );
};