// المسار: components/Settings/SettingsSecurityTab.js

window.SettingsSecurityTab = function({ securityKey, setSecurityKey, handleSaveSecurityKey, isSavingKey, showToast }) {
    const { useState } = React;
    const [copied, setCopied] = useState(false);

    const generateKey = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let key = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setSecurityKey(key);
    };

    const copyToClipboard = () => {
        if (!securityKey) return;
        navigator.clipboard.writeText(securityKey);
        setCopied(true);
        if (typeof showToast === 'function') {
            showToast("تم نسخ مفتاح الأمان إلى الحافظة بنجاح", "success");
        }
        setTimeout(() => setCopied(false), 2000);
    };

    const isConfigured = Boolean(securityKey && securityKey.trim().length >= 8);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10 animate-view max-w-3xl mx-auto text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl shadow-inner border border-violet-100 shrink-0">
                        <i className="fa-solid fa-key"></i>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg">مفتاح الأمان واستعادة الحساب (Offline Recovery)</h3>
                        <p className="text-slate-400 font-bold text-xs mt-0.5">يستخدم لاسترجاع كلمة مرور مدير المركز في حال نسيانها</p>
                    </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 self-start sm:self-auto ${
                    isConfigured 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                }`}>
                    <i className={`fa-solid ${isConfigured ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
                    <span>{isConfigured ? 'المفتاح مفعل ومحمي' : 'غير مفعل (يوصى بالتعيين فوراً)'}</span>
                </div>
            </div>

            <div className="my-6 bg-gradient-to-l from-violet-50/80 to-slate-50 border border-violet-100 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <i className="fa-solid fa-info text-sm"></i>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
                    نظراً لأن نظام <strong className="text-violet-700">MentraFix Lite</strong> يعمل محلياً (Offline-First) بدون إنترنت، 
                    فإنه <span className="text-rose-600 font-black">لا يمكن استرجاع كلمة المرور عبر الإيميل أو SMS</span>. 
                    في حال نسيان كلمة مرورك، سيمكنك فتح النظام عبر إدخال هذا المفتاح. 
                    <span className="block text-slate-500 font-semibold mt-1">يُرجى حفظ هذا الرمز في مكان آمن خارج المتصفح.</span>
                </div>
            </div>

            <form onSubmit={handleSaveSecurityKey} className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-700 mb-2">مفتاح الأمان الخاص بمدير المركز</label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                            <input 
                                type="text"
                                dir="ltr"
                                placeholder="مثال: X8K9-M2W4-P7Q3"
                                value={securityKey || ''}
                                onChange={(e) => setSecurityKey(e.target.value.toUpperCase())}
                                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-violet-600 focus:bg-white text-slate-900 font-mono text-center font-black text-lg sm:text-xl py-3.5 px-12 rounded-2xl outline-none transition-all tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                                required
                            />
                            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            {securityKey && (
                                <button 
                                    type="button" 
                                    onClick={copyToClipboard}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 p-1.5 rounded-lg transition-colors"
                                    title="نسخ المفتاح"
                                >
                                    <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                                </button>
                            )}
                        </div>

                        <button 
                            type="button" 
                            onClick={generateKey}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 border border-slate-200 active:scale-95"
                        >
                            <i className="fa-solid fa-shuffle text-violet-600"></i>
                            <span>توليد تلقائي</span>
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSavingKey || !securityKey}
                        className="w-full bg-gradient-to-l from-violet-600 to-indigo-600 hover:opacity-95 text-white font-black py-4 rounded-2xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 active:scale-95"
                    >
                        {isSavingKey ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
                        <span>اعتماد وحفظ مفتاح الأمان</span>
                    </button>
                </div>
            </form>
        </div>
    );
};