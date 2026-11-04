// المسار: components/Requests/Module_Requests_Container.js
window.Module_Requests_Container = function({ centerId, userId, showToast, setActiveModule }) {
    const { useState, useEffect, useRef } = React;
    const { 
        RequestsHeader, RequestsStatusFilters, RequestsTable, 
        RequestsProBanner, RequestsPartsModal, RequestsAddEditModal 
    } = window;

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total_records: 0 });
    const [activeTab, setActiveTab] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const limit = 3; 

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [technicians, setTechnicians] = useState([]);
    const [customerDevices, setCustomerDevices] = useState([]);
    
    const initialFormState = { id: null, customer_id: '', device_id: '', maintenance_type: 'داخلي', issue_description: '', technician_id: '', estimated_cost: '', status: 'قيد الفحص' };
    const [formData, setFormData] = useState(initialFormState);

    const [customerSearchText, setCustomerSearchText] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const [deviceSearchText, setDeviceSearchText] = useState('');
    const [deviceSearchResults, setDeviceSearchResults] = useState([]);
    const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
    const deviceDropdownRef = useRef(null);

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

    // Functions
    const fetchOrders = async (page = 1, status = activeTab, search = searchQuery) => {
        setIsLoading(true);
        try {
            let allOrders = await window.db.maintenance_requests.orderBy('id').reverse().toArray();
            for (let order of allOrders) {
                const customer = await window.db.customers.get(order.customer_id);
                const device = await window.db.devices.get(order.device_id);
                let techName = null;
                if(order.technician_id) {
                    const tech = await window.db.users.get(parseInt(order.technician_id));
                    if(tech) techName = tech.name;
                }
                order.customer_name = customer ? customer.name : 'عميل محذوف';
                order.customer_phone = customer ? String(customer.phone) : '';
                order.device_type = device ? device.device_type : 'جهاز محذوف';
                order.brand = device ? device.brand : '';
                order.technician_name = techName;
            }

            if (status !== 'الكل') allOrders = allOrders.filter(o => o.status === status);
            if (search.trim() !== '') {
                const query = search.toLowerCase().trim();
                allOrders = allOrders.filter(o => String(o.id) === query || (o.customer_name && o.customer_name.toLowerCase().includes(query)) || (o.customer_phone && o.customer_phone.includes(query)));
            }

            const totalRecords = allOrders.length;
            const totalPages = Math.ceil(totalRecords / limit) || 1;
            const pagedOrders = allOrders.slice((page - 1) * limit, page * limit);

            setOrders(pagedOrders);
            setPagination({ current_page: page, last_page: totalPages, total_records: totalRecords });
        } catch (e) { showToast("حدث خطأ في تحميل الطلبات", "error"); } 
        finally { setIsLoading(false); }
    };

    const fetchFormOptions = async () => {
        try {
            const users = await window.db.users.filter(u => u.is_active === 1 || u.is_active === true).toArray();
            setTechnicians(users);
        } catch (e) {}
    };

    useEffect(() => { fetchOrders(1, activeTab, searchQuery); }, [activeTab]);
    useEffect(() => { fetchFormOptions(); }, []); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowCustomerDropdown(false);
            if (deviceDropdownRef.current && !deviceDropdownRef.current.contains(event.target)) setShowDeviceDropdown(false);
            if (partDropdownRef.current && !partDropdownRef.current.contains(event.target)) setShowPartDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchOrders(1, activeTab, searchQuery); };

    // دالة مساعدة لتحديث الفاتورة تلقائياً إذا تم تعديل الطلب أو القطع وهو (تم التسليم)
    const updateInvoiceIfDelivered = async (orderId) => {
        const request = await window.db.maintenance_requests.get(orderId);
        if (request.status === 'تم التسليم') {
            const invoices = await window.db.invoices.where('request_id').equals(orderId).toArray();
            if (invoices.length > 0) {
                const inv = invoices[0];
                const usedItems = await window.db.used_items.where('request_id').equals(orderId).toArray();
                const laborCost = parseFloat(request.estimated_cost) || 0;
                const partsCost = usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                const finalTotal = laborCost + partsCost;

                await window.db.invoices.update(inv.id, { total_amount: finalTotal, net_amount: finalTotal });
                const payments = await window.db.payments.where('invoice_id').equals(inv.id).toArray();
                if(payments.length > 0) await window.db.payments.update(payments[0].id, { amount: finalTotal });
            }
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setIsUpdating(true);
        try {
            if (newStatus === 'تم التسليم') {
                const request = await window.db.maintenance_requests.get(orderId);
                const usedItems = await window.db.used_items.where('request_id').equals(orderId).toArray();
                const laborCost = parseFloat(request.estimated_cost) || 0;
                const partsCost = usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                const finalTotal = laborCost + partsCost;

                const invoiceId = await window.CenterQueries.finishRequestAndCreateInvoice(orderId, request.customer_id, finalTotal);
                await window.CenterQueries.payInvoice(invoiceId, finalTotal, 'كاش');
                showToast(`تم تسليم الجهاز، إنشاء الفاتورة، وتحصيل (${finalTotal} ج.م) كاش بنجاح`, "success");
            } else {
                await window.db.maintenance_requests.update(orderId, { status: newStatus });
                showToast(`تم تغيير الحالة إلى: ${newStatus}`, "success");
            }
            fetchOrders(pagination.current_page, activeTab, searchQuery);
        } catch (e) { showToast("خطأ في التحديث", "error"); } 
        finally { setIsUpdating(false); }
    };

    const openAddModal = () => {
        setModalMode('add'); setFormData(initialFormState); setCustomerSearchText(''); setDeviceSearchText('');
        setCustomerDevices([]); setDeviceSearchResults([]); setShowModal(true);
    };

    const fetchCustomerDevices = async (customerId) => {
        try {
            const devices = await window.db.devices.where('customer_id').equals(customerId).toArray();
            setCustomerDevices(devices); setDeviceSearchResults(devices);
        } catch (e) {}
    };

    const openEditModal = (order) => {
        setModalMode('edit');
        setFormData({
            id: order.id, customer_id: order.customer_id, device_id: order.device_id, maintenance_type: order.maintenance_type,
            issue_description: order.issue_description || '', technician_id: order.technician_id || '', estimated_cost: order.estimated_cost || '',
            status: order.status || 'قيد الفحص'
        });
        setCustomerSearchText(order.customer_name);
        setDeviceSearchText(`${order.device_type} ${order.brand ? order.brand : ''}`.trim());
        fetchCustomerDevices(order.customer_id); setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customer_id || !formData.device_id) return showToast("الرجاء اختيار العميل والجهاز", "error");
        setIsUpdating(true);
        try {
            const payload = {
                customer_id: formData.customer_id, device_id: formData.device_id, technician_id: formData.technician_id ? parseInt(formData.technician_id) : null,
                maintenance_type: formData.maintenance_type, issue_description: formData.issue_description, estimated_cost: parseFloat(formData.estimated_cost) || 0,
            };
            
            if (modalMode === 'add') {
                payload.status = 'قيد الفحص'; payload.created_at = new Date().toISOString();
                await window.db.maintenance_requests.add(payload);
                showToast("تم إنشاء أمر الشغل بنجاح", "success");
            } else {
                const oldRequest = await window.db.maintenance_requests.get(formData.id);
                payload.status = formData.status;
                await window.db.maintenance_requests.update(formData.id, payload);

                if (oldRequest.status !== formData.status) {
                    if (formData.status === 'تم التسليم') {
                        // إنشاء فاتورة جديدة
                        const usedItems = await window.db.used_items.where('request_id').equals(formData.id).toArray();
                        const finalTotal = payload.estimated_cost + usedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                        const invoiceId = await window.CenterQueries.finishRequestAndCreateInvoice(formData.id, formData.customer_id, finalTotal);
                        await window.CenterQueries.payInvoice(invoiceId, finalTotal, 'كاش');
                        showToast("تم تحديث الطلب وإصدار الفاتورة للعميل", "success");
                    } else if (oldRequest.status === 'تم التسليم') {
                        // التراجع عن التسليم: حذف الفاتورة القديمة
                        const invoices = await window.db.invoices.where('request_id').equals(formData.id).toArray();
                        for (let inv of invoices) {
                            await window.db.payments.where('invoice_id').equals(inv.id).delete();
                            await window.db.invoices.delete(inv.id);
                        }
                        showToast("تم التراجع عن التسليم وحذف الفاتورة بنجاح", "success");
                    }
                } else if (formData.status === 'تم التسليم') {
                    // تحديث الفاتورة في حال تم تعديل المصنعية فقط وتم التسليم
                    await updateInvoiceIfDelivered(formData.id);
                    showToast("تم تحديث أمر الشغل وإجمالي الفاتورة", "success");
                } else {
                    showToast("تم تحديث أمر الشغل بنجاح", "success");
                }
            }
            setShowModal(false); fetchOrders(modalMode === 'add' ? 1 : pagination.current_page, activeTab, searchQuery);
        } catch (e) { showToast("خطأ في الحفظ", "error"); } 
        finally { setIsUpdating(false); }
    };

    const handleCustomerSearchChange = (e) => {
        const value = e.target.value; setCustomerSearchText(value);
        if(formData.customer_id) {
            setFormData({...formData, customer_id: '', device_id: ''}); setCustomerDevices([]); setDeviceSearchResults([]); setDeviceSearchText('');
        }
        if (value.trim().length < 2) { setCustomerSearchResults([]); setShowCustomerDropdown(false); return; }
        setIsSearchingCustomers(true); setShowCustomerDropdown(true);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const query = value.toLowerCase().trim();
                const customers = await window.db.customers.filter(c => {
                    const name = c.name ? String(c.name).toLowerCase() : '';
                    const phone = c.phone ? String(c.phone) : '';
                    return name.includes(query) || phone.includes(query);
                }).limit(5).toArray();
                setCustomerSearchResults(customers);
            } catch (error) {} finally { setIsSearchingCustomers(false); }
        }, 300);
    };

    const selectCustomer = (customer) => {
        setCustomerSearchText(customer.name); setFormData({...formData, customer_id: customer.id, device_id: ''});
        setDeviceSearchText(''); setShowCustomerDropdown(false); fetchCustomerDevices(customer.id);
    };

    const handleDeviceSearchChange = (e) => {
        const value = e.target.value; setDeviceSearchText(value);
        if(formData.device_id) setFormData({...formData, device_id: ''});
        if (value.trim() === '') setDeviceSearchResults(customerDevices);
        else {
            const filtered = customerDevices.filter(d => (d.device_type && d.device_type.toLowerCase().includes(value.toLowerCase())) || (d.brand && d.brand.toLowerCase().includes(value.toLowerCase())));
            setDeviceSearchResults(filtered);
        }
        setShowDeviceDropdown(true);
    };

    const selectDevice = (device) => {
        setDeviceSearchText(`${device.device_type} ${device.brand ? device.brand : ''}`.trim());
        setFormData({...formData, device_id: device.id}); setShowDeviceDropdown(false);
    };

    const openPartsModal = async (order) => {
        setSelectedOrderForParts(order); setPartForm({ part_id: '', quantity: 1, max_qty: 1, price: 0 });
        setPartSearchText(''); setShowPartsModal(true); loadPartsData(order.id);
    };

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
            await updateInvoiceIfDelivered(selectedOrderForParts.id);
            showToast("تم خصم القطعة وإضافتها للطلب", "success");
            setPartForm({ part_id: '', quantity: 1, max_qty: 1, price: 0 }); setPartSearchText(''); loadPartsData(selectedOrderForParts.id); 
        } catch (e) {} finally { setIsUpdating(false); }
    };

    const handleRemovePart = async (usedItem) => {
        if(!confirm("إرجاع القطعة للمخزن؟")) return;
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
            await updateInvoiceIfDelivered(selectedOrderForParts.id);
            showToast("تم إرجاع القطعة", "success"); loadPartsData(selectedOrderForParts.id);
        } catch (e) {} finally { setIsUpdating(false); }
    };

    return (
        <div className="pb-24 md:pb-8 w-full max-w-7xl mx-auto space-y-6 relative">
            
            {showModal ? (
                <RequestsAddEditModal 
                    showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} formData={formData} setFormData={setFormData}
                    handleFormSubmit={handleFormSubmit} dropdownRef={dropdownRef} customerSearchText={customerSearchText} 
                    handleCustomerSearchChange={handleCustomerSearchChange} showCustomerDropdown={showCustomerDropdown} 
                    setShowCustomerDropdown={setShowCustomerDropdown} customerSearchResults={customerSearchResults} selectCustomer={selectCustomer}
                    isSearchingCustomers={isSearchingCustomers} deviceDropdownRef={deviceDropdownRef} deviceSearchText={deviceSearchText} 
                    handleDeviceSearchChange={handleDeviceSearchChange} customerDevices={customerDevices} showDeviceDropdown={showDeviceDropdown} 
                    setShowDeviceDropdown={setShowDeviceDropdown} deviceSearchResults={deviceSearchResults} selectDevice={selectDevice} 
                    technicians={technicians} isUpdating={isUpdating}
                />
            ) : (
                <>
                    <RequestsHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} openAddModal={openAddModal} />
                    <RequestsStatusFilters activeTab={activeTab} setActiveTab={setActiveTab} />
                    <RequestsTable 
                        orders={orders} isLoading={isLoading} isUpdating={isUpdating} showModal={showModal} 
                        showPartsModal={showPartsModal} openPartsModal={openPartsModal} handleStatusChange={handleStatusChange} 
                        openEditModal={openEditModal} pagination={pagination} fetchOrders={fetchOrders} activeTab={activeTab} searchQuery={searchQuery}
                    />
                    <RequestsProBanner />
                </>
            )}

            <RequestsPartsModal 
                showPartsModal={showPartsModal} setShowPartsModal={setShowPartsModal} selectedOrderForParts={selectedOrderForParts}
                isPartsLoading={isPartsLoading} handleAddPart={handleAddPart} partDropdownRef={partDropdownRef} partForm={partForm} 
                setPartForm={setPartForm} partSearchText={partSearchText} handlePartSearchChange={handlePartSearchChange} 
                partSearchResults={partSearchResults} showPartDropdown={showPartDropdown} setShowPartDropdown={setShowPartDropdown}
                selectPart={selectPart} isSearchingParts={isSearchingParts} isUpdating={isUpdating} usedParts={usedParts} handleRemovePart={handleRemovePart}
            />
            
        </div>
    );
};