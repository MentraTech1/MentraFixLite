// المسار: components/Settings/SettingsImportTab.js

window.SettingsImportTab = function({ userId, showToast }) {
    const { useState, useRef } = React;
    const fileInputRef = useRef(null);

    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewData, setPreviewData] = useState([]);
    const [stats, setStats] = useState({ validCount: 0, invalidCount: 0 });
    const [fileName, setFileName] = useState('');

    // التأكد من توفر مكتبة XLSX ديناميكياً إذا لم تكن موجودة في الصفحة
    const ensureXLSX = async () => {
        if (window.XLSX) return window.XLSX;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'assets/xlsx.full.min.js';
            script.onload = () => resolve(window.XLSX);
            script.onerror = () => reject(new Error('فشل تحميل محرك قراءة الإكسيل'));
            document.head.appendChild(script);
        });
    };

    // تحميل ملف قالب إكسيل جاهز للمستخدم لتفادي الأخطاء
    const downloadTemplate = async () => {
        try {
            const XLSX = await ensureXLSX();
            const sampleData = [
                {
                    "اسم القطعة": "شاشة ايفون 11 أصلية",
                    "الكود أو الباركود": "IPH-11-SCR",
                    "الرصيد الافتتاحي": 5,
                    "سعر الشراء": 1200,
                    "سعر البيع للعميل": 1600,
                    "الحد الأدنى للنواقص": 2,
                    "مكان التخزين / الرف": "A-12"
                },
                {
                    "اسم القطعة": "بطارية سامسونج A52",
                    "الكود أو الباركود": "BAT-SM-A52",
                    "الرصيد الافتتاحي": 10,
                    "سعر الشراء": 350,
                    "سعر البيع للعميل": 550,
                    "الحد الأدنى للنواقص": 3,
                    "مكان التخزين / الرف": "B-04"
                }
            ];

            const ws = XLSX.utils.json_to_sheet(sampleData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "قطع الغيار");
            XLSX.writeFile(wb, "MentraFix_Spare_Parts_Template.xlsx");
            showToast("تم تنزيل قالب الإكسيل التجريبي بنجاح", "success");
        } catch (err) {
            console.error(err);
            showToast("حدث خطأ أثناء تنزيل القالب", "error");
        }
    };

    // معالجة واختبار ملف الإكسيل المرفوع
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsParsing(true);
        setPreviewData([]);

        try {
            const XLSX = await ensureXLSX();
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

            if (!rawRows || rawRows.length === 0) {
                showToast("الملف فارغ أو لا يحتوي على صفوف بيانات", "error");
                setIsParsing(false);
                return;
            }

            // فحص وتوحيد أسماء الأعمدة (Mapping) لدعم العربية والإنجليزية
            let valid = 0;
            let invalid = 0;

            const cleaned = rawRows.map((row, idx) => {
                const partName = String(
                    row['اسم القطعة'] || row['اسم الصنف'] || row['القطعة'] || 
                    row['part_name'] || row['name'] || row['Item Name'] || ''
                ).trim();

                const sku = String(
                    row['الكود أو الباركود'] || row['الكود'] || row['الباركود'] || 
                    row['sku'] || row['barcode'] || row['code'] || ''
                ).trim();

                const qty = Math.max(0, parseInt(
                    row['الرصيد الافتتاحي'] || row['الكمية'] || row['الرصيد'] || 
                    row['quantity'] || row['stock_quantity'] || row['qty'] || 0
                ) || 0);

                const buyPrice = Math.max(0, parseFloat(
                    row['سعر الشراء'] || row['التكلفة'] || 
                    row['purchase_price'] || row['cost_price'] || 0
                ) || 0);

                const sellPrice = Math.max(0, parseFloat(
                    row['سعر البيع للعميل'] || row['سعر البيع'] || 
                    row['selling_price'] || row['price'] || 0
                ) || 0);

                const minAlert = Math.max(0, parseInt(
                    row['الحد الأدنى للنواقص'] || row['حد النواقص'] || 
                    row['min_stock'] || row['alert_limit'] || 3
                ) || 3);

                const location = String(
                    row['مكان التخزين / الرف'] || row['المكان'] || row['الرف'] || 
                    row['location'] || row['shelf'] || ''
                ).trim();

                const isValid = partName.length > 0;
                if (isValid) valid++; else invalid++;

                return {
                    temp_id: idx + 1,
                    part_name: partName,
                    sku: sku,
                    stock_quantity: qty,
                    purchase_price: buyPrice,
                    selling_price: sellPrice,
                    min_stock: minAlert,
                    location: location,
                    isValid: isValid
                };
            });

            setStats({ validCount: valid, invalidCount: invalid });
            setPreviewData(cleaned);

            if (valid === 0) {
                showToast("لم يتم العثور على أي صف يحتوي على 'اسم القطعة'!", "error");
            } else {
                showToast(`تم فحص الملف: تم استخراج ${valid} قطعة صالحة`, "success");
            }

        } catch (err) {
            console.error(err);
            showToast("فشل فتح ملف الإكسيل. تأكد من امتداد .xlsx أو .xls", "error");
        } finally {
            setIsParsing(false);
        }
    };

    // حفظ البيانات المعتمدة في قاعدة بيانات المخزن Dexie
    const handleExecuteImport = async () => {
        const validItems = previewData.filter(i => i.isValid);
        if (validItems.length === 0) {
            showToast("لا توجد بيانات صالحة للحفظ!", "error");
            return;
        }

        if (!confirm(`هل أنت متأكد من استيراد وحفظ (${validItems.length}) قطعة غيار في المخزن؟`)) {
            return;
        }

        setIsSaving(true);
        setProgress(0);

        try {
            const now = new Date().toISOString();
            const total = validItems.length;

            // تنفيذ الاستيراد على دفعات للحفاظ على أداء المتصفح
            await window.db.transaction('rw', window.db.inventory_parts, window.db.stock_movements, async () => {
                for (let i = 0; i < total; i++) {
                    const item = validItems[i];

                    // 1. إضافة القطعة إلى جدول المخزن
                    const insertedPartId = await window.db.inventory_parts.add({
                        part_name: item.part_name,
                        sku: item.sku,
                        stock_quantity: item.stock_quantity,
                        purchase_price: item.purchase_price,
                        selling_price: item.selling_price,
                        min_stock: item.min_stock,
                        location: item.location,
                        created_at: now,
                        updated_at: now
                    });

                    // 2. إذا كانت هناك كمية افتتاحية أكبر من صفر، نسجل حركة وارد افتتاحية في سجل المخزن
// 2. تسجيل حركة رصيد افتتاحي في سجل حركة المخزن
if (item.stock_quantity > 0) {
    await window.db.stock_movements.add({
        part_id: insertedPartId,
        user_id: parseInt(userId) || null,
        movement_type: 'رصيد افتتاحي', // <-- تم تعديل البيان هنا ليكون رصيد افتتاحي
        quantity: item.stock_quantity,
        total_cost: item.stock_quantity * item.purchase_price, // تمثل قيمة رأس مال البضاعة
        notes: 'تم توليد الرصيد الافتتاحي تلقائياً عبر استيراد شيت إكسيل',
        created_at: now
    });
}

                    if ((i + 1) % 10 === 0 || i === total - 1) {
                        setProgress(Math.round(((i + 1) / total) * 100));
                    }
                }
            });

            showToast(`تم استيراد ${validItems.length} قطعة غيار بنجاح إلى المخزن!`, "success");
            setPreviewData([]);
            setFileName('');
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (err) {
            console.error("Import Error:", err);
            showToast("حدث خطأ أثناء كتابة البيانات في المخزن", "error");
        } finally {
            setIsSaving(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-6 animate-view text-right max-w-5xl mx-auto">
            
            {/* الهيكل التوضيحي لشيت الإكسيل (Excel Template Structure) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner border border-emerald-100 shrink-0">
                            <i className="fa-solid fa-file-excel"></i>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg">الهيكل المطلوب لملف الإكسيل</h3>
                            <p className="text-slate-400 font-bold text-xs mt-0.5">تأكد من مطابقة أسماء الأعمدة في السطر الأول لتفادي أي خطأ</p>
                        </div>
                    </div>

                    <button 
                        type="button" 
                        onClick={downloadTemplate}
                        className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 border border-emerald-200 hover:border-emerald-600 shadow-sm active:scale-95 shrink-0"
                    >
                        <i className="fa-solid fa-cloud-arrow-down text-base"></i>
                        <span>تحميل قالب إكسيل جاهز (.xlsx)</span>
                    </button>
                </div>

                {/* جدول المعاينة التوضيحي للشيت */}
                <div className="mt-5">
                    <p className="text-xs font-bold text-slate-500 mb-2">ترتيب وأسماء الأعمدة المعتمدة بالنظام:</p>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 hide-scrollbar">
                        <table className="w-full text-center text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-black">
                                <tr>
                                    <th className="p-3 border-l border-slate-200">اسم القطعة <span className="text-rose-500">*</span></th>
                                    <th className="p-3 border-l border-slate-200">الكود أو الباركود</th>
                                    <th className="p-3 border-l border-slate-200">الرصيد الافتتاحي</th>
                                    <th className="p-3 border-l border-slate-200">سعر الشراء</th>
                                    <th className="p-3 border-l border-slate-200">سعر البيع للعميل</th>
                                    <th className="p-3 border-l border-slate-200">الحد الأدنى للنواقص</th>
                                    <th className="p-3">مكان التخزين / الرف</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100 font-bold text-slate-600">
                                <tr>
                                    <td className="p-3 border-l border-slate-100 text-slate-900 font-black">شاشة ايفون 11 أصلية</td>
                                    <td className="p-3 border-l border-slate-100 font-mono text-cyan-600" dir="ltr">IPH-11-SCR</td>
                                    <td className="p-3 border-l border-slate-100 text-emerald-600">5</td>
                                    <td className="p-3 border-l border-slate-100">1200</td>
                                    <td className="p-3 border-l border-slate-100">1600</td>
                                    <td className="p-3 border-l border-slate-100 text-amber-600">2</td>
                                    <td className="p-3">A-12</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-2">
                        <i className="fa-solid fa-circle-info text-cyan-500 ml-1"></i>
                        العمود الوحيد الإجباري هو <span className="text-slate-800 font-black">اسم القطعة</span>، وباقي الأعمدة اختيارية وسيقوم النظام بملئها بقيم افتراضية إن تُركت فارغة.
                    </p>
                </div>
            </div>

            {/* منطقة رفع الملف (Upload Area) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm text-center">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".xlsx, .xls, .csv" 
                    className="hidden" 
                />

                <div 
                    onClick={() => !isParsing && !isSaving && fileInputRef.current.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 p-8 sm:p-12 rounded-3xl cursor-pointer transition-all flex flex-col items-center justify-center group"
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-emerald-600 flex items-center justify-center text-3xl sm:text-4xl shadow-md group-hover:scale-110 group-hover:text-emerald-700 transition-all mb-4 border border-emerald-100">
                        {isParsing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-arrow-up"></i>}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-800 mb-1">
                        {fileName ? `الملف المحدد: ${fileName}` : 'اضغط هنا لاختيار ملف الإكسيل'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-400">يدعم صيغ .xlsx و .xls و .csv حتى آلاف الأصناف</p>
                </div>
            </div>

            {/* المعاينة الحية للبيانات المرفوعة (Live Preview Table) */}
            {previewData.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-view">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                        <div className="flex items-center gap-3">
                            <h4 className="font-black text-slate-800 text-base">معاينة البيانات المستخرجة</h4>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-2.5 py-1 rounded-xl">
                                {stats.validCount} صالحة للإضافة
                            </span>
                            {stats.invalidCount > 0 && (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black px-2.5 py-1 rounded-xl">
                                    {stats.invalidCount} صف مهمل (بدون اسم)
                                </span>
                            )}
                        </div>

                        <button 
                            type="button" 
                            disabled={isSaving || stats.validCount === 0}
                            onClick={handleExecuteImport}
                            className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 active:scale-95"
                        >
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-double"></i>}
                            <span>اعتماد واستيراد ({stats.validCount}) قطعة غيار</span>
                        </button>
                    </div>

                    {/* مؤشر التقدم أثناء الحفظ */}
                    {isSaving && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-pulse">
                            <div className="flex justify-between text-xs font-black text-slate-700 mb-2">
                                <span>جاري حفظ قطع الغيار في قاعدة البيانات...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {/* جدول المعاينة */}
                    <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl hide-scrollbar">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-slate-200 z-10">
                                <tr>
                                    <th className="p-3">#</th>
                                    <th className="p-3">اسم القطعة</th>
                                    <th className="p-3">الكود (SKU)</th>
                                    <th className="p-3 text-center">الكمية</th>
                                    <th className="p-3 text-center">سعر الشراء</th>
                                    <th className="p-3 text-center">سعر البيع</th>
                                    <th className="p-3">المكان</th>
                                    <th className="p-3 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold">
                                {previewData.slice(0, 50).map((row) => (
                                    <tr key={row.temp_id} className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/60 text-rose-500"}>
                                        <td className="p-3 text-slate-400">{row.temp_id}</td>
                                        <td className="p-3 font-black text-slate-800">{row.part_name || 'بدون اسم (سيتم تجاهله)'}</td>
                                        <td className="p-3 font-mono text-cyan-600" dir="ltr">{row.sku || '-'}</td>
                                        <td className="p-3 text-center text-emerald-600 font-black">{row.stock_quantity}</td>
                                        <td className="p-3 text-center">{row.purchase_price} ج.م</td>
                                        <td className="p-3 text-center">{row.selling_price} ج.م</td>
                                        <td className="p-3 text-slate-500">{row.location || '-'}</td>
                                        <td className="p-3 text-center">
                                            {row.isValid ? (
                                                <span className="text-emerald-600 font-bold"><i className="fa-solid fa-circle-check"></i> جاهز</span>
                                            ) : (
                                                <span className="text-rose-500 font-bold"><i className="fa-solid fa-circle-xmark"></i> غير صالح</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {previewData.length > 50 && (
                        <p className="text-center text-xs font-bold text-slate-400 mt-2">
                            يتم عرض أول 50 صنفاً فقط للمعاينة من أصل {previewData.length} صنف.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};