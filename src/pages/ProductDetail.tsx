import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { products } from '@/data/products';
import { useCart } from '@/hooks/useCart';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);
  
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Button onClick={() => navigate('/catalog')}>
            Вернуться в каталог
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.weight && (
                <p className="text-muted-foreground">{product.weight}</p>
              )}
            </div>

            <p className="text-lg text-muted-foreground">
              {product.description}
            </p>

            <div className="border-t border-b py-6">
              <p className="text-3xl font-bold text-primary">{product.price} ₽</p>
            </div>

            <Button
              size="lg"
              onClick={() => {
                addItem(product);
                navigate('/cart');
              }}
              disabled={!product.inStock}
              className="w-full md:w-auto"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
            </Button>

            {!product.inStock && (
              <p className="text-sm text-muted-foreground">
                К сожалению, этот товар временно недоступен
              </p>
            )}
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

export default ProductDetail;
