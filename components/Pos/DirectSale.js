// المسار: components/Pos/DirectSale.js
window.DirectSale = function({ userId, showToast }) {
    const { useState, useMemo } = React;
    const ITEMS_PER_PAGE = 6;

    const [cart, setCart] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [discount, setDiscount] = useState(0);
    const [productPage, setProductPage] = useState(1);

    const products = window.useLiveQuery(() => window.db.inventory_parts.filter(p => p.is_active !== false).toArray(), []) || [];

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return num.toLocaleString('ar-EG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const extractPrice = (product, type = 'sell') => {
        let rawPrice = 0;
        if (type === 'sell') {
            rawPrice = product.selling_price || product.price || 0;
        } else {
            rawPrice = product.purchase_price || product.cost_price || 0;
        }
        const parsedPrice = parseFloat(rawPrice);
        return isNaN(parsedPrice) ? 0 : parsedPrice;
    };

    const extractStock = (product) => {
        const rawStock = product.stock_quantity || 0;
        const parsedStock = parseInt(rawStock, 10);
        return isNaN(parsedStock) ? 0 : parsedStock;
    };

    const printThermalReceipt = (invoiceId, cartItems, discountVal, netTotal, dateStr) => {
        const session = JSON.parse(localStorage.getItem('MentraFix_Session') || '{}');
        const centerName = session.center_name || 'مركز الصيانة';
        
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html dir="rtl">
            <head>
                <title>فاتورة مبيعات #${invoiceId}</title>
                <style>
                    body { font-family: 'Tahoma', sans-serif; text-align: center; font-size: 13px; width: 300px; margin: 0 auto; color: #000; padding-top: 10px; }
                    .header { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                    .meta { font-size: 11px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { text-align: right; border-bottom: 1px dotted #ccc; padding: 6px 0; font-size: 12px; }
                    th { border-bottom: 1px solid #000; font-weight: bold; }
                    .center { text-align: center; }
                    .totals { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; text-align: left; font-weight: bold; }
                    .footer { margin-top: 20px; font-size: 11px; text-align: center; border-top: 1px dashed #000; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">${centerName}</div>
                <div class="meta">
                    <div>مبيعات قطع غيار/إكسسوارات</div>
                    <div>رقم الفاتورة: #${invoiceId}</div>
                    <div>التاريخ: ${new Date(dateStr).toLocaleString('ar-EG', {hour12: true})}</div>
                </div>
                <table>
                    <tr><th>الصنف</th><th class="center">الكمية</th><th style="text-align:left">السعر</th></tr>
                    ${cartItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td class="center">${item.qtySold}</td>
                            <td style="text-align:left">${formatCurrency(item.sellPrice * item.qtySold)}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="totals">
                    ${discountVal > 0 ? `<div>الخصم: ${formatCurrency(discountVal)} ج.م</div>` : ''}
                    <div style="font-size: 16px; margin-top: 5px;">الإجمالي: ${formatCurrency(netTotal)} ج.م</div>
                </div>
                <div class="footer">شكراً لثقتكم بنا!<br>MentraFix Lite</div>
                <script>window.onload = function() { window.print(); window.close(); }<\/script>
            </body>
            </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const paginatedProducts = useMemo(() => {
        const start = (productPage - 1) * ITEMS_PER_PAGE;
        return products.slice(start, start + ITEMS_PER_PAGE);
    }, [products, productPage]);
    
    const totalProductPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.part_id === product.id);
        const currentQtyInCart = existingItem ? existingItem.qtySold : 0;
        
        const availableStock = extractStock(product);

        if (availableStock <= currentQtyInCart) {
            showToast(`لا يوجد رصيد كافي من ${product.part_name}`, 'error');
            return;
        }

        const itemSellPrice = extractPrice(product, 'sell');
        const itemCostPrice = extractPrice(product, 'cost');

        if (existingItem) {
            setCart(cart.map(item => item.part_id === product.id ? { ...item, qtySold: item.qtySold + 1 } : item));
        } else {
            setCart([...cart, { 
                part_id: product.id, 
                name: product.part_name, 
                sellPrice: itemSellPrice,
                costPrice: itemCostPrice,
                qtySold: 1,
                maxStock: availableStock
            }]);
        }
        setBarcodeInput(''); 
    };

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;
        const product = products.find(p => p.sku === barcodeInput.trim() || p.barcode === barcodeInput.trim());
        if (product) addToCart(product);
        else showToast('القطعة غير مسجلة بالمخزن', 'error');
        setBarcodeInput('');
    };

    const updateCartQty = (part_id, newQty) => {
        if (newQty < 1) {
            setCart(cart.filter(item => item.part_id !== part_id));
            return;
        }
        const item = cart.find(i => i.part_id === part_id);
        if (newQty > item.maxStock) {
            showToast('الكمية المطلوبة تتجاوز المخزون المتاح', 'error');
            return;
        }
        setCart(cart.map(item => item.part_id === part_id ? { ...item, qtySold: newQty } : item));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.qtySold), 0);
    const netTotal = cartTotal - discount;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.qtySold), 0);
            const netProfit = netTotal - totalCost;

            const invoiceId = await window.CenterQueries.processPosSale(
                userId, 
                cart.map(i => ({ itemId: i.part_id, qtySold: i.qtySold, sellPrice: i.sellPrice })), 
                discount, 
                cartTotal, 
                netTotal, 
                netProfit
            );

            printThermalReceipt(invoiceId, cart, discount, netTotal, new Date().toISOString());
            showToast('تم تسجيل الفاتورة بنجاح', 'success');
            setCart([]);
            setDiscount(0);
        } catch (error) { 
            console.error(error);
            showToast('حدث خطأ أثناء الحفظ', 'error'); 
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-view pb-10">
            <div className="lg:col-span-7 space-y-4">
                <form onSubmit={handleBarcodeSubmit} className="relative">
                    <input autoFocus type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="مرر الباركود (SKU) هنا..." className="w-full bg-white border-2 border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:border-[#06B6D4] transition-colors font-bold text-slate-700 shadow-sm" />
                    <i className="fas fa-barcode absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400"></i>
                    <button type="submit" className="hidden"></button>
                </form>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col justify-between">
                    <div>
                        <h3 className="font-black text-slate-700 mb-4 flex justify-between items-center">
                            <span>قطع الغيار المتاحة للبيع</span>
                            <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-1 rounded font-bold">صفحة {productPage} من {totalProductPages}</span>
                        </h3>
                        
                        {products.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 font-bold"><i className="fas fa-box-open text-4xl mb-2 block"></i>لا توجد قطع غيار مسجلة</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {paginatedProducts.map(p => {
                                    const availableStock = extractStock(p);
                                    const isOutOfStock = availableStock <= 0;
                                    const itemPrice = extractPrice(p, 'sell');
                                    
                                    return (
                                        <button key={p.id} onClick={() => !isOutOfStock && addToCart(p)} disabled={isOutOfStock} className={`p-4 rounded-xl border-2 text-right transition-all flex flex-col relative ${isOutOfStock ? 'border-rose-100 bg-rose-50 opacity-60 cursor-not-allowed' : 'border-slate-100 bg-slate-50 hover:border-[#06B6D4] hover:shadow-md'}`}>
                                            <span className="font-black text-slate-800 text-sm mb-1 truncate w-full">{p.part_name}</span>
                                            <span className="text-[#06B6D4] font-black text-lg">{formatCurrency(itemPrice)} ج.م</span>
                                            <span className={`text-[10px] font-bold mt-2 ${isOutOfStock ? 'text-rose-500' : 'text-slate-400'}`}>الرصيد المتاح: {availableStock}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    
                    {totalProductPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
                            <button onClick={() => setProductPage(prev => Math.max(prev - 1, 1))} disabled={productPage === 1} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-[#06B6D4] hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-chevron-right"></i></button>
                            <button onClick={() => setProductPage(prev => Math.min(prev + 1, totalProductPages))} disabled={productPage === totalProductPages} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-[#06B6D4] hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-chevron-left"></i></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] overflow-hidden">
                    <div className="p-4 bg-[#0F172A] text-white flex justify-between items-center">
                        <h3 className="font-black"><i className="fas fa-shopping-cart mr-2 text-[#06B6D4]"></i> الفاتورة الحالية</h3>
                        <span className="bg-[#06B6D4] text-xs font-bold px-2 py-1 rounded-full">{cart.length} أصناف</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50"><i className="fas fa-receipt text-5xl mb-3"></i><p className="font-bold text-sm">الفاتورة فارغة</p></div>
                        ) : (
                            cart.map(item => (
                                <div key={item.part_id} className="bg-white p-3 rounded-xl mb-2 shadow-sm border border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                                        <p className="text-[#06B6D4] font-bold text-xs">{formatCurrency(item.sellPrice)} ج.م للقطعة</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
                                        <button onClick={() => updateCartQty(item.part_id, item.qtySold - 1)} className="w-7 h-7 rounded bg-white text-slate-600 shadow-sm font-bold flex items-center justify-center hover:bg-rose-100 hover:text-rose-600">-</button>
                                        <span className="w-6 text-center font-black text-sm">{item.qtySold}</span>
                                        <button onClick={() => updateCartQty(item.part_id, item.qtySold + 1)} className="w-7 h-7 rounded bg-white text-slate-600 shadow-sm font-bold flex items-center justify-center hover:bg-cyan-100 hover:text-cyan-600">+</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-2 text-sm font-bold text-slate-500"><span>الإجمالي:</span><span>{formatCurrency(cartTotal)} ج.م</span></div>
                        <div className="flex justify-between items-center mb-4 text-sm font-bold text-slate-500">
                            <span>خصم (إن وجد):</span>
                            <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-20 border border-slate-200 rounded px-2 py-1 outline-none text-left focus:border-[#06B6D4]" />
                        </div>
                        <div className="flex justify-between items-center mb-4 text-lg font-black text-slate-800 border-t border-slate-100 pt-3">
                            <span>الصافي المطلوب:</span><span className="text-[#06B6D4] text-3xl font-black">{formatCurrency(netTotal)} <span className="text-lg">ج.م</span></span>
                        </div>
                        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] hover:opacity-90 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex justify-center items-center gap-2 text-lg active:scale-95">
                            <i className="fas fa-print"></i> دفع وطباعة الإيصال
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};