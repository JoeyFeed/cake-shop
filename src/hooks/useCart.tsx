import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductCategory } from '@/types/product';
import { toast } from 'sonner';

// Категории, которые продаются поштучно (не по весу)
const PIECE_BASED_CATEGORIES: ProductCategory[] = ['cupcakes', 'macarons', 'photo-print', 'bento-cakes'];

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateWeight: (productId: string, weight: number) => void;
  resetWeight: (productId: string) => void; // Сброс веса до базового
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
          toast.success('Количество товара увеличено');
        } else {
          // Если у товара есть вес и это не поштучная категория, автоматически устанавливаем 2.5 кг
          const newItem: CartItem = {
            ...product,
            quantity: 1,
          };
          
          // Для категорий, продающихся поштучно, не устанавливаем customWeight
          if (product.weight && !PIECE_BASED_CATEGORIES.includes(product.category)) {
            // Парсим базовый вес из строки (например "1.5 кг" -> 1.5)
            const baseWeightMatch = product.weight.match(/(\d+\.?\d*)/);
            const baseWeight = baseWeightMatch ? parseFloat(baseWeightMatch[1]) : 1;
            
            // Если базовый вес меньше 2.5 кг, устанавливаем 2.5 кг
            // Если базовый вес больше или равен 2.5 кг, оставляем базовый вес
            if (baseWeight < 2.5) {
              newItem.customWeight = 2.5;
            }
          }
          
          set({ items: [...items, newItem] });
          toast.success('Товар добавлен в корзину');
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
        toast.success('Товар удалён из корзины');
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      updateWeight: (productId, weight) => {
        // Минимальный вес 2.5 кг, шаг 0.5 кг
        const minWeight = 2.5;
        const step = 0.5;
        
        // Округляем до ближайшего шага
        const roundedWeight = Math.round(weight / step) * step;
        const finalWeight = Math.max(roundedWeight, minWeight);
        
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, customWeight: finalWeight } : item
          ),
        });
      },
      
      resetWeight: (productId) => {
        // Сбрасываем customWeight, чтобы использовать базовый вес
        set({
          items: get().items.map((item) => {
            if (item.id === productId) {
              const { customWeight, ...itemWithoutWeight } = item;
              return itemWithoutWeight;
            }
            return item;
          }),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          // Для поштучных категорий всегда используем обычную цену
          if (PIECE_BASED_CATEGORIES.includes(item.category)) {
            return total + item.price * item.quantity;
          }
          
          // Если у товара есть customWeight, пересчитываем цену пропорционально весу
          if (item.customWeight && item.weight) {
            // Парсим базовый вес из строки (например "1.5 кг" -> 1.5)
            const baseWeightMatch = item.weight.match(/(\d+\.?\d*)/);
            const baseWeight = baseWeightMatch ? parseFloat(baseWeightMatch[1]) : 1;
            
            // Пересчитываем цену пропорционально весу
            const adjustedPrice = (item.price / baseWeight) * item.customWeight;
            return total + adjustedPrice * item.quantity;
          }
          
          // Обычная цена
          return total + item.price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
