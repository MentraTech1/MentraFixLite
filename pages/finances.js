// المسار: pages/finances.js

window.Module_Finances = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
           const filesToLoad = [
                'components/Finances/FinancesHeader.js',
                'components/Finances/FinancesStats.js',
                'components/Finances/FinancesChart.js', // <--- أضفنا الرسم البياني هنا
                'components/Finances/FinancesTabs.js',
                'components/Finances/FinancesTable.js',
                'components/Finances/FinancesProBanner.js',
                'components/Finances/FinancesExpenseModal.js',
                'components/Finances/FinancesPayModal.js',
                'components/Finances/FinancesEditInvoiceModal.js',
                // --- الملفات المقسمة الجديدة ---
                'components/Finances/Finances_InvoicesTab.js',
                'components/Finances/Finances_PosTab.js',
                'components/Finances/Finances_ExpensesTab.js',
                'components/Finances/Finances_PurchasesTab.js',
                // -------------------------------
                'components/Finances/Module_Finances_Container.js'
            ];

            try {
                for (const file of filesToLoad) {
                    // منع التحميل المزدوج
                    if(file.includes('FinancesHeader') && window.FinancesHeader) continue;
                    if(file.includes('FinancesStats') && window.FinancesStats) continue;
                    if(file.includes('FinancesChart') && window.FinancesChart) continue; // <--- تخطي في حال كان محملاً
                    if(file.includes('FinancesTabs') && window.FinancesTabs) continue;
                    if(file.includes('FinancesTable') && window.FinancesTable) continue;
                    if(file.includes('FinancesProBanner') && window.FinancesProBanner) continue;
                    if(file.includes('FinancesExpenseModal') && window.FinancesExpenseModal) continue;
                    if(file.includes('FinancesPayModal') && window.FinancesPayModal) continue;
                    if(file.includes('FinancesEditInvoiceModal') && window.FinancesEditInvoiceModal) continue;
                    if(file.includes('Container') && window.Module_Finances_Container) continue;

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
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل الشاشة:</span>
                <span className="text-rose-500 mt-2 text-sm">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Finances_Container) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-view px-4">
                <div className="relative bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)] border border-emerald-50 max-w-sm w-full text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10 w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl opacity-30 animate-ping" style={{ animationDuration: '2.5s' }}></div>
                        <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-xl shadow-emerald-500/40">
                            <i className="fa-solid fa-file-invoice-dollar text-4xl"></i>
                        </div>
                        <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] animate-spin text-emerald-400 opacity-70" viewBox="0 0 100 100" fill="none" style={{ animationDuration: '3s' }}>
                            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round"></circle>
                        </svg>
                    </div>

                    <h3 className="relative z-10 text-2xl font-black text-slate-800 mb-2">السجلات المالية</h3>
                    <p className="relative z-10 text-sm font-bold text-slate-400 mb-8">يتم تجميع الفواتير والمصروفات...</p>

                    <div className="relative z-10 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 rounded-full animate-pulse w-full bg-[length:200%_100%]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return React.createElement(window.Module_Finances_Container, props);
};