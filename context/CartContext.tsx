'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Discount, DeliveryType, PaymentMethod } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  discount: Discount | null;
  discountAmount: number;
  setDiscount: (discount: Discount | null, amount?: number) => void;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  deliveryNotes: string;
  setDeliveryNotes: (notes: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  deliveryFee: number;
  total: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'takeo_client_cart_state';

export function CartProvider({ children, deliveryFee = 1200 }: { children: React.ReactNode; deliveryFee?: number }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscountState] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Restore cart on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items) setItems(parsed.items);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
        if (parsed.deliveryAddress) setDeliveryAddress(parsed.deliveryAddress);
        if (parsed.deliveryType) setDeliveryType(parsed.deliveryType);
      }
    } catch {
      // Ignore
    }
    setIsHydrated(true);
  }, []);

  // Save cart changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          customerName,
          customerPhone,
          deliveryAddress,
          deliveryType,
        })
      );
    } catch {
      // Ignore
    }
  }, [items, customerName, customerPhone, deliveryAddress, deliveryType, isHydrated]);

  const addItem = (product: Product, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity, notes: notes || i.notes } : i
        );
      }
      return [...prev, { product, quantity, notes }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountState(null);
    setDiscountAmount(0);
    setOrderNotes('');
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Recalculate discount whenever subtotal changes
  const setDiscount = (disc: Discount | null, amount = 0) => {
    setDiscountState(disc);
    if (!disc) {
      setDiscountAmount(0);
      return;
    }
    if (amount > 0) {
      setDiscountAmount(amount);
    } else if (disc.type === 'PERCENTAGE') {
      const calc = Math.round((subtotal * disc.value) / 100);
      setDiscountAmount(disc.max_discount_amount ? Math.min(calc, disc.max_discount_amount) : calc);
    } else {
      setDiscountAmount(Math.min(disc.value, subtotal));
    }
  };

  const currentDeliveryFee = deliveryType === 'DELIVERY' ? deliveryFee : 0;
  const total = Math.max(0, subtotal - discountAmount + currentDeliveryFee);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        discount,
        discountAmount,
        setDiscount,
        deliveryType,
        setDeliveryType,
        deliveryAddress,
        setDeliveryAddress,
        deliveryNotes,
        setDeliveryNotes,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        paymentMethod,
        setPaymentMethod,
        orderNotes,
        setOrderNotes,
        deliveryFee: currentDeliveryFee,
        total,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
