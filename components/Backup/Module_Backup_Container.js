// المسار: components/Backup/Module_Backup_Container.js

window.Module_Backup_Container = function({ centerId, userId, showToast }) {
    const { useState, useRef } = React;
    const { BackupHeader, BackupActions, BackupDangerZone, BackupProBanner, BackupOverlayLoader } = window;

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("جاري المعالجة...");
    const [lastBackup, setLastBackup] = useState(localStorage.getItem(`MentraFix_LastBackup_${centerId}`) || 'لم يتم عمل نسخة بعد');
    const fileInputRef = useRef(null);

    // دالة مساعدة لعمل إيقاف مؤقت صغير جداً للسماح للواجهة بالتحديث (تمنع تجميد الشاشة)
    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 50));

    // 1. تصدير البيانات (Export / Backup)
    const handleExport = async () => {
        setIsLoading(true);
        setLoadingText("جاري تجميع بيانات المركز...");
        await yieldToMain();

        try {
            const db = window.db;
            if (!db) throw new Error("قاعدة البيانات غير متصلة");

            const backupData = {};
            for (const table of db.tables) {
                setLoadingText(`جاري تجهيز جدول: ${table.name}...`);
                await yieldToMain();
                backupData[table.name] = await table.toArray();
            }

            setLoadingText("جاري إنشاء ملف النسخة الاحتياطية...");
            await yieldToMain();

            const backupObject = { app: "MentraFix", centerId: centerId, timestamp: new Date().toISOString(), data: backupData };

            const jsonString = JSON.stringify(backupObject);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            downloadAnchorNode.download = `MentraFix_Backup_${dateStr}.json`;
            
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            document.body.removeChild(downloadAnchorNode);
            URL.revokeObjectURL(url); 

            const now = new Date().toLocaleString('ar-EG');
            localStorage.setItem(`MentraFix_LastBackup_${centerId}`, now);
            setLastBackup(now);
            showToast("تم تحميل النسخة الاحتياطية بنجاح!", "success");
        } catch (error) {
            console.error("خطأ في التصدير:", error); showToast("حدث خطأ أثناء أخذ النسخة الاحتياطية", "error");
        } finally { setIsLoading(false); }
    };

    // 2. استيراد البيانات (Import / Restore)
    const triggerImport = () => { fileInputRef.current.click(); };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true); setLoadingText("جاري قراءة الملف... يرجى الانتظار");

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setLoadingText("جاري تحليل البيانات..."); await yieldToMain();
                const importedData = JSON.parse(e.target.result);

                if (importedData.app !== "MentraFix" || !importedData.data) {
                    throw new Error("ملف النسخة الاحتياطية غير صالح أو لا يتبع النظام");
                }

                if (confirm("تحذير: سيتم مسح البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية. هل أنت متأكد؟")) {
                    const db = window.db;
                    setLoadingText("جاري تفريغ الجداول القديمة..."); await yieldToMain();

                    await db.transaction('rw', db.tables, async () => {
                        for (const table of db.tables) {
                            if (importedData.data[table.name]) {
                                await table.clear();
                                const records = importedData.data[table.name];
                                const chunkSize = 1000; 
                                for (let i = 0; i < records.length; i += chunkSize) {
                                    const chunk = records.slice(i, i + chunkSize);
                                    await table.bulkAdd(chunk);
                                }
                            }
                        }
                    });

                    showToast("تم استرجاع البيانات بنجاح! سيتم إعادة تشغيل النظام.", "success");
                    setTimeout(() => window.location.reload(), 2000);
                } else { setIsLoading(false); }
            } catch (error) {
                console.error("خطأ في الاستيراد:", error);
                showToast(error.message || "حدث خطأ أثناء قراءة الملف، قد يكون تالفاً أو كبيراً جداً", "error"); setIsLoading(false);
            } finally { event.target.value = ""; }
        };
        reader.readAsText(file);
    };

    // 3. تفريغ النظام (Factory Reset)
    const handleFactoryReset = async () => {
        if (!confirm("🚨 تحذير خطير جداً 🚨\nهل أنت متأكد من رغبتك في مسح كافة بيانات المركز؟ لا يمكن التراجع عن هذه الخطوة!")) return;
        if (!confirm("تأكيد نهائي: هل أنت متأكد تماماً من مسح كل شيء والبدء من الصفر؟")) return;

        setIsLoading(true); setLoadingText("جاري تدمير البيانات... لا تغلق الصفحة");
        try {
            const db = window.db;
            await db.transaction('rw', db.tables, async () => { for (const table of db.tables) { await table.clear(); } });
            showToast("تم مسح كافة البيانات. سيتم توجيهك لتسجيل الخروج.", "success");
            setTimeout(() => { localStorage.removeItem('MentraFix_Session'); window.location.replace('subscriptions.html'); }, 2000);
        } catch (error) {
            console.error("خطأ في مسح البيانات:", error); showToast("حدث خطأ أثناء مسح البيانات", "error"); setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 fade-up pb-28 md:pb-8 relative max-w-5xl mx-auto">
            {isLoading && <BackupOverlayLoader loadingText={loadingText} />}
            <BackupHeader lastBackup={lastBackup} />
            <BackupActions handleExport={handleExport} triggerImport={triggerImport} handleImport={handleImport} fileInputRef={fileInputRef} />
            <BackupDangerZone handleFactoryReset={handleFactoryReset} />
            <BackupProBanner />
        </div>
    );
};