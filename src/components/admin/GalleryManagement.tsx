import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminToastSuccess, adminToastError } from '@/utils/adminToast';
import { Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  category: string;
  created_at: string;
}

const GalleryManagement = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image_url: '',
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      adminToastError('Ошибка загрузки галереи', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      adminToastSuccess('Изображение загружено');
    } catch (error: any) {
      adminToastError('Ошибка загрузки изображения', error?.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('gallery')
        .insert({
          title: formData.title,
          category: formData.category,
          image_url: formData.image_url,
        });

      if (error) throw error;
      adminToastSuccess('Фото добавлено в галерею');
      setDialogOpen(false);
      resetForm();
      fetchGalleryItems();
    } catch (error: any) {
      adminToastError('Ошибка добавления фото', error?.message);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Удалить это фото?')) return;

    try {
      // Удаляем из базы данных
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Пытаемся удалить файл из storage
      const pathParts = imageUrl.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `gallery/${fileName}`;
      
      await supabase.storage.from('products').remove([filePath]);

      adminToastSuccess('Фото удалено');
      fetchGalleryItems();
    } catch (error: any) {
      adminToastError('Ошибка удаления фото', error?.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      image_url: '',
    });
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <CardTitle>Управление галереей</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить фото
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить фото в галерею</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Торты, Капкейки и т.д."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Изображение</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      required
                    />
                    <Button type="button" variant="outline" disabled={uploading}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded" />
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={!formData.image_url}>
                    Добавить
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                <p className="text-white font-medium text-center px-2">{item.title}</p>
                <p className="text-white/80 text-sm">{item.category}</p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id, item.image_url)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryManagement;
