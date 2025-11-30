import { Button } from '@/components/ui/button';
import { ProductCategory } from '@/types/product';
import { categories } from '@/data/products';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | null;
  onCategoryChange: (category: ProductCategory | null) => void;
}

export const CategoryFilter = ({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.value ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.value)}
          className="transition-all"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
