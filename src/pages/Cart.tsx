import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useCart } from '@/hooks/useCart';
import { ProductCategory } from '@/types/product';

// Категории, которые продаются поштучно (не по весу)
const PIECE_BASED_CATEGORIES: ProductCategory[] = ['cupcakes', 'macarons', 'photo-print', 'bento-cakes'];

const Cart = () => {
  const { items, updateQuantity, updateWeight, resetWeight, removeItem, getTotal } = useCart();

  // Функция для парсинга веса из строки (например "1.5 кг" -> 1.5)
  const parseWeight = (weightStr: string): number => {
    const match = weightStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 1;
  };

  // Функция для расчета цены за 1 кг
  const getPricePerKg = (item: typeof items[0]): number | null => {
    // Для поштучных категорий цена за кг не применима
    if (PIECE_BASED_CATEGORIES.includes(item.category) || !item.weight) {
      return null;
    }
    
    const baseWeight = parseWeight(item.weight);
    return item.price / baseWeight;
  };

  // Функция для расчета итоговой цены с учетом веса и количества
  const getItemPrice = (item: typeof items[0]): number => {
    // Для поштучных категорий всегда используем обычную цену
    if (PIECE_BASED_CATEGORIES.includes(item.category)) {
      return item.price * item.quantity;
    }
    
    if (item.customWeight && item.weight) {
      const baseWeight = parseWeight(item.weight);
      const adjustedPrice = (item.price / baseWeight) * item.customWeight;
      return adjustedPrice * item.quantity;
    }
    return item.price * item.quantity;
  };

  // Функция для получения текущего веса товара
  const getCurrentWeight = (item: typeof items[0]): number => {
    if (item.customWeight) {
      return item.customWeight;
    }
    if (item.weight) {
      return parseWeight(item.weight);
    }
    return 2.5; // Минимальный вес по умолчанию
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto p-8 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Корзина пуста</h2>
            <p className="text-muted-foreground mb-6">
              Добавьте товары из каталога
            </p>
            <Button asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Корзина</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    {item.weight && (
                      <p className="text-xs text-muted-foreground">{item.weight}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="text-right">
                      {getPricePerKg(item) !== null ? (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {getPricePerKg(item)!.toFixed(0)} ₽/кг
                          </p>
                          <p className="font-bold text-lg">
                            {getItemPrice(item).toFixed(0)} ₽
                          </p>
                        </div>
                      ) : (
                        <p className="font-bold text-lg">
                          {getItemPrice(item).toFixed(0)} ₽
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Количество товаров */}
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground mr-2">Количество:</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {/* Показываем информацию о весе и итоговой стоимости для товаров с весом */}
                  {!PIECE_BASED_CATEGORIES.includes(item.category) && item.weight && getPricePerKg(item) !== null && (
                    <div className="ml-auto text-sm text-muted-foreground">
                      <span>
                        {getCurrentWeight(item).toFixed(1)} кг × {item.quantity} шт. = {getItemPrice(item).toFixed(0)} ₽
                      </span>
                    </div>
                  )}
                </div>

                {/* Изменение веса (только для товаров с весом, не для поштучных категорий) */}
                {item.weight && !PIECE_BASED_CATEGORIES.includes(item.category) && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground mr-2">Вес:</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const currentWeight = getCurrentWeight(item);
                        const baseWeight = parseWeight(item.weight!);
                        const newWeight = currentWeight - 0.5;
                        
                        // Если новый вес меньше базового, сбрасываем customWeight (используем базовый)
                        if (newWeight < baseWeight) {
                          resetWeight(item.id);
                        } else if (newWeight >= 2.5) {
                          updateWeight(item.id, newWeight);
                        }
                      }}
                      disabled={getCurrentWeight(item) <= parseWeight(item.weight!)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-medium">
                      {getCurrentWeight(item).toFixed(1)} кг
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const currentWeight = getCurrentWeight(item);
                        updateWeight(item.id, currentWeight + 0.5);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {item.customWeight && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (базовый: {item.weight})
                      </span>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-4">Итого</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товары ({items.length})</span>
                  <span>{getTotal()} ₽</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Итого</span>
                  <span className="text-primary">{getTotal()} ₽</span>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/checkout">Оформить заказ</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Cake Oksana. Домашняя кондитерская</p>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
