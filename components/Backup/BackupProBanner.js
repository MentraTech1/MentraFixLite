// المسار: components/Backup/BackupProBanner.js
window.BackupProBanner = function() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#0B1120] rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-500/20 group mt-6 animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#06B6D4]/20 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center lg:text-right text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-cyan-400 text-xs font-black mb-3 backdrop-blur-sm"><i className="fas fa-cloud animate-pulse"></i> أمان سحابي تلقائي</div>
                    <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">تخشى ضياع هاتفك أو تلف جهازك؟ <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#06B6D4] to-[#3B82F6]">النسخة السحابية</span> هي الحل!</h3>
                    <p className="text-slate-400 font-bold text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto lg:mx-0">لا حاجة لأخذ نسخ احتياطية يدوياً بعد الآن. في نسخة <span className="text-white">MentraFix PRO</span> تُحفظ بياناتك لحظياً على خوادم سحابية آمنة، ويمكنك متابعة مركزك من أي جهاز في العالم.</p>
                </div>
                <a href="https://wa.me/201211934816" target="_blank" className="w-full lg:w-auto bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white font-black px-6 py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 whitespace-nowrap text-sm sm:text-base">
                    <i className="fab fa-whatsapp text-xl"></i><span>اسأل عن أسعار السحابي</span>
                </a>
            </div>
        </div>
    );
};