// المسار: components/Customers/DeviceVisitsView.js
window.DeviceVisitsView = function({ 
    selectedDevice, selectedCustomer, deviceVisits, goBack, isLoading, isUpdating,
    handleStatusChange, openPartsModal, openEditRequestModal, openAddRequestModal,
    handlePrintInvoice // <- دالة الطباعة الجديدة
}) {
    const { useState } = React;
    const [page, setPage] = useState(1);
    const limit = 3;

    const totalPages = Math.ceil(deviceVisits.length / limit) || 1;
    const paginatedVisits = deviceVisits.slice((page - 1) * limit, page * limit);

    const getStatusStyle = (status) => {
        const styles = {
            'قيد الفحص': { color: 'bg-yellow-100 text-yellow-700', icon: 'fa-clock' },
            'جاري العمل': { color: 'bg-blue-100 text-blue-700', icon: 'fa-spinner fa-spin' },
            'بانتظار قطع غيار': { color: 'bg-orange-100 text-orange-700', icon: 'fa-pause' },
            'تم الإصلاح': { color: 'bg-emerald-100 text-emerald-700', icon: 'fa-check-double' },
            'تم التسليم': { color: 'bg-purple-100 text-purple-700', icon: 'fa-handshake' },
            'مرفوض / لا يمكن إصلاحه': { color: 'bg-rose-100 text-rose-700', icon: 'fa-ban' }
        };
        return styles[status] || { color: 'bg-slate-100 text-slate-700', icon: 'fa-circle' };
    };

    const safeFormatDate = (dateString) => {
        if (!dateString) return '-';
        try { return String(dateString).split('T')[0]; } 
        catch (e) { return '-'; }
    };

    return (
        <div className="animate-view">
            <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={goBack} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 flex items-center justify-center transition-all shadow-sm shrink-0">
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left text-cyan-500"></i> سجل صيانة: {selectedDevice.device_type} {selectedDevice.brand}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-bold">العميل: {selectedCustomer.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="bg-purple-50 text-purple-600 px-3 py-2 rounded-xl text-xs font-black border border-purple-100 flex items-center justify-center flex-1 sm:flex-none">
                        {deviceVisits.length} زيارات
                    </div>
                    <button onClick={openAddRequestModal} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none">
                        <i className="fa-solid fa-plus"></i> زيارة جديدة
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                {(isLoading || isUpdating) && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                                <th className="p-4 whitespace-nowrap">رقم الطلب</th>
                                <th className="p-4 whitespace-nowrap">التاريخ</th>
                                <th className="p-4 whitespace-nowrap">الشكوى / العطل</th>
                                <th className="p-4 whitespace-nowrap text-center">الحالة</th>
                                <th className="p-4 whitespace-nowrap text-center">إجراءات (تحكم كامل)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedVisits.length > 0 ? paginatedVisits.map((visit) => {
                                const status = getStatusStyle(visit.status);
                                return (
                                    <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-black text-slate-700">#{visit.id}</td>
                                        <td className="p-4 text-xs font-bold text-slate-500" dir="ltr">{safeFormatDate(visit.created_at)}</td>
                                        <td className="p-4 font-bold text-slate-800 max-w-[250px] truncate" title={visit.issue_description}>{visit.issue_description}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-max mx-auto shadow-sm border border-slate-100/50 ${status.color}`}>
                                                <i className={`fa-solid ${status.icon}`}></i> {visit.status}
                                            </span>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                
                                                {/* زر الطباعة الجديد */}
                                                <button onClick={() => handlePrintInvoice(visit)} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center" title="طباعة الفاتورة">
                                                    <i className="fa-solid fa-print text-xs"></i>
                                                </button>

                                                {visit.status !== 'مرفوض / لا يمكن إصلاحه' && (
                                                    <button onClick={() => openPartsModal(visit)} disabled={isUpdating} className={`w-8 h-8 rounded-lg transition-colors border shadow-sm disabled:opacity-50 flex items-center justify-center ${visit.status === 'تم التسليم' ? 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700' : 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-600 hover:text-white'}`} title={visit.status === 'تم التسليم' ? "تعديل قطع الغيار لطلب مُسلم (سيُحدث الفاتورة)" : "صرف قطع غيار"}>
                                                        <i className="fa-solid fa-boxes-stacked text-xs"></i>
                                                    </button>
                                                )}

                                                {visit.status === 'قيد الفحص' && <button onClick={() => handleStatusChange(visit.id, 'جاري العمل')} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center" title="البدء في العمل"><i className="fa-solid fa-play text-xs"></i></button>}
                                                {visit.status === 'جاري العمل' && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(visit.id, 'بانتظار قطع غيار')} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center" title="تعليق العمل"><i className="fa-solid fa-pause text-xs"></i></button>
                                                        <button onClick={() => handleStatusChange(visit.id, 'تم الإصلاح')} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center" title="إنهاء الصيانة"><i className="fa-solid fa-check text-xs"></i></button>
                                                    </>
                                                )}
                                                {visit.status === 'بانتظار قطع غيار' && <button onClick={() => handleStatusChange(visit.id, 'جاري العمل')} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center" title="استئناف العمل"><i className="fa-solid fa-play text-xs"></i></button>}
                                                {visit.status === 'تم الإصلاح' && <button onClick={() => handleStatusChange(visit.id, 'تم التسليم')} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center" title="تسليم الجهاز للعميل وإصدار فاتورة"><i className="fa-solid fa-handshake text-xs"></i></button>}

                                                <button onClick={() => openEditRequestModal(visit)} disabled={isUpdating} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center" title="تعديل تفاصيل الزيارة">
                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-file-circle-xmark text-2xl"></i></div>لم يدخل هذا الجهاز للصيانة من قبل.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[11px] font-bold text-slate-500">صفحة {page} من {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || isUpdating} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1 || isUpdating} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};