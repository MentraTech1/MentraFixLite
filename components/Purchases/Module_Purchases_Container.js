// المسار: components/Purchases/Module_Purchases_Container.js

window.Module_Purchases_Container = function({ userId, showToast }) {
    const { useState, useEffect, useRef, useMemo } = React;
    const { PurchasesHeader, PurchasesStats, PurchasesTable, PurchasesProBanner, PurchaseModal } = window;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // 1. البيانات والإحصائيات الذكية
    const [smartStats, setSmartStats] = useState({
        total_purchases_cost: 0,
        items_in: 0,
        items_out: 0,
        net_flow: 0,            // صافي الحركة (وارد - منصرف)
        movements_count: 0,     // إجمالي عدد العمليات
        daily_avg_out: 0        // متوسط الصرف اليومي خلال الفترة
    });
    
    const [movements, setMovements] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total_records: 0 });
    
    // 2. نظام التبويبات (Tabs)
    const [activeTab, setActiveTab] = useState('ALL');
    const [availableTypes, setAvailableTypes] = useState([]);
    const [typeCounts, setTypeCounts] = useState({});

    // 3. دوال التاريخ المحلي (Local Date) لمنع مشاكل الـ Timezone
    const getFirstDayOfMonth = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };

    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [tableSearch, setTableSearch] = useState('');
    const tableSearchTimeoutRef = useRef(null);
    const [dateFilter, setDateFilter] = useState({ from: getFirstDayOfMonth(), to: getTodayString() });

    // 4. حالة نافذة المشتريات
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);
    const purchaseSearchTimeoutRef = useRef(null);
    const [purchaseForm, setPurchaseForm] = useState({ quantity: 1, unit_price: '', add_to_expenses: true });

    // توحيد صيغة التاريخ للمقارنة (YYYY-MM-DD)
    const normalizeDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        const s = String(val).trim();
        if (s.includes('T')) return s.split('T')[0];
        if (s.includes(' ')) return s.split(' ')[0];
        return s.substring(0, 10);
    };

    // ==========================================
    // دوال الحسابات والإحصائيات الذكية (من - إلى)
    // ==========================================
    const calculateSmartStats = (periodMovements, expenses, partsMap) => {
        let inQty = 0;
        let outQty = 0;
        let movementsTotalCost = 0;

        periodMovements.forEach(m => {
            const type = String(m.movement_type || '');
            const isAdd = type.includes('وارد') || type.includes('شراء') || type.includes('إضافة') || type.includes('افتتاحي');
            const qty = Number(m.quantity) || 0;

            if (isAdd) {
                inQty += qty;

                // 1. حساب التكلفة بتدرج ذكي:
                // أ) التكلفة الإجمالية المسجلة في الحركة
                // ب) أو (الكمية × سعر الوحدة للحركة)
                // ج) أو (الكمية × سعر شراء الصنف الأصلي في المخزن)
                let cost = 0;
                if (m.total_cost !== undefined && m.total_cost !== null && !isNaN(Number(m.total_cost)) && Number(m.total_cost) > 0) {
                    cost = Number(m.total_cost);
                } else if (m.unit_price && !isNaN(Number(m.unit_price)) && Number(m.unit_price) > 0) {
                    cost = qty * Number(m.unit_price);
                } else if (partsMap && partsMap.has(m.part_id)) {
                    const part = partsMap.get(m.part_id);
                    const pPrice = Number(part?.purchase_price || 0);
                    if (pPrice > 0) cost = qty * pPrice;
                }

                movementsTotalCost += cost;
            } else {
                outQty += qty;
            }
        });

        // احتساب المصروفات المرتبطة بالفترة من - إلى
        const periodExpenses = (expenses || []).filter(e => {
            const eDate = normalizeDate(e.date || e.created_at);
            const type = String(e.expense_type || '');
            const desc = String(e.description || '');
            const isPurchaseExpense = type.includes('مشتريات') || type.includes('بضاعة') || desc.includes('شراء');
            return eDate >= dateFilter.from && eDate <= dateFilter.to && isPurchaseExpense;
        }).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        // عدد الأيام لحساب متوسط الصرف اليومي
        const dFrom = new Date(dateFilter.from);
        const dTo = new Date(dateFilter.to);
        const diffDays = Math.max(1, Math.ceil(Math.abs(dTo - dFrom) / (1000 * 60 * 60 * 24)) + 1);

        // التكلفة النهائية: نعتمد تكلفة حركات الوارد، وإذا لم تكن متوفرة نأخذ من فواتير المصروفات
        const finalPurchasesCost = movementsTotalCost > 0 ? movementsTotalCost : periodExpenses;

        setSmartStats({
            total_purchases_cost: finalPurchasesCost,
            items_in: inQty,
            items_out: outQty,
            net_flow: inQty - outQty,
            movements_count: periodMovements.length,
            daily_avg_out: Number((outQty / diffDays).toFixed(1))
        });
    };

    // ==========================================
    // قراءة ومعالجة البيانات مع التبويبات والفلترة
    // ==========================================
    const fetchMovements = async (page = 1, searchStr = tableSearch, tab = activeTab) => {
        setIsLoading(true);
        try {
            const allMovements = await window.db.stock_movements.reverse().toArray();
            const expenses = await window.db.expenses ? await window.db.expenses.toArray() : [];
            const allParts = await window.db.inventory_parts ? await window.db.inventory_parts.toArray() : [];
            const partsMap = new Map(allParts.map(p => [p.id, p]));

            // 1. استخراج أنواع الحركات ديناميكياً
            const uniqueTypes = Array.from(new Set(allMovements.map(m => m.movement_type).filter(Boolean)));
            setAvailableTypes(uniqueTypes);

            // 2. الفلترة التاريخية الدقيقة (من - إلى)
            const periodMovements = allMovements.filter(m => {
                const mDate = normalizeDate(m.created_at);
                return mDate >= dateFilter.from && mDate <= dateFilter.to;
            });

            // 3. حساب الإحصائيات الذكية
            calculateSmartStats(periodMovements, expenses, partsMap);

            // 4. أعداد التبويبات
            const counts = { ALL: periodMovements.length };
            uniqueTypes.forEach(t => {
                counts[t] = periodMovements.filter(m => m.movement_type === t).length;
            });
            setTypeCounts(counts);

            // 5. فلترة التبويب المحدد
            let filteredByTab = periodMovements;
            if (tab !== 'ALL') {
                filteredByTab = periodMovements.filter(m => m.movement_type === tab);
            }

            // 6. تجهيز السجلات للعرض مع حساب التكلفة التلقائية لكل صف
            let enrichedMovements = [];
            for (let m of filteredByTab) {
                const part = partsMap.get(m.part_id);
                const user = m.user_id && window.db.users ? await window.db.users.get(m.user_id) : null;
                const type = String(m.movement_type || '');
                const isAdd = type.includes('وارد') || type.includes('شراء') || type.includes('إضافة') || type.includes('افتتاحي');

                // احتساب تكلفة الصف إذا كانت مفقودة لعرضها بالجدول
                let rowCost = Number(m.total_cost);
                if (!rowCost || isNaN(rowCost) || rowCost <= 0) {
                    if (part && Number(part.purchase_price) > 0) {
                        rowCost = (Number(m.quantity) || 0) * Number(part.purchase_price);
                    } else {
                        rowCost = 0;
                    }
                }

                enrichedMovements.push({
                    ...m,
                    total_cost: rowCost,
                    part_name: part ? part.part_name : 'قطعة محذوفة',
                    sku: part && part.sku ? part.sku : '',
                    user_name: user ? user.name : 'النظام',
                    is_in: isAdd
                });
            }

            // 7. فلترة البحث النصي
            if (searchStr.trim() !== '') {
                const lowerSearch = searchStr.toLowerCase();
                enrichedMovements = enrichedMovements.filter(m => 
                    m.part_name.toLowerCase().includes(lowerSearch) || 
                    m.sku.toLowerCase().includes(lowerSearch) || 
                    (m.movement_type && m.movement_type.toLowerCase().includes(lowerSearch))
                );
            }

            const perPage = 3;
            const total = enrichedMovements.length;
            const last_page = Math.ceil(total / perPage) || 1;
            const paginatedItems = enrichedMovements.slice((page - 1) * perPage, page * perPage);

            setMovements(paginatedItems);
            setPagination({ current_page: page, last_page, total_records: total });
        } catch (error) { 
            showToast("حدث خطأ في قراءة الحركات", "error"); 
            console.error(error);
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { 
        fetchMovements(1, tableSearch, activeTab); 
    }, [dateFilter.from, dateFilter.to]); 

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        fetchMovements(1, tableSearch, newTab);
    };

    const applyDateFilter = () => fetchMovements(1, tableSearch, activeTab);

    const handleTableSearchChange = (e) => {
        const val = e.target.value; 
        setTableSearch(val);
        if (tableSearchTimeoutRef.current) clearTimeout(tableSearchTimeoutRef.current);
        tableSearchTimeoutRef.current = setTimeout(() => { 
            fetchMovements(1, val, activeTab); 
        }, 400);
    };

    const handlePurchaseSearch = async (e) => {
        const val = e.target.value; 
        setSearchKeyword(val); 
        setSelectedPart(null); 
        if (purchaseSearchTimeoutRef.current) clearTimeout(purchaseSearchTimeoutRef.current);
        if(val.length < 1) { setSearchResults([]); return; }
        purchaseSearchTimeoutRef.current = setTimeout(async () => {
            try {
                const lowerVal = val.toLowerCase();
                const parts = await window.db.inventory_parts.filter(p => p.part_name.toLowerCase().includes(lowerVal) || (p.sku && p.sku.toLowerCase().includes(lowerVal))).toArray();
                setSearchResults(parts.slice(0, 8));
            } catch (error) { console.error(error); }
        }, 300);
    };

    const selectPart = (part) => {
        setSelectedPart(part); 
        setSearchKeyword(part.part_name); 
        setSearchResults([]); 
        setPurchaseForm({ ...purchaseForm, unit_price: part.purchase_price || '' }); 
    };

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();
        if(!selectedPart) { showToast("الرجاء اختيار القطعة أولاً", "error"); return; }
        setIsUpdating(true);
        try {
            const qty = Number(purchaseForm.quantity) || 1;
            const price = Number(purchaseForm.unit_price) || Number(selectedPart.purchase_price) || 0;
            const totalCost = qty * price;
            const now = new Date().toISOString();
            
            await window.db.transaction('rw', window.db.inventory_parts, window.db.stock_movements, window.db.expenses, async () => {
                const part = await window.db.inventory_parts.get(selectedPart.id);
                await window.db.inventory_parts.update(part.id, { 
                    stock_quantity: Number(part.stock_quantity || 0) + qty, 
                    purchase_price: price > 0 ? price : part.purchase_price, 
                    updated_at: now 
                });
                await window.db.stock_movements.add({ 
                    part_id: part.id, 
                    user_id: userId, 
                    movement_type: 'شراء بضاعة (وارد)', 
                    quantity: qty, 
                    unit_price: price,
                    total_cost: totalCost, 
                    created_at: now 
                });
                if (purchaseForm.add_to_expenses && totalCost > 0) {
                    await window.db.expenses.add({ 
                        expense_type: 'مشتريات بضاعة', 
                        amount: totalCost, 
                        date: now.split('T')[0], 
                        description: `شراء قطعة: ${part.part_name} - كمية: ${qty}` 
                    });
                }
            });
            showToast("تم توريد البضاعة بنجاح", "success");
            setShowPurchaseModal(false); 
            setSearchKeyword(''); 
            setSelectedPart(null);
            fetchMovements(1, tableSearch, activeTab);
        } catch (e) { 
            console.error("Purchase Submit Error:", e);
            showToast("حدث خطأ أثناء حفظ الشراء", "error"); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    return (
        <div className="space-y-6 relative pb-10">
            <PurchasesHeader setShowPurchaseModal={setShowPurchaseModal} setSelectedPart={setSelectedPart} setSearchKeyword={setSearchKeyword} />
            
            {/* الإحصائيات الذكية المرتبطة بفترة التواريخ */}
            <PurchasesStats stats={smartStats} dateFilter={dateFilter} />
            
            {/* جدول الحركات مع التبويبات */}
            <PurchasesTable 
                movements={movements} 
                pagination={pagination} 
                isLoading={isLoading} 
                tableSearch={tableSearch} 
                handleTableSearchChange={handleTableSearchChange}
                dateFilter={dateFilter} 
                setDateFilter={setDateFilter} 
                applyDateFilter={applyDateFilter}
                fetchMovements={(p) => fetchMovements(p, tableSearch, activeTab)}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                availableTypes={availableTypes}
                typeCounts={typeCounts}
            />
            
            <PurchasesProBanner />

            {showPurchaseModal && (
                <PurchaseModal 
                    setShowPurchaseModal={setShowPurchaseModal} searchKeyword={searchKeyword} handlePurchaseSearch={handlePurchaseSearch}
                    searchResults={searchResults} selectedPart={selectedPart} selectPart={selectPart}
                    purchaseForm={purchaseForm} setPurchaseForm={setPurchaseForm} handlePurchaseSubmit={handlePurchaseSubmit}
                    setSearchKeyword={setSearchKeyword} setSelectedPart={setSelectedPart} isUpdating={isUpdating}
                />
            )}
        </div>
    );
};