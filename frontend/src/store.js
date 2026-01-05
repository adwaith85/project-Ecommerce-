import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const CartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      add: (newItem) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === newItem.id);

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            cart: [...state.cart, { ...newItem, quantity: 1 }],
          };
        }),

      decrease: (id) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0),
        })),

      remove: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      clear: () => set({ cart: [] }),

      setCart: (cartItems) => set({ cart: cartItems }),

      getTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getQuantity: () => {
        return get().cart.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default CartStore;
