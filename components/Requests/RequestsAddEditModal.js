// المسار: components/Requests/RequestsAddEditModal.js
window.RequestsAddEditModal = function({
    showModal, setShowModal, modalMode, formData, setFormData, handleFormSubmit,
    dropdownRef, customerSearchText, handleCustomerSearchChange, showCustomerDropdown,
    setShowCustomerDropdown, customerSearchResults, selectCustomer, isSearchingCustomers,
    deviceDropdownRef, deviceSearchText, handleDeviceSearchChange, formData_customer_id,
    customerDevices, showDeviceDropdown, setShowDeviceDropdown, deviceSearchResults,
    selectDevice, technicians, isUpdating
}) {
    const { useState, useEffect, useRef } = React;

    const [techSearchText, setTechSearchText] = useState('');
    const [showTechDropdown, setShowTechDropdown] = useState(false);
    const techDropdownRef = useRef(null);

    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    // تم التعديل هنا: استخدام individual بدلاً من فرد لتطابق شاشة العملاء
    const [newCustomer, setNewCustomer] = useState({ 
        name: '', phone: '', alt_phone: '', customer_type: 'individual', address: '' 
    });
    const [isSavingCustomer, setIsSavingCustomer] = useState(false);

    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ device_type: '', brand: '', model: '', serial_number: '' });
    const [isSavingDevice, setIsSavingDevice] = useState(false);
    
    const predefinedDeviceTypes = ['لاب توب', 'كمبيوتر (PC)', 'موبايل', 'شاشة', 'بلايستيشن / كونسول', 'طابعة', 'تابلت / آيباد'];
    const [showDeviceTypeDropdown, setShowDeviceTypeDropdown] = useState(false);
    const deviceTypeDropdownRef = useRef(null);

    const getFormattedDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (techDropdownRef.current && !techDropdownRef.current.contains(e.target)) setShowTechDropdown(false);
            if (deviceTypeDropdownRef.current && !deviceTypeDropdownRef.current.contains(e.target)) setShowDeviceTypeDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (formData.technician_id && technicians?.length > 0) {
            const tech = technicians.find(t => t.id == formData.technician_id);
            if (tech) setTechSearchText(tech.name);
        }
    }, [formData.technician_id, technicians]);

    const handleQuickAddCustomer = async (e) => {
        e.preventDefault();
        setIsSavingCustomer(true);
        try {
            const payload = { 
                name: newCustomer.name,
                phone: newCustomer.phone,
                alt_phone: newCustomer.alt_phone,
                customer_type: newCustomer.customer_type, 
                type: newCustomer.customer_type, 
                address: newCustomer.address,
                created_at: getFormattedDate() 
            };
            const newId = await window.db.customers.add(payload);
            selectCustomer({ id: newId, ...payload });
            setShowAddCustomerModal(false);
            // تم التعديل هنا أيضاً للعودة للقيمة الافتراضية الصحيحة
            setNewCustomer({ name: '', phone: '', alt_phone: '', customer_type: 'individual', address: '' });
        } catch (error) {
            alert("حدث خطأ! قد يكون رقم الهاتف مسجل لعميل آخر.");
        } finally { setIsSavingCustomer(false); }
    };

    const handleQuickAddDevice = async (e) => {
        e.preventDefault();
        if(!newDevice.device_type.trim()) { alert("يرجى كتابة أو اختيار نوع الجهاز"); return; }
        setIsSavingDevice(true);
        try {
            const payload = { ...newDevice, customer_id: formData.customer_id, created_at: getFormattedDate() };
            const newId = await window.db.devices.add(payload);
            selectDevice({ id: newId, ...payload });
            setShowAddDeviceModal(false);
            setNewDevice({ device_type: '', brand: '', model: '', serial_number: '' });
        } catch (error) {
            alert("حدث خطأ أثناء إضافة الجهاز.");
        } finally { setIsSavingDevice(false); }
    };

    if (!showModal) return null;

    const filteredTechnicians = technicians?.filter(t => t.name.toLowerCase().includes(techSearchText.toLowerCase())) || [];
    const filteredDeviceTypes = predefinedDeviceTypes.filter(type => type.toLowerCase().includes(newDevice.device_type.toLowerCase()));

    return (
        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-view relative">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white text-slate-500 hover:bg-slate-800 hover:text-white border border-slate-200 shadow-sm flex items-center justify-center transition-all group">
                        <i className="fa-solid fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
                    </button>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">
                            {modalMode === 'add' ? 'إضافة أمر شغل جديد' : `تعديل أمر الشغل #${formData.id}`}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                            {modalMode === 'add' ? 'قم بإدخال بيانات العميل والجهاز لفتح تيكت الصيانة.' : 'تحديث بيانات الصيانة والفني المسؤول.'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-8 relative">
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-user-tag text-[#06B6D4]"></i> بيانات الاستلام
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">العميل (بحث بالاسم أو الهاتف) <span className="text-rose-500">*</span></label>
                            <div className="flex gap-2">
                                <div className="relative flex-1" ref={dropdownRef}>
                                    <input 
                                        type="text" required 
                                        className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-500/20 pr-10 transition-all ${formData.customer_id ? 'border-emerald-500 bg-emerald-50/30' : ''}`}
                                        placeholder="اكتب للبحث عن العميل..." value={customerSearchText} onChange={handleCustomerSearchChange}
                                        onFocus={() => { if(customerSearchResults?.length > 0) setShowCustomerDropdown(true); }}
                                    />
                                    <i className={`fa-solid ${isSearchingCustomers ? 'fa-spinner fa-spin text-[#06B6D4]' : (formData.customer_id ? 'fa-check text-emerald-500' : 'fa-magnifying-glass text-slate-400')} absolute left-4 top-1/2 -translate-y-1/2`}></i>
                                    
                                    {showCustomerDropdown && (
                                        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                                            {customerSearchResults?.length > 0 ? (
                                                customerSearchResults.map(c => (
                                                    <li key={c.id} onMouseDown={() => selectCustomer(c)} className="p-3 hover:bg-cyan-50 cursor-pointer flex flex-col transition-colors text-right">
                                                        <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">{c.phone}</span>
                                                    </li>
                                                ))
                                            ) : <li className="p-4 text-center text-sm font-bold text-slate-400">لا توجد نتائج مطابقة</li>}
                                        </ul>
                                    )}
                                </div>
                                <button type="button" onClick={() => setShowAddCustomerModal(true)} className="w-12 shrink-0 bg-cyan-50 hover:bg-[#06B6D4] text-[#06B6D4] hover:text-white border border-cyan-200 rounded-xl shadow-sm flex items-center justify-center transition-all" title="إضافة عميل جديد">
                                    <i className="fa-solid fa-user-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">الجهاز المُستلم <span className="text-rose-500">*</span></label>
                            <div className="flex gap-2">
                                <div className="relative flex-1" ref={deviceDropdownRef}>
                                    <input 
                                        type="text" required disabled={!formData.customer_id}
                                        className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-500/20 pr-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formData.device_id ? 'border-emerald-500 bg-emerald-50/30' : ''}`}
                                        placeholder={formData.customer_id ? "اختر من أجهزة العميل..." : "الرجاء اختيار العميل أولاً"}
                                        value={deviceSearchText} onChange={handleDeviceSearchChange}
                                        onFocus={() => { if(formData.customer_id && customerDevices?.length > 0) setShowDeviceDropdown(true); }}
                                    />
                                    <i className={`fa-solid ${formData.device_id ? 'fa-check text-emerald-500' : 'fa-laptop text-slate-400'} absolute left-4 top-1/2 -translate-y-1/2`}></i>
                                    
                                    {showDeviceDropdown && formData.customer_id && (
                                        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                                            {deviceSearchResults?.length > 0 ? (
                                                deviceSearchResults.map(d => (
                                                    <li key={d.id} onMouseDown={() => selectDevice(d)} className="p-3 hover:bg-cyan-50 cursor-pointer flex flex-col transition-colors text-right">
                                                        <span className="font-bold text-slate-800 text-sm">{d.device_type}</span>
                                                        {d.brand && <span className="text-[10px] text-slate-400 font-bold">{d.brand} {d.model}</span>}
                                                    </li>
                                                ))
                                            ) : <li className="p-4 text-center text-sm font-bold text-slate-400">لا توجد أجهزة للعميل</li>}
                                        </ul>
                                    )}
                                </div>
                                <button type="button" disabled={!formData.customer_id} onClick={() => setShowAddDeviceModal(true)} className="w-12 shrink-0 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-200 rounded-xl shadow-sm flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="إضافة جهاز جديد للعميل">
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">نوع الصيانة <span className="text-rose-500">*</span></label>
                        <select required className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                            value={formData.maintenance_type} onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}>
                            <option value="داخلي">صيانة داخلية (في المركز)</option>
                            <option value="خارجي">صيانة خارجية (عند العميل)</option>
                        </select>
                    </div>
                    
                    <div className="relative" ref={techDropdownRef}>
                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">الفني المسؤول (اختياري)</label>
                        <div className="relative">
                            <input 
                                type="text"
                                className={`w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] pr-10 transition-all ${formData.technician_id ? 'border-[#06B6D4] bg-cyan-50/20' : ''}`}
                                placeholder="ابحث باسم الفني..." 
                                value={techSearchText} 
                                onChange={(e) => {
                                    setTechSearchText(e.target.value);
                                    if(formData.technician_id) setFormData({...formData, technician_id: ''}); 
                                    setShowTechDropdown(true);
                                }}
                                onFocus={() => setShowTechDropdown(true)}
                            />
                            <i className={`fa-solid ${formData.technician_id ? 'fa-user-check text-[#06B6D4]' : 'fa-user-gear text-slate-400'} absolute left-4 top-1/2 -translate-y-1/2`}></i>
                        </div>

                        {showTechDropdown && (
                            <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                                <li onMouseDown={() => { setTechSearchText(''); setFormData({...formData, technician_id: ''}); setShowTechDropdown(false); }} className="p-3 hover:bg-rose-50 cursor-pointer flex items-center gap-2 text-rose-600 font-bold text-sm transition-colors text-right">
                                    <i className="fa-solid fa-xmark"></i> بدون تحديد فني
                                </li>
                                {filteredTechnicians.length > 0 ? (
                                    filteredTechnicians.map(t => (
                                        <li key={t.id} onMouseDown={() => { setTechSearchText(t.name); setFormData({...formData, technician_id: t.id}); setShowTechDropdown(false); }} className="p-3 hover:bg-cyan-50 cursor-pointer flex items-center gap-2 transition-colors text-right">
                                            <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-black">{t.name.charAt(0)}</div>
                                            <span className="font-bold text-slate-800 text-sm">{t.name}</span>
                                        </li>
                                    ))
                                ) : <li className="p-4 text-center text-sm font-bold text-slate-400">لا يوجد فني بهذا الاسم</li>}
                            </ul>
                        )}
                    </div>
                    
                    {modalMode === 'edit' && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">تغيير حالة الصيانة <span className="text-rose-500">*</span></label>
                            <select required className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5 text-sm font-black text-blue-700 focus:outline-none focus:border-blue-500 appearance-none"
                                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                <option value="قيد الفحص">قيد الفحص</option>
                                <option value="جاري العمل">جاري العمل</option>
                                <option value="بانتظار قطع غيار">بانتظار قطع غيار</option>
                                <option value="تم الإصلاح">تم الإصلاح</option>
                                <option value="تم التسليم">تم التسليم (سُيصدر أو يحدّث الفاتورة)</option>
                                <option value="مرفوض / لا يمكن إصلاحه">مرفوض / لا يمكن إصلاحه</option>
                            </select>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1">
                                <i className="fa-solid fa-circle-info text-blue-500"></i> ملاحظة: عند تغيير الحالة إلى (تم التسليم) سيتم إنشاء فاتورة أو تحديث الفاتورة الحالية تلقائياً.
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">وصف العطل / شكوى العميل بالتفصيل <span className="text-rose-500">*</span></label>
                    <textarea required rows="4" className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] transition-colors resize-none" placeholder="اكتب تفاصيل العطل والملاحظات هنا..."
                        value={formData.issue_description} onChange={(e) => setFormData({...formData, issue_description: e.target.value})}></textarea>
                </div>

                <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100">
                    <label className="block text-xs font-bold text-cyan-800 mb-2 ml-1">مصنعية الصيانة المبدئية (بدون قطع الغيار)</label>
                    <div className="relative md:w-1/2">
                        <input type="number" min="0" className="w-full bg-white border border-cyan-200 rounded-xl px-4 py-3.5 text-lg font-black text-cyan-700 focus:outline-none focus:border-[#06B6D4]" placeholder="0"
                            value={formData.estimated_cost} onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})} />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 font-bold text-xs bg-cyan-50 px-2 py-1 rounded">ج.م</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-3">
                    <button type="submit" disabled={isUpdating} className="flex-1 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-[0_10px_20px_-10px_rgba(6,182,212,0.5)] active:scale-95 text-base">
                        {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                        {modalMode === 'add' ? 'إنشاء وفتح أمر الشغل' : 'حفظ التعديلات'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-black transition-all active:scale-95 text-sm py-4 md:py-0">
                        إلغاء والعودة
                    </button>
                </div>
            </form>

            {showAddCustomerModal && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 backdrop-blur-sm bg-slate-900/60">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-view">
                        
                        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                            <button type="button" onClick={() => setShowAddCustomerModal(false)} className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                إضافة عميل جديد <i className="fa-solid fa-user-plus text-[#06B6D4]"></i>
                            </h3>
                        </div>

                        <form onSubmit={handleQuickAddCustomer} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 text-right">اسم العميل <span className="text-rose-500">*</span></label>
                                <input type="text" required placeholder="الاسم ثلاثي أو اسم الشركة" 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] text-right" 
                                    value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 text-right">رقم هاتف بديل</label>
                                    <input type="tel" dir="ltr" placeholder="اختياري" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] text-left placeholder:text-right" 
                                        value={newCustomer.alt_phone} onChange={(e) => setNewCustomer({...newCustomer, alt_phone: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 text-right">رقم الهاتف <span className="text-rose-500">*</span></label>
                                    <input type="tel" required dir="ltr" placeholder="01X..." 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] text-left placeholder:text-right" 
                                        value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 text-right">نوع العميل <span className="text-rose-500">*</span></label>
                                <div className="flex gap-3 flex-row-reverse">
                                    {/* التعديل هنا ليتوافق مع individual و company */}
                                    <button 
                                        type="button" 
                                        onClick={() => setNewCustomer({...newCustomer, customer_type: 'individual'})} 
                                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${newCustomer.customer_type === 'individual' ? 'border-[#06B6D4] text-[#06B6D4] bg-cyan-50/50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        فرد (شخصي) <i className="fa-solid fa-user"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setNewCustomer({...newCustomer, customer_type: 'company'})} 
                                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${newCustomer.customer_type === 'company' ? 'border-[#06B6D4] text-[#06B6D4] bg-cyan-50/50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        شركة / مؤسسة <i className="fa-solid fa-building"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 text-right">العنوان</label>
                                <textarea rows="2" placeholder="اكتب العنوان بالتفصيل..." 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4] text-right resize-none" 
                                    value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddCustomerModal(false)} className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors text-sm">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={isSavingCustomer} className="flex-1 bg-[#3B82F6] hover:bg-blue-600 text-white py-3.5 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                    {isSavingCustomer ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} حفظ العميل
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {showAddDeviceModal && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 backdrop-blur-sm bg-slate-900/60">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-view">
                        
                        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                            <button type="button" onClick={() => setShowAddDeviceModal(false)} className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                إضافة جهاز جديد <i className="fa-solid fa-laptop text-blue-500"></i>
                            </h3>
                        </div>

                        <form onSubmit={handleQuickAddDevice} className="p-6 space-y-5 relative overflow-visible">
                            
                            <div className="relative" ref={deviceTypeDropdownRef}>
                                <label className="block text-xs font-bold text-slate-700 mb-2 text-right">نوع الجهاز <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input 
                                        type="text" required 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors" 
                                        placeholder="اكتب نوع الجهاز أو اختر..."
                                        value={newDevice.device_type} 
                                        onChange={(e) => {
                                            setNewDevice({...newDevice, device_type: e.target.value});
                                            setShowDeviceTypeDropdown(true);
                                        }}
                                        onFocus={() => setShowDeviceTypeDropdown(true)}
                                    />
                                    <i className="fa-solid fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                                </div>
                                
                                {showDeviceTypeDropdown && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100">
                                        {filteredDeviceTypes.length > 0 ? (
                                            filteredDeviceTypes.map(type => (
                                                <li key={type} onMouseDown={() => { setNewDevice({...newDevice, device_type: type}); setShowDeviceTypeDropdown(false); }} className="p-3 hover:bg-blue-50 cursor-pointer font-bold text-slate-700 text-sm text-right transition-colors">
                                                    {type}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-3 text-right">
                                                <span className="text-xs text-slate-500 block mb-1">غير موجود بالقائمة.. سيتم حفظه كنوع جديد:</span>
                                                <span className="font-black text-blue-600 text-sm"><i className="fa-solid fa-plus mr-1 text-[10px]"></i> {newDevice.device_type}</span>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 text-right">الماركة (Brand)</label>
                                    <input type="text" placeholder="مثال: HP, Samsung" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500" 
                                        value={newDevice.brand} onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 text-right">الموديل (Model)</label>
                                    <input type="text" placeholder="اختياري" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500" 
                                        value={newDevice.model} onChange={(e) => setNewDevice({...newDevice, model: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddDeviceModal(false)} className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors text-sm">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={isSavingDevice} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                    {isSavingDevice ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plus"></i>} إضافة الجهاز للطلب
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            
        </div>
    );
};