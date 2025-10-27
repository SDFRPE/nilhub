// fronted/src\app\admin\productos\nuevo/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Categorías predefinidas
const categorias = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'fragancias', label: 'Fragancias' },
  { value: 'cuidado-personal', label: 'Cuidado Personal' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'otros', label: 'Otros' },
];

interface FormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  marca: string;
  precio: string;
  precio_oferta: string;
  stock: string;
  hay_stock: boolean;
  ingredientes: string;
  peso: string;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    categoria: '',
    marca: '',
    precio: '',
    precio_oferta: '',
    stock: '0',
    hay_stock: true,
    ingredientes: '',
    peso: '',
  });

  // Estado de imágenes
  const [imagenes, setImagenes] = useState<ImagePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Upload de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    // Validar cantidad (máximo 5)
    if (imagenes.length + files.length > 5) {
      setError('Máximo 5 imágenes permitidas');
      return;
    }

    // Validar tipo de archivo
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes');
        return false;
      }
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Las imágenes deben pesar menos de 5MB');
        return false;
      }
      return true;
    });

    // Crear previews
    const newPreviews: ImagePreview[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagenes(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImagenes(prev => {
      // Liberar URL del preview
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!formData.categoria) {
        throw new Error('Selecciona una categoría');
      }
      if (!formData.precio || parseFloat(formData.precio) <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (imagenes.length === 0) {
        throw new Error('Debes agregar al menos 1 imagen');
      }

      // 1. Subir imágenes a Cloudinary
      const imagenesFiles = imagenes.map(img => img.file);
      const uploadResponse = await api.upload.imagenes(imagenesFiles, 'productos');

      if (!uploadResponse.success) {
        throw new Error('Error al subir las imágenes');
      }

      // 2. Preparar datos del producto
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria as 'maquillaje' | 'skincare' | 'fragancias' | 'cuidado-personal' | 'accesorios' | 'otros', // ✅ TYPE CASTING
        marca: formData.marca || undefined,
        precio: parseFloat(formData.precio),
        precio_oferta: formData.precio_oferta ? parseFloat(formData.precio_oferta) : undefined,
        stock: parseInt(formData.stock) || 0,
        hay_stock: formData.hay_stock,
        ingredientes: formData.ingredientes || undefined,
        peso: formData.peso || undefined,
        imagenes: uploadResponse.data,
        activo: true,
      };

      // 3. Crear producto
      const response = await api.productos.create(productData);

      if (response.success) {
        setSuccess(true);

        // Redirigir después de 1 segundo
        setTimeout(() => {
          router.push('/admin/productos');
        }, 1000);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al crear el producto');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular si el formulario es válido
  const isFormValid =
    formData.nombre.trim() !== '' &&
    formData.categoria !== '' &&
    formData.precio !== '' &&
    parseFloat(formData.precio) > 0 &&
    imagenes.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/productos">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Nuevo Producto
            </h1>
            <p className="text-slate-600 mt-1">
              Completa la información de tu producto
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-900 animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Producto creado exitosamente! Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Imágenes del Producto</span>
              <Badge variant="outline">
                {imagenes.length}/5
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Zona de drop */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                dragActive
                  ? "border-pink-500 bg-pink-50"
                  : "border-slate-300 hover:border-pink-400 hover:bg-slate-50"
              )}
            >
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-pink-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Arrastra tus imágenes aquí o
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    Seleccionar Archivos
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  PNG, JPG o WEBP • Máx 5MB por imagen • Hasta 5 imágenes
                </p>
              </div>
            </div>

            {/* Preview de imágenes */}
            {imagenes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagenes.map((imagen, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-pink-300 transition-colors"
                  >
                    <img
                      src={imagen.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge de orden */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-white/90 text-slate-900 border-slate-200">
                        {index === 0 ? 'Principal' : `#${index + 1}`}
                      </Badge>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-semibold text-slate-700">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Labial Mate Rosa"
                required
                className="h-11"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="descripcion" className="text-sm font-semibold text-slate-700">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu producto, sus beneficios y características..."
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all resize-none"
              />
            </div>

            {/* Categoría y Marca */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="categoria" className="text-sm font-semibold text-slate-700">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="marca" className="text-sm font-semibold text-slate-700">
                  Marca
                </label>
                <Input
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ej: Maybelline"
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precios y Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Precios y Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="precio" className="text-sm font-semibold text-slate-700">
                  Precio (S/) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="25.00"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="precio_oferta" className="text-sm font-semibold text-slate-700">
                  Precio en Oferta (S/)
                  <span className="text-xs text-slate-500 ml-2">Opcional</span>
                </label>
                <Input
                  id="precio_oferta"
                  name="precio_oferta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_oferta}
                  onChange={handleChange}
                  placeholder="20.00"
                  className="h-11"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-semibold text-slate-700">
                  Cantidad en Stock
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Disponibilidad
                </label>
                <div className="flex items-center h-11 px-4 rounded-md border border-slate-200 bg-slate-50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hay_stock"
                      checked={formData.hay_stock}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Producto disponible para venta
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Detalles Adicionales
              <Badge variant="outline" className="text-xs">
                Opcional
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ingredientes */}
            <div className="space-y-2">
              <label htmlFor="ingredientes" className="text-sm font-semibold text-slate-700">
                Ingredientes
              </label>
              <textarea
                id="ingredientes"
                name="ingredientes"
                value={formData.ingredientes}
                onChange={handleChange}
                placeholder="Lista de ingredientes o componentes del producto..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all resize-none"
              />
            </div>

            {/* Peso/Tamaño */}
            <div className="space-y-2">
              <label htmlFor="peso" className="text-sm font-semibold text-slate-700">
                Peso / Tamaño
              </label>
              <Input
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="Ej: 50ml, 100g, 3.5g"
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <Link href="/admin/productos">
            <Button type="button" variant="outline" size="lg">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !isFormValid}
            className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/30 min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creando producto...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Crear Producto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}