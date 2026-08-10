import React, { useState } from 'react';
import { SaleRecord, ShopInfo } from '../types';
import { Printer, X, CheckCircle, FileText, Smartphone, Phone, Mail, MapPin, Globe } from 'lucide-react';

interface VoucherModalProps {
  sale: SaleRecord | null;
  shopInfo: ShopInfo;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  sale,
  shopInfo,
  onClose,
}) => {
  const [printSize, setPrintSize] = useState<'80mm' | 'A4' | 'A6'>('80mm');

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto print:static print:bg-transparent print:backdrop-blur-none print:p-0">
      <style>
        {`
          @media print {
            @page {
              size: ${printSize === 'A4' ? 'A4 portrait' : printSize === 'A6' ? '105mm 150mm' : '80mm auto'};
              margin: 0mm;
            }
            html, body {
              ${printSize === 'A6' ? 'width: 105mm; height: 150mm; overflow: hidden !important;' : ''}
            }
          }
        `}

      </style>
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden my-6 transition-all print:shadow-none print:border-none print:m-0 ${printSize === 'A4' || printSize === 'A6' ? 'max-w-4xl print:max-w-none' : 'max-w-lg print:max-w-none'}`}>
        {/* Top Header Actions Bar (Hidden on Print) */}
        <div className="bg-indigo-900 px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">အရောင်း ဘောင်ချာ (Voucher)</h3>
              <p className="text-[11px] text-indigo-200">
                {printSize === 'A4' ? 'A4 Invoice Size' : printSize === 'A6' ? '10.5x15cm Invoice Size' : '80mm Thermal Receipt Printer Size'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Size Toggle */}
            <div className="bg-indigo-950 p-1 rounded-lg flex items-center border border-indigo-700/60 text-xs">
              <button
                type="button"
                onClick={() => setPrintSize('80mm')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  printSize === '80mm'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setPrintSize('A4')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  printSize === 'A4'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                A4 / Regular
              </button>
              <button
                type="button"
                onClick={() => setPrintSize('A6')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  printSize === 'A6'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                10.5x15cm
              </button>
            </div>

            <button
              onClick={handlePrint}
              id="print-voucher-btn"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outer Receipt Wrapper */}
        <div className="p-4 sm:p-6 bg-slate-100 flex flex-col items-center justify-center print:p-0 print:bg-white space-y-3">
          {/* Refunded Banner */}
          {sale.status === 'Refunded' && (
            <div className="w-[320px] max-w-full bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 font-bold print:border-rose-400">
              <div className="flex items-center gap-1.5 text-rose-700">
                <span>❌ ဤဘောင်ချာကို ပယ်ဖျက်ထားပါသည် (REFUNDED)</span>
              </div>
              {sale.refundReason && (
                <span className="text-[11px] font-normal text-rose-600">
                  အကြောင်းရင်း - {sale.refundReason}
                </span>
              )}
            </div>
          )}

          {/* Auto-saved badge for UI confirmation */}
          {sale.status !== 'Refunded' && (
            <div className="w-[320px] max-w-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-medium print:hidden">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>အရောင်းမှတ်တမ်းကို ရက်ချုပ်/နှစ်ချုပ် စာရင်းတွင် auto သိမ်းဆည်းထားပြီးပါပြီ။</span>
            </div>
          )}

          {/* Printable Voucher Paper Content */}
          {printSize === 'A4' || printSize === 'A6' ? (
            <div className="w-full overflow-x-auto bg-slate-100 p-4 sm:p-8 flex justify-center print:p-0 print:bg-white print:overflow-visible">
              <div 
                className={`bg-white shrink-0 relative overflow-hidden print:border-none border border-slate-200 shadow-md font-sans text-slate-900 flex flex-col mx-auto ${
                  printSize === 'A4' 
                    ? 'w-[210mm] min-h-[297mm] print:w-[210mm] print:min-w-[210mm] print:max-w-[210mm] print:min-h-0 print:h-auto' 
                    : 'w-[105mm] min-h-[150mm] print:w-[105mm] print:min-w-[105mm] print:max-w-[105mm] print:min-h-0 print:h-auto'
                }`} 
                id="voucher-printable-area"
              >
                <img src="https://i.postimg.cc/BnMDmH0x/Colorful-minimal-layout-with-blank-white-space-for-adding-elements-Premium-Vector.jpg" alt="" className="absolute inset-0 w-full h-full object-fill z-0 print:block" />
                
              <div className={`relative z-10 flex flex-col h-full ${printSize === 'A6' ? 'p-4 print:p-4' : 'p-10 sm:p-14 print:p-12'} flex-1`}>
                {/* Header */}
                <div className={`flex justify-between items-start ${printSize === 'A6' ? 'mb-2' : 'mb-10'}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className={`${printSize === 'A6' ? 'text-lg' : 'text-3xl'} font-bold text-[#333B4F] tracking-tight`}>{shopInfo.name}</h1>
                    </div>
                    <p className={`${printSize === 'A6' ? 'text-xs' : 'text-sm'} text-slate-500 font-medium tracking-widest uppercase`}>{shopInfo.tagline}</p>
                  </div>
                  <div className="text-right mt-2">
                     <h2 className={`${printSize === 'A6' ? 'text-xl' : 'text-4xl'} font-light text-[#333B4F] tracking-widest ${printSize === 'A6' ? 'mb-2' : 'mb-4'}`}>INVOICE</h2>
                  </div>
                </div>

                {/* Invoice Info */}
                <div className={`flex justify-between ${printSize === 'A6' ? 'mb-4' : 'mb-10'} items-end`}>
                   <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-700 mb-2">Invoice to:</h3>
                      <p className={`font-bold text-[#333B4F] ${printSize === 'A6' ? 'text-sm' : 'text-lg'}`}>{sale.customerName || 'Customer / General'}</p>
                   </div>
                   <div className={`grid grid-cols-2 ${printSize === 'A6' ? 'gap-x-2 gap-y-1 text-sm' : 'gap-x-8 gap-y-3 text-base'}`}>
                      <span className="font-bold text-slate-700 text-right">Invoice #</span>
                      <span className="font-bold text-[#333B4F]">{sale.voucherNo}</span>
                      <span className="font-bold text-slate-700 text-right">Date</span>
                      <span className="font-bold text-[#333B4F]">{sale.date}</span>
                   </div>
                </div>

                {/* Table */}
                <div className="flex-1 mb-8 flex flex-col">
                   <table className={`w-full border-collapse border border-[#333B4F] ${printSize === 'A6' ? 'text-xs' : 'text-base'}`}>
                      <thead>
                         <tr className="bg-[#333B4F] text-white">
                           <th className={`${printSize === 'A6' ? 'py-1 px-1.5 w-6' : 'py-2.5 px-3 w-12'} text-left font-semibold border-r border-[#333B4F]`}>No</th>
                           <th className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} text-left font-semibold border-r border-[#333B4F]`}>Item Description</th>
                           <th className={`${printSize === 'A6' ? 'py-1 px-1.5 w-10' : 'py-2.5 px-3 w-20'} text-center font-semibold border-r border-[#333B4F]`}>Qty</th>
                           <th className={`${printSize === 'A6' ? 'py-1 px-1.5 w-16' : 'py-2.5 px-3 w-32'} text-center font-semibold border-r border-[#333B4F]`}>Price</th>
                           <th className={`${printSize === 'A6' ? 'py-1 px-1.5 w-16' : 'py-2.5 px-3 w-32'} text-center font-semibold`}>Total</th>
                         </tr>
                      </thead>
                      <tbody>
                         {sale.items.map((item, idx) => (
                           <tr key={idx} className="border-b border-[#333B4F]">
                              <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} border-r border-[#333B4F] text-[#333B4F] font-medium text-center`}>{idx + 1}</td>
                              <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} border-r border-[#333B4F] text-[#333B4F]`}>{item.productName}</td>
                              <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} text-center border-r border-[#333B4F] text-[#333B4F]`}>{item.quantity ?? (item as any).weightKg ?? 1}</td>
                              <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} text-right border-r border-[#333B4F] text-[#333B4F]`}>{(item.unitPrice ?? (item as any).pricePerKg ?? 0).toLocaleString()}</td>
                              <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} text-right text-[#333B4F] font-medium`}>{(item.totalAmount ?? 0).toLocaleString()}</td>
                           </tr>
                         ))}
                         {/* Fill empty rows to make it look like a full page invoice */}
                         {printSize !== 'A6' && [...Array(Math.max(1, 12 - sale.items.length))].map((_, i) => (
                           <tr key={`empty-${i}`} className="border-b border-[#333B4F]">
                             <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-4 px-3'} border-r border-[#333B4F]`}></td>
                             <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-4 px-3'} border-r border-[#333B4F]`}></td>
                             <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-4 px-3'} border-r border-[#333B4F]`}></td>
                             <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-4 px-3'} border-r border-[#333B4F]`}></td>
                             <td className={`${printSize === 'A6' ? 'py-1 px-1.5' : 'py-4 px-3'}`}></td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                   
                   <div className="flex w-full">
                      {/* Left: Payment Info */}
                      <div className={`${printSize === 'A6' ? 'flex-1 pt-2 pr-2' : 'flex-1 pt-6 pr-4'}`}>
                        <p className={`font-bold text-slate-800 mb-2 ${printSize === 'A6' ? 'text-sm' : 'text-base'}`}>Payment Info:</p>
                        <div className={`text-slate-600 space-y-1 ${printSize === 'A6' ? 'text-xs' : 'text-sm'}`}>
                          <p>Method: {sale.paymentMethod}</p>
                          <p>Cash Received: {(sale.cashReceived ?? 0).toLocaleString()}</p>
                          {sale.changeAmount !== undefined && <p>Change: {(sale.changeAmount ?? 0).toLocaleString()}</p>}
                          {sale.notes && <p className="mt-2 text-[#333B4F]"><span className="font-bold">Notes:</span> {sale.notes}</p>}
                        </div>
                      </div>
                      
                      {/* Right: Totals Grid */}
                      <div className="w-[16rem] flex flex-col">
                        <div className="flex border-b border-x border-[#333B4F]">
                          <div className={`w-1/2 bg-[#333B4F] text-white ${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2 px-3'} font-semibold flex items-center border-b border-[#4A6568]`}>Sub Total</div>
                          <div className="w-1/2 py-2 px-3 text-right font-medium text-[#333B4F] flex items-center justify-end">{(sale.subtotal ?? 0).toLocaleString()}</div>
                        </div>
                        <div className="flex border-b border-x border-[#333B4F]">
                          <div className="w-1/2 bg-[#333B4F] text-white py-2 px-3 font-semibold flex items-center border-b border-[#4A6568]">Discount</div>
                          <div className="w-1/2 py-2 px-3 text-right font-medium text-[#333B4F] flex items-center justify-end">{(sale.discount ?? 0).toLocaleString()}</div>
                        </div>
                        <div className="flex border-b border-x border-[#333B4F]">
                          <div className="w-1/2 bg-[#333B4F] text-white py-3 px-3 font-bold text-lg flex items-center tracking-wider">TOTAL</div>
                          <div className="w-1/2 py-3 px-3 text-right font-bold text-lg text-[#333B4F] flex items-center justify-end">{(sale.grandTotal ?? 0).toLocaleString()}</div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Footer Info */}
                <div className="mt-auto pt-8 flex justify-center w-full z-10 pb-4">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-xs text-[#333B4F]">
                     <div className="flex items-center gap-2.5"><Phone className="w-3.5 h-3.5"/> <span className="font-medium">{shopInfo.phone || 'Phone Number'}</span></div>
                     <div className="flex items-center gap-2.5"><MapPin className="w-3.5 h-3.5"/> <span className="font-medium max-w-[200px] truncate">{shopInfo.address || 'Store Address'}</span></div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          ) : (
            <div
              className="bg-white text-slate-900 shadow-md border border-slate-200 p-4 print:p-1 print:border-none print:shadow-none transition-all w-[320px] print:w-[72mm] print:min-w-[72mm] print:max-w-[72mm] font-sans text-xs print:text-[11px] leading-normal mx-auto print:mx-0"
              id="voucher-printable-area"
            >
              {/* Shop Branding */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
                  {shopInfo.name}
                </h1>
                <p className="text-[11px] text-slate-700 font-sans mt-0.5">{shopInfo.tagline}</p>
                <p className="text-[11px] text-slate-700 font-sans mt-0.5">{shopInfo.address}</p>
                <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
                  ဖုန်း - {shopInfo.phone}
                </p>
              </div>

              {/* Voucher Metadata Grid */}
              <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">ဘောင်ချာနံပါတ်:</span>
                  <span className="font-bold text-slate-900">{sale.voucherNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ရက်စွဲ/အချိန်:</span>
                  <span className="font-medium text-slate-900">
                    {sale.date} {sale.time ? `(${sale.time})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ဝယ်သူအမည်:</span>
                  <span className="font-bold text-slate-900">{sale.customerName || 'အထွေထွေ'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">အမျိုးအစား/ငွေရှင်း:</span>
                  <span className="font-semibold text-slate-900">
                    {sale.saleType === 'Wholesale' ? 'လက်ကား' : 'လက်လီ'} / {sale.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Itemized Receipt Table (80mm Thermal optimized layout) */}
              <div className="py-2.5 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold text-[11px] text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
                  <span className="text-left">ပစ္စည်း / အသေးစိတ်</span>
                  <span className="text-right">ကျသင့်ငွေ</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-semibold text-slate-950 flex justify-between items-start gap-1">
                        <span className="text-left leading-tight break-words flex-1">{item.productName}</span>
                        <span className="text-right font-bold shrink-0 text-slate-900 min-w-[70px]">
                          {(item.totalAmount ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 pl-0.5">
                        <span>
                          {(item.quantity ?? (item as any).weightKg ?? 1)} x {(item.unitPrice ?? (item as any).pricePerKg ?? 0).toLocaleString()} ကျပ်
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Calculations */}
              <div className="py-2.5 space-y-1 text-[11px] text-slate-800 border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-600">ကျသင့်ငွေ စုစုပေါင်း:</span>
                  <span className="font-semibold">{(sale.subtotal ?? 0).toLocaleString()} ကျပ်</span>
                </div>
                {(sale.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>လျှော့ဈေး (Discount):</span>
                    <span>- {(sale.discount ?? 0).toLocaleString()} ကျပ်</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 text-xs sm:text-sm font-bold text-slate-950 border-t border-slate-800">
                  <span>အသားတင် ကျသင့်ငွေ:</span>
                  <span className="text-indigo-950 font-extrabold">{(sale.grandTotal ?? 0).toLocaleString()} ကျပ်</span>
                </div>

                {sale.cashReceived !== undefined && sale.cashReceived > 0 && (
                  <div className="pt-1.5 text-[11px] space-y-0.5 text-slate-700 border-t border-dotted border-slate-400 mt-1">
                    <div className="flex justify-between">
                      <span>ပေးငွေ (Cash):</span>
                      <span>{(sale.cashReceived ?? 0).toLocaleString()} ကျပ်</span>
                    </div>
                    {sale.changeAmount !== undefined && (
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>ပြန်အမ်းငွေ (Change):</span>
                        <span>{(sale.changeAmount ?? 0).toLocaleString()} ကျပ်</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              {sale.notes && (
                <div className="py-2 text-[10px] text-slate-700 border-b border-dashed border-slate-400">
                  <span className="font-bold">မှတ်ချက်:</span> {sale.notes}
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-3 text-center text-[10px] text-slate-700 space-y-1 font-sans">
                <p className="font-semibold">{shopInfo.voucherNote}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                  *** THANK YOU ***
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>80mm Thermal Receipt Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>80mm Thermal Printer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

