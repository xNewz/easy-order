import { create } from 'zustand';

export type CartItem = {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
};

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const existing = state.items.find(i => i.menuItemId === newItem.menuItemId && i.notes === newItem.notes);
    if (existing) {
      return {
        items: state.items.map(i => i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i)
      };
    }
    return { items: [...state.items, newItem] };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.menuItemId !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity <= 0 
      ? state.items.filter(i => i.menuItemId !== id)
      : state.items.map(i => i.menuItemId === id ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
