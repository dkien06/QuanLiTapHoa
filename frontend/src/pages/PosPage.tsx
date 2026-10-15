import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  Product,
  CartItem,
  CartSummaryData,
  DiscountType,
  PaymentMethod,
  SaleOrderDraft,
} from '../types/pos';
import { authService } from '../services/authService';
import { posService } from '../services/posService';
import {
  BarcodeScannerInput,
  type BarcodeScannerInputRef,
} from '../components/pos/BarcodeScannerInput';
import { CartTable } from '../components/pos/CartTable';
import { CartSummary } from '../components/pos/CartSummary';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import {
  Store,
  Clock,
  ArrowLeft,
  UserCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const PosPage: React.FC = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<BarcodeScannerInputRef>(null);

  // Thông tin người dùng / ca bán hàng
  const [currentUser] = useState(() => {
    return (
      authService.getStoredUser() || {
        fullName: 'Nguyễn Văn An',
        username: 'tiem_binh_an',
        storeName: 'Tạp hóa Bình An',
        storeAddress: '123 Nguyễn Trãi, Q.5, TP.HCM',
      }
    );
  });

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trạng thái Giỏ hàng
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Có sẵn 1 món mẫu để người dùng thấy giao diện ngay từ đầu
    const defaultProduct = posService.getAllProducts()[0];
    if (defaultProduct) {
      return [
        {
          productId: defaultProduct.id,
          barcode: defaultProduct.barcode,
          name: defaultProduct.name,
          unit: defaultProduct.unit,
          price: defaultProduct.price,
          quantity: 2,
          subtotal: defaultProduct.price * 2,
          stockQuantity: defaultProduct.stockQuantity,
        },
      ];
    }
    return [];
  });

  // Trạng thái Tổng kết
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<DiscountType>('FIXED');
  const [customerPaid, setCustomerPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Trạng thái Modal Hóa đơn
  const [completedOrder, setCompletedOrder] = useState<SaleOrderDraft | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Cập nhật đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tính toán Tổng kết theo thời gian thực
  const computeSummary = useCallback((): CartSummaryData => {
    const itemCount = cartItems.length;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    let discountAmount = 0;
    if (discountType === 'FIXED') {
      discountAmount = Math.min(discount, subtotal);
    } else {
      discountAmount = Math.round((subtotal * Math.min(100, discount)) / 100);
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);
    const effectivePaid = customerPaid > 0 ? customerPaid : finalTotal;
    const changeAmount = Math.max(0, effectivePaid - finalTotal);

    return {
      itemCount,
      totalQuantity,
      subtotal,
      discount,
      discountType,
      discountAmount,
      finalTotal,
      customerPaid: effectivePaid,
      changeAmount,
    };
  }, [cartItems, discount, discountType, customerPaid]);

  const summary = computeSummary();

  // Thêm sản phẩm vào giỏ (tự động cộng dồn số lượng nếu trùng barcode)
  const handleAddProduct = useCallback((product: Product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.barcode === product.barcode || item.productId === product.id
      );

      if (existingIndex > -1) {
        // Trùng mã -> Tăng số lượng
        return prevItems.map((item, idx) => {
          if (idx === existingIndex) {
            const nextQty = item.quantity + 1;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.price,
            };
          }
          return item;
        });
      }

      // Chưa có trong giỏ -> Thêm dòng mới
      const newItem: CartItem = {
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        unit: product.unit,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        stockQuantity: product.stockQuantity,
      };

      return [newItem, ...prevItems];
    });
  }, []);

  // Cập nhật số lượng mặt hàng
  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Giảm về 0 -> Xóa món
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          };
        }
        return item;
      })
    );
  }, []);

  // Xóa một món khỏi giỏ
  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // Xóa toàn bộ giỏ
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
    setCustomerPaid(0);
  }, []);

  // Kích hoạt thanh toán
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;

    const draftOrder: SaleOrderDraft = {
      id: `ord-${Date.now()}`,
      orderCode: `HD${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      items: [...cartItems],
      summary: { ...summary },
      paymentMethod,
      cashierName: currentUser.fullName || 'Thu ngân',
      storeName: currentUser.storeName || 'Tạp hóa Bình An',
      storeAddress: currentUser.storeAddress || '123 Nguyễn Trãi',
    };

    await posService.checkoutOrder(draftOrder);
    setCompletedOrder(draftOrder);
    setIsReceiptOpen(true);
  }, [cartItems, summary, paymentMethod, currentUser]);

  // Tạo đơn mới sau khi xem hóa đơn
  const handleNewOrder = useCallback(() => {
    setIsReceiptOpen(false);
    setCompletedOrder(null);
    handleClearCart();
    scannerRef.current?.focusInput();
  }, [handleClearCart]);

  // Đăng ký Phím tắt toàn trang (F2: focus scanner, F9: checkout, Esc: đóng modal)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        scannerRef.current?.focusInput();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (cartItems.length > 0 && !isReceiptOpen) {
          handleCheckout();
        }
      } else if (e.key === 'Escape') {
        if (isReceiptOpen) {
          e.preventDefault();
          setIsReceiptOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cartItems.length, isReceiptOpen, handleCheckout]);

  // Chuyển đổi toàn màn hình
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none text-slate-800">
      {/* Top POS Header Bar */}
      <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shadow-md shrink-0 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="Quay lại Bảng điều khiển"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-700" />

          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xs sm:text-sm tracking-tight text-white leading-none">
                {currentUser.storeName || 'TẠP HÓA BÌNH AN'}
              </h1>
              <span className="text-[10px] text-blue-300 font-medium">
                Màn hình Bán lẻ Thu Ngân (POS)
              </span>
            </div>
          </div>
        </div>

        {/* Info & Utility Badges */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Thu ngân viên */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium">{currentUser.fullName}</span>
          </div>

          {/* Đồng hồ */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Bật/Tắt toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main 2-Column POS Workspace */}
      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* CỘT TRÁI (~60-65%): Bảng giỏ hàng CartTable */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-[450px]">
          <CartTable
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onFocusScanner={() => scannerRef.current?.focusInput()}
          />
        </div>

        {/* CỘT PHẢI (~35-40%): Khung quét barcode + Bảng tổng thanh toán */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4 h-full overflow-y-auto">
          {/* Khung quét mã vạch BarcodeScannerInput */}
          <BarcodeScannerInput
            ref={scannerRef}
            onAddProduct={handleAddProduct}
          />

          {/* Bảng tổng kết thanh toán CartSummary */}
          <CartSummary
            summary={summary}
            onUpdateDiscount={(disc, type) => {
              setDiscount(disc);
              setDiscountType(type);
            }}
            onUpdateCustomerPaid={(paid) => setCustomerPaid(paid)}
            onPaymentMethodChange={(method) => setPaymentMethod(method)}
            selectedPaymentMethod={paymentMethod}
            onCheckout={handleCheckout}
            isDisabled={cartItems.length === 0}
          />
        </div>
      </main>

      {/* Modal Hóa đơn thanh toán xem trước */}
      <ReceiptModal
        order={completedOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
};
