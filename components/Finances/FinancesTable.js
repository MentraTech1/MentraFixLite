// المسار: components/Finances/FinancesTable.js
window.FinancesTable = function({ activeTab, listData, isLoading, pagination, fetchData, searchText, dateFrom, dateTo, getInvoiceStatusUI, getExpenseTypeName, safeFormatDate, openPayModal, openEditInvoice, handlePrintInvoice, openEditExpense }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative animate-view" style={{ animationDelay: '0.2s' }}>
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            )}

            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-right text-sm min-w-[800px]">
                    {activeTab === 'invoices' && (
                        <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                                <th className="p-4 whitespace-nowrap">رقم الفاتورة</th>
                                <th className="p-4 whitespace-nowrap">اسم العميل</th>
                                <th className="p-4 whitespace-nowrap">الإجمالي المطلوب</th>
                                <th className="p-4 whitespace-nowrap">تاريخ الإصدار</th>
                                <th className="p-4 whitespace-nowrap text-center">الحالة</th>
                                <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                            </tr>
                        </thead>
                    )}
                    {activeTab === 'pos' && (
                        <thead className="bg-emerald-50/50 text-emerald-700 font-bold border-b border-emerald-100">
                            <tr>
                                <th className="p-4 whitespace-nowrap">رقم الفاتورة</th>
                                <th className="p-4 whitespace-nowrap">العميل / المشتري</th>
                                <th className="p-4 whitespace-nowrap">تاريخ البيع</th>
                                <th className="p-4 whitespace-nowrap">إجمالي المبيعات</th>
                                <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                            </tr>
                        </thead>
                    )}
                    {activeTab === 'purchases' && (
                        <thead className="bg-orange-50/50 text-orange-700 font-bold border-b border-orange-100">
                            <tr>
                                <th className="p-4 whitespace-nowrap">رقم الفاتورة / المورد</th>
                                <th className="p-4 whitespace-nowrap">التاريخ</th>
                                <th className="p-4 whitespace-nowrap">إجمالي التكلفة</th>
                                <th className="p-4 whitespace-nowrap">المدفوع / المتبقي</th>
                                <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                            </tr>
                        </thead>
                    )}
                    {activeTab === 'expenses' && (
                        <thead className="bg-rose-50/50 text-slate-500 font-bold border-b border-rose-100">
                            <tr>
                                <th className="p-4 whitespace-nowrap">نوع المصروف</th>
                                <th className="p-4 whitespace-nowrap">البيان / الوصف</th>
                                <th className="p-4 whitespace-nowrap text-center">تاريخ الصرف</th>
                                <th className="p-4 whitespace-nowrap">المبلغ المنصرف</th>
                                <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                            </tr>
                        </thead>
                    )}

                    <tbody className="divide-y divide-slate-50">
                        {activeTab === 'invoices' && (listData?.length > 0 ? listData.map((inv) => {
                            const stUI = getInvoiceStatusUI(inv.status);
                            return (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 font-black text-slate-700 tracking-wider font-mono bg-slate-50/50" dir="ltr">{inv.display_invoice_number}</td>
                                    <td className="p-4 font-bold text-slate-800">{inv.customer_name}</td>
                                    <td className="p-4 font-black text-cyan-600 text-base">{Number(inv.final_amount || inv.total_amount).toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span></td>
                                    <td className="p-4 text-xs font-bold text-slate-400" dir="ltr">{safeFormatDate(inv.display_date)}</td>
                                    <td className="p-4 text-center"><span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-sm ${stUI.color}`}>{stUI.text}</span></td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 opacity-100 md:opacity-50 group-hover:opacity-100 transition-opacity">
                                            {inv.status === 'غير مدفوعة' ? (
                                                <button onClick={() => openPayModal(inv)} className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="تحصيل الفاتورة"><i className="fa-solid fa-hand-holding-dollar text-xs"></i></button>
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-400" title="تم التحصيل"><i className="fa-solid fa-check"></i></div>
                                            )}
                                            <button onClick={() => openEditInvoice(inv)} className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="تعديل الفاتورة وقطع الغيار"><i className="fa-solid fa-pen text-xs"></i></button>
                                            <button onClick={() => handlePrintInvoice(inv.id, 'maintenance')} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all flex items-center justify-center shadow-sm" title="طباعة الفاتورة"><i className="fa-solid fa-print text-xs"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-file-invoice text-2xl"></i></div>لا توجد فواتير مطابقة.</td></tr>)}

                        {activeTab === 'pos' && (listData?.length > 0 ? listData.map((pos) => (
                            <tr key={pos.id} className="hover:bg-emerald-50/20 transition-colors">
                                <td className="p-4 font-black text-slate-700 tracking-wider font-mono bg-slate-50/50" dir="ltr">{pos.invoice_number || `POS-${pos.id}`}</td>
                                <td className="p-4 font-bold text-slate-800">{pos.customer_name || 'عميل نقدي'}</td>
                                <td className="p-4 text-xs font-bold text-slate-400" dir="ltr">{safeFormatDate(pos.created_at)}</td>
                                <td className="p-4 font-black text-emerald-600 text-base">{Number(pos.total_amount).toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span></td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handlePrintInvoice(pos.id, 'pos')} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center mx-auto shadow-sm" title="طباعة الفاتورة"><i className="fa-solid fa-print text-xs"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><div className="w-16 h-16 bg-emerald-50 text-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-store text-2xl"></i></div>لا توجد مبيعات قطع غيار.</td></tr>)}

                        {activeTab === 'purchases' && (listData?.length > 0 ? listData.map((pur) => (
                            <tr key={pur.id} className="hover:bg-orange-50/20 transition-colors">
                                <td className="p-4">
                                    <p className="font-black text-slate-700 tracking-wider font-mono" dir="ltr">{pur.invoice_number || `PUR-${pur.id}`}</p>
                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{pur.supplier_name || 'مورد عام'}</p>
                                </td>
                                <td className="p-4 text-xs font-bold text-slate-400" dir="ltr">{safeFormatDate(pur.date || pur.created_at)}</td>
                                <td className="p-4 font-black text-orange-600 text-base">{Number(pur.total_cost || pur.amount || 0).toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span></td>
                                <td className="p-4 font-bold text-slate-600 text-xs">
                                    <span className="text-emerald-500 block">مدفوع: {Number(pur.paid_amount || pur.total_cost || 0).toLocaleString()}</span>
                                    {Number(pur.remaining_amount || 0) > 0 && <span className="text-rose-500 block mt-0.5">متبقي: {Number(pur.remaining_amount).toLocaleString()}</span>}
                                </td>
                                <td className="p-4 text-center">
                                    <button className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-300 flex items-center justify-center mx-auto shadow-sm cursor-not-allowed" title="يمكن تعديلها من شاشة المشتريات"><i className="fa-solid fa-lock text-xs"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><div className="w-16 h-16 bg-orange-50 text-orange-200 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-truck-ramp-box text-2xl"></i></div>لا توجد فواتير مشتريات مسجلة.</td></tr>)}

                        {activeTab === 'expenses' && (listData?.length > 0 ? listData.map((exp) => (
                            <tr key={exp.id} className="hover:bg-rose-50/20 transition-colors group">
                                <td className="p-4 font-black text-slate-700"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"><i className="fa-solid fa-tag text-slate-400 mr-1 text-[10px]"></i> {getExpenseTypeName(exp.expense_type)}</span></td>
                                <td className="p-4 font-semibold text-slate-600 max-w-[200px] truncate" title={exp.description}>{exp.description || '-'}</td>
                                <td className="p-4 text-xs font-bold text-slate-400 text-center" dir="ltr">{safeFormatDate(exp.date || exp.expense_date)}</td>
                                <td className="p-4 font-black text-rose-600 text-base">{Number(exp.amount).toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span></td>
                                <td className="p-4 text-center">
                                    <button onClick={() => openEditExpense(exp)} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center justify-center mx-auto shadow-sm opacity-100 md:opacity-50 group-hover:opacity-100" title="تعديل المصروف"><i className="fa-solid fa-pen text-xs"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><div className="w-16 h-16 bg-rose-50 text-rose-200 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-receipt text-2xl"></i></div>لا توجد مصروفات مسجلة.</td></tr>)}
                    </tbody>
                </table>
            </div>

            {pagination.total > 0 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-500">صفحة {pagination.current_page} من {pagination.last_page} <span className="mr-2 px-2 py-0.5 bg-white rounded-md border border-slate-200">إجمالي: {pagination.total}</span></span>
                    <div className="flex gap-2">
                        <button onClick={() => fetchData(pagination.current_page + 1, searchText, activeTab, dateFrom, dateTo)} disabled={pagination.current_page === pagination.last_page || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                        <button onClick={() => fetchData(pagination.current_page - 1, searchText, activeTab, dateFrom, dateTo)} disabled={pagination.current_page === 1 || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};