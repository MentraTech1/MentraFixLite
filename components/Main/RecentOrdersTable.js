// المسار: components/Main/RecentOrdersTable.js
window.MainRecentOrdersTable = function({ recentOrders, pagination, isLoading, fetchDashboardData }) {
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchDashboardData(newPage);
        }
    };

    const safeFormatDate = (dateString) => {
        if (!dateString) return '-';
        try { return String(dateString).split('T')[0].split(' ')[0]; } 
        catch (e) { return '-'; }
    };

    const getStatusStyle = (status) => {
        const cleanStatus = status ? status.trim() : '';
        const styles = {
            'قيد الانتظار': { color: 'bg-slate-100 text-slate-700', icon: 'fa-clock' },
            'جاري الفحص': { color: 'bg-blue-100 text-blue-700', icon: 'fa-magnifying-glass' },
            'بانتظار موافقة العميل': { color: 'bg-yellow-100 text-yellow-700', icon: 'fa-phone-volume' },
            'جاري الصيانة': { color: 'bg-cyan-100 text-cyan-700', icon: 'fa-screwdriver-wrench' },
            'بانتظار قطع غيار': { color: 'bg-orange-100 text-orange-700', icon: 'fa-box-open' },
            'مكتمل': { color: 'bg-emerald-100 text-emerald-700', icon: 'fa-check-double' },
            'تم التسليم': { color: 'bg-purple-100 text-purple-700', icon: 'fa-handshake' },
            'ملغاة': { color: 'bg-rose-100 text-rose-700', icon: 'fa-ban' }
        };
        const st = styles[cleanStatus] || { color: 'bg-slate-100 text-slate-700', icon: 'fa-circle' };
        return { ...st, text: cleanStatus || 'غير محدد' };
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-view" style={{ animationDelay: '0.2s' }}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600"><i className="fa-solid fa-clock-rotate-left"></i></div>
                    أحدث أوامر الشغل
                </h3>
                <button onClick={() => fetchDashboardData(pagination.current_page)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-colors shadow-sm flex items-center justify-center" title="تحديث البيانات">
                    <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
                </button>
            </div>
            
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-right text-sm min-w-[800px]">
                    <thead className="bg-white border-b border-slate-100 text-slate-500 font-bold text-xs">
                        <tr>
                            <th className="p-4 whitespace-nowrap">رقم الطلب</th>
                            <th className="p-4 whitespace-nowrap">اسم العميل</th>
                            <th className="p-4 whitespace-nowrap">نوع الجهاز</th>
                            <th className="p-4 whitespace-nowrap text-center">حالة الصيانة</th>
                            <th className="p-4 whitespace-nowrap text-left">تاريخ الاستلام</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {recentOrders.length > 0 ? recentOrders.map((order) => {
                            const statusUI = getStatusStyle(order.status);
                            return (
                                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-black text-slate-700 tracking-wider font-mono">#{String(order.id).padStart(4, '0')}</td>
                                    <td className="p-4 font-bold text-slate-800">{order.customer_name}</td>
                                    <td className="p-4 font-bold text-slate-600">{order.device_type}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-max mx-auto shadow-sm border border-slate-100/50 ${statusUI.color}`}>
                                            <i className={`fa-solid ${statusUI.icon}`}></i> {statusUI.text}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-slate-400 text-xs text-left" dir="ltr">
                                        {safeFormatDate(order.receipt_date || order.created_at)}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-folder-open text-2xl"></i></div>
                                    لا توجد أوامر شغل مسجلة في المركز حتى الآن.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination.last_page > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-500">
                        صفحة {pagination.current_page} من {pagination.last_page}
                    </span>
                    
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm">
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                        <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1 || isLoading} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm">
                            <i className="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};