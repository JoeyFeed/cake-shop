export type ProductCategory = 'cakes' | 'cupcakes' | 'macarons' | 'photo-print' | 'bento-cakes';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  weight?: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  customWeight?: number; // Вес в кг (для товаров с весом)
}

export interface DeliveryInfo {
  type: 'delivery' | 'pickup';
  address?: string;
  phone: string;
  name: string;
  comment?: string;
}
