# Sistema de Subida de Imágenes a Cloudinary

## Descripción

El sistema de gestión de imágenes de productos en Virtago2 integra **Cloudinary** para subida, optimización y entrega de imágenes con las siguientes características:

- ✅ Subida directa a Cloudinary desde el navegador
- ✅ Generación automática de blur data URLs para placeholders
- ✅ Indicador de progreso en tiempo real
- ✅ Validación de archivos (formato, tamaño)
- ✅ Drag & Drop y selección múltiple
- ✅ Gestión de orden e imagen principal
- ✅ Integración con API para persistencia

## Arquitectura

### 1. Servicio de Cloudinary (`src/services/cloudinary.ts`)

**Funciones principales:**

```typescript
uploadImageToCloudinary(file: File, onProgress?: (progress: UploadProgress) => void): Promise<CloudinaryUploadResult>
```
- Sube una imagen individual a Cloudinary
- Reporta progreso de subida
- Genera blur data URL automáticamente
- Retorna: `{ url, publicId, blurDataURL, width, height }`

```typescript
uploadMultipleImages(files: File[], onProgress?: (fileIndex: number, progress: UploadProgress) => void): Promise<CloudinaryUploadResult[]>
```
- Sube múltiples imágenes secuencialmente
- Progreso individual por archivo
- Útil para batch uploads

**Configuración requerida:**

En `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyy8hc876
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=virtago
```

### 2. Componente de Galería (`src/components/products/admin/product-images-gallery.tsx`)

**Características:**

- **Subida con progreso:** Muestra porcentaje de carga con spinner
- **Estados visuales:** uploading → completed → added to product
- **Validación:** Verifica formato (jpg, png, webp) y tamaño (máx 10MB)
- **Preview inmediato:** Muestra preview local mientras sube
- **Gestión completa:**
  - Establecer imagen principal (estrella)
  - Reordenar imágenes (flechas arriba/abajo)
  - Eliminar imágenes
  - Ver metadata

**Flujo de subida:**

1. Usuario selecciona archivos (input o drag & drop)
2. Validación de formato y tamaño
3. Crea previews locales
4. Sube a Cloudinary con progreso
5. Genera blur data URL
6. Agrega al estado del producto
7. Limpia estados temporales

### 3. Integración con la API

Cuando se guarda el producto, las imágenes se envían en el formato:

```json
{
  "productImages": [
    {
      "url": "https://res.cloudinary.com/dyy8hc876/image/upload/v1234/products/image1.jpg",
      "blurDataURL": "data:image/jpeg;base64,/9j/4AAQ...",
      "alt": "Descripción de la imagen",
      "isPrimary": true
    },
    {
      "url": "https://res.cloudinary.com/dyy8hc876/image/upload/v1234/products/image2.jpg",
      "blurDataURL": "data:image/jpeg;base64,/9j/4AAQ...",
      "alt": "Vista lateral",
      "isPrimary": false
    }
  ]
}
```

**Endpoint PUT:** `/api/admin/products/{prodVirtaId}`

El payload incluye:
- `productImages`: Array de objetos con url, blurDataURL, alt, isPrimary
- Solo se incluye si hay imágenes nuevas o modificadas

## Estructura de Datos

### ProductData Image Type

```typescript
{
  id: string;              // ID único local
  url: string;             // URL de Cloudinary
  blurDataURL: string;     // Base64 blur para placeholder
  alt: string;             // Texto alternativo
  isPrimary: boolean;      // Si es la imagen principal
  order: number;           // Orden de visualización
}
```

### CloudinaryUploadResult

```typescript
{
  url: string;             // URL pública de la imagen
  publicId: string;        // ID en Cloudinary para eliminación
  blurDataURL: string;     // Data URL blur generada
  width: number;           // Ancho original
  height: number;          // Alto original
}
```

## Uso

### En modo edición:

1. Click en "Editar" en el detalle del producto
2. En la galería, click en "Agregar" o drag & drop
3. Seleccionar imágenes (múltiples permitidas)
4. Ver progreso de subida
5. Gestionar orden e imagen principal
6. Click "Guardar" para persistir cambios

### Validaciones:

- ✅ Formatos: JPG, JPEG, PNG, WEBP
- ✅ Tamaño máximo: 10MB por imagen
- ✅ Mínimo 1 imagen para productos visibles
- ✅ Primera imagen se marca como principal automáticamente

## Optimizaciones de Cloudinary

Las imágenes se suben a la carpeta `products/` en Cloudinary con las siguientes transformaciones automáticas:

- **Blur data URL:** Versión 10px de ancho con desenfoque para placeholder
- **Formato automático:** Cloudinary elige el mejor formato (WebP si es soportado)
- **Compresión inteligente:** Optimización automática de calidad

## Manejo de Errores

### Errores comunes:

1. **"Formato no válido"**: Archivo no es JPG/PNG/WEBP
2. **"Archivo muy grande"**: Excede 10MB
3. **"Error de red"**: Problema de conexión con Cloudinary
4. **"Tiempo agotado"**: Upload tomó más de 30 segundos

### Recuperación:

- Los errores se muestran con toast notifications
- Imágenes con error no se agregan al producto
- Usuario puede reintentar inmediatamente
- No afecta imágenes ya subidas exitosamente

## Próximas Mejoras

- [ ] Eliminación de imágenes en Cloudinary (requiere endpoint backend)
- [ ] Recorte/edición de imágenes antes de subir
- [ ] Tags y categorización en Cloudinary
- [ ] Caché de blur data URLs
- [ ] Subida paralela en lugar de secuencial
- [ ] Preview de transformaciones de Cloudinary
- [ ] Integración con Cloudinary AI para auto-tagging

## Notas de Seguridad

⚠️ **Upload Preset**: Debe estar configurado en Cloudinary como "unsigned" para permitir subidas desde el navegador, pero con restricciones:
- Folder limitado a `products/`
- Formatos permitidos: jpg, png, webp
- Tamaño máximo configurado en Cloudinary

🔒 **Eliminación**: La eliminación de imágenes DEBE hacerse desde el backend con API key privada (no exponer en cliente).

## Soporte

Para problemas con Cloudinary:
1. Verificar variables de entorno
2. Confirmar upload preset en dashboard de Cloudinary
3. Revisar logs de consola del navegador
4. Verificar cuota de Cloudinary (plan free tiene límites)
