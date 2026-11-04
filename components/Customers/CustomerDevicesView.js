// المسار: components/Customers/CustomerDevicesView.js
window.CustomerDevicesView = function({ 
    selectedCustomer, goBack, deviceFormData, setDeviceFormData, 
    handleDeviceSubmit, isUpdating, customerDevices, onViewVisits, openEditDeviceModal
}) {
    const { useState } = React;
    const [page, setPage] = useState(1);
    const [deviceSearch, setDeviceSearch] = useState('');
    const limit = 4;

    // فلترة الأجهزة بناءً على البحث
    const filteredDevices = customerDevices.filter(d => {
        const query = deviceSearch.toLowerCase();
        return (d.device_type && d.device_type.toLowerCase().includes(query)) ||
               (d.brand && d.brand.toLowerCase().includes(query)) ||
               (d.model && d.model.toLowerCase().includes(query)) ||
               (d.serial_number && d.serial_number.toLowerCase().includes(query));
    });

    const totalPages = Math.ceil(filteredDevices.length / limit) || 1;
    const paginatedDevices = filteredDevices.slice((page - 1) * limit, page * limit);

    return (
        <div className="animate-view">
            {/* هيدر الشاشة الداخلية */}
            <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={goBack} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 flex items-center justify-center transition-all shadow-sm">
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <i className="fa-solid fa-laptop-medical text-cyan-500"></i> أجهزة: {selectedCustomer.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-bold">{selectedCustomer.phone}</p>
                    </div>
                </div>
                <div className="bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-lg text-xs font-black border border-cyan-100">
                    {customerDevices.length} جهاز مسجل
                </div>
            </div>

            {/* تم إضافة items-start هنا لمنع تحرك العناصر عند البحث */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* عمود إضافة جهاز (ثابت بالأعلى) */}
                <div className="w-full lg:w-4/12 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-4">
                    <h4 className="font-black text-slate-700 mb-5 text-sm flex items-center gap-2"><i className="fa-solid fa-plus-circle text-cyan-500 text-lg"></i> إضافة جهاز جديد</h4>
                    <form onSubmit={(e) => { handleDeviceSubmit(e); setPage(1); setDeviceSearch(''); }} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الجهاز <span className="text-rose-500">*</span></label>
                            <input type="text" required placeholder="مثال: ثلاجة، شاشة، لاب توب..." className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all" value={deviceFormData.device_type} onChange={(e) => setDeviceFormData({...deviceFormData, device_type: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">الماركة</label>
                                <input type="text" placeholder="مثال: LG" className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all" value={deviceFormData.brand} onChange={(e) => setDeviceFormData({...deviceFormData, brand: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">الموديل</label>
                                <input type="text" placeholder="رقم الموديل" className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all" value={deviceFormData.model} onChange={(e) => setDeviceFormData({...deviceFormData, model: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الرقم التسلسلي (S/N)</label>
                            <input type="text" placeholder="Serial Number" className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all text-left" dir="ltr" value={deviceFormData.serial_number} onChange={(e) => setDeviceFormData({...deviceFormData, serial_number: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الضمان</label>
                            <select className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all" value={deviceFormData.warranty_status} onChange={(e) => setDeviceFormData({...deviceFormData, warranty_status: e.target.value})}>
                                <option value="out_of_warranty">خارج الضمان</option>
                                <option value="in_warranty">داخل الضمان (ساري)</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isUpdating} className="w-full bg-gradient-to-l from-cyan-500 to-blue-500 hover:opacity-90 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 mt-2 text-sm disabled:opacity-50 shadow-md">
                            {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} حفظ الجهاز
                        </button>
                    </form>
                </div>

                {/* عمود الأجهزة المسجلة */}
                {/* تمت إزالة justify-between لحل مشكلة التمدد */}
                <div className="w-full lg:w-8/12 flex flex-col gap-4">
                    
                    {/* شريط البحث عن جهاز */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="ابحث في أجهزة العميل (النوع، الماركة، الموديل، S/N)..." 
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-cyan-500 transition-all font-bold shadow-sm"
                            value={deviceSearch}
                            onChange={(e) => { setDeviceSearch(e.target.value); setPage(1); }}
                        />
                        <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {paginatedDevices?.length > 0 ? paginatedDevices.map((device) => (
                            <div key={device.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-cyan-200 transition-all group flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors">
                                            <i className="fa-solid fa-laptop text-base"></i>
                                        </div>
                                        <div>
                                            <h5 className="font-black text-slate-800 text-sm leading-tight">{device.device_type}</h5>
                                            {device.brand && <p className="text-cyan-600 font-bold text-[11px]">{device.brand}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {device.warranty_status === 'in_warranty' && (
                                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                                                <i className="fa-solid fa-shield-check"></i> ضمان
                                            </span>
                                        )}
                                        <button onClick={() => openEditDeviceModal(device)} className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm" title="تعديل بيانات الجهاز">
                                            <i className="fa-solid fa-pen text-[10px]"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-slate-50/70 rounded-xl p-2.5 space-y-1 mb-3 text-[11px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 font-bold">الموديل:</span>
                                        <span className="text-slate-700 font-black">{device.model || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 font-bold">S/N:</span>
                                        <span className="text-slate-700 font-black font-mono" dir="ltr">{device.serial_number || '-'}</span>
                                    </div>
                                </div>
                                <button onClick={() => onViewVisits(device)} className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-auto">
                                    <i className="fa-solid fa-clock-rotate-left"></i> سجل الصيانة (الزيارات)
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[250px]">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3"><i className="fa-solid fa-box-open text-2xl text-slate-300"></i></div>
                                <p className="text-slate-500 font-bold text-sm">لا توجد أجهزة مطابقة للبحث</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">صفحة {page} من {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 disabled:opacity-50 transition-all shadow-sm"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};