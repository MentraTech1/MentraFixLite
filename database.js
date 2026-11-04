// ============================================================================
// MentraFix Lite - Offline First Database Engine (Maintenance Centers)
// Powered by Dexie.js (IndexedDB Wrapper)
// ============================================================================

// 1. قاعدة البيانات الرئيسية (Master DB) - لتخزين مراكز الصيانة المسجلة على هذا الجهاز
window.masterDb = new Dexie("MentraFix_MasterDB");
window.masterDb.version(1).stores({
    centers: '++id, centerName, ownerName, phone, dbName, createdAt'
});

// متغير عالمي سيحمل قاعدة بيانات المركز النشط
window.db = null;

// 2. دالة تشفير كلمات المرور (للحماية المحلية)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 3. دالة تهيئة وفتح قاعدة بيانات مركز معين
window.initCenterDB = async function(dbName) {
    if (window.db) {
        window.db.close();
    }
    
    window.db = new Dexie(dbName);
    
    // تصميم الجداول الخاصة بنظام الصيانة (Schema) - الإصدار الأول (القديم لم يمس)
    window.db.version(1).stores({
        // إعدادات المركز
        center_info: '++id, name, center_type, status',
        
        // المستخدمين (مدير، فني، استقبال)
        users: '++id, name, phone, password, role, is_active,security_key',
        
        // العملاء والأجهزة
        customers: '++id, name, phone, customer_type, created_at',
        devices: '++id, customer_id, device_type, brand, model, serial_number, warranty_status',
        
        // ================= Maintenance Engine (نظام ورشة الصيانة) =================
        // أوامر الشغل
        maintenance_requests: '++id, customer_id, device_id, technician_id, maintenance_type, status, scheduled_date, created_at',
        
        // المخزن ودليل الخدمات
        service_catalog: '++id, type, name, price', // خدمات ومصنعيات
        inventory_parts: '++id, &sku, part_name, brand, stock_quantity, price, is_active', // قطع الغيار
        used_items: '++id, request_id, item_type, part_id, service_id, quantity, created_at', // القطع المستهلكة في أمر شغل
        stock_movements: '++id, part_id, user_id, movement_type, quantity, created_at', // حركات المخزن
        
        // ================= Financial Engine (نظام الحسابات والماليات) =================
        invoices: '++id, invoice_number, customer_id, request_id, total_amount, status, created_at',
        payments: '++id, invoice_id, amount, payment_method, payment_date',
        expenses: '++id, expense_type, amount, date, description'
    });

    // ================= الإضافة الجديدة (الإصدار الثاني) =================
    // تمت إضافة جداول المبيعات المباشرة (الكاشير) مع الحفاظ على القديم
    window.db.version(2).stores({
        pos_invoices: '++id, invoice_number, date, totalAmount, discount, netAmount, profit, userId',
        pos_items: '++id, invoiceId, part_id, qtySold, sellPrice'
    });

    await window.db.open();
};

