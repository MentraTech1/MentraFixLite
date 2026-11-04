// المسار: components/Customers/Module_Customers_Container.js
window.Module_Customers_Container = function({ centerId, userId, showToast, setActiveModule }) {
    const { useState, useEffect, useRef } = React;
    const { 
        CustomersHeader, CustomersStats, CustomersTable, CustomersProBanner, 
        CustomerAddEditModal, CustomerDevicesView, DeviceVisitsView,
        RequestsPartsModal, DeviceEditModal 
    } = window;
    
    const [viewState, setViewState] = useState('customers_list');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [stats, setStats] = useState({ total: 0, individuals: 0, companies: 0 });
    const [searchQuery, setSearchQuery] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const initialFormState = { id: null, name: '', phone: '', alt_phone: '', address: '', customer_type: 'individual' };
    const [formData, setFormData] = useState(initialFormState);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDevices, setCustomerDevices] = useState([]);
    const initialDeviceForm = { device_type: '', brand: '', model: '', serial_number: '', warranty_status: 'out_of_warranty', notes: '' };
    const [deviceFormData, setDeviceFormData] = useState(initialDeviceForm);

    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deviceVisits, setDeviceVisits] = useState([]);

    const [showRequestEditModal, setShowRequestEditModal] = useState(false);
    const [requestModalMode, setRequestModalMode] = useState('add'); 
    const [requestFormData, setRequestFormData] = useState({});
    const [technicians, setTechnicians] = useState([]);
    
    // ==========================================
    // Live Search States for Technician
    // ==========================================
    const [techSearchText, setTechSearchText] = useState('');
    const [showTechDropdown, setShowTechDropdown] = useState(false);
    const techDropdownRef = useRef(null);

    const [showPartsModal, setShowPartsModal] = useState(false);
    const [selectedOrderForParts, setSelectedOrderForParts] = useState(null);
    const [usedParts, setUsedParts] = useState([]);
    const [partForm, setPartForm] = useState({ part_id: '', quantity: 1, max_qty: 1, price: 0 });
    const [isPartsLoading, setIsPartsLoading] = useState(false);
    const [partSearchText, setPartSearchText] = useState('');
    const [partSearchResults, setPartSearchResults] = useState([]);
    const [isSearchingParts, setIsSearchingParts] = useState(false);
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const partDropdownRef = useRef(null);
    const partSearchTimeoutRef = useRef(null);

    const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
    const [editDeviceFormData, setEditDeviceFormData] = useState({});

    // ==========================================
    // Core Engine Logic
    // ==========================================

    const fetchStats = async () => {
        try {
            const allCustomers = await window.db.customers.toArray();
            setStats({
                total: allCustomers.length,
                individuals: allCustomers.filter(c => c.customer_type === 'individual').length,
                companies: allCustomers.filter(c => c.customer_type === 'company').length
            });
            const users = await window.db.users.filter(u => u.is_active === 1 || u.is_active === true).toArray();
            setTechnicians(users);
        } catch (e) {}
    };

    const fetchCustomers = async (page = 1, search = searchQuery) => {
        setIsLoading(true);
        try {
            let allItems = await window.db.customers.reverse().toArray(); 
            if (search.trim() !== '') {
                const lowerSearch = search.toLowerCase();
                allItems = allItems.filter(c => c.name.toLowerCase().includes(lowerSearch) || c.phone.includes(search) || (c.alt_phone && c.alt_phone.includes(search)));
            }
            for (let c of allItems) c.devices_count = await window.db.devices.where('customer_id').equals(c.id).count();

            const perPage = 3;
            const total = allItems.length;
            const last_page = Math.ceil(total / perPage) || 1;
            const paginatedItems = allItems.slice((page - 1) * perPage, page * perPage);

            setCustomers(paginatedItems);
            setPagination({ current_page: page, last_page, total });
        } catch (error) { showToast("حدث خطأ في قراءة البيانات", "error"); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchStats(); fetchCustomers(1, ''); }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (partDropdownRef.current && !partDropdownRef.current.contains(event.target)) setShowPartDropdown(false);
            if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) setShowTechDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchCustomers(1, searchQuery); };

    // ==========================================
    // Customer & Device Functions
    // ==========================================

    const handleViewDevices = async (customer) => {
        setSelectedCustomer(customer); setDeviceFormData(initialDeviceForm); setCustomerDevices([]);
        setViewState('customer_devices'); setIsLoading(true);
        try {
            const devices = await window.db.devices.where('customer_id').equals(customer.id).reverse().toArray();
            setCustomerDevices(devices);
        } catch (e) { showToast("خطأ في جلب الأجهزة", "error"); } finally { setIsLoading(false); }
    };

    const handleViewVisits = async (device) => {
        setSelectedDevice(device); setDeviceVisits([]); setViewState('device_visits'); setIsLoading(true);
        try {
            const visits = await window.db.maintenance_requests.where('device_id').equals(device.id).reverse().toArray();
            setDeviceVisits(visits);
        } catch (e) { showToast("خطأ في جلب الزيارات", "error"); } finally { setIsLoading(false); }
    };

    const refreshVisits = async () => {
        if (!selectedDevice) return;
        try {
            const visits = await window.db.maintenance_requests.where('device_id').equals(selectedDevice.id).reverse().toArray();
            setDeviceVisits(visits);
        } catch (e) { console.error(e); }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            const now = new Date().toISOString();
            if (modalMode === 'add') {
                await window.db.customers.add({ name: formData.name, phone: formData.phone, alt_phone: formData.alt_phone, address: formData.address, customer_type: formData.customer_type, created_at: now.split('T')[0] });
                showToast("تم تسجيل العميل بنجاح", "success");
            } else {
                await window.db.customers.update(formData.id, { name: formData.name, phone: formData.phone, alt_phone: formData.alt_phone, address: formData.address, customer_type: formData.customer_type, updated_at: now });
                showToast("تم تحديث بيانات العميل", "success");
            }
            setShowModal(false); fetchStats(); fetchCustomers(modalMode === 'add' ? 1 : pagination.current_page, searchQuery);
        } catch (e) { showToast("حدث خطأ أثناء الحفظ", "error"); } finally { setIsUpdating(false); }
    };

    const handleDeviceSubmit = async (e) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            await window.db.devices.add({ ...deviceFormData, customer_id: selectedCustomer.id, created_at: new Date().toISOString() });
            showToast("تمت إضافة الجهاز بنجاح", "success");
            setDeviceFormData(initialDeviceForm); 
            const devices = await window.db.devices.where('customer_id').equals(selectedCustomer.id).reverse().toArray();
            setCustomerDevices(devices); fetchCustomers(pagination.current_page, searchQuery);
        } catch (e) { showToast("حدث خطأ أثناء الحفظ", "error"); } finally { setIsUpdating(false); }
    };

    const openEditDeviceModal = (device) => {
        setEditDeviceFormData({...device});
        setShowEditDeviceModal(true);
    };

    const handleEditDeviceSubmit = async (e) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            await window.db.devices.update(editDeviceFormData.id, {
                device_type: editDeviceFormData.device_type,
                brand: editDeviceFormData.brand,
                model: editDeviceFormData.model,
                serial_number: editDeviceFormData.serial_number,
                warranty_status: editDeviceFormData.warranty_status
            });
            showToast("تم تعديل بيانات الجهاز بنجاح", "success");
            setShowEditDeviceModal(false);
            const devices = await window.db.devices.where('customer_id').equals(selectedCustomer.id).reverse().toArray();
            setCustomerDevices(devices);
        } catch (err) { showToast("حدث خطأ أثناء تعديل الجهاز", "error"); } finally { setIsUpdating(false); }
    };

    // ==========================================
    // Smart Billing & Print Engine
    // ==========================================

    const handlePrintInvoice = async (visit) => {
        try {
            const invoice = await window.db.invoices.where('request_id').equals(visit.id).first();
            const usedItems = await window.db.used_items.where('request_id').equals(visit.id).toArray();
            
            for(let item of usedItems) {
                if(item.item_type === 'part') {
                    const part = await window.db.inventory_parts.get(item.part_id);
                    item.part_name = part ? part.part_name : 'قطعة محذوفة';
                }
            }
            
            const laborCost = parseFloat(visit.estimated_cost) || 0;
            const partsCost = usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
            const finalTotal = laborCost + partsCost;
            
            const centerInfoArray = await window.db.center_info.toArray();
            const centerInfo = centerInfoArray[0] || { name: 'مركز الصيانة' };
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html dir="rtl" lang="ar">
                <head>
                    <title>فاتورة صيانة #${visit.id}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 900; }
                        .header p { margin: 5px 0 0; color: #64748b; font-weight: bold; }
                        .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                        .info-col p { margin: 8px 0; font-size: 14px; }
                        .info-col strong { color: #475569; display: inline-block; width: 90px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; text-align: right; font-size: 14px; }
                        th { background-color: #f1f5f9; color: #334155; font-weight: bold; }
                        tr:last-child td { border-bottom: 2px solid #94a3b8; }
                        .totals { width: 300px; margin-right: auto; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                        .totals p { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; font-weight: bold; color: #475569; }
                        .totals .final { font-size: 18px; color: #0f172a; font-weight: 900; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 10px; }
                        .footer { text-align: center; margin-top: 50px; font-size: 13px; color: #94a3b8; font-weight: bold; }
                        @media print { body { -webkit-print-color-adjust: exact; padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${centerInfo.name}</h1>
                        <p>فاتورة صيانة إلكترونيات وأجهزة</p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-col">
                            <p><strong>رقم الطلب:</strong> #${visit.id}</p>
                            <p><strong>رقم الفاتورة:</strong> ${invoice ? invoice.invoice_number : '---'}</p>
                            <p><strong>التاريخ:</strong> ${invoice ? invoice.created_at : visit.created_at.split('T')[0]}</p>
                            <p><strong>حالة الطلب:</strong> ${visit.status}</p>
                        </div>
                        <div class="info-col">
                            <p><strong>اسم العميل:</strong> ${selectedCustomer.name}</p>
                            <p><strong>رقم الهاتف:</strong> <span dir="ltr">${selectedCustomer.phone}</span></p>
                            <p><strong>نوع الجهاز:</strong> ${selectedDevice.device_type} ${selectedDevice.brand ? '- ' + selectedDevice.brand : ''}</p>
                            <p><strong>الموديل / SN:</strong> ${selectedDevice.model || '-'} / ${selectedDevice.serial_number || '-'}</p>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>البيان / الخدمة</th>
                                <th>الكمية</th>
                                <th>سعر الوحدة</th>
                                <th>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>مصنعية صيانة: ${visit.issue_description || 'أعمال صيانة'}</td>
                                <td>1</td>
                                <td>${laborCost.toLocaleString()}</td>
                                <td>${laborCost.toLocaleString()}</td>
                            </tr>
                            ${usedItems.map(item => `
                            <tr>
                                <td>قطعة غيار: ${item.part_name}</td>
                                <td>${item.quantity}</td>
                                <td>${Number(item.price).toLocaleString()}</td>
                                <td>${Number(item.total_price).toLocaleString()}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals">
                        <p><span>إجمالي المصنعية:</span> <span>${laborCost.toLocaleString()} ج.م</span></p>
                        <p><span>إجمالي قطع الغيار:</span> <span>${partsCost.toLocaleString()} ج.م</span></p>
                        <p class="final"><span>الصافي المطلوب:</span> <span>${finalTotal.toLocaleString()} ج.م</span></p>
                    </div>
                    
                    <div class="footer">
                        <p>شكراً لثقتكم بخدماتنا، نتمنى لكم يوماً سعيداً!</p>
                        <p>تم إصدار هذه الفاتورة بواسطة نظام MentraFix</p>
                    </div>
                    <script>
                        window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (e) {
            console.error(e);
            showToast("حدث خطأ أثناء محاولة الطباعة", "error");
        }
    };

    const syncInvoiceIfDelivered = async (orderId) => {
        const request = await window.db.maintenance_requests.get(orderId);
        const existingInvoice = await window.db.invoices.where('request_id').equals(orderId).first();
        
        if (existingInvoice) {
            const usedItems = await window.db.used_items.where('request_id').equals(orderId).toArray();
            const laborCost = parseFloat(request.estimated_cost) || 0;
            const partsCost = usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
            const finalTotal = laborCost + partsCost;

            await window.db.invoices.update(existingInvoice.id, { total_amount: finalTotal });
            const existingPayment = await window.db.payments.where('invoice_id').equals(existingInvoice.id).first();
            if (existingPayment) {
                await window.db.payments.update(existingPayment.id, { amount: finalTotal });
            }
            return { updated: true, total: finalTotal };
        }
        return { updated: false, total: 0 };
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setIsUpdating(true);
        try {
            await window.db.maintenance_requests.update(orderId, { status: newStatus });
            
            if (newStatus === 'تم التسليم') {
                const request = await window.db.maintenance_requests.get(orderId);
                const syncResult = await syncInvoiceIfDelivered(orderId);
                
                if (syncResult.updated) {
                    showToast(`تم إعادة تسليم الجهاز، وتحديث الفاتورة السابقة لتصبح (${syncResult.total} ج.م)`, "success");
                } else {
                    const usedItems = await window.db.used_items.where('request_id').equals(orderId).toArray();
                    const laborCost = parseFloat(request.estimated_cost) || 0;
                    const partsCost = usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                    const finalTotal = laborCost + partsCost;

                    const invoiceId = await window.CenterQueries.finishRequestAndCreateInvoice(orderId, request.customer_id, finalTotal);
                    await window.CenterQueries.payInvoice(invoiceId, finalTotal, 'كاش');
                    showToast(`تم تسليم الجهاز، وإنشاء فاتورة جديدة بـ (${finalTotal} ج.م)`, "success");
                }
            } else {
                showToast(`تم تغيير الحالة إلى: ${newStatus}`, "success");
            }
            refreshVisits();
        } catch (e) { showToast("خطأ في التحديث", "error"); } finally { setIsUpdating(false); }
    };

    const handleRequestFormSubmit = async (e) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            const payload = {
                customer_id: requestFormData.customer_id,
                device_id: requestFormData.device_id,
                technician_id: requestFormData.technician_id ? parseInt(requestFormData.technician_id) : null,
                maintenance_type: requestFormData.maintenance_type,
                issue_description: requestFormData.issue_description,
                estimated_cost: parseFloat(requestFormData.estimated_cost) || 0,
                status: requestFormData.status
            };

            if (requestModalMode === 'add') {
                payload.created_at = new Date().toISOString();
                await window.db.maintenance_requests.add(payload);
                showToast("تم فتح أمر شغل (زيارة) جديدة بنجاح", "success");
            } else {
                await window.db.maintenance_requests.update(requestFormData.id, payload);
                if (payload.status === 'تم التسليم') {
                    const syncResult = await syncInvoiceIfDelivered(requestFormData.id);
                    if (!syncResult.updated) {
                        const usedItems = await window.db.used_items.where('request_id').equals(requestFormData.id).toArray();
                        const partsCost = usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                        const finalTotal = payload.estimated_cost + partsCost;
                        const invoiceId = await window.CenterQueries.finishRequestAndCreateInvoice(requestFormData.id, requestFormData.customer_id, finalTotal);
                        await window.CenterQueries.payInvoice(invoiceId, finalTotal, 'كاش');
                    }
                } else {
                    await syncInvoiceIfDelivered(requestFormData.id);
                }
                showToast("تم حفظ التعديلات وضبط الحسابات بنجاح", "success");
            }
            setShowRequestEditModal(false); 
            refreshVisits();
        } catch (e) { showToast("خطأ في الحفظ", "error"); } finally { setIsUpdating(false); }
    };

    const openAddRequestModal = () => {
        setRequestFormData({
            id: null, customer_id: selectedCustomer.id, device_id: selectedDevice.id, maintenance_type: 'داخلي',
            issue_description: '', technician_id: '', estimated_cost: '', status: 'قيد الفحص'
        });
        setTechSearchText('');
        setRequestModalMode('add');
        setShowRequestEditModal(true);
    };

    const openEditRequestModal = (order) => {
        const tech = technicians.find(t => String(t.id) === String(order.technician_id));
        setRequestFormData({
            id: order.id, customer_id: order.customer_id, device_id: order.device_id, maintenance_type: order.maintenance_type,
            issue_description: order.issue_description || '', technician_id: order.technician_id || '', 
            estimated_cost: order.estimated_cost || '', status: order.status || 'قيد الفحص'
        });
        setTechSearchText(tech ? tech.name : '');
        setRequestModalMode('edit');
        setShowRequestEditModal(true);
    };

    // ==========================================
    // Parts Management Logic
    // ==========================================

    const loadPartsData = async (orderId) => {
        setIsPartsLoading(true);
        try {
            const used = await window.db.used_items.where('request_id').equals(orderId).toArray();
            for(let item of used) {
                if(item.item_type === 'part') {
                    const part = await window.db.inventory_parts.get(item.part_id);
                    item.part_name = part ? part.part_name : 'قطعة محذوفة';
                    const fallbackPrice = part ? (Number(part.selling_price) || Number(part.price) || 0) : 0;
                    const finalItemPrice = item.price !== undefined && item.price !== null ? Number(item.price) : fallbackPrice;
                    item.price = finalItemPrice;
                    item.total_price = item.total_price !== undefined && item.total_price !== null ? Number(item.total_price) : (finalItemPrice * item.quantity);
                }
            }
            setUsedParts(used);
        } catch (e) {} finally { setIsPartsLoading(false); }
    };

    const openPartsModal = (order) => {
        order.customer_name = selectedCustomer.name; order.device_type = selectedDevice.device_type;
        setSelectedOrderForParts(order); setPartForm({ part_id: '', quantity: 1, max_qty: 1, price: 0 });
        setPartSearchText(''); setShowPartsModal(true); loadPartsData(order.id);
    };

    const handlePartSearchChange = (e) => {
        const value = e.target.value; setPartSearchText(value);
        if(partForm.part_id) setPartForm({ ...partForm, part_id: '' });
        if (value.trim().length < 2) { setPartSearchResults([]); setShowPartDropdown(false); return; }
        setIsSearchingParts(true); setShowPartDropdown(true);
        if (partSearchTimeoutRef.current) clearTimeout(partSearchTimeoutRef.current);
        partSearchTimeoutRef.current = setTimeout(async () => {
            try {
                const query = value.toLowerCase().trim();
                const parts = await window.db.inventory_parts.filter(p => {
                    const name = p.part_name ? String(p.part_name).toLowerCase() : '';
                    const sku = p.sku ? String(p.sku).toLowerCase() : '';
                    return (name.includes(query) || sku.includes(query)) && p.stock_quantity > 0;
                }).limit(5).toArray();
                setPartSearchResults(parts);
            } catch (error) {} finally { setIsSearchingParts(false); }
        }, 300);
    };

    const selectPart = (part) => {
        const actualPrice = Number(part.selling_price) || Number(part.price) || 0;
        setPartSearchText(`${part.part_name} - ${actualPrice} ج.م`);
        setPartForm({ part_id: part.id, quantity: 1, max_qty: part.stock_quantity, price: actualPrice });
        setShowPartDropdown(false);
    };

    const handleAddPart = async (e) => {
        e.preventDefault();
        if(!partForm.part_id || partForm.quantity > partForm.max_qty) return showToast("خطأ في الكمية أو القطعة", "error");
        setIsUpdating(true);
        try {
            await window.db.transaction('rw', window.db.used_items, window.db.inventory_parts, window.db.stock_movements, async () => {
                const qty = parseInt(partForm.quantity); const unitPrice = parseFloat(partForm.price) || 0;
                await window.db.used_items.add({ request_id: selectedOrderForParts.id, item_type: 'part', part_id: partForm.part_id, service_id: null, quantity: qty, price: unitPrice, total_price: unitPrice * qty, created_at: new Date().toISOString() });
                const part = await window.db.inventory_parts.get(partForm.part_id);
                await window.db.inventory_parts.update(part.id, { stock_quantity: part.stock_quantity - qty });
                await window.db.stock_movements.add({ part_id: part.id, user_id: userId, movement_type: 'سحب لصيانة', quantity: qty, created_at: new Date().toISOString() });
            });
            await syncInvoiceIfDelivered(selectedOrderForParts.id);
            showToast("تم خصم القطعة وإضافتها للطلب", "success");
            setPartForm({ part_id: '', quantity: 1, max_qty: 1, price: 0 }); setPartSearchText(''); loadPartsData(selectedOrderForParts.id); 
        } catch (e) {} finally { setIsUpdating(false); }
    };

    const handleUpdatePart = async (usedItemId, newQtyStr, newPriceStr) => {
        const newQty = parseInt(newQtyStr); const newPrice = parseFloat(newPriceStr);
        setIsUpdating(true);
        try {
            await window.db.transaction('rw', window.db.used_items, window.db.inventory_parts, window.db.stock_movements, async () => {
                const usedItem = await window.db.used_items.get(usedItemId);
                const part = await window.db.inventory_parts.get(usedItem.part_id);
                const qtyDiff = newQty - usedItem.quantity;
                if (qtyDiff > 0 && part.stock_quantity < qtyDiff) throw new Error(`الرصيد غير كافٍ! المتاح: ${part.stock_quantity}`);
                if (qtyDiff !== 0) {
                    await window.db.inventory_parts.update(part.id, { stock_quantity: part.stock_quantity - qtyDiff });
                    const moveType = qtyDiff > 0 ? 'سحب إضافي لصيانة' : 'إرجاع جزئي من صيانة';
                    await window.db.stock_movements.add({ part_id: part.id, user_id: userId, movement_type: moveType, quantity: Math.abs(qtyDiff), created_at: new Date().toISOString() });
                }
                await window.db.used_items.update(usedItemId, { quantity: newQty, price: newPrice, total_price: newQty * newPrice });
            });
            await syncInvoiceIfDelivered(selectedOrderForParts.id);
            showToast("تم تعديل الكمية/السعر بنجاح", "success"); loadPartsData(selectedOrderForParts.id);
        } catch (e) { showToast(e.message || "حدث خطأ", "error"); } finally { setIsUpdating(false); }
    };

    const handleRemovePart = async (usedItem) => {
        if(!confirm("هل أنت متأكد من إرجاع القطعة للمخزن؟")) return;
        setIsUpdating(true);
        try {
            await window.db.transaction('rw', window.db.used_items, window.db.inventory_parts, window.db.stock_movements, async () => {
                const part = await window.db.inventory_parts.get(usedItem.part_id);
                if(part) {
                    await window.db.inventory_parts.update(part.id, { stock_quantity: part.stock_quantity + usedItem.quantity });
                    await window.db.stock_movements.add({ part_id: part.id, user_id: userId, movement_type: 'إرجاع من صيانة', quantity: usedItem.quantity, created_at: new Date().toISOString() });
                }
                await window.db.used_items.delete(usedItem.id);
            });
            await syncInvoiceIfDelivered(selectedOrderForParts.id);
            showToast("تم إرجاع القطعة بنجاح", "success"); loadPartsData(selectedOrderForParts.id);
        } catch (e) {} finally { setIsUpdating(false); }
    };


    return (
        <div className="space-y-6 relative pb-10 max-w-7xl mx-auto">
            
            {viewState === 'customers_list' && (
                <>
                    <CustomersHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} openAddModal={() => {setModalMode('add'); setFormData(initialFormState); setShowModal(true);}} />
                    <CustomersStats stats={stats} />
                    <CustomersTable 
                        customers={customers} isLoading={isLoading} isUpdating={isUpdating} 
                        pagination={pagination} fetchCustomers={fetchCustomers} 
                        searchQuery={searchQuery} onViewDevices={handleViewDevices} openEditModal={(c) => {
                            setModalMode('edit');
                            setFormData({ id: c.id, name: c.name, phone: c.phone, alt_phone: c.alt_phone || '', address: c.address || '', customer_type: c.customer_type });
                            setShowModal(true);
                        }} 
                    />
                    <CustomersProBanner />
                </>
            )}

            {viewState === 'customer_devices' && selectedCustomer && (
                <CustomerDevicesView 
                    selectedCustomer={selectedCustomer} goBack={() => setViewState('customers_list')} 
                    deviceFormData={deviceFormData} setDeviceFormData={setDeviceFormData} 
                    handleDeviceSubmit={handleDeviceSubmit} isUpdating={isUpdating} 
                    customerDevices={customerDevices} onViewVisits={handleViewVisits}
                    openEditDeviceModal={openEditDeviceModal} 
                />
            )}

            {viewState === 'device_visits' && selectedDevice && (
                <DeviceVisitsView 
                    selectedDevice={selectedDevice} selectedCustomer={selectedCustomer}
                    deviceVisits={deviceVisits} isLoading={isLoading} isUpdating={isUpdating}
                    goBack={() => setViewState('customer_devices')}
                    handleStatusChange={handleStatusChange}
                    openPartsModal={openPartsModal}
                    openEditRequestModal={openEditRequestModal}
                    openAddRequestModal={openAddRequestModal}
                    handlePrintInvoice={handlePrintInvoice} 
                />
            )}

            <CustomerAddEditModal showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} formData={formData} setFormData={setFormData} handleFormSubmit={handleFormSubmit} isUpdating={isUpdating} />

            {DeviceEditModal && <DeviceEditModal showModal={showEditDeviceModal} setShowModal={setShowEditDeviceModal} formData={editDeviceFormData} setFormData={setEditDeviceFormData} handleSubmit={handleEditDeviceSubmit} isUpdating={isUpdating} />}

            {RequestsPartsModal && <RequestsPartsModal showPartsModal={showPartsModal} setShowPartsModal={setShowPartsModal} selectedOrderForParts={selectedOrderForParts} isPartsLoading={isPartsLoading} handleAddPart={handleAddPart} partDropdownRef={partDropdownRef} partForm={partForm} setPartForm={setPartForm} partSearchText={partSearchText} handlePartSearchChange={handlePartSearchChange} partSearchResults={partSearchResults} showPartDropdown={showPartDropdown} setShowPartDropdown={setShowPartDropdown} selectPart={selectPart} isSearchingParts={isSearchingParts} isUpdating={isUpdating} usedParts={usedParts} handleRemovePart={handleRemovePart} handleUpdatePart={handleUpdatePart} />}

            {showRequestEditModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRequestEditModal(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl z-10 overflow-hidden animate-view">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <i className={`fa-solid ${requestModalMode === 'add' ? 'fa-file-medical text-cyan-500' : 'fa-pen-to-square text-blue-500'}`}></i>
                                {requestModalMode === 'add' ? 'إنشاء زيارة (أمر شغل) جديد' : `تعديل الزيارة #${requestFormData.id}`}
                            </h3>
                            <button onClick={() => setShowRequestEditModal(false)} className="w-8 h-8 rounded-full bg-white text-slate-500 hover:bg-rose-500 hover:text-white border border-slate-200 shadow-sm flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <form onSubmit={handleRequestFormSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2">نوع الصيانة</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700" value={requestFormData.maintenance_type} onChange={(e) => setRequestFormData({...requestFormData, maintenance_type: e.target.value})}>
                                        <option value="داخلي">داخلي (بالمركز)</option>
                                        <option value="خارجي">خارجي (منزل/شركة)</option>
                                    </select>
                                </div>
                                <div className="relative" ref={techDropdownRef}>
                                    <label className="block text-xs font-bold text-slate-500 mb-2">الفني المسؤول</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4]"
                                            placeholder="ابحث عن الفني..."
                                            value={techSearchText}
                                            onChange={(e) => {
                                                setTechSearchText(e.target.value);
                                                setRequestFormData({...requestFormData, technician_id: ''}); 
                                                setShowTechDropdown(true);
                                            }}
                                            onFocus={() => setShowTechDropdown(true)}
                                        />
                                        <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                        {requestFormData.technician_id && (
                                            <i className="fa-solid fa-check absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                                        )}
                                    </div>
                                    
                                    {showTechDropdown && (
                                        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100">
                                            <li 
                                                onMouseDown={() => {
                                                    setRequestFormData({...requestFormData, technician_id: ''});
                                                    setTechSearchText('');
                                                    setShowTechDropdown(false);
                                                }} 
                                                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors text-slate-500 text-sm font-bold flex items-center gap-2"
                                            >
                                                <i className="fa-solid fa-user-slash text-slate-400 w-5 text-center"></i> -- لم يُحدد --
                                            </li>
                                            {technicians?.filter(t => t.name.toLowerCase().includes(techSearchText.toLowerCase())).length > 0 ? (
                                                technicians.filter(t => t.name.toLowerCase().includes(techSearchText.toLowerCase())).map(t => (
                                                    <li 
                                                        key={t.id} 
                                                        onMouseDown={() => {
                                                            setRequestFormData({...requestFormData, technician_id: t.id});
                                                            setTechSearchText(t.name);
                                                            setShowTechDropdown(false);
                                                        }} 
                                                        className="p-3 hover:bg-cyan-50 cursor-pointer transition-colors text-slate-800 text-sm font-bold flex items-center gap-2"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs">
                                                            {t.name.charAt(0)}
                                                        </div>
                                                        {t.name}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-3 text-center text-sm font-bold text-slate-400">لا يوجد فني مطابق</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            
                            {requestModalMode === 'edit' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2">حالة أمر الشغل الحالية</label>
                                    <select required className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-black text-blue-700 focus:outline-none focus:border-blue-500" value={requestFormData.status} onChange={(e) => setRequestFormData({...requestFormData, status: e.target.value})}>
                                        <option value="قيد الفحص">قيد الفحص</option>
                                        <option value="جاري العمل">جاري العمل</option>
                                        <option value="بانتظار قطع غيار">بانتظار قطع غيار</option>
                                        <option value="تم الإصلاح">تم الإصلاح</option>
                                        <option value="تم التسليم">تم التسليم (يُصدر فاتورة)</option>
                                        <option value="مرفوض / لا يمكن إصلاحه">مرفوض / لا يمكن إصلاحه</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">الشكوى / وصف العطل <span className="text-rose-500">*</span></label>
                                <textarea required rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4]" value={requestFormData.issue_description} onChange={(e) => setRequestFormData({...requestFormData, issue_description: e.target.value})}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">التكلفة المتوقعة للمصنعية (بدون قطع الغيار)</label>
                                <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#06B6D4]" value={requestFormData.estimated_cost} onChange={(e) => setRequestFormData({...requestFormData, estimated_cost: e.target.value})} />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="submit" disabled={isUpdating} className={`flex-1 hover:opacity-90 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-md ${requestModalMode === 'add' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
                                    {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} 
                                    {requestModalMode === 'add' ? 'فتح أمر الشغل' : 'حفظ التعديلات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};