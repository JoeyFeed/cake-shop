import { Link } from 'react-router-dom';
import { ArrowRight, Cake, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { categories } from '@/data/products';
import heroImage from '@/assets/hero-confectionery.jpg';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 z-10">
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                Сладкие{' '}
                <span className="text-primary">шедевры</span>
                {' '}для ваших праздников
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                Домашняя кондитерская с любовью создаёт торты, капкейки и макаронс на заказ. 
                Только натуральные ингредиенты и индивидуальный подход.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/catalog">
                    Перейти в каталог
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contacts">Связаться</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Кондитерские изделия"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">С любовью</h3>
              <p className="text-muted-foreground">
                Каждое изделие создаётся с душой и вниманием к деталям
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Cake className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Натуральные продукты</h3>
              <p className="text-muted-foreground">
                Только качественные ингредиенты без искусственных добавок
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Доставка и самовывоз</h3>
              <p className="text-muted-foreground">
                Удобные варианты получения заказа по вашему выбору
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Наши категории
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(1).map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.value}`}
                className="group relative overflow-hidden rounded-xl bg-card p-8 text-center transition-all hover:card-hover-shadow hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Смотреть товары →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent-foreground rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы сделать заказ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Выберите понравившиеся изделия в каталоге и оформите заказ прямо сейчас
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/catalog">Смотреть каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Cake Oksana. Домашняя кондитерская</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
