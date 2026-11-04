// المسار: components/Requests/RequestsTable.js
window.RequestsTable = function({ 
    orders, isLoading, isUpdating, showModal, showPartsModal, 
    openPartsModal, handleStatusChange, openEditModal, 
    pagination, fetchOrders, activeTab, searchQuery 
}) {
    const getStatusStyle = (status) => {
        const styles = {
            'قيد الفحص': { color: 'bg-yellow-100 text-yellow-700', text: 'قيد الفحص', icon: 'fa-clock' },
            'جاري العمل': { color: 'bg-blue-100 text-blue-700', text: 'جاري العمل', icon: 'fa-spinner fa-spin' },
            'بانتظار قطع غيار': { color: 'bg-orange-100 text-orange-700', text: 'بانتظار قطع', icon: 'fa-pause' },
            'تم الإصلاح': { color: 'bg-emerald-100 text-emerald-700', text: 'تم الإصلاح', icon: 'fa-check-double' },
            'تم التسليم': { color: 'bg-purple-100 text-purple-700', text: 'تم التسليم', icon: 'fa-handshake' },
            'مرفوض / لا يمكن إصلاحه': { color: 'bg-rose-100 text-rose-700', text: 'مرفوض', icon: 'fa-ban' }
        };
        return styles[status] || { color: 'bg-slate-100 text-slate-700', text: status, icon: 'fa-circle' };
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative animate-view" style={{ animationDelay: '0.2s' }}>
            {(isLoading || isUpdating) && !showModal && !showPartsModal && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin text-4xl text-[#06B6D4]"></i>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-4 whitespace-nowrap">رقم الطلب</th>
                            <th className="p-4 whitespace-nowrap">العميل / الجهاز</th>
                            <th className="p-4 whitespace-nowrap">العطل</th>
                            <th className="p-4 whitespace-nowrap">النوع</th>
                            <th className="p-4 whitespace-nowrap">الفني المسؤول</th>
                            <th className="p-4 whitespace-nowrap">الحالة</th>
                            <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders?.length > 0 ? orders.map((order) => {
                            const status = getStatusStyle(order.status);
                            return (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-black text-slate-700">#{order.id}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{order.customer_name}</p>
                                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{order.device_type} {order.brand ? `(${order.brand})` : ''}</p>
                                    </td>
                                    <td className="p-4"><p className="font-semibold text-slate-600 w-48 truncate" title={order.issue_description}>{order.issue_description || 'لم يتم تسجيل وصف'}</p></td>
                                    <td className="p-4">
                                        {order.maintenance_type === 'داخلي' 
                                            ? <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md"><i className="fa-solid fa-shop"></i> داخلي</span>
                                            : <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md"><i className="fa-solid fa-truck-fast"></i> خارجي</span>
                                        }
                                    </td>
                                    <td className="p-4 font-bold text-slate-700">
                                        {order.technician_name ? <span className="flex items-center gap-1.5 text-xs"><i className="fa-solid fa-user-gear text-slate-400"></i> {order.technician_name}</span> : <span className="text-slate-400 text-[10px] bg-slate-50 px-2 py-1 border border-slate-100 rounded">لم يُحدد</span>}
                                    </td>
                                    <td className="p-4"><span className={`px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-max border ${status.color.replace('text', 'border').replace('100', '200')} ${status.color}`}><i className={`fa-solid ${status.icon}`}></i> {status.text}</span></td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {order.status !== 'مرفوض / لا يمكن إصلاحه' && (
                                                <button onClick={() => openPartsModal(order)} className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors border border-purple-100 shadow-sm" title="سحب قطع غيار من المخزن / تعديل القطع">
                                                    <i className="fa-solid fa-boxes-stacked text-xs"></i>
                                                </button>
                                            )}
                                            {order.status === 'قيد الفحص' && <button onClick={() => handleStatusChange(order.id, 'جاري العمل')} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="البدء في العمل"><i className="fa-solid fa-play text-xs"></i></button>}
                                            {order.status === 'جاري العمل' && (
                                                <>
                                                    <button onClick={() => handleStatusChange(order.id, 'بانتظار قطع غيار')} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors" title="تعليق العمل - بانتظار قطع غيار"><i className="fa-solid fa-pause text-xs"></i></button>
                                                    <button onClick={() => handleStatusChange(order.id, 'تم الإصلاح')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors" title="إنهاء الصيانة"><i className="fa-solid fa-check text-xs"></i></button>
                                                </>
                                            )}
                                            {order.status === 'بانتظار قطع غيار' && <button onClick={() => handleStatusChange(order.id, 'جاري العمل')} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="استئناف العمل"><i className="fa-solid fa-play text-xs"></i></button>}
                                            {order.status === 'تم الإصلاح' && <button onClick={() => handleStatusChange(order.id, 'تم التسليم')} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors" title="تسليم الجهاز للعميل وإصدار فاتورة"><i className="fa-solid fa-handshake text-xs"></i></button>}
                                            <button onClick={() => openEditModal(order)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors shadow-sm" title="تعديل البيانات"><i className="fa-solid fa-pen text-xs"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : <tr><td colSpan="7" className="p-10 text-center text-slate-400 font-bold">لا توجد أوامر شغل مطابقة.</td></tr>}
                    </tbody>
                </table>
            </div>

            {pagination.total_records > 0 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[10px] font-bold text-slate-500">صفحة {pagination.current_page} من {pagination.last_page} (إجمالي: {pagination.total_records})</span>
                    <div className="flex gap-2">
                        <button onClick={() => fetchOrders(pagination.current_page + 1, activeTab, searchQuery)} disabled={pagination.current_page === pagination.last_page || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                        <button onClick={() => fetchOrders(pagination.current_page - 1, activeTab, searchQuery)} disabled={pagination.current_page === 1 || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};