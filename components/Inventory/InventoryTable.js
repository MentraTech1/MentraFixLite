// المسار: components/Inventory/InventoryTable.js

window.InventoryTable = function({ items, pagination, isLoading, isUpdating, showModal, showAdjustModal, fetchItems, searchText, openAdjustModal, openEditModal }) {
    return (
        <div className="relative animate-view" style={{ animationDelay: '0.2s' }}>
            
            {/* تأثير التحميل فوق الكروت */}
            {(isLoading || isUpdating) && !showModal && !showAdjustModal && (
                <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                    <div className="w-14 h-14 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin shadow-lg"></div>
                </div>
            )}

            {/* شبكة الكروت (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items?.length > 0 ? items.map((item) => {
                    const isLowStock = parseInt(item.stock_quantity) <= 5;
                    return (
                        <div key={item.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.15)] hover:border-cyan-100 transition-all flex flex-col group relative overflow-hidden">
                            
                            {/* شريط علوي ملون خفيف */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${isLowStock ? 'bg-rose-400' : 'bg-cyan-400'}`}></div>

                            {/* رأس الكارت (الاسم والكمية) */}
                            <div className="flex justify-between items-start mb-4 mt-1">
                                <div className="flex-1 min-w-0 pl-3">
                                    <h3 className="font-black text-slate-800 text-lg truncate" title={item.part_name}>{item.part_name}</h3>
                                    {item.sku && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 mt-1 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100" dir="ltr">
                                            <i className="fa-solid fa-barcode text-slate-300"></i> {item.sku}
                                        </span>
                                    )}
                                </div>
                                <div className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm ${isLowStock ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`} title="الرصيد الحالي">
                                    <span className="font-black text-base">{item.stock_quantity}</span>
                                    {isLowStock && <i className="fa-solid fa-circle-exclamation animate-pulse text-[10px]"></i>}
                                </div>
                            </div>

                            {/* تفاصيل الكارت (الماركة والمكان) */}
                            <div className="flex flex-col gap-2 mb-4">
                                {item.brand && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><i className="fa-solid fa-tag text-[10px]"></i></div>
                                        <span className="truncate">{item.brand}</span>
                                    </div>
                                )}
                                {item.location_in_store && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><i className="fa-solid fa-map-pin text-[10px]"></i></div>
                                        <span className="truncate">الرف: <span className="text-slate-700">{item.location_in_store}</span></span>
                                    </div>
                                )}
                            </div>

                            {/* الأسعار (في صندوق مدمج أسفل الكارت) */}
                            <div className="grid grid-cols-2 gap-2 mb-5 bg-slate-50 rounded-2xl p-3 border border-slate-100 mt-auto">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 mb-0.5">سعر الشراء</p>
                                    <p className="text-sm font-black text-slate-700">{Number(item.purchase_price).toLocaleString()} <span className="text-[9px] font-bold text-slate-400">ج.م</span></p>
                                </div>
                                <div className="border-r border-slate-200 pr-3">
                                    <p className="text-[10px] font-bold text-cyan-600 mb-0.5">سعر البيع</p>
                                    <p className="text-base font-black text-cyan-700">{Number(item.selling_price).toLocaleString()} <span className="text-[9px] font-bold text-cyan-500">ج.م</span></p>
                                </div>
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button onClick={() => openAdjustModal(item)} className="flex-1 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-black text-xs flex items-center justify-center gap-2 group/btn">
                                    <i className="fa-solid fa-boxes-packing group-hover/btn:scale-110 transition-transform"></i> تسوية
                                </button>
                                <button onClick={() => openEditModal(item)} className="w-12 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all font-bold text-xs flex items-center justify-center">
                                    <i className="fa-solid fa-pen"></i>
                                </button>
                            </div>

                        </div>
                    );
                }) : (
                    // حالة عدم وجود بيانات (Empty State)
                    <div className="col-span-full py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mb-4 relative">
                            <i className="fa-solid fa-box-open text-4xl text-cyan-400 relative z-10"></i>
                            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-1">المخزن فارغ!</h4>
                        <p className="text-slate-500 font-bold text-sm">لا توجد أصناف تطابق بحثك حالياً.</p>
                    </div>
                )}
            </div>

            {/* الترقيم (Pagination) */}
            {pagination.total > 0 && (
                <div className="mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        صفحة {pagination.current_page} من {pagination.last_page} 
                        <span className="mr-3 border-r border-slate-200 pr-3 font-black text-slate-700">إجمالي: {pagination.total} صنف</span>
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => fetchItems(pagination.current_page + 1, searchText)} disabled={pagination.current_page === pagination.last_page || isLoading} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-500 hover:text-white hover:border-cyan-500 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 transition-all shadow-sm">
                            <i className="fa-solid fa-chevron-right text-sm"></i>
                        </button>
                        <button onClick={() => fetchItems(pagination.current_page - 1, searchText)} disabled={pagination.current_page === 1 || isLoading} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-cyan-500 hover:text-white hover:border-cyan-500 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 transition-all shadow-sm">
                            <i className="fa-solid fa-chevron-left text-sm"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};