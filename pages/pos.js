// المسار: pages/pos.js
window.Module_POS = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const loadComponents = async () => {
            const filesToLoad = [
                'components/Pos/DirectSale.js',
                'components/Pos/InvoiceHistory.js',
                'components/Pos/Module_POS_Container.js'
            ];

            try {
                let loaded = 0;
                for (const file of filesToLoad) {
                    if (!window[file.split('/').pop().split('.')[0]]) {
                        const res = await fetch(`${file}?v=${Date.now()}`);
                        if (!res.ok) throw new Error(`تعذر تحميل: ${file}`);
                        
                        const rawScript = await res.text();
                        const compiled = window.Babel.transform(rawScript, { presets: ['react'] }).code;
                        
                        const scriptEl = document.createElement('script');
                        scriptEl.text = compiled;
                        document.body.appendChild(scriptEl);
                    }
                    loaded++;
                    setLoadingProgress(Math.round((loaded / filesToLoad.length) * 100));
                }
                
                // تأخير بسيط لرؤية اكتمال التحميل
                setTimeout(() => setComponentsLoaded(true), 400);
            } catch (err) {
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view">
                <i className="fas fa-exclamation-triangle text-5xl text-rose-500 mb-4 animate-pulse"></i>
                <span className="text-rose-700 font-black text-xl mb-2">خطأ في تحميل شاشة المبيعات</span>
                <span className="text-rose-500 text-sm font-bold bg-white px-4 py-2 rounded-lg border border-rose-100">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.PosMainContainer) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-view">
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#06B6D4] rounded-full border-t-transparent animate-spin"></div>
                    <i className="fas fa-store text-3xl text-[#0F172A]"></i>
                </div>
                <h3 className="text-slate-700 font-black text-xl mb-3">جاري تهيئة نظام المبيعات...</h3>
                <div className="w-64 bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] h-2.5 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                </div>
                <span className="text-[#06B6D4] text-xs font-bold mt-2">{loadingProgress}%</span>
            </div>
        );
    }

    return React.createElement(window.PosMainContainer, props);
};