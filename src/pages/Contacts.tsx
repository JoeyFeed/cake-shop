import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';

const Contacts = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Контакты</h1>
        <p className="text-center text-muted-foreground mb-12">
          Свяжитесь с нами любым удобным способом
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Телефон</h3>
            <a href="tel:+79027267881" className="text-muted-foreground hover:text-primary">
              +7 (902) 726-78-81
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <a href="mailto:sweet@dreams.ru" className="text-muted-foreground hover:text-primary">
              oksana2526@yandex.ru
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Адрес</h3>
            <p className="text-muted-foreground text-sm">
              г. Котовск<br />
              ул. Южная, д. 39
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Режим работы</h3>
            <p className="text-muted-foreground text-sm">
              Ежедневно<br />
              08:00 - 20:00
            </p>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto mt-12 p-8">
          <h2 className="text-2xl font-bold mb-4">О нас</h2>
          <p className="text-muted-foreground mb-4">
            Cake Oksana - это домашняя кондитерская, которая с любовью создаёт сладкие 
            шедевры для ваших праздников и особых моментов.
          </p>
          <p className="text-muted-foreground mb-4">
            Мы используем только натуральные ингредиенты высокого качества и уделяем 
            внимание каждой детали, чтобы ваш десерт был не только вкусным, но и красивым.
          </p>
          <p className="text-muted-foreground">
            Работаем на заказ, индивидуально подходим к каждому клиенту. 
            Принимаем заказы минимум за 2 дня.
          </p>
        </Card>
      </div>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Cake Oksana. Домашняя кондитерская</p>
        </div>
      </footer>
    </div>
  );
};

export default Contacts;
