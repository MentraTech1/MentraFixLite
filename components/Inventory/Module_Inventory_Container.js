// المسار: components/Inventory/Module_Inventory_Container.js

window.Module_Inventory_Container = function({ centerId, userId, showToast, setActiveModule }) {
    const { useState, useEffect, useRef } = React;
    const { InventoryHeader, InventoryStats, InventoryTable, InventoryProBanner, InventoryModal, InventoryAdjustModal } = window;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // 1. بيانات الجدول
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [stats, setStats] = useState({ total_items: 0, total_value: 0, low_stock: 0 });
    
    // 2. حالة البحث
    const [searchText, setSearchText] = useState('');
    const searchTimeoutRef = useRef(null);

    // 3. حالة نافذة إضافة/تعديل صنف
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const initialFormState = { id: null, part_name: '', sku: '', brand: '', location_in_store: '', stock_quantity: '', purchase_price: '', selling_price: '' };
    const [formData, setFormData] = useState(initialFormState);

    // 4. حالة نافذة تسوية الرصيد السريعة
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustData, setAdjustData] = useState({ id: null, part_name: '', current_qty: 0, adjust_type: 'add', amount: 1 });

    // ==========================================
    // دوال قاعدة البيانات (Dexie)
    // ==========================================
    const fetchStats = async () => {
        try {
            const allItems = await window.db.inventory_parts.toArray();
            let totalValue = 0, lowStockCount = 0;
            allItems.forEach(item => {
                totalValue += (Number(item.purchase_price) || 0) * (Number(item.stock_quantity) || 0);
                if (Number(item.stock_quantity) <= 5) lowStockCount++;
            });
            setStats({ total_items: allItems.length, total_value: totalValue, low_stock: lowStockCount });
        } catch (e) { console.error(e); }
    };

    const fetchItems = async (page = 1, search = searchText) => {
        setIsLoading(true);
        try {
            let allItems = await window.db.inventory_parts.reverse().toArray();
            if (search.trim() !== '') {
                const lowerSearch = search.toLowerCase();
                allItems = allItems.filter(item => 
                    item.part_name.toLowerCase().includes(lowerSearch) || 
                    (item.sku && item.sku.toLowerCase().includes(lowerSearch)) ||
                    (item.brand && item.brand.toLowerCase().includes(lowerSearch))
                );
            }
            const perPage = 4;
            const total = allItems.length;
            const last_page = Math.ceil(total / perPage) || 1;
            const paginatedItems = allItems.slice((page - 1) * perPage, page * perPage);

            setItems(paginatedItems); setPagination({ current_page: page, last_page, total });
        } catch (error) { 
            showToast("حدث خطأ في قراءة بيانات المخزن", "error"); 
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchStats(); fetchItems(1, ''); }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value; setSearchText(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => { fetchItems(1, val); }, 400);
    };

    const openAddModal = () => { setModalMode('add'); setFormData(initialFormState); setShowModal(true); };
    
    const openEditModal = (item) => {
        setModalMode('edit');
        setFormData({ id: item.id, part_name: item.part_name, sku: item.sku || '', brand: item.brand || '', location_in_store: item.location_in_store || '', stock_quantity: item.stock_quantity, purchase_price: item.purchase_price, selling_price: item.selling_price });
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            const now = new Date().toISOString();
            const payload = { part_name: formData.part_name, brand: formData.brand, location_in_store: formData.location_in_store, stock_quantity: Number(formData.stock_quantity), purchase_price: Number(formData.purchase_price), selling_price: Number(formData.selling_price), is_active: true };
            if (formData.sku && formData.sku.trim() !== '') { payload.sku = formData.sku.trim(); }

            if (modalMode === 'add') {
                payload.created_at = now.split('T')[0];
                await window.db.inventory_parts.add(payload);
                const newlyAddedItem = await window.db.inventory_parts.where('part_name').equals(payload.part_name).last();
                if(newlyAddedItem) {
                    await window.db.stock_movements.add({ part_id: newlyAddedItem.id, user_id: userId, movement_type: 'رصيد افتتاحي', quantity: payload.stock_quantity, created_at: now });
                }
                showToast("تمت إضافة القطعة للمخزن بنجاح", "success");
            } else {
                payload.updated_at = now;
                await window.db.inventory_parts.update(formData.id, payload);
                showToast("تم تحديث بيانات القطعة", "success");
            }
            setShowModal(false); fetchStats(); fetchItems(modalMode === 'add' ? 1 : pagination.current_page, searchText);
        } catch (e) { 
            if(e.name === "ConstraintError") { showToast("هذا الكود (SKU) مستخدم لقطعة أخرى بالفعل!", "error"); } 
            else { showToast("حدث خطأ أثناء الحفظ", "error"); }
        } finally { setIsUpdating(false); }
    };

    const openAdjustModal = (item) => {
        setAdjustData({ id: item.id, part_name: item.part_name, current_qty: item.stock_quantity, adjust_type: 'add', amount: 1 });
        setShowAdjustModal(true);
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            const currentItem = await window.db.inventory_parts.get(adjustData.id);
            if (!currentItem) throw new Error("القطعة غير موجودة");
            const adjustAmount = Number(adjustData.amount);
            let newQty = Number(currentItem.stock_quantity);

            if (adjustData.adjust_type === 'add') { newQty += adjustAmount; } 
            else {
                if (newQty < adjustAmount) { showToast("الكمية المسحوبة أكبر من الرصيد المتاح!", "error"); setIsUpdating(false); return; }
                newQty -= adjustAmount;
            }

            await window.db.inventory_parts.update(adjustData.id, { stock_quantity: newQty, updated_at: new Date().toISOString() });
            await window.db.stock_movements.add({ part_id: adjustData.id, user_id: userId, movement_type: adjustData.adjust_type === 'add' ? 'إضافة بضاعة (تسوية)' : 'سحب بضاعة (تسوية)', quantity: adjustAmount, created_at: new Date().toISOString() });

            showToast("تم تسوية الرصيد وتسجيل الحركة بنجاح", "success");
            setShowAdjustModal(false); fetchStats(); fetchItems(pagination.current_page, searchText);
        } catch (e) { showToast(e.message || "حدث خطأ أثناء التسوية", "error"); } finally { setIsUpdating(false); }
    };

    return (
        <div className="space-y-6 relative pb-10">
            <InventoryHeader searchText={searchText} handleSearchChange={handleSearchChange} openAddModal={openAddModal} />
            <InventoryStats stats={stats} />
            <InventoryTable 
                items={items} pagination={pagination} isLoading={isLoading} isUpdating={isUpdating}
                showModal={showModal} showAdjustModal={showAdjustModal} fetchItems={fetchItems}
                searchText={searchText} openAdjustModal={openAdjustModal} openEditModal={openEditModal}
            />
            <InventoryProBanner />
            {showModal && (
                <InventoryModal 
                    showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} 
                    formData={formData} setFormData={setFormData} handleFormSubmit={handleFormSubmit} isUpdating={isUpdating}
                />
            )}
            {showAdjustModal && (
                <InventoryAdjustModal 
                    showAdjustModal={showAdjustModal} setShowAdjustModal={setShowAdjustModal} 
                    adjustData={adjustData} setAdjustData={setAdjustData} handleAdjustSubmit={handleAdjustSubmit} isUpdating={isUpdating}
                />
            )}
        </div>
    );
};