// المسار: pages/customers.js
window.Module_Customers = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            const filesToLoad = [
                'components/Customers/CustomersHeader.js',
                'components/Customers/CustomersStats.js',
                'components/Customers/CustomersTable.js',
                'components/Customers/CustomersProBanner.js',
                'components/Customers/CustomerAddEditModal.js',
                'components/Customers/CustomerDevicesView.js',
                'components/Customers/DeviceEditModal.js', // <- تمت إضافة الملف هنا
                'components/Customers/DeviceVisitsView.js',
                'components/Customers/RequestsPartsModal.js',
                'components/Customers/Module_Customers_Container.js'
            ];

            try {
                for (const file of filesToLoad) {
                    if(file.includes('CustomersHeader') && window.CustomersHeader) continue;
                    if(file.includes('CustomersStats') && window.CustomersStats) continue;
                    if(file.includes('CustomersTable') && window.CustomersTable) continue;
                    if(file.includes('CustomersProBanner') && window.CustomersProBanner) continue;
                    if(file.includes('CustomerAddEditModal') && window.CustomerAddEditModal) continue;
                    if(file.includes('CustomerDevicesView') && window.CustomerDevicesView) continue;
                    if(file.includes('DeviceEditModal') && window.DeviceEditModal) continue; // <- تجنب التحميل المزدوج
                    if(file.includes('DeviceVisitsView') && window.DeviceVisitsView) continue;
                    if(file.includes('RequestsPartsModal') && window.RequestsPartsModal) continue;
                    if(file.includes('Container') && window.Module_Customers_Container) continue;

                    const res = await fetch(`${file}?v=${Date.now()}`);
                    if (!res.ok) throw new Error(`تعذر تحميل: ${file}`);
                    
                    const rawScript = await res.text();
                    const compiled = window.Babel.transform(rawScript, { presets: ['react'] }).code;
                    
                    const scriptEl = document.createElement('script');
                    scriptEl.text = compiled;
                    document.body.appendChild(scriptEl);
                }
                setComponentsLoaded(true);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل شاشة العملاء:</span>
                <span className="text-rose-500 mt-2 text-sm">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Customers_Container) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-view px-4">
                <div className="relative bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(6,182,212,0.25)] border border-cyan-50 max-w-sm w-full text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10 w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl opacity-30 animate-ping" style={{ animationDuration: '2.5s' }}></div>
                        <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] rounded-3xl text-white shadow-xl shadow-cyan-500/40">
                            <i className="fas fa-users text-4xl"></i>
                        </div>
                        <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] animate-spin text-cyan-400 opacity-70" viewBox="0 0 100 100" fill="none" style={{ animationDuration: '3s' }}>
                            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round"></circle>
                        </svg>
                    </div>

                    <h3 className="relative z-10 text-2xl font-black text-slate-800 mb-2">تجهيز سجل العملاء</h3>
                    <p className="relative z-10 text-sm font-bold text-slate-400 mb-8">يتم تحميل بيانات العملاء والأجهزة...</p>

                    <div className="relative z-10 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full animate-pulse w-full bg-[length:200%_100%]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return React.createElement(window.Module_Customers_Container, props);
};