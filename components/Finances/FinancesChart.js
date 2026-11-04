// المسار: components/Finances/FinancesChart.js

window.FinancesChart = function({ stats }) {
    const { useState, useMemo } = React;
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // تجهيز البيانات المالية
    const chartData = useMemo(() => {
        const rawItems = [
            { id: 'maint', name: 'إيرادات الصيانة', amount: stats.revenue || 0, color: '#06B6D4', bgClass: 'bg-cyan-500', textClass: 'text-cyan-600', icon: 'fa-screwdriver-wrench' },
            { id: 'pos', name: 'مبيعات قطع الغيار', amount: stats.posSales || 0, color: '#10B981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600', icon: 'fa-store' },
            { id: 'exp', name: 'مصروفات التشغيل', amount: stats.expenses || 0, color: '#F43F5E', bgClass: 'bg-rose-500', textClass: 'text-rose-600', icon: 'fa-receipt' },
            { id: 'pur', name: 'مشتريات بضاعة', amount: stats.purchases || 0, color: '#F97316', bgClass: 'bg-orange-500', textClass: 'text-orange-600', icon: 'fa-truck-ramp-box' }
        ];

        const total = rawItems.reduce((acc, curr) => acc + curr.amount, 0);

        // نصف القطر والمحيط للـ SVG
        const radius = 70;
        const circumference = 2 * Math.PI * radius; // 439.82

        let cumulativePercent = 0;

        const itemsWithCoords = rawItems.map((item, idx) => {
            const percent = total > 0 ? (item.amount / total) : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercent * circumference;
            cumulativePercent += percent;

            return {
                ...item,
                percent: Math.round(percent * 100),
                strokeDasharray,
                strokeDashoffset
            };
        });

        return { items: itemsWithCoords, total, radius, circumference };
    }, [stats]);

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm animate-view" style={{ animationDelay: '0.15s' }}>
            {/* عنوان القسم */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shadow-inner">
                        <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg">التحليل المالي وتوزيع التدفق النقدي</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">نسبة وتوزيع الإيرادات مقابل المصروفات والمشتريات</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                    <i className="fa-solid fa-calculator text-cyan-500"></i>
                    <span>إجمالي الحركة: </span>
                    <span className="font-black text-slate-800 font-mono">{chartData.total.toLocaleString()} ج.م</span>
                </div>
            </div>

            {/* محتوى الشارت والبيانات */}
            <div className="mt-6 flex flex-col lg:flex-row items-center justify-around gap-8">
                
                {/* الرسم البياني الدائري (SVG Donut) */}
                <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                        {/* حلقة الخلفية عند انعدام البيانات */}
                        <circle
                            cx="100"
                            cy="100"
                            r={chartData.radius}
                            fill="transparent"
                            stroke="#F1F5F9"
                            strokeWidth="24"
                        />

                        {/* قطاعات الرسم الدائري */}
                        {chartData.total > 0 ? (
                            chartData.items.map((slice, index) => {
                                if (slice.amount <= 0) return null;
                                const isHovered = hoveredIndex === index;
                                return (
                                    <circle
                                        key={slice.id}
                                        cx="100"
                                        cy="100"
                                        r={chartData.radius}
                                        fill="transparent"
                                        stroke={slice.color}
                                        strokeWidth={isHovered ? "28" : "24"}
                                        strokeDasharray={slice.strokeDasharray}
                                        strokeDashoffset={slice.strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-300 cursor-pointer"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        style={{
                                            filter: isHovered ? `drop-shadow(0 0 10px ${slice.color}80)` : 'none'
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <circle
                                cx="100"
                                cy="100"
                                r={chartData.radius}
                                fill="transparent"
                                stroke="#CBD5E1"
                                strokeWidth="16"
                                strokeDasharray="6 6"
                            />
                        )}
                    </svg>

                    {/* المحتوى المركزي داخل الدائرة المفرغة */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                        {hoveredIndex !== null ? (
                            <div className="animate-view">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${chartData.items[hoveredIndex].textClass}`}>
                                    {chartData.items[hoveredIndex].name}
                                </span>
                                <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">
                                    {chartData.items[hoveredIndex].amount.toLocaleString()}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                    {chartData.items[hoveredIndex].percent}% من الإجمالي
                                </span>
                            </div>
                        ) : (
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">صافي السيولة</span>
                                <h4 className={`text-2xl font-black font-mono ${stats.cashInDrawer >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                                    {stats.cashInDrawer.toLocaleString()}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400">ج.م (بالدرج)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* دليل الألوان والأرقام (Legend Cards) */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {chartData.items.map((item, index) => {
                        const isHovered = hoveredIndex === index;
                        return (
                            <div
                                key={item.id}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                    isHovered 
                                        ? 'bg-slate-50 border-slate-300 shadow-md scale-[1.02]' 
                                        : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    >
                                        <i className={`fa-solid ${item.icon} text-sm`}></i>
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-800 text-xs sm:text-sm">{item.name}</h5>
                                        <p className="font-mono font-bold text-slate-500 text-xs mt-0.5">
                                            {item.amount.toLocaleString()} <span className="text-[10px]">ج.م</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span 
                                        className="text-sm font-black font-mono px-2.5 py-1 rounded-lg block"
                                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                    >
                                        {item.percent}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};