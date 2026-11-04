// المسار: components/Customers/CustomersProBanner.js
window.CustomersProBanner = function() {
    return (
        <div className="mt-8 bg-[#0B1120] rounded-3xl p-6 md:p-8 border border-cyan-500/30 shadow-[0_10px_40px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-cyan-500/60 transition-all animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-5">
                <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] items-center justify-center text-white text-3xl shadow-lg shadow-cyan-500/25 shrink-0">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white uppercase tracking-wider">Pro Version</span>
                        <h3 className="text-xl md:text-2xl font-black text-white">طوّر نظامك إلى النسخة السحابية!</h3>
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm font-bold mt-2 max-w-xl leading-relaxed">
                        احمِ بياناتك من الضياع، تابع مركزك من الموبايل في أي مكان، اربط فروعك وأضف موظفيك بصلاحيات متقدمة، وارسل فواتير WhatsApp للعملاء بضغطة زر.
                    </p>
                </div>
            </div>

            <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
                <a href="https://wa.me/201211934816" target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg shadow-[#25D366]/20">
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    <span dir="ltr">01211934816</span>
                </a>
                <a href="tel:01211934816" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
                    <i className="fa-solid fa-phone text-sm"></i>
                    <span>اتصل بنا</span>
                </a>
            </div>
        </div>
    );
};