import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { Product } from '../../types/pos';
import { posService, playScannerBeep } from '../../services/posService';
import { Barcode, Search, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export interface BarcodeScannerInputRef {
  focusInput: () => void;
}

interface BarcodeScannerInputProps {
  onAddProduct: (product: Product) => void;
}

export const BarcodeScannerInput = forwardRef<BarcodeScannerInputRef, BarcodeScannerInputProps>(
  ({ onAddProduct }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{
      type: 'success' | 'warning' | 'error';
      text: string;
    } | null>(null);

    // Cho phép cha gọi hàm focusInput từ bên ngoài (hoặc phím tắt F2)
    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      },
    }));

    // Tự động focus ô quét khi mới mở component
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    // Cập nhật live search trực tiếp khi người dùng gõ
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      if (!val.trim()) {
        setSearchResults([]);
        setIsDropdownOpen(false);
      } else {
        const results = posService.searchProducts(val);
        setSearchResults(results);
        setIsDropdownOpen(true);
      }
    };

    const handleSelectProduct = (product: Product) => {
      if (product.stockQuantity <= 0) {
        setFeedbackMessage({
          type: 'error',
          text: `"${product.name}" hiện đã hết hàng trong kho!`,
        });
        return;
      }

      playScannerBeep();
      onAddProduct(product);

      setFeedbackMessage({
        type: 'success',
        text: `Đã thêm "${product.name}" vào giỏ hàng.`,
      });

      setInputValue('');
      setSearchResults([]);
      setIsDropdownOpen(false);
      inputRef.current?.focus();

      // Tự tắt thông báo sau 2.5s
      setTimeout(() => {
        setFeedbackMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 2500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = inputValue.trim();
        if (!query) return;

        // 1. Thử tìm kiếm chính xác bằng barcode
        const matchedByBarcode = posService.findProductByBarcode(query);
        if (matchedByBarcode) {
          handleSelectProduct(matchedByBarcode);
          return;
        }

        // 2. Nếu có danh sách kết quả live search, lấy kết quả đầu tiên
        if (searchResults.length > 0) {
          handleSelectProduct(searchResults[0]);
          return;
        }

        // 3. Không tìm thấy sản phẩm nào
        setFeedbackMessage({
          type: 'error',
          text: `Không tìm thấy sản phẩm với mã hoặc từ khóa "${query}"`,
        });
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    // Danh sách 4 sản phẩm mẫu phổ biến để test nhanh
    const sampleProducts = posService.getAllProducts().slice(0, 5);

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quét Mã Vạch / Tìm Kiếm Mặt Hàng
              </h3>
              <p className="text-xs text-slate-500">
                Quét mã hoặc gõ tên rồi nhấn <kbd className="keycap">Enter</kbd>
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            Phím tắt <kbd className="keycap text-slate-900 font-bold">F2</kbd>
          </span>
        </div>

        {/* Input Barcode Scanner */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim() && searchResults.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            placeholder="Quét mã vạch barcode hoặc gõ tên sản phẩm... (F2)"
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
            <button
              type="button"
              onClick={() => {
                const query = inputValue.trim();
                if (!query) return;
                const match = posService.findProductByBarcode(query) || searchResults[0];
                if (match) handleSelectProduct(match);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition cursor-pointer"
            >
              Thêm
            </button>
          </div>

          {/* Live Search Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-600 flex justify-between">
                <span>Gợi ý tìm kiếm ({searchResults.length} kết quả)</span>
                <span>Nhấn Enter để chọn</span>
              </div>
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-blue-50/80 transition cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                        {product.barcode}
                      </span>
                      <span>ĐVT: {product.unit}</span>
                      <span
                        className={`font-semibold ${
                          product.stockQuantity <= 3 ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        Tồn: {product.stockQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-blue-700 font-mono tabular-nums">
                      {product.price.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thông báo kết quả quét */}
        {feedbackMessage && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : feedbackMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                : 'bg-red-50 text-red-900 border border-red-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        {/* Sản phẩm mẫu nhanh cho thu ngân / test máy quét */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Chọn nhanh mặt hàng mẫu:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProduct(p)}
                className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-medium rounded-md border border-slate-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:translate-y-0.5"
              >
                <span>{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
                <span className="font-mono tabular-nums text-slate-700 font-bold">
                  {p.price.toLocaleString('vi-VN')}đ
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

BarcodeScannerInput.displayName = 'BarcodeScannerInput';
