// المسار: components/Main/InventoryStats.js
window.MainInventoryStats = function({ invStats, isLoading }) {
    const { useEffect, useRef } = React;
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !window.Chart) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        
        const hasData = invStats.itemsIn > 0 || invStats.itemsOutMaintenance > 0 || invStats.itemsOutSales > 0;
        
        // تقسيم البيانات إلى 3 أقسام
        const dataValues = hasData 
            ? [invStats.itemsIn, invStats.itemsOutMaintenance, invStats.itemsOutSales] 
            : [1, 1, 1];
            
        // ألوان احترافية: سماوي (للوارد)، أحمر وردي (للصيانة)، برتقالي (للمبيعات)
        const bgColors = hasData 
            ? ['#06B6D4', '#F43F5E', '#F59E0B'] 
            : ['#E2E8F0', '#E2E8F0', '#E2E8F0'];

        chartInstance.current = new window.Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['وارد (شراء/تسوية)', 'منصرف (صيانة)', 'منصرف (مبيعات)'],
                datasets: [{
                    data: dataValues,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Cairo', weight: 'bold', boxWidth: 12 } } },
                    tooltip: { enabled: hasData, titleFont: { family: 'Cairo' }, bodyFont: { family: 'Cairo' } }
                }
            }
        });

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };
    }, [invStats]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-view relative overflow-hidden" style={{ animationDelay: '0.15s' }}>
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                    <i className="fa-solid fa-circle-notch fa-spin text-cyan-500 text-4xl shadow-lg rounded-full bg-white"></i>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-inner">
                    <i className="fa-solid fa-boxes-stacked"></i>
                </div>
                <div>
                    <h3 className="font-black text-slate-800 text-lg">تحليل المخزن وقطع الغيار</h3>
                    <p className="text-xs font-bold text-slate-400">حركة المشتريات وتفصيل القطع المنصرفة (صيانة/مبيعات)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* الإحصائيات الرقمية */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-cyan-300 transition-all shadow-sm hover:shadow-md">
                        <div>
                            <p className="text-slate-600 text-xs font-bold mb-1">إجمالي تكلفة المشتريات</p>
                            <h4 className="text-2xl font-black text-slate-800">{invStats.totalPurchases.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">ج.م</span></h4>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-cyan-600 transition-all">
                            <i className="fa-solid fa-cart-arrow-down text-xl"></i>
                        </div>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 flex items-center justify-between group hover:border-emerald-400 transition-all shadow-sm hover:shadow-md">
                        <div>
                            <p className="text-emerald-700 text-xs font-bold mb-1">أرباح بيع القطع (صيانة ومبيعات)</p>
                            <h4 className="text-2xl font-black text-emerald-600">{invStats.partsProfit.toLocaleString()} <span className="text-[10px] font-bold opacity-70">ج.م</span></h4>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 transition-all">
                            <i className="fa-solid fa-hand-holding-dollar text-xl"></i>
                        </div>
                    </div>

                    {/* مربع حركة القطع المُحدث بثلاث أقسام */}
                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 flex items-center justify-between md:col-span-2 group hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                        <div className="flex-1">
                            <p className="text-blue-700 text-xs font-bold mb-3">حركة القطع (الوارد والمنصرف)</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm flex-1 md:flex-none justify-center">
                                    <i className="fa-solid fa-arrow-down text-emerald-500"></i>
                                    <span className="font-black text-slate-700 text-sm">{invStats.itemsIn} <span className="text-[10px] font-bold text-slate-400">وارد</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm flex-1 md:flex-none justify-center">
                                    <i className="fa-solid fa-screwdriver-wrench text-rose-500"></i>
                                    <span className="font-black text-slate-700 text-sm">{invStats.itemsOutMaintenance} <span className="text-[10px] font-bold text-slate-400">صيانة</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm flex-1 md:flex-none justify-center">
                                    <i className="fa-solid fa-store text-amber-500"></i>
                                    <span className="font-black text-slate-700 text-sm">{invStats.itemsOutSales} <span className="text-[10px] font-bold text-slate-400">مبيعات</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="pl-4 md:pl-5 border-r-2 border-blue-200/50 mr-4 text-center shrink-0">
                            <p className="text-[10px] font-bold text-slate-500 mb-1 whitespace-nowrap">الرصيد الكلي المتاح</p>
                            <span className="text-2xl font-black text-blue-600">{invStats.totalPartsInStock}</span>
                        </div>
                    </div>
                </div>

                {/* الرسم البياني */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center min-h-[220px] shadow-inner">
                    <div className="relative w-full h-40">
                        <canvas ref={chartRef}></canvas>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
                            <span className="text-[10px] font-bold text-slate-400">إجمالي الحركة</span>
                            <span className="text-xl font-black text-slate-800">{invStats.itemsIn + invStats.itemsOut}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};