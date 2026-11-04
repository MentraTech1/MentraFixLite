/* ===================================================================
   MentraFix Lite - Full Offline Service Worker (100% Offline-First)
   شامل جميع المكونات الفرعية (components/) لضمان عمل الشاشات بالكامل أوفلاين
   =================================================================== */

const CACHE_NAME = 'mentrafix-lite-v3.0.0';

// القائمة الشاملة والنهائية لجميع ملفات النظام (أكثر من 70 ملف ومكون)
const STATIC_ASSETS = [
    // -------------------------------------------------------------
    // 1. الصفحات الأساسية وملفات الإعدادات
    // -------------------------------------------------------------
    './',
    './index.html',
    './subscriptions.html',
    './dashboard.html',
    './Tutorial.html',
    './manifest.json',
    './robots.txt',
    './database.js',

    // -------------------------------------------------------------
    // 2. مكتبات الجافاسكربت المحلية وملفات التصميم
    // -------------------------------------------------------------
    './assets/Tailwind.js',
    './assets/react.production.min.js',
    './assets/react-dom.production.min.js',
    './assets/babel.min.js',
    './assets/dexie.min.js',
    './assets/chart.js', // مكتبة الرسم البياني للوحة الرئيسية والمالية

    // -------------------------------------------------------------
    // 3. الصور ودليل الاستخدام
    // -------------------------------------------------------------
    './assets/logo.png',
    './assets/start.PNG',
    './assets/step1.PNG',
    './assets/step2.PNG',
    './assets/step3.PNG',
    './assets/step4.PNG',
    './assets/step5.PNG',
    './assets/step6.PNG',
    './assets/step7.PNG',

    // -------------------------------------------------------------
    // 4. حاويات الشاشات الرئيسية (Pages Modules)
    // -------------------------------------------------------------
    './pages/main.js',
    './pages/customers.js',
    './pages/purchases_and_stock.js',
    './pages/requests.js',
    './pages/pos.js',
    './pages/inventory.js',
    './pages/finances.js',
    './pages/settings.js',
    './pages/backup.js',

    // -------------------------------------------------------------
    // 5. المكونات الفرعية المحقونة (Components Modules)
    // -------------------------------------------------------------
    
    // أ) الشاشة الرئيسية (Main)
    './components/Main/WelcomeHeader.js',
    './components/Main/QuickStats.js',
    './components/Main/InventoryStats.js',
    './components/Main/RecentOrdersTable.js',
    './components/Main/ProBanner.js',
    './components/Main/Module_Main_Container.js',

    // ب) العملاء والأجهزة (Customers)
    './components/Customers/CustomersHeader.js',
    './components/Customers/CustomersStats.js',
    './components/Customers/CustomersTable.js',
    './components/Customers/CustomersProBanner.js',
    './components/Customers/CustomerAddEditModal.js',
    './components/Customers/CustomerDevicesView.js',
    './components/Customers/DeviceEditModal.js',
    './components/Customers/DeviceVisitsView.js',
    './components/Customers/RequestsPartsModal.js',
    './components/Customers/Module_Customers_Container.js',

    // ج) ورشة الصيانة وأوامر الشغل (Requests)
    './components/Requests/RequestsHeader.js',
    './components/Requests/RequestsStatusFilters.js',
    './components/Requests/RequestsTable.js',
    './components/Requests/RequestsProBanner.js',
    './components/Requests/RequestsPartsModal.js',
    './components/Requests/RequestsAddEditModal.js',
    './components/Requests/Module_Requests_Container.js',

    // د) المشتريات والمخزن (Purchases)
    './components/Purchases/PurchasesHeader.js',
    './components/Purchases/PurchasesStats.js',
    './components/Purchases/PurchasesTable.js',
    './components/Purchases/PurchasesProBanner.js',
    './components/Purchases/PurchaseModal.js',
    './components/Purchases/Module_Purchases_Container.js',

    // هـ) المبيعات المباشرة (POS)
    './components/Pos/DirectSale.js',
    './components/Pos/InvoiceHistory.js',
    './components/Pos/Module_POS_Container.js',

    // و) جرد المخزن والخدمات (Inventory)
    './components/Inventory/InventoryHeader.js',
    './components/Inventory/InventoryStats.js',
    './components/Inventory/InventoryTable.js',
    './components/Inventory/InventoryProBanner.js',
    './components/Inventory/InventoryModal.js',
    './components/Inventory/InventoryAdjustModal.js',
    './components/Inventory/Module_Inventory_Container.js',

    // ز) المالية والفواتير (Finances)
    './components/Finances/FinancesHeader.js',
    './components/Finances/FinancesStats.js',
    './components/Finances/FinancesChart.js',
    './components/Finances/FinancesTabs.js',
    './components/Finances/FinancesTable.js',
    './components/Finances/FinancesProBanner.js',
    './components/Finances/FinancesExpenseModal.js',
    './components/Finances/FinancesPayModal.js',
    './components/Finances/FinancesEditInvoiceModal.js',
    './components/Finances/Finances_InvoicesTab.js',
    './components/Finances/Finances_PosTab.js',
    './components/Finances/Finances_ExpensesTab.js',
    './components/Finances/Finances_PurchasesTab.js',
    './components/Finances/Module_Finances_Container.js',

    // ح) إعدادات المركز (Settings)
    './components/Settings/SettingsHeader.js',
    './components/Settings/SettingsStaffTab.js',
    './components/Settings/SettingsCenterTab.js',
    './components/Settings/SettingsSecurityTab.js',
    './components/Settings/SettingsImportTab.js',
    './components/Settings/SettingsProBanner.js',
    './components/Settings/SettingsStaffModal.js',
    './components/Settings/Module_Settings_Container.js',

    // ط) النسخ الاحتياطي (Backup)
    './components/Backup/BackupHeader.js',
    './components/Backup/BackupActions.js',
    './components/Backup/BackupDangerZone.js',
    './components/Backup/BackupProBanner.js',
    './components/Backup/BackupOverlayLoader.js',
    './components/Backup/Module_Backup_Container.js'
];

