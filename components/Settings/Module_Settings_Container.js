// المسار: components/Settings/Module_Settings_Container.js

window.Module_Settings_Container = function({ centerId, userId, showToast }) {
    const { useState, useEffect } = React;
    
    // سحب المكونات من window بأمان
    const SettingsHeader = window.SettingsHeader;
    const SettingsStaffTab = window.SettingsStaffTab;
    const SettingsCenterTab = window.SettingsCenterTab;
    const SettingsSecurityTab = window.SettingsSecurityTab;
    const SettingsImportTab = window.SettingsImportTab; // <-- المكون الجديد
    const SettingsProBanner = window.SettingsProBanner;
    const SettingsStaffModal = window.SettingsStaffModal;

    const [activeTab, setActiveTab] = useState('staff'); 
    const [isLoading, setIsLoading] = useState(true);
    const [staff, setStaff] = useState([]);
    const [centerInfo, setCenterInfo] = useState(null);

    // حالة مفتاح الأمان
    const [securityKey, setSecurityKey] = useState('');
    const [isSavingKey, setIsSavingKey] = useState(false);

    const [isEditingCenter, setIsEditingCenter] = useState(false);
    const [centerFormData, setCenterFormData] = useState({ centerName: '', ownerName: '', phone: '' });

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState(null); 
    const [formData, setFormData] = useState({ name: '', phone: '', password: '', role: 'technician' });

    const roleDetails = {
        'admin': { name: 'مدير المركز', color: 'bg-purple-50 text-purple-600 border-purple-200' },
        'technician': { name: 'مهندس / فني', color: 'bg-blue-50 text-blue-600 border-blue-200' },
        'reception': { name: 'موظف استقبال', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
    };

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const fetchSettingsData = async () => {
        setIsLoading(true);
        try {
            if (window.db && window.db.users) {
                const usersList = await window.db.users.reverse().toArray();
                setStaff(usersList);

                const currentUser = await window.db.users.get(parseInt(userId));
                if (currentUser && currentUser.security_key) {
                    setSecurityKey(currentUser.security_key);
                }
            }

            if (window.masterDb && window.masterDb.centers) {
                const center = await window.masterDb.centers.get(parseInt(centerId));
                if (center) {
                    setCenterInfo(center);
                    setCenterFormData({ centerName: center.centerName, ownerName: center.ownerName, phone: center.phone });
                }
            }
        } catch (error) { 
            console.error("fetchSettingsData error:", error);
            showToast("حدث خطأ أثناء تحميل بيانات الإعدادات", "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { fetchSettingsData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const handleSaveSecurityKey = async (e) => {
        e.preventDefault();
        const trimmed = (securityKey || '').trim();
        if (!trimmed) {
            showToast("لا يمكن ترك مفتاح الأمان فارغاً", "error");
            return;
        }

        setIsSavingKey(true);
        try {
            const existing = await window.db.users.where('security_key').equals(trimmed).first();
            if (existing && existing.id !== parseInt(userId)) {
                showToast("هذا المفتاح مستخدم بالفعل لحساب آخر، يرجى توليد مفتاح مختلف", "error");
                setIsSavingKey(false);
                return;
            }

            await window.db.users.update(parseInt(userId), { 
                security_key: trimmed,
                updated_at: new Date().toISOString()
            });

            showToast("تم اعتماد وحفظ مفتاح الأمان بنجاح", "success");
        } catch (error) {
            console.error(error);
            showToast("حدث خطأ أثناء حفظ مفتاح الأمان", "error");
        } finally {
            setIsSavingKey(false);
        }
    };

    const filteredStaff = staff.filter(user => (user.name || '').includes(searchQuery) || (user.phone || '').includes(searchQuery));
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const openAddModal = () => { setEditingStaffId(null); setFormData({ name: '', phone: '', password: '', role: 'technician' }); setIsModalOpen(true); };
    const openEditModal = (staffMember) => {
        setEditingStaffId(staffMember.id);
        setFormData({ name: staffMember.name, phone: staffMember.phone, password: '', role: staffMember.role });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const existingUser = await window.db.users.where('phone').equals(formData.phone).first();
            if (existingUser && existingUser.id !== editingStaffId) { showToast("رقم الهاتف مسجل مسبقاً لموظف آخر", "error"); return; }
            const dataToSave = { name: formData.name, phone: formData.phone, role: formData.role };
            if (formData.password.trim() !== '') { dataToSave.password = await hashPassword(formData.password); }

            if (editingStaffId) {
                await window.db.users.update(editingStaffId, dataToSave); showToast("تم تعديل بيانات الموظف بنجاح", "success");
            } else {
                if (formData.password.trim() === '') { showToast("يجب إدخال كلمة مرور للموظف الجديد", "error"); return; }
                dataToSave.is_active = true; await window.db.users.add(dataToSave); showToast("تم إضافة الموظف بنجاح", "success");
            }
            setIsModalOpen(false); fetchSettingsData();
        } catch (error) { showToast("حدث خطأ أثناء الحفظ", "error"); }
    };

    const toggleStaffStatus = async (staffMember) => {
        if (staffMember.id === parseInt(userId)) { showToast("لا يمكنك إيقاف حسابك الشخصي الذي تستخدمه حالياً!", "error"); return; }
        if(confirm(staffMember.is_active ? `هل أنت متأكد من إيقاف حساب (${staffMember.name})؟ لن يتمكن من تسجيل الدخول.` : `هل تريد تفعيل حساب (${staffMember.name})؟`)) {
            try {
                await window.db.users.update(staffMember.id, { is_active: !staffMember.is_active });
                showToast(staffMember.is_active ? "تم إيقاف الحساب" : "تم تفعيل الحساب"); fetchSettingsData();
            } catch (error) { showToast("حدث خطأ أثناء تغيير حالة الحساب", "error"); }
        }
    };

    const handleSaveCenterInfo = async (e) => {
        e.preventDefault();
        try {
            await window.masterDb.centers.update(parseInt(centerId), { centerName: centerFormData.centerName, ownerName: centerFormData.ownerName, phone: centerFormData.phone });
            const localInfo = await window.db.center_info.toCollection().first();
            if(localInfo) { await window.db.center_info.update(localInfo.id, { name: centerFormData.centerName }); }

            let session = JSON.parse(localStorage.getItem('MentraFix_Session'));
            if (session) {
                session.center_name = centerFormData.centerName;
                if (session.role === 'admin' && parseInt(session.user_id) === parseInt(userId)) { session.name = centerFormData.ownerName; }
                localStorage.setItem('MentraFix_Session', JSON.stringify(session));
            }
            setCenterInfo(prev => ({ ...prev, ...centerFormData })); setIsEditingCenter(false);
            showToast("تم حفظ بيانات المركز بنجاح! سيتم تحديث الاسم بالأعلى.", "success");
            setTimeout(() => { window.location.reload(); }, 1500);
        } catch (error) { showToast("حدث خطأ أثناء تحديث البيانات", "error"); }
    };

    return (
        <div className="space-y-6 fade-up pb-24 md:pb-6 relative max-w-7xl mx-auto">
            {typeof SettingsHeader === 'function' && (
                <SettingsHeader activeTab={activeTab} setActiveTab={setActiveTab} setIsEditingCenter={setIsEditingCenter} />
            )}
            
            {activeTab === 'staff' && typeof SettingsStaffTab === 'function' && (
                <SettingsStaffTab 
                    isLoading={isLoading} currentStaff={currentStaff} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
                    openAddModal={openAddModal} openEditModal={openEditModal} toggleStaffStatus={toggleStaffStatus}
                    userId={userId} roleDetails={roleDetails} currentPage={currentPage} totalPages={totalPages} prevPage={prevPage} nextPage={nextPage}
                />
            )}

            {activeTab === 'centerInfo' && centerInfo && typeof SettingsCenterTab === 'function' && (
                <SettingsCenterTab 
                    centerInfo={centerInfo} isEditingCenter={isEditingCenter} setIsEditingCenter={setIsEditingCenter}
                    centerFormData={centerFormData} setCenterFormData={setCenterFormData} handleSaveCenterInfo={handleSaveCenterInfo}
                />
            )}

            {activeTab === 'security' && typeof SettingsSecurityTab === 'function' && (
                <SettingsSecurityTab 
                    securityKey={securityKey}
                    setSecurityKey={setSecurityKey}
                    handleSaveSecurityKey={handleSaveSecurityKey}
                    isSavingKey={isSavingKey}
                    showToast={showToast}
                />
            )}

            {/* عرض تبويب استيراد قطع الغيار */}
            {activeTab === 'import' && typeof SettingsImportTab === 'function' && (
                <SettingsImportTab 
                    userId={userId}
                    showToast={showToast}
                />
            )}

            {typeof SettingsProBanner === 'function' && <SettingsProBanner />}

            {isModalOpen && typeof SettingsStaffModal === 'function' && (
                <SettingsStaffModal 
                    setIsModalOpen={setIsModalOpen} editingStaffId={editingStaffId} formData={formData} setFormData={setFormData}
                    handleSubmit={handleSubmit} userId={userId}
                />
            )}
        </div>
    );
};