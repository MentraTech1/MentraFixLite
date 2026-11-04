// المسار: pages/settings.js

window.Module_Settings = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadComponents = async () => {
            const filesToLoad = [
                { path: 'components/Settings/SettingsHeader.js', key: 'SettingsHeader' },
                { path: 'components/Settings/SettingsStaffTab.js', key: 'SettingsStaffTab' },
                { path: 'components/Settings/SettingsCenterTab.js', key: 'SettingsCenterTab' },
                { path: 'components/Settings/SettingsSecurityTab.js', key: 'SettingsSecurityTab' },
                { path: 'components/Settings/SettingsImportTab.js', key: 'SettingsImportTab' }, // <-- تمت الإضافة هنا
                { path: 'components/Settings/SettingsProBanner.js', key: 'SettingsProBanner' },
                { path: 'components/Settings/SettingsStaffModal.js', key: 'SettingsStaffModal' },
                { path: 'components/Settings/Module_Settings_Container.js', key: 'Module_Settings_Container' }
            ];

            try {
                for (const item of filesToLoad) {
                    if (window[item.key]) continue;

                    const res = await fetch(`${item.path}?v=${Date.now()}`);
                    if (!res.ok) {
                        throw new Error(`تعذر العثور على الملف: ${item.path} (تأكد من وجود الملف بنفس المسار وحالة الأحرف)`);
                    }
                    
                    const rawScript = await res.text();
                    const compiled = (window.Babel || Babel).transform(rawScript, { presets: ['react'] }).code;
                    
                    const scriptEl = document.createElement('script');
                    scriptEl.text = compiled;
                    document.body.appendChild(scriptEl);
                }

                const requiredKeys = ['SettingsHeader', 'SettingsStaffTab', 'SettingsCenterTab', 'SettingsSecurityTab', 'SettingsImportTab', 'SettingsProBanner', 'SettingsStaffModal', 'Module_Settings_Container'];
                const notFound = requiredKeys.find(k => typeof window[k] !== 'function');

                if (notFound) {
                    throw new Error(`المكون [${notFound}] غير معرّف كدالة على window. تأكد من صحة الكود بداخله.`);
                }

                if (isMounted) setComponentsLoaded(true);

            } catch (err) {
                console.error("Settings Load Error:", err);
                if (isMounted) setError(err.message);
            }
        };

        loadComponents();
        return () => { isMounted = false; };
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-rose-50 rounded-3xl border border-rose-200 animate-view max-w-2xl mx-auto my-10 text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-3"></i>
                <h3 className="text-rose-800 font-black text-lg">خطأ في تحميل ملفات الإعدادات</h3>
                <p className="text-rose-600 font-bold mt-2 text-sm leading-relaxed" dir="ltr">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition">
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (!componentsLoaded || typeof window.Module_Settings_Container !== 'function') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-view px-4">
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                        <i className="fa-solid fa-gear fa-spin"></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">إعدادات النظام</h3>
                    <p className="text-xs font-bold text-slate-400">جاري فحص وتأمين بيئة التشغيل...</p>
                </div>
            </div>
        );
    }

    return React.createElement(window.Module_Settings_Container, props);
};