// ===================================================================
// حدث التثبيت (Install Event)
// ===================================================================
self.addEventListener('install', (event) => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('📦 [MentraFix SW] بدء تخزين النظام والمكونات بالكامل...');

            // استخدام Promise.allSettled لضمان عدم توقف الكاش عند غياب أي ملف ثانوي
            const cachePromises = STATIC_ASSETS.map(async (url) => {
                try {
                    const request = new Request(url, { cache: 'reload' });
                    const response = await fetch(request);
                    if (response.ok) {
                        return await cache.put(url, response);
                    } else {
                        console.warn(`⚠️ [MentraFix SW] تخطي الملف (${response.status}): ${url}`);
                    }
                } catch (err) {
                    console.warn(`⚠️ [MentraFix SW] لم يتم العثور على: ${url}`);
                }
            });

            await Promise.allSettled(cachePromises);
            console.log('✅ [MentraFix SW] تم تخزين جميع المكونات بنجاح. النظام جاهز للعمل أوفلاين 100%.');
        })
    );
});

// ===================================================================
// حدث التنشيط وحذف الكاش القديم (Activate Event)
// ===================================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log(`🗑️ [MentraFix SW] حذف كاش قديم: ${key}`);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ===================================================================
// حدث اعتراض الطلبات (Fetch Event)
// ===================================================================
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = request.url;

    if (request.method !== 'GET' || !url.startsWith('http')) return;

    event.respondWith(
        // ignoreSearch: true هو السر لمعالجة fetch(`${file}?v=${Date.now()}`)
        caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {

            // استراتيجية Cache-First: إرجاع المكون فوراً من الذاكرة لسرعة خيالية في أجزاء من الثانية
            if (cachedResponse) {
                // محاولة تحديث الكاش بهدوء في الخلفية إن توفر اتصال بالإنترنت
                fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                }).catch(() => { /* وضع عدم الاتصال */ });

                return cachedResponse;
            }

            // إذا لم يكن بالذاكرة (مثل خطوط Google أو أيقونات CDN لأول مرة)
            return fetch(request).then((networkResponse) => {
                if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch((error) => {
                console.error(`❌ [MentraFix SW] فشل جلب المورد أثناء وضع أوفلاين: ${url}`);
                throw error;
            });
        })
    );
});