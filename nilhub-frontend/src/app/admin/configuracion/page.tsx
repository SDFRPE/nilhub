'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Store,
  Upload,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  ExternalLink,
  Palette,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface ConfigData {
  nombre: string;
  descripcion: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  color_tema: string;
}

interface UpdateTiendaData {
  nombre: string;
  descripcion: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  color_tema: string;
  logo_url?: string;
  logo_cloudinary_id?: string;
  banner_url?: string;
  banner_cloudinary_id?: string;
}

const coloresPreset = [
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Púrpura', value: '#A855F7' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Naranja', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Turquesa', value: '#14B8A6' },
];

export default function ConfiguracionPage() {
  const { tienda, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setConfigData] = useState<ConfigData>({
    nombre: '',
    descripcion: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    color_tema: '#EC4899',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // ✅ Actualizar formData cuando cambie la tienda
  useEffect(() => {
    if (tienda) {
      setConfigData({
        nombre: tienda.nombre,
        descripcion: tienda.descripcion || '',
        whatsapp: tienda.whatsapp,
        instagram: tienda.instagram || '',
        facebook: tienda.facebook || '',
        color_tema: tienda.color_tema,
      });
      setLogoPreview(tienda.logo_url || '');
      setBannerPreview(tienda.banner_url || '');
    }
  }, [tienda]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfigData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setConfigData(prev => ({ ...prev, color_tema: color }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El logo debe pesar menos de 2MB');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(tienda?.logo_url || '');
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El banner debe pesar menos de 5MB');
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError('');
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(tienda?.banner_url || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        throw new Error('El nombre de la tienda es obligatorio');
      }
      if (!formData.whatsapp.trim()) {
        throw new Error('El WhatsApp es obligatorio');
      }

      // Verificar que tienda existe
      if (!tienda?._id) {
        throw new Error('No se encontró información de la tienda');
      }

      // Preparar datos a actualizar
      const updateData: Partial<UpdateTiendaData> = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        facebook: formData.facebook,
        color_tema: formData.color_tema,
      };

      // Subir logo si hay uno nuevo
      if (logoFile) {
        const logoResponse = await api.upload.imagen(logoFile, 'tiendas/logos');
        if (logoResponse.success) {
          updateData.logo_url = logoResponse.data.url;
          updateData.logo_cloudinary_id = logoResponse.data.cloudinary_id;
        }
      }

      // Subir banner si hay uno nuevo
      if (bannerFile) {
        const bannerResponse = await api.upload.imagen(bannerFile, 'tiendas/banners');
        if (bannerResponse.success) {
          updateData.banner_url = bannerResponse.data.url;
          updateData.banner_cloudinary_id = bannerResponse.data.cloudinary_id;
        }
      }

      // ✅ ÚNICO CAMBIO CRÍTICO: Agregar tienda._id como primer parámetro
      const response = await api.tiendas.update(tienda._id, updateData);

      if (response.success) {
        setSuccess(true);
        
        // Limpiar archivos temporales
        setLogoFile(null);
        setBannerFile(null);
        
        // Refrescar datos del usuario y tienda sin recargar página
        await refreshUser();
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(false), 3000);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al actualizar la configuración');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // URL del catálogo
  const catalogoUrl = `/${tienda?.slug || 'tienda-demo'}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Configuración de Tienda
        </h1>
        <p className="text-slate-600 mt-1">
          Personaliza la apariencia y datos de tu catálogo público
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Configuración actualizada correctamente!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card 1: Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-semibold text-slate-700">
                    Nombre de la Tienda *
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Cosméticos Mary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="descripcion" className="text-sm font-semibold text-slate-700">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe brevemente tu negocio..."
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="text-sm font-semibold text-slate-700">
                    WhatsApp * (con código de país)
                  </label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="51987654321"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Sin espacios ni símbolos. Ej: 51987654321
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="instagram" className="text-sm font-semibold text-slate-700">
                      Instagram
                    </label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@tutienda"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="facebook" className="text-sm font-semibold text-slate-700">
                      Facebook
                    </label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="Tu Tienda"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Card 2: Link del Catálogo */}
            <Card className="border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="h-5 w-5" />
                  Link de tu Catálogo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-slate-200">
                  <code className="text-sm font-mono text-slate-700 flex-1 truncate">
                    nilhub.xyz{catalogoUrl}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(catalogoUrl, '_blank')}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Comparte este link en tus redes sociales para que tus clientes vean tu catálogo
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Imágenes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Logo */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Logo
                  </label>
                  
                  <div className="relative w-24 h-24 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                    {logoPreview ? (
                      <div className="w-full h-full">
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        {logoFile && (
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => document.getElementById('logo')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      PNG, JPG o WEBP • Máx 2MB • Recomendado: 400x400px
                    </p>
                  </div>
                </div>

                {/* Banner */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Banner
                  </label>
                  
                  <div className="relative w-full h-32 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                    {bannerPreview ? (
                      <div className="w-full h-full">
                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        {bannerFile && (
                          <button
                            type="button"
                            onClick={removeBanner}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      id="banner"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => document.getElementById('banner')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {bannerPreview ? 'Cambiar Banner' : 'Subir Banner'}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      PNG, JPG o WEBP • Máx 5MB • Recomendado: 1200x400px
                    </p>
                  </div>
                </div>
                
              </CardContent>
            </Card>

            {/* Card 4: Color de Tema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color de Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Colores Populares
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {coloresPreset.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorChange(color.value)}
                        className={cn(
                          "relative h-12 rounded-lg transition-all hover:scale-105",
                          formData.color_tema === color.value && "ring-2 ring-offset-2 ring-slate-900"
                        )}
                        style={{ backgroundColor: color.value }}
                      >
                        {formData.color_tema === color.value && (
                          <Check className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="color_tema" className="text-sm font-semibold text-slate-700 mb-3 block">
                    Color Personalizado
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="color_tema"
                      name="color_tema"
                      value={formData.color_tema}
                      onChange={handleChange}
                      className="h-12 w-20 rounded-lg cursor-pointer border-2 border-slate-200"
                    />
                    <Input
                      value={formData.color_tema}
                      onChange={handleChange}
                      name="color_tema"
                      placeholder="#EC4899"
                      className="h-12 font-mono"
                    />
                  </div>
                </div>
                
              </CardContent>
            </Card>

            {/* Botón guardar */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Guardando cambios...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <span>Guardar Configuración</span>
                </div>
              )}
            </Button>

          </div>

          {/* Columna derecha: Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PreviewCatalogo
                    bannerPreview={bannerPreview}
                    logoPreview={logoPreview}
                    nombre={formData.nombre}
                    descripcion={formData.descripcion}
                    colorTema={formData.color_tema}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

// Componente separado para el preview
function PreviewCatalogo({
  bannerPreview,
  logoPreview,
  nombre,
  descripcion,
  colorTema
}: {
  bannerPreview: string;
  logoPreview: string;
  nombre: string;
  descripcion: string;
  colorTema: string;
}) {
  const bannerStyle = {
    backgroundColor: bannerPreview ? 'transparent' : colorTema,
    backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="h-24 w-full" style={bannerStyle} />

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="h-6 w-6 text-slate-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-900 truncate">
                {nombre || 'Tu Tienda'}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {descripcion || 'Descripción de tu tienda'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 px-4 rounded-lg text-white text-xs font-semibold"
            style={{ backgroundColor: colorTema }}
          >
            Consultar por WhatsApp
          </button>

          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="h-24 bg-slate-100 rounded-md" />
            <h4 className="text-xs font-semibold text-slate-900">Producto Ejemplo</h4>
            <p className="text-sm font-bold" style={{ color: colorTema }}>
              S/ 25.00
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Así se verá tu catálogo público
      </p>
    </div>
  );
}