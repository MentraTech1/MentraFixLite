// المسار: components/Customers/CustomersTable.js
window.CustomersTable = function({ customers, isLoading, isUpdating, pagination, fetchCustomers, searchQuery, onViewDevices, openEditModal }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative animate-view" style={{ animationDelay: '0.2s' }}>
            {(isLoading || isUpdating) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            )}

            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-4 whitespace-nowrap">بيانات العميل</th>
                            <th className="p-4 whitespace-nowrap">النوع</th>
                            <th className="p-4 whitespace-nowrap">أرقام التواصل</th>
                            <th className="p-4 whitespace-nowrap">الأجهزة</th>
                            <th className="p-4 whitespace-nowrap">تاريخ التسجيل</th>
                            <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {customers?.length > 0 ? customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4">
                                    <p className="font-bold text-slate-800">{customer.name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1 max-w-[200px] truncate" title={customer.address}><i className="fa-solid fa-location-dot"></i> {customer.address || 'بدون عنوان'}</p>
                                </td>
                                <td className="p-4">
                                    {customer.customer_type === 'individual' 
                                        ? <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"><i className="fa-solid fa-user ml-1"></i> فرد</span>
                                        : <span className="text-[11px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100"><i className="fa-solid fa-building ml-1"></i> شركة</span>
                                    }
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-slate-700" dir="ltr">{customer.phone}</p>
                                    {customer.alt_phone && <p className="text-[11px] font-bold text-slate-400 mt-0.5" dir="ltr">{customer.alt_phone}</p>}
                                </td>
                                <td className="p-4">
                                    <button onClick={() => onViewDevices(customer)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all font-bold text-xs border border-cyan-100 hover:border-cyan-600 shadow-sm">
                                        <i className="fa-solid fa-laptop-medical"></i> 
                                        <span>عرض ({customer.devices_count || 0})</span>
                                    </button>
                                </td>
                                <td className="p-4 text-[11px] font-bold text-slate-400" dir="ltr">{customer.created_at}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => openEditModal(customer)} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all flex items-center justify-center mx-auto" title="تعديل">
                                        <i className="fa-solid fa-pen text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-users-slash text-2xl"></i></div>لا يوجد عملاء يطابقون البحث الحالي.</td></tr>}
                    </tbody>
                </table>
            </div>

            {pagination.total > 0 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-500">صفحة {pagination.current_page} من {pagination.last_page} <span className="mr-2 px-2 py-0.5 bg-white rounded-md border border-slate-200">إجمالي: {pagination.total}</span></span>
                    <div className="flex gap-2">
                        <button onClick={() => fetchCustomers(pagination.current_page + 1, searchQuery)} disabled={pagination.current_page === pagination.last_page || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                        <button onClick={() => fetchCustomers(pagination.current_page - 1, searchQuery)} disabled={pagination.current_page === 1 || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};