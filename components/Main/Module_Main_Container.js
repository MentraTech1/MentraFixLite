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
        estimatedNetProfit: 0,  // الأرباح التشغيلية الحقيقية
        inventoryValue: 0,      // قيمة البضاعة المتبقية في المخزن
        active_jobs: 0, 
        total_customers: 0 
    });
    
    const [recentOrders, setRecentOrders] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
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
            const fromTime = new Date(dateFilter.from).getTime();
            const toTime = new Date(dateFilter.to).setHours(23, 59, 59, 999);

            const total_customers = await window.db.customers.count();

            // 1. إيرادات الصيانة المحصلة كاش خلال الفترة
            const allPayments = await window.db.payments.toArray();
            const revenue = allPayments.filter(p => {
                const pTime = new Date(p.payment_date || p.created_at).getTime();
                return pTime >= fromTime && pTime <= toTime;
            }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

            // 2. إيرادات المبيعات المباشرة (الكاشير POS خلال الفترة)
            let posSalesRevenue = 0;
            if (window.db.pos_invoices) {
                const allPosInvoices = await window.db.pos_invoices.toArray();
                posSalesRevenue = allPosInvoices.filter(inv => {
                    const invTime = new Date(inv.date || inv.created_at).getTime();
                    return invTime >= fromTime && invTime <= toTime;
                }).reduce((sum, inv) => sum + Number(inv.netAmount || inv.total_amount || 0), 0);
            }

            // 3. المصروفات التشغيلية العامة (استبعاد مشتريات البضاعة لمنع الازدواجية)
            const allExpenses = await window.db.expenses.toArray();
            const expensesAmount = allExpenses.filter(e => {
                const eTime = new Date(e.date || e.created_at).getTime(); 
                const inRange = eTime >= fromTime && eTime <= toTime;
                const isOperationalExpense = e.expense_type !== 'مشتريات بضاعة';
                return inRange && isOperationalExpense;
            }).reduce((sum, e) => sum + Number(e.amount || 0), 0);

            // 4. أوامر الشغل النشطة
            const allRequests = await window.db.maintenance_requests.toArray();
            const filteredRequests = allRequests.filter(r => {
                const rTime = new Date(r.created_at).getTime();
                return rTime >= fromTime && rTime <= toTime;
            });
            const closedStatuses = ['مكتمل', 'تم التسليم', 'ملغاة', 'مرفوض / لا يمكن إصلاحه'];
            const active_jobs = filteredRequests.filter(r => !closedStatuses.includes(r.status ? r.status.trim() : '')).length;

            // 5. تفنيد حركة المخزن والمشتريات باحترافية
            let totalPurchases = 0;
            let partsProfit = 0;
            let itemsIn = 0;
            let itemsOutMaintenance = 0;
            let itemsOutSales = 0;

            const allMovements = await window.db.stock_movements.toArray();
            const filteredMovements = allMovements.filter(m => {
                const mTime = new Date(m.created_at).getTime();
                return mTime >= fromTime && mTime <= toTime;
            });

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

                        // التصحيح المحاسبي: احتساب المشتريات النقدية الفعلية فقط التي خرجت من الدرج
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
            // أ) السيولة الفعلية المتبقية في الدرج (الكاش الفعلي في الصندوق):
            const cashInDrawer = (revenue + posSalesRevenue) - expensesAmount - totalPurchases;

            // ب) صافي الربح الحقيقي للنشاط (إيرادات الصيانة + أرباح بيع القطع - المصروفات):
            const estimatedNetProfit = (revenue + partsProfit) - expensesAmount;

            setStats({ 
                revenue, 
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
                } else { req.customer_name = 'عميل غير مسجل'; }

                if (req.device_id) {
                    const dev = await window.db.devices.get(Number(req.device_id));
                    req.device_type = dev ? dev.device_type : 'غير محدد';
                } else { req.device_type = 'غير محدد'; }
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

    useEffect(() => { fetchDashboardData(pagination.current_page); }, [dateFilter]);
    const handleDateChange = (e) => { setDateFilter({ ...dateFilter, [e.target.name]: e.target.value }); };

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