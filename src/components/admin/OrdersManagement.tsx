import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminToastSuccess, adminToastError } from '@/utils/adminToast';
import { Eye, Package } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  delivery_type: string;
  delivery_address?: string;
  phone: string;
  name: string;
  comment?: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
  };
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Сначала загружаем заказы без join на products
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Затем загружаем order_items для каждого заказа
      const orderIds = ordersData.map(order => order.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, product_id, quantity, price')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        // Не прерываем выполнение, просто логируем ошибку
      }

      // Загружаем информацию о продуктах, если есть order_items
      let productsMap: Record<string, { name: string }> = {};
      if (itemsData && itemsData.length > 0) {
        const productIds = [...new Set(itemsData.map(item => item.product_id))];
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products:', productsError);
        } else if (productsData) {
          productsMap = productsData.reduce((acc, product) => {
            acc[product.id] = { name: product.name };
            return acc;
          }, {} as Record<string, { name: string }>);
        }
      }

      // Объединяем данные
      const ordersWithItems = ordersData.map(order => ({
        ...order,
        order_items: itemsData
          ?.filter(item => item.order_id === order.id)
          .map(item => ({
            ...item,
            products: productsMap[item.product_id]
          })) || []
      }));

      console.log('Orders loaded:', ordersWithItems);
      setOrders(ordersWithItems);
    } catch (error: any) {
      console.error('Error in fetchOrders:', error);
      adminToastError('Ошибка загрузки заказов', error?.message || 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      adminToastSuccess('Статус заказа обновлён');
      fetchOrders();
    } catch (error: any) {
      adminToastError('Ошибка обновления статуса', error?.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'Новый', className: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'В обработке', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Выполнен', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Отменён', className: 'bg-red-100 text-red-800' },
    };

    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <CardTitle>Управление заказами</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№ Заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell>{order.phone}</TableCell>
                <TableCell className="font-semibold">{order.total} ₽</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Детали заказа #{order.id.slice(0, 8)}</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Клиент</p>
                              <p className="font-medium">{selectedOrder.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Телефон</p>
                              <p className="font-medium">{selectedOrder.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Доставка</p>
                              <p className="font-medium">
                                {selectedOrder.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз'}
                              </p>
                            </div>
                            {selectedOrder.delivery_address && (
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Адрес</p>
                                <p className="font-medium">{selectedOrder.delivery_address}</p>
                              </div>
                            )}
                            {selectedOrder.comment && (
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Комментарий</p>
                                <p className="font-medium">{selectedOrder.comment}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Товары</p>
                            <div className="space-y-2">
                              {selectedOrder.order_items?.map((item) => (
                                <div key={item.id} className="flex justify-between border-b pb-2">
                                  <span>{item.products?.name}</span>
                                  <span>{item.quantity} x {item.price} ₽</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="font-semibold">Итого:</span>
                            <span className="text-2xl font-bold">{selectedOrder.total} ₽</span>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Статус заказа</p>
                            <Select
                              value={selectedOrder.status}
                              onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Новый</SelectItem>
                                <SelectItem value="processing">В обработке</SelectItem>
                                <SelectItem value="completed">Выполнен</SelectItem>
                                <SelectItem value="cancelled">Отменён</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrdersManagement;
