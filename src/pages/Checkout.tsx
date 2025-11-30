import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendTelegramMessage, formatOrderNotification } from '@/utils/telegram';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z.string().optional(),
  comment: z.string().optional(),
}).refine((data) => {
  if (data.deliveryType === 'delivery') {
    return data.address && data.address.trim().length > 0;
  }
  return true;
}, {
  message: 'Адрес доставки обязателен',
  path: ['address'],
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: 'delivery',
    },
  });

  const formDeliveryType = watch('deliveryType');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const deliveryCost = data.deliveryType === 'delivery' ? 300 : 0;
      const totalAmount = getTotal() + deliveryCost;

      // Получаем текущего пользователя (если есть)
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Создаём заказ
      const orderData: any = {
        name: data.name,
        phone: data.phone,
        delivery_type: data.deliveryType,
        delivery_address: data.deliveryType === 'delivery' ? data.address : null,
        comment: data.comment || null,
        total: totalAmount,
        status: 'pending'
      };

      // Добавляем user_id только если пользователь авторизован
      if (userId) {
        orderData.user_id = userId;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Создаём позиции заказа (убираем product_name, так как его нет в таблице)
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Формируем данные заказа для уведомления в Telegram
      const orderForNotification = {
        id: order.id,
        name: order.name,
        phone: order.phone,
        delivery_type: order.delivery_type,
        delivery_address: order.delivery_address,
        comment: order.comment,
        total: order.total,
        order_items: items.map(item => ({
          quantity: item.quantity,
          price: item.price,
          products: { name: item.name }
        }))
      };

      // Отправляем уведомление в Telegram
      const telegramMessage = formatOrderNotification(orderForNotification);
      sendTelegramMessage(telegramMessage).catch((error) => {
        console.error('Failed to send Telegram notification:', error);
        // Не прерываем выполнение, если не удалось отправить в Telegram
      });

      toast.success('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
      clearCart();
      navigate('/');
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error?.message || 'Неизвестная ошибка';
      toast.error(`Ошибка при оформлении заказа: ${errorMessage}. Попробуйте ещё раз.`);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Контактные данные</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ваше имя *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Иван Иванов"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+7 (999) 123-45-67"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Способ получения</h2>
              <RadioGroup
                value={formDeliveryType || deliveryType}
                onValueChange={(value) => {
                  const newType = value as 'delivery' | 'pickup';
                  setDeliveryType(newType);
                  setValue('deliveryType', newType);
                }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="delivery" id="delivery" {...register('deliveryType')} />
                  <Label htmlFor="delivery" className="cursor-pointer">
                    Доставка
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" {...register('deliveryType')} />
                  <Label htmlFor="pickup" className="cursor-pointer">
                    Самовывоз
                  </Label>
                </div>
              </RadioGroup>

              {(formDeliveryType || deliveryType) === 'delivery' && (
                <div className="mt-4">
                  <Label htmlFor="address">Адрес доставки *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Улица, дом, квартира"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>
              )}

              {(formDeliveryType || deliveryType) === 'pickup' && (
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm">
                    <strong>Адрес для самовывоза:</strong><br />
                    г. Москва, ул. Примерная, д. 1<br />
                    Ежедневно с 10:00 до 20:00
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Комментарий к заказу</h2>
              <Textarea
                {...register('comment')}
                placeholder="Добавьте пожелания или уточнения к заказу"
                rows={4}
              />
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-4">Ваш заказ</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товары</span>
                  <span>{getTotal()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>{(formDeliveryType || deliveryType) === 'delivery' ? '300 ₽' : 'Бесплатно'}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Итого</span>
                  <span className="text-primary">
                    {getTotal() + ((formDeliveryType || deliveryType) === 'delivery' ? 300 : 0)} ₽
                  </span>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Подтвердить заказ
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                После оформления заказа мы свяжемся с вами для подтверждения
              </p>
            </Card>
          </div>
        </form>
      </div>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Cake Oksana. Домашняя кондитерская</p>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