// ============================================================================
// كائن الاستعلامات (CenterQueries) - يحتوي على كافة دوال التعامل مع البيانات
// ============================================================================
window.CenterQueries = {
    
    // --- 1. المصادقة وتأسيس المركز ---
    
    createCenter: async (centerName, ownerName, phone, password) => {
        const dbName = `MentraFix_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const hashedPassword = await hashPassword(password);
        
        // حفظ في الـ Master
        const centerId = await window.masterDb.centers.add({
            centerName, ownerName, phone, dbName, createdAt: new Date().toISOString()
        });
        
        // تهيئة الفرع الجديد
        await window.initCenterDB(dbName);
        
        await window.db.center_info.add({ name: centerName, center_type: 'مركز صيانة عام', status: 'نشط' });
        
        // إنشاء حساب المدير
        const userId = await window.db.users.add({
            name: ownerName, phone, password: hashedPassword, role: 'admin', is_active: true
        });

        // إضافة بيانات تجريبية للمخزن لتسهيل البداية
        await window.db.service_catalog.bulkAdd([
            { type: 'مصنعية', name: 'فحص وصيانة عامة', price: 150 },
            { type: 'مصنعية', name: 'تغيير شاشة', price: 200 },
            { type: 'مصنعية', name: 'سوفت وير', price: 100 }
        ]);

        return { centerId, userId, dbName };
    },

    login: async (dbName, phone, password) => {
        const hashedPassword = await hashPassword(password);
        
        const center = await window.masterDb.centers.where('dbName').equals(dbName).first();
        if (!center) throw new Error("بيانات المركز غير موجودة");

        await window.initCenterDB(dbName);
        const user = await window.db.users.where('phone').equals(phone).first();
        
        if (!user) throw new Error("رقم الهاتف غير مسجل");
        if (!user.is_active) throw new Error("هذا الحساب موقوف، راجع الإدارة");
        if (user.password !== hashedPassword) throw new Error("كلمة المرور غير صحيحة");

        return { user, center, dbName };
    },

    // --- 2. إدارة العملاء والأجهزة (Customers & Devices) ---

    addCustomerWithDevice: async (name, phone, deviceData) => {
        return await window.db.transaction('rw', window.db.customers, window.db.devices, async () => {
            const customerId = await window.db.customers.add({
                name, phone, customer_type: 'عادي', created_at: new Date().toISOString()
            });

            const deviceId = await window.db.devices.add({
                customer_id: customerId,
                device_type: deviceData.type,
                brand: deviceData.brand,
                model: deviceData.model,
                serial_number: deviceData.serial || "",
                warranty_status: deviceData.warranty || "منتهي"
            });

            return { customerId, deviceId };
        });
    },

    // --- 3. نظام أوامر الشغل والمخزن (Maintenance & Inventory Engine) ---

    createMaintenanceRequest: async (customerId, deviceId, maintenanceType) => {
        return await window.db.maintenance_requests.add({
            customer_id: customerId,
            device_id: deviceId,
            maintenance_type: maintenanceType,
            status: 'قيد الفحص',
            created_at: new Date().toISOString()
        });
    },

    addItemsToRequest: async (requestId, itemsList, userId) => {
        return await window.db.transaction('rw', window.db.used_items, window.db.inventory_parts, window.db.stock_movements, async () => {
            for (let item of itemsList) {
                await window.db.used_items.add({
                    request_id: requestId,
                    item_type: item.type,
                    part_id: item.type === 'part' ? item.id : null,
                    service_id: item.type === 'service' ? item.id : null,
                    quantity: item.qty,
                    created_at: new Date().toISOString()
                });

                if (item.type === 'part') {
                    const part = await window.db.inventory_parts.get(item.id);
                    if (part.stock_quantity < item.qty) throw new Error(`الكمية غير كافية لقطعة: ${part.part_name}`);
                    
                    await window.db.inventory_parts.update(item.id, {
                        stock_quantity: part.stock_quantity - item.qty
                    });

                    await window.db.stock_movements.add({
                        part_id: item.id,
                        user_id: userId,
                        movement_type: 'سحب لصيانة',
                        quantity: item.qty,
                        created_at: new Date().toISOString()
                    });
                }
            }
        });
    },

    // --- 4. الحسابات والماليات (Financial Engine) ---

    finishRequestAndCreateInvoice: async (requestId, customerId, totalAmount) => {
        return await window.db.transaction('rw', window.db.maintenance_requests, window.db.invoices, async () => {
            await window.db.maintenance_requests.update(requestId, { status: 'تم التسليم' });

            const invoiceId = await window.db.invoices.add({
                invoice_number: `INV-${Date.now()}`,
                customer_id: customerId,
                request_id: requestId,
                total_amount: parseFloat(totalAmount),
                status: 'غير مدفوعة',
                created_at: new Date().toISOString().split('T')[0]
            });

            return invoiceId;
        });
    },

    payInvoice: async (invoiceId, amount, paymentMethod) => {
        return await window.db.transaction('rw', window.db.invoices, window.db.payments, async () => {
            await window.db.invoices.update(invoiceId, { status: 'مدفوعة' });
            
            await window.db.payments.add({
                invoice_id: invoiceId,
                amount: parseFloat(amount),
                payment_method: paymentMethod,
                payment_date: new Date().toISOString().split('T')[0]
            });
        });
    },

    addExpense: async (amount, expenseType, description, dateStr) => {
        return await window.db.expenses.add({
            expense_type: expenseType,
            amount: parseFloat(amount),
            date: dateStr || new Date().toISOString().split('T')[0],
            description: description || ""
        });
    },

    getFinancialSummary: async (startDateStr, endDateStr) => {
        const payments = await window.db.payments
            .where('payment_date').between(startDateStr, endDateStr, true, true).toArray();
        
        const expenses = await window.db.expenses
            .where('date').between(startDateStr, endDateStr, true, true).toArray();

        let totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
        let totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            paymentsList: payments,
            expensesList: expenses
        };
    },

    // --- 5. نظام المبيعات المباشرة (POS Engine) ---
    // الدالة المسئولة عن حفظ فاتورة البيع المباشر بضمان خصم المخزن
    processPosSale: async (userId, cartItems, discount, totalAmount, netAmount, netProfit) => {
        return await window.db.transaction('rw', window.db.pos_invoices, window.db.pos_items, window.db.inventory_parts, window.db.stock_movements, async () => {
            // 1. إنشاء الفاتورة
            const invoiceId = await window.db.pos_invoices.add({
                invoice_number: `POS-${Date.now()}`,
                date: new Date().toISOString(),
                totalAmount: totalAmount,
                discount: discount,
                netAmount: netAmount,
                profit: netProfit,
                userId: userId
            });

            // 2. إضافة الأصناف وخصمها من المخزن
            for (let item of cartItems) {
                await window.db.pos_items.add({
                    invoiceId: invoiceId,
                    part_id: item.itemId, // رقم القطعة من جدول المخزن
                    qtySold: item.qtySold,
                    sellPrice: item.sellPrice
                });
                
                const part = await window.db.inventory_parts.get(item.itemId);
                
                // 3. خصم الرصيد
                await window.db.inventory_parts.update(part.id, {
                    stock_quantity: part.stock_quantity - item.qtySold
                });

                // 4. تسجيل العملية في حركات المخزن (مهم جداً للمراجعة)
                await window.db.stock_movements.add({
                    part_id: part.id,
                    user_id: userId,
                    movement_type: 'بيع مباشر (POS)',
                    quantity: item.qtySold,
                    created_at: new Date().toISOString()
                });
            }
            
            return invoiceId;
        });
    }
};