// المسار: pages/main.js
window.Module_Main = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                // تحميل مكتبة Chart.js ديناميكياً للرسم البياني
                if (!window.Chart) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = "assets/chart.js";
                        script.onload = resolve;
                        script.onerror = () => reject(new Error("تعذر تحميل مكتبة Chart.js"));
                        document.head.appendChild(script);
                    });
                }

                const filesToLoad = [
                    'components/Main/WelcomeHeader.js',
                    'components/Main/QuickStats.js',
                    'components/Main/InventoryStats.js', // ملف إحصائيات المخزن الجديد
                    'components/Main/RecentOrdersTable.js',
                    'components/Main/ProBanner.js',
                    'components/Main/Module_Main_Container.js'
                ];

                for (const file of filesToLoad) {
                    if(file.includes('WelcomeHeader') && window.MainWelcomeHeader) continue;
                    if(file.includes('QuickStats') && window.MainQuickStats) continue;
                    if(file.includes('InventoryStats') && window.MainInventoryStats) continue;
                    if(file.includes('RecentOrdersTable') && window.MainRecentOrdersTable) continue;
                    if(file.includes('ProBanner') && window.MainProBanner) continue;
                    if(file.includes('Container') && window.Module_Main_Container) continue;

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
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل الشاشة الرئيسية:</span>
                <span className="text-rose-500 mt-2 text-sm">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Main_Container) return <div className="p-10 text-center"><i className="fas fa-circle-notch fa-spin text-4xl text-cyan-500"></i></div>;

    return React.createElement(window.Module_Main_Container, props);
};