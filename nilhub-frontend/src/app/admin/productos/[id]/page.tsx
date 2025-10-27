// fronted/src\app\admin\productos\[id]\page.tsx
/**
 * @fileoverview Página de Edición de Producto - Panel Administrativo
 * 
 * Permite a los vendedores editar productos existentes con gestión completa de:
 * - Información básica (nombre, descripción, categoría, marca)
 * - Precios (normal y oferta)
 * - Stock manual (cantidad y disponibilidad)
 * - Imágenes (mantener existentes, eliminar, agregar nuevas - máx 5 total)
 * - Detalles opcionales (ingredientes, peso)
 * 
 * Características técnicas:
 * - Carga de producto existente desde API
 * - Upload a Cloudinary para nuevas imágenes
 * - Eliminación de imágenes antiguas de Cloudinary
 * - Validaciones en tiempo real
 * - Loading states y feedback visual
 * - Drag & drop de imágenes
 * 
 * @module EditarProductoPage
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Sparkles,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// ===================================
// CONSTANTES Y TIPOS
// ===================================

/**
 * Categorías predefinidas de productos cosméticos
 */
const categorias = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'fragancias', label: 'Fragancias' },
  { value: 'cuidado-personal', label: 'Cuidado Personal' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'otros', label: 'Otros' },
];

/**
 * Interface para los datos del formulario
 */
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

/**
 * Interface para imágenes existentes (ya en Cloudinary)
 */
interface ImagenExistente {
  url: string;
  cloudinary_id: string;
}

/**
 * Interface para imágenes nuevas (pendientes de subir)
 */
interface ImagenNueva {
  file: File;
  preview: string;
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Página de Edición de Producto
 * 
 * Flujo de edición:
 * 1. Carga producto existente desde API
 * 2. Usuario modifica datos y/o imágenes
 * 3. Al guardar:
 *    - Sube nuevas imágenes a Cloudinary
 *    - Elimina imágenes marcadas de Cloudinary
 *    - Actualiza producto con PUT /api/productos/:id
 * 
 * @returns Formulario de edición de producto
 */
export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // ===================================
  // ESTADOS
  // ===================================

  // Estados de carga y feedback
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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

  // Estados de imágenes
  const [imagenesExistentes, setImagenesExistentes] = useState<ImagenExistente[]>([]);
  const [imagenesNuevas, setImagenesNuevas] = useState<ImagenNueva[]>([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState<string[]>([]); // cloudinary_ids
  const [dragActive, setDragActive] = useState(false);

  // ===================================
  // EFECTOS
  // ===================================

  /**
   * Effect: Cargar datos del producto al montar
   * 
   * Obtiene el producto desde la API y rellena el formulario
   * con los datos existentes.
   */
  useEffect(() => {
    const loadProducto = async () => {
      setLoadingData(true);
      try {
        const response = await api.productos.getById(productId);

        if (response.success) {
          const producto = response.data;

          // Llenar formulario con datos existentes
          setFormData({
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            categoria: producto.categoria,
            marca: producto.marca || '',
            precio: producto.precio.toString(),
            precio_oferta: producto.precio_oferta?.toString() || '',
            stock: producto.stock.toString(),
            hay_stock: producto.hay_stock,
            ingredientes: producto.ingredientes || '',
            peso: producto.peso || '',
          });

          // Cargar imágenes existentes
          setImagenesExistentes(producto.imagenes || []);
        }
      } catch (err) {
        setError('Error al cargar el producto. Verifica que el ID sea correcto.');
        console.error('Error al cargar producto:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadProducto();
  }, [productId]);

  // ===================================
  // HANDLERS - FORMULARIO
  // ===================================

  /**
   * Handler para cambios en campos del formulario
   * 
   * Maneja inputs de texto, textareas, selects y checkboxes
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ===================================
  // HANDLERS - IMÁGENES EXISTENTES
  // ===================================

  /**
   * Marcar imagen existente para eliminar
   * 
   * La imagen se elimina visualmente del preview y se guarda
   * su cloudinary_id para eliminarla al guardar el producto.
   * 
   * @param index - Índice de la imagen en el array
   */
  const removeImagenExistente = (index: number) => {
    const imagen = imagenesExistentes[index];
    setImagenesAEliminar(prev => [...prev, imagen.cloudinary_id]);
    setImagenesExistentes(prev => prev.filter((_, i) => i !== index));
  };

  // ===================================
  // HANDLERS - IMÁGENES NUEVAS
  // ===================================

  /**
   * Handler para input de archivo
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  /**
   * Agregar nuevas imágenes al estado
   * 
   * Validaciones:
   * - Máximo 5 imágenes total (existentes + nuevas)
   * - Solo archivos de imagen
   * - Máximo 5MB por imagen
   * 
   * @param files - Array de archivos a agregar
   */
  const addImages = (files: File[]) => {
    const totalImagenes = imagenesExistentes.length + imagenesNuevas.length;

    // Validar cantidad total (máximo 5)
    if (totalImagenes + files.length > 5) {
      setError('Máximo 5 imágenes permitidas en total');
      return;
    }

    // Validar tipo y tamaño de cada archivo
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen (JPG, PNG, WebP)');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Las imágenes deben pesar menos de 5MB');
        return false;
      }
      return true;
    });

    // Crear previews para visualización
    const newPreviews: ImagenNueva[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagenesNuevas(prev => [...prev, ...newPreviews]);
    setError('');
  };

  /**
   * Eliminar imagen nueva (antes de subirla)
   * 
   * Libera la URL del preview para evitar memory leaks
   * 
   * @param index - Índice de la imagen en el array
   */
  const removeImagenNueva = (index: number) => {
    setImagenesNuevas(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ===================================
  // HANDLERS - DRAG & DROP
  // ===================================

  /**
   * Handler para eventos de drag (enter, over, leave)
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handler para drop de archivos
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // ===================================
  // HANDLER - SUBMIT
  // ===================================

  /**
   * Handler para envío del formulario
   * 
   * Proceso:
   * 1. Validar campos obligatorios
   * 2. Subir nuevas imágenes a Cloudinary (si las hay)
   * 3. Preparar array final de imágenes (existentes + nuevas)
   * 4. Actualizar producto con PUT /api/productos/:id
   * 5. Eliminar imágenes marcadas de Cloudinary (en paralelo)
   * 6. Redirigir a lista de productos
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ===================================
      // PASO 1: VALIDACIONES
      // ===================================

      if (!formData.nombre.trim()) {
        throw new Error('El nombre del producto es obligatorio');
      }
      if (!formData.categoria) {
        throw new Error('Debes seleccionar una categoría');
      }
      if (!formData.precio || parseFloat(formData.precio) <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      const totalImagenes = imagenesExistentes.length + imagenesNuevas.length;
      if (totalImagenes === 0) {
        throw new Error('El producto debe tener al menos 1 imagen');
      }

      // ===================================
      // PASO 2: SUBIR NUEVAS IMÁGENES
      // ===================================

      let nuevasImagenesSubidas: ImagenExistente[] = [];

      if (imagenesNuevas.length > 0) {
        const imagenesFiles = imagenesNuevas.map(img => img.file);
        const uploadResponse = await api.upload.imagenes(imagenesFiles, 'productos');

        if (!uploadResponse.success) {
          throw new Error('Error al subir las nuevas imágenes');
        }

        nuevasImagenesSubidas = uploadResponse.data;
      }

      // ===================================
      // PASO 3: PREPARAR DATOS
      // ===================================

      // Combinar imágenes existentes + nuevas subidas
      const imagenesFinales = [
        ...imagenesExistentes,
        ...nuevasImagenesSubidas
      ];

      // Preparar objeto con datos del producto
      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.categoria as 'maquillaje' | 'skincare' | 'fragancias' | 'cuidado-personal' | 'accesorios' | 'otros',
        marca: formData.marca.trim() || undefined,
        precio: parseFloat(formData.precio),
        precio_oferta: formData.precio_oferta ? parseFloat(formData.precio_oferta) : undefined,
        stock: parseInt(formData.stock) || 0,
        hay_stock: formData.hay_stock,
        ingredientes: formData.ingredientes.trim() || undefined,
        peso: formData.peso.trim() || undefined,
        imagenes: imagenesFinales,
        activo: true,
      };

      // ===================================
      // PASO 4: ACTUALIZAR PRODUCTO
      // ===================================

      const response = await api.productos.update(productId, productData);

      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar el producto');
      }

      // ===================================
      // PASO 5: ELIMINAR IMÁGENES ANTIGUAS
      // ===================================

      // Eliminar imágenes de Cloudinary en paralelo (no bloqueante)
      if (imagenesAEliminar.length > 0) {
        Promise.all(
          imagenesAEliminar.map(cloudinary_id =>
            api.upload.delete(cloudinary_id).catch((err: unknown) => { 
              console.error(`Error al eliminar imagen ${cloudinary_id}:`, err);
              // No lanzamos error aquí para no bloquear el flujo
            })
          )
        );
      }

      // ===================================
      // PASO 6: ÉXITO Y REDIRECCIÓN
      // ===================================

      setSuccess(true);

      // Liberar URLs de previews
      imagenesNuevas.forEach(img => URL.revokeObjectURL(img.preview));

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push('/admin/productos');
      }, 1500);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al actualizar el producto. Intenta nuevamente.');
      }
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // VALIDACIÓN DE FORMULARIO
  // ===================================

  /**
   * Verificar si el formulario es válido para habilitar el botón de guardar
   */
  const isFormValid =
    formData.nombre.trim() !== '' &&
    formData.categoria !== '' &&
    formData.precio !== '' &&
    parseFloat(formData.precio) > 0 &&
    (imagenesExistentes.length + imagenesNuevas.length) > 0;

  // ===================================
  // RENDERIZADO - LOADING STATE
  // ===================================

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
          <p className="text-slate-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // ===================================
  // RENDERIZADO PRINCIPAL
  // ===================================

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ===================================
          HEADER
          =================================== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/productos">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Editar Producto
            </h1>
            <p className="text-slate-600 mt-1">
              Modifica la información y las imágenes de tu producto
            </p>
          </div>
        </div>
      </div>

      {/* ===================================
          ALERTAS DE FEEDBACK
          =================================== */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>
            ¡Producto actualizado exitosamente! Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      {/* ===================================
          FORMULARIO
          =================================== */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ===================================
            SECCIÓN: IMÁGENES
            =================================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-pink-500" />
              Imágenes del Producto
              <Badge variant="outline" className="ml-2">
                {imagenesExistentes.length + imagenesNuevas.length}/5
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Grid de imágenes existentes */}
            {imagenesExistentes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Imágenes Actuales
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagenesExistentes.map((imagen, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                        <img
                          src={imagen.url}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Botón eliminar */}
                      <button
                        type="button"
                        onClick={() => removeImagenExistente(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid de imágenes nuevas */}
            {imagenesNuevas.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Imágenes Nuevas
                  <Badge className="ml-2 bg-green-500">
                    Para subir
                  </Badge>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagenesNuevas.map((imagen, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-400 bg-green-50">
                        <img
                          src={imagen.preview}
                          alt={`Nueva imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Badge "Nueva" */}
                      <Badge className="absolute top-2 left-2 bg-green-500">
                        Nueva
                      </Badge>
                      {/* Botón eliminar */}
                      <button
                        type="button"
                        onClick={() => removeImagenNueva(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zona de upload / drag & drop */}
            {(imagenesExistentes.length + imagenesNuevas.length) < 5 && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                  dragActive
                    ? "border-pink-400 bg-pink-50"
                    : "border-slate-300 hover:border-pink-400 hover:bg-slate-50"
                )}
              >
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-pink-100 p-3">
                      <Upload className="h-6 w-6 text-pink-500" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="imagenes"
                      className="text-pink-600 font-semibold hover:text-pink-700 cursor-pointer"
                    >
                      Haz clic para subir
                    </label>
                    <span className="text-slate-600"> o arrastra imágenes aquí</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, WebP hasta 5MB • Máximo {5 - (imagenesExistentes.length + imagenesNuevas.length)} más
                  </p>
                  <input
                    id="imagenes"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Mensaje cuando se alcanza el límite */}
            {(imagenesExistentes.length + imagenesNuevas.length) >= 5 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Has alcanzado el límite de 5 imágenes. Elimina alguna si deseas agregar más.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ===================================
            SECCIÓN: INFORMACIÓN BÁSICA
            =================================== */}
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

        {/* ===================================
            SECCIÓN: PRECIOS Y STOCK
            =================================== */}
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

        {/* ===================================
            SECCIÓN: DETALLES ADICIONALES
            =================================== */}
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

        {/* ===================================
            BOTONES DE ACCIÓN
            =================================== */}
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
                Actualizando...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Actualizar Producto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}