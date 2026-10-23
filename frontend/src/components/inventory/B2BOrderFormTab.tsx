import React, { useMemo, useState } from 'react';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { Factory, MapPin, Search, Clock3, Plus, Minus, Send, AlertCircle, X } from 'lucide-react';

interface B2BOrderFormTabProps { onOrderSuccess: (orderCode: string) => void; onCancel: () => void; }
const RECENT_KEY = 'recent_supplier_search_store';

export const B2BOrderFormTab: React.FC<B2BOrderFormTabProps> = ({ onOrderSuccess, onCancel }) => {
  const suppliers = purchaseOrderService.getSuppliers();
  const [search, setSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[]; } catch { return []; }
  });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderNote, setOrderNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const matchingSuppliers = useMemo(() => suppliers.filter(s => `${s.name} ${s.code} ${s.address}`.toLowerCase().includes(search.trim().toLowerCase())), [suppliers, search]);
  const recentSuppliers = recentIds.map(id => suppliers.find(s => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const selectSupplier = (id: string) => {
    setSelectedSupplierId(id);
    setQuantities({});
    setErrorMessage(null);
    setRecentIds(previous => {
      const next = [id, ...previous.filter(item => item !== id)].slice(0, 3);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* optional preference */ }
      return next;
    });
  };
  const updateQuantity = (id: string, value: number) => setQuantities(previous => ({ ...previous, [id]: Math.max(0, value) }));
  const selectedItems = (currentSupplier?.catalog || []).map(product => ({ ...product, quantity: quantities[product.productId] || 0, subtotal: (quantities[product.productId] || 0) * product.wholesalePrice })).filter(item => item.quantity > 0);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setErrorMessage(null);
    if (!currentSupplier) { setErrorMessage('Vui lòng tìm và chọn một xưởng sản xuất.'); return; }
    if (selectedItems.length === 0) { setErrorMessage('Vui lòng chọn số lượng cho ít nhất một sản phẩm.'); return; }
    const invalid = selectedItems.find(item => item.quantity < item.minOrderQuantity);
    if (invalid) { setErrorMessage(`"${invalid.name}" cần đặt tối thiểu ${invalid.minOrderQuantity} ${invalid.unit}.`); return; }
    setIsSubmitting(true);
    try {
      const record = await purchaseOrderService.createB2BOrder(currentSupplier.id, selectedItems.map(item => ({ productId: item.productId, quantity: item.quantity })), orderNote.trim() || undefined);
      onOrderSuccess(record.orderCode);
    } catch (error: unknown) { setErrorMessage(error instanceof Error ? error.message : 'Có lỗi khi tạo đơn.'); }
    finally { setIsSubmitting(false); }
  };

  return <form onSubmit={handleSubmit} className="space-y-4">
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <label htmlFor="supplier-search" className="mb-2 block text-sm font-bold text-slate-800">Tìm xưởng hoặc nhà cung cấp</label>
      <div className="relative"><Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"/><input id="supplier-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nhập tên xưởng, mã hoặc khu vực..." className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/>{search && <button type="button" onClick={() => setSearch('')} aria-label="Xóa nội dung tìm kiếm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-4 w-4"/></button>}</div>
      {!currentSupplier && <div className="mt-4">
        {!search.trim() && recentSuppliers.length > 0 && <div className="mb-4"><p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><Clock3 className="h-3.5 w-3.5"/>Xưởng đã xem gần đây</p><div className="flex flex-wrap gap-2">{recentSuppliers.map(supplier => <button key={supplier.id} type="button" onClick={() => selectSupplier(supplier.id)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">{supplier.name}</button>)}</div></div>}
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{search.trim() ? `Kết quả (${matchingSuppliers.length})` : 'Gợi ý xưởng'}</p>
        <div className="grid gap-2 sm:grid-cols-2">{matchingSuppliers.map(supplier => <button key={supplier.id} type="button" onClick={() => selectSupplier(supplier.id)} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-400 hover:shadow-sm"><span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Factory className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{supplier.name}</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3 shrink-0"/>{supplier.address}</span></span><span className="mt-1 shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{supplier.catalog.length} SP</span></button>)}</div>
        {matchingSuppliers.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">Không tìm thấy xưởng phù hợp. Thử tên hoặc khu vực khác.</p>}
      </div>}
      {currentSupplier && <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3"><div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-white p-2 text-blue-600"><Factory className="h-5 w-5"/></span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{currentSupplier.name}</p><p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><MapPin className="h-3 w-3 shrink-0"/>{currentSupplier.address}</p></div></div><button type="button" onClick={() => {setSelectedSupplierId(''); setQuantities({});}} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700">Đổi xưởng</button></div>}
    </section>

    {currentSupplier && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col justify-between gap-1 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:px-5"><div><h3 className="text-sm font-bold text-slate-900">Sản phẩm xưởng cung cấp</h3><p className="mt-0.5 text-xs text-slate-500">{currentSupplier.catalog.length} sản phẩm · Giá nhập theo bảng giá mock</p></div><span className="text-xs text-slate-500">Xưởng xác nhận sau khi gửi đơn</span></div>
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4">
        {currentSupplier.catalog.map((product, index) => {
          const quantity = quantities[product.productId] || 0;
          const underMinimum = quantity > 0 && quantity < product.minOrderQuantity;
          const artwork = ['🥫','🥤','🍜','🧃','🍪','🧴','🧼','🍚'][index % 8];
          return <article key={product.productId} className={`overflow-hidden rounded-xl border transition ${quantity > 0 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'}`}>
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 text-6xl">{artwork}</div>
            <div className="p-3"><h4 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800">{product.name}</h4><p className="mt-2 text-base font-extrabold text-blue-700">{product.wholesalePrice.toLocaleString('vi-VN')} đ</p><p className="text-xs text-slate-500">/ {product.unit}</p>
              <div className="mt-3 flex items-center justify-between gap-2"><span className="text-[11px] text-slate-500">Tối thiểu {product.minOrderQuantity}</span><div className="flex items-center gap-1"><button type="button" aria-label={`Giảm ${product.name}`} onClick={() => updateQuantity(product.productId, quantity <= product.minOrderQuantity ? 0 : quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Minus className="h-3.5 w-3.5"/></button><input type="number" min="0" aria-label={`Số lượng ${product.name}`} value={quantity} onChange={event => updateQuantity(product.productId, parseInt(event.target.value, 10) || 0)} className={`h-8 w-12 rounded-lg border text-center text-sm font-bold ${underMinimum ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}/><button type="button" aria-label={`Tăng ${product.name}`} onClick={() => updateQuantity(product.productId, quantity === 0 ? product.minOrderQuantity : quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Plus className="h-3.5 w-3.5"/></button></div></div>
              {underMinimum && <p className="mt-1 text-[10px] font-medium text-rose-600">Chưa đạt số lượng tối thiểu</p>}{quantity > 0 && <p className="mt-2 border-t border-slate-100 pt-2 text-right text-xs font-bold text-slate-700">Tạm tính {(quantity * product.wholesalePrice).toLocaleString('vi-VN')} đ</p>}
            </div>
          </article>;
        })}
      </div>
    </section>}

    {currentSupplier && <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-end"><div><label htmlFor="supplier-note" className="mb-1.5 block text-xs font-semibold text-slate-700">Ghi chú cho xưởng</label><input id="supplier-note" value={orderNote} onChange={event => setOrderNote(event.target.value)} placeholder="Ví dụ: Giao vào buổi sáng, gọi trước khi đến..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"/></div><div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 md:min-w-56"><p className="text-xs text-slate-500">{selectedItems.length} sản phẩm · {totalQuantity} đơn vị</p><p className="text-xl font-extrabold text-blue-700">{totalAmount.toLocaleString('vi-VN')} đ</p></div></div>}
    {errorMessage && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="h-4 w-4 shrink-0"/>{errorMessage}</div>}
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Hủy</button><button type="submit" disabled={isSubmitting || !currentSupplier || selectedItems.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Đang gửi...' : <><Send className="h-4 w-4"/>Gửi đơn đặt hàng</>}</button></div>
  </form>;
};
