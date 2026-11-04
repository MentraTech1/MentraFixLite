// المسار: components/Main/Module_Main_Container.js
window.Module_Main_Container = function(props) {
    const { centerId, userId, showToast, setActiveModule } = props;
    const { useState, useEffect } = React;
    const { MainWelcomeHeader, MainQuickStats, MainInventoryStats, MainRecentOrdersTable, MainProBanner } = window;

    const [isLoading, setIsLoading] = useState(true);
    
    const [stats, setStats] = useState({ 
        revenue: 0, 
        posSalesRevenue: 0, 
        expenses: 0, 
        totalPurchases: 0, 
        cashInDrawer: 0,        // السيولة في الدرج
        estimatedNetProfit: 0,  // الأرباح التشغيلية
        inventoryValue: 0,      // قيمة البضاعة في المخزن
        active_jobs: 0, 
        total_customers: 0 
    });
    
    const [recentOrders, setRecentOrders] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    
    // دالة استخراج التاريخ النصي الموحد YYYY-MM-DD تماماً مثل صفحة الحسابات
    const safeDate = (d) => {
        if (!d) return '';
        try {
            return String(d).split('T')[0].split(' ')[0];
        } catch(e) {
            return '';
        }
    };

    const today = safeDate(new Date().toISOString());
    // بداية الشهر الحالي كافتراضي
    const firstDay = safeDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
    const [dateFilter, setDateFilter] = useState({ from: firstDay, to: today });
    
    const [invStats, setInvStats] = useState({ 
        totalPurchases: 0, partsProfit: 0, totalPartsInStock: 0, 
        itemsIn: 0, itemsOutMaintenance: 0, itemsOutSales: 0, itemsOut: 0 
    });

    const sessionStr = localStorage.getItem('MentraFix_Session');
    const sessionData = sessionStr ? JSON.parse(sessionStr) : { name: 'يا باشمهندس' };

    const fetchDashboardData = async (page = 1) => {
        setIsLoading(true);
        try {
            const { from, to } = dateFilter;

            // دالة التحقق من مطابقة النطاق الزمني
            const isDateInRange = (rawDate) => {
                const itemDate = safeDate(rawDate);
                if (!itemDate) return true; // إذا لم يوجد تاريخ يُحسب لعدم التضييع
                if (from && itemDate < from) return false;
                if (to && itemDate > to) return false;
                return true;
            };

            const total_customers = await window.db.customers.count();

            // 1. إيرادات فواتير الصيانة (تماماً كما تُحسب في Finances_InvoicesTab)
            let maintenanceRevenue = 0;
            if (window.db.invoices) {
                const allInvoices = await window.db.invoices.toArray();
                maintenanceRevenue = allInvoices.filter(inv => {
                    const invDate = inv.created_at || inv.date;
                    const inRange = isDateInRange(invDate);
                    const isPaid = inv.status === 'مدفوعة';
                    return inRange && isPaid;
                }).reduce((sum, inv) => {
                    const amount = Number(inv.final_amount !== undefined ? inv.final_amount : inv.total_amount) || 0;
                    return sum + amount;
                }, 0);
            }

            // 2. إيرادات المبيعات المباشرة (تماماً كما تُحسب في Finances_PosTab)
            let posSalesRevenue = 0;
            if (window.db.pos_invoices) {
                const allPosInvoices = await window.db.pos_invoices.toArray();
                posSalesRevenue = allPosInvoices.filter(sale => {
                    const saleDate = sale.date || sale.created_at;
                    return isDateInRange(saleDate);
                }).reduce((sum, sale) => {
                    const amount = Number(sale.netAmount !== undefined ? sale.netAmount : sale.total_amount) || 0;
                    return sum + amount;
                }, 0);
            }

            // 3. المصروفات التشغيلية (من جدول expenses)
            let expensesAmount = 0;
            if (window.db.expenses) {
                const allExpenses = await window.db.expenses.toArray();
                expensesAmount = allExpenses.filter(e => {
                    const eDate = e.date || e.created_at;
                    const inRange = isDateInRange(eDate);
                    const isOperational = e.expense_type !== 'مشتريات بضاعة';
                    return inRange && isOperational;
                }).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            }

            // 4. أوامر الشغل النشطة
            const allRequests = await window.db.maintenance_requests.toArray();
            const filteredRequests = allRequests.filter(r => isDateInRange(r.created_at || r.receipt_date));
            const closedStatuses = ['مكتمل', 'تم التسليم', 'ملغاة', 'مرفوض / لا يمكن إصلاحه'];
            const active_jobs = filteredRequests.filter(r => !closedStatuses.includes(r.status ? r.status.trim() : '')).length;

            // 5. تقرير المخزن، المشتريات، وحركة القطع
            let totalPurchases = 0;
            let partsProfit = 0;
            let itemsIn = 0;
            let itemsOutMaintenance = 0;
            let itemsOutSales = 0;

            const allMovements = await window.db.stock_movements.toArray();
            const filteredMovements = allMovements.filter(m => isDateInRange(m.created_at));

            const allParts = await window.db.inventory_parts.toArray();
            const partsMap = {};
            let inventoryValue = 0;
            allParts.forEach(p => {
                partsMap[String(p.id)] = p;
                const cost = Number(p.purchase_price || p.cost_price || 0);
                inventoryValue += (cost * Number(p.stock_quantity || 0));
            });

            filteredMovements.forEach(m => {
                const qty = Number(m.quantity || 0);
                const part = partsMap[String(m.part_id)];

                if (part) {
                    const cost = Number(part.purchase_price || part.cost_price || 0); 
                    const price = Number(part.selling_price || part.price || 0);
                    const moveType = String(m.movement_type || '');

                    // المرتجعات
                    if (moveType.includes('إرجاع') || moveType.includes('استرجاع') || moveType.includes('إلغاء')) {
                        if (moveType.includes('مبيعات') || moveType.includes('بيع') || moveType.includes('POS')) {
                            itemsOutSales -= qty;
                        } else {
                            itemsOutMaintenance -= qty;
                        }
                        partsProfit -= (qty * (price - cost));
                    } 
                    // مبيعات الصالة
                    else if (moveType.includes('مبيعات') || moveType.includes('بيع') || moveType.includes('POS')) {
                        itemsOutSales += qty;
                        partsProfit += (qty * (price - cost));
                    }
                    // مسحوبات ورشة الصيانة
                    else if (moveType.includes('سحب') || moveType.includes('منصرف') || moveType.includes('صيانة')) {
                        itemsOutMaintenance += qty;
                        partsProfit += (qty * (price - cost));
                    } 
                    // حركات الوارد (المخزن)
                    else {
                        itemsIn += qty;

                        // مشتريات نقدية فعلية فقط (دون الرصيد الافتتاحي أو التسوية الجردية)
                        const isActualPurchase = (moveType.includes('شراء') || moveType.includes('وارد') || moveType.includes('توريد')) 
                                              && !moveType.includes('افتتاحي') 
                                              && !moveType.includes('تسوية');

                        if (isActualPurchase) {
                            const movementCost = Number(m.total_cost) || (qty * cost);
                            totalPurchases += movementCost;
                        }
                    }
                }
            });

            itemsOutMaintenance = Math.max(0, itemsOutMaintenance);
            itemsOutSales = Math.max(0, itemsOutSales);
            itemsIn = Math.max(0, itemsIn);
            const totalItemsOut = itemsOutMaintenance + itemsOutSales;
            const totalPartsInStock = allParts.reduce((sum, item) => sum + Number(item.stock_quantity || 0), 0);

            // 6. المعادلات المالية الدقيقة:
            // أ) السيولة الفعلية المتبقية في الدرج (كاش الصيانة + كاش المبيعات - المصروفات - المشتريات):
            const cashInDrawer = (maintenanceRevenue + posSalesRevenue) - expensesAmount - totalPurchases;

            // ب) صافي الربح الحقيقي:
            const estimatedNetProfit = (maintenanceRevenue + partsProfit) - expensesAmount;

            setStats({ 
                revenue: maintenanceRevenue, 
                posSalesRevenue,
                expenses: expensesAmount, 
                totalPurchases, 
                cashInDrawer,
                estimatedNetProfit,
                inventoryValue,
                active_jobs, 
                total_customers 
            });

            setInvStats({ 
                totalPurchases, 
                partsProfit, 
                totalPartsInStock, 
                itemsIn, 
                itemsOutMaintenance, 
                itemsOutSales, 
                itemsOut: totalItemsOut 
            });

            // 7. جدول أحدث أوامر الشغل
            const perPage = 3;
            let sortedRequests = filteredRequests.sort((a, b) => b.id - a.id);
            const total = sortedRequests.length;
            const last_page = Math.ceil(total / perPage) || 1;
            const paginatedRequests = sortedRequests.slice((page - 1) * perPage, page * perPage);

            for (let req of paginatedRequests) {
                if (req.customer_id) {
                    const cust = await window.db.customers.get(Number(req.customer_id));
                    req.customer_name = cust ? cust.name : 'عميل غير مسجل';
                } else { 
                    req.customer_name = 'عميل غير مسجل'; 
                }

                if (req.device_id) {
                    const dev = await window.db.devices.get(Number(req.device_id));
                    req.device_type = dev ? dev.device_type : 'غير محدد';
                } else { 
                    req.device_type = 'غير محدد'; 
                }
            }

            setRecentOrders(paginatedRequests);
            setPagination({ current_page: page, last_page });

        } catch (error) {
            console.error(error);
            showToast("حدث خطأ في تجميع بيانات اللوحة", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchDashboardData(pagination.current_page); 
    }, [dateFilter]);

    const handleDateChange = (e) => { 
        setDateFilter({ ...dateFilter, [e.target.name]: e.target.value }); 
    };

    if (isLoading && recentOrders.length === 0 && stats.revenue === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <i className="fas fa-circle-notch fa-spin text-4xl text-cyan-500 mb-4"></i>
                <p className="font-bold">جاري تجميع البيانات المالية...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pb-10">
            <MainWelcomeHeader sessionData={sessionData} setActiveModule={setActiveModule} />
            
            <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 animate-view">
                <div className="flex items-center gap-3 text-slate-800 font-black">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl shadow-inner">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div>
                        <h3 className="text-lg">التقرير المالي الشامل</h3>
                        <p className="text-[10px] text-slate-400 font-bold">تغيير التاريخ يطبق على المركز بالكامل</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full sm:w-auto justify-center shadow-inner">
                    <input type="date" name="from" value={dateFilter.from} onChange={handleDateChange} className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500 w-full sm:w-auto transition-colors" />
                    <span className="text-slate-400 font-black">إلى</span>
                    <input type="date" name="to" value={dateFilter.to} onChange={handleDateChange} className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500 w-full sm:w-auto transition-colors" />
                </div>
            </div>

            <MainQuickStats stats={stats} />
            <MainInventoryStats invStats={invStats} isLoading={isLoading} />
            <MainRecentOrdersTable recentOrders={recentOrders} pagination={pagination} isLoading={isLoading} fetchDashboardData={fetchDashboardData} />
            <MainProBanner />
        </div>
    );
};