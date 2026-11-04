// المسار: components/Requests/RequestsProBanner.js
window.RequestsProBanner = function() {
    return (
        <div className="bg-gradient-to-r from-slate-900 to-[#0B1120] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl mt-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-3xl shadow-lg shrink-0 transform -rotate-6">
                    <i className="fas fa-qrcode"></i>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-black text-lg md:text-xl">تتبع بالـ Barcode وإشعارات واتساب!</h3>
                        <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">PRO</span>
                    </div>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-lg">
                        في النسخة السحابية، يمكنك طباعة ملصق QR Code لكل جهاز يدخل الورشة، وسيقوم النظام بإرسال رسالة واتساب للعميل تلقائياً فور تغيير الحالة إلى "تم الإصلاح".
                    </p>
                </div>
            </div>
            <a href="https://wa.me/201211934816" target="_blank" className="relative z-10 w-full md:w-auto bg-white hover:bg-slate-50 text-slate-900 font-black text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_5px_20px_rgba(255,255,255,0.15)] whitespace-nowrap">
                <i className="fab fa-whatsapp text-[#25D366] text-lg"></i> احصل على النسخة PRO
            </a>
        </div>
    );
};