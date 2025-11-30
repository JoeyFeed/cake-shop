import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCart((state) => state.addItem);

  return (
    <Card className="group overflow-hidden transition-all hover:card-hover-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>
        {product.weight && (
          <p className="text-xs text-muted-foreground mb-2">{product.weight}</p>
        )}
        <p className="text-xl font-bold text-primary">{product.price} ₽</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => addItem(product)}
          className="w-full"
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.inStock ? 'В корзину' : 'Нет в наличии'}
        </Button>
      </CardFooter>
    </Card>
  );
};
