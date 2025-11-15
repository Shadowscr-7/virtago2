# Sistema de Análisis de Imágenes con IA - Cloudinary + OpenAI Vision

## 📋 Resumen

Sistema completo de gestión de imágenes de productos que integra:
- **Cloudinary**: Almacenamiento y optimización de imágenes
- **OpenAI GPT-4o Vision**: Análisis inteligente de imágenes
- **Backend API**: Matching automático con inventario de productos
- **Frontend React**: UI moderna con progreso animado y resultados visuales

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Usuario       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ImageUploadModal                              │  │
│  │  - Drag & Drop multi-archivo                  │  │
│  │  - Upload a Cloudinary (directo)              │  │
│  │  - Batch processing                           │  │
│  └──────────┬────────────────────────────────────┘  │
│             │                                        │
│             ▼                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ AIProgressBar                                 │  │
│  │  - Mensajes animados                          │  │
│  │  - Progress visual                            │  │
│  │  - Estados: uploading → analyzing → matching  │  │
│  └──────────┬────────────────────────────────────┘  │
│             │                                        │
└─────────────┼────────────────────────────────────────┘
              │
              │ POST /api/product-images
              │ { images: [{ imageUrl, metadata }] }
              │ Authorization: Bearer <token>
              ▼
┌─────────────────────────────────────────────────────┐
│  Next.js API Route                                   │
│  /api/images/product-images/route.ts                │
│  - Proxy entre frontend y backend                   │
│  - Manejo de batch de imágenes                      │
│  - Gestión de errores                               │
└──────────┬──────────────────────────────────────────┘
           │
           │ POST http://localhost:3001/api/product-images
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Backend API (FastAPI/Node)                         │
│  - OpenAI Vision API (GPT-4o)                       │
│  - Análisis de características                      │
│  - Matching con productos en BD                     │
│  - Cálculo de similarity scores                     │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Response                                            │
│  {                                                   │
│    success: true,                                    │
│    summary: { total, successful, failed },          │
│    results: [                                        │
│      {                                               │
│        imageUrl,                                     │
│        matchScore: 85,                               │
│        matchedProduct: { id, nombre, ... },         │
│        visionData: { description, features, ... },  │
│        allMatches: [{ product, score }],            │
│        processingTime: 1250                          │
│      }                                               │
│    ]                                                 │
│  }                                                   │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  ImageMatchResults                                   │
│  - Tarjeta con mejor match                          │
│  - Score visual con colores                         │
│  - Lista de candidatos alternativos                 │
│  - Botones de confirmación/rechazo                  │
└─────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
src/
├── app/
│   └── api/
│       └── product-images/
│           └── route.ts              # Endpoint proxy con autenticación
│
├── components/
│   └── images/
│       └── admin/
│           ├── image-upload-modal.tsx   # Modal de carga
│           ├── ai-progress-bar.tsx      # Barra de progreso animada
│           └── image-match-results.tsx  # Resultados visuales
│
├── services/
│   └── image-vision.service.ts          # Servicio OpenAI Vision (legacy)
│
└── hooks/
    └── useImageVision.ts                # Hook React (legacy)
```

## 🔧 Configuración

### Variables de Entorno (.env.local)

```bash
# OpenAI Vision API
OPENAI_API_KEY=sk-proj-...

# Cloudinary (Cliente)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyy8hc876
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=virtago

# Cloudinary (Servidor - opcional para futuras operaciones admin)
CLOUDINARY_API_SECRET=GEtVk38BTPJavBLNK6h9TX-JyVo

# Backend API
BACKEND_API_URL=http://localhost:3001/api
```

## 🚀 Flujo de Trabajo

### 1. Usuario Carga Imágenes

```tsx
// En admin/imagenes/page.tsx
<ImageUploadModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onComplete={(images) => {
    console.log('Imágenes procesadas:', images);
    // Actualizar lista de productos
  }}
/>
```

### 2. Upload a Cloudinary (Directo)

```typescript
// Upload directo sin pasar por nuestro backend
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', 'virtago');

const response = await fetch(
  `https://api.cloudinary.com/v1_1/dyy8hc876/image/upload`,
  { method: 'POST', body: formData }
);

const { secure_url, public_id } = await response.json();
```

### 3. Envío Batch al Backend

```typescript
// POST /api/product-images (con autenticación automática vía http-client)
const response = await fetch('/api/product-images', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    // El token se agrega automáticamente en el backend Next.js
  },
  body: JSON.stringify({
    images: [
      {
        imageUrl: 'https://res.cloudinary.com/...',
        metadata: {
          filename: 'producto.jpg',
          size: 1024000,
          format: 'image/jpeg'
        }
      }
    ]
  })
});
```

**Nota:** El endpoint `/api/product-images` usa internamente `http-client` que:
- Añade automáticamente el Bearer token del `localStorage`
- Maneja refresh de tokens expirados
- Gestiona errores de autenticación (401, 403)

### 4. Backend Procesa con OpenAI Vision

```python
# En el backend (FastAPI/Node)
import openai

# Analizar imagen con GPT-4o
response = openai.chat.completions.create(
  model="gpt-4o",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "Analiza este producto..."},
        {"type": "image_url", "image_url": {"url": image_url}}
      ]
    }
  ]
)

# Extraer características detectadas
detected_features = parse_vision_response(response)

# Buscar productos similares en BD
matches = search_similar_products(detected_features)

# Calcular scores de similitud
ranked_matches = calculate_similarity_scores(matches, detected_features)
```

### 5. Response con Resultados

```json
{
  "success": true,
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  },
  "results": [
    {
      "imageUrl": "https://res.cloudinary.com/...",
      "matchScore": 85,
      "matchedProduct": {
        "id": "prod-123",
        "nombre": "Samsung Galaxy S23",
        "codigo": "SAM-S23-BLK",
        "precio": 899.99,
        "categoria": "Smartphones"
      },
      "visionData": {
        "description": "Smartphone de alta gama con pantalla AMOLED",
        "detectedFeatures": ["Pantalla grande", "Cámara triple", "Color negro"],
        "suggestedCategory": "Electrónica > Smartphones",
        "detectedBrand": "Samsung"
      },
      "allMatches": [
        { "product": {...}, "score": 92 },
        { "product": {...}, "score": 85 },
        { "product": {...}, "score": 78 }
      ],
      "processingTime": 1250
    }
  ]
}
```

## 🎨 Componentes UI

### ImageUploadModal

**Características:**
- ✅ Drag & Drop multi-archivo
- ✅ Vista previa de imágenes
- ✅ Progreso individual por imagen
- ✅ Validación (formato, tamaño)
- ✅ Upload directo a Cloudinary
- ✅ Batch processing automático

**Estados:**
- `pending`: Imagen seleccionada
- `uploading`: Subiendo a Cloudinary
- `uploaded`: Subida exitosa
- `analyzing`: Enviada al backend
- `completed`: Análisis completado
- `error`: Error en alguna etapa

### AIProgressBar

**Características:**
- ✅ Mensajes animados que rotan cada 2s
- ✅ Barra de progreso con efecto de brillo
- ✅ Indicadores de fase (Subida → Análisis → Matching)
- ✅ Contador visual (3/10 imágenes)
- ✅ Partículas decorativas durante análisis

**Mensajes por Fase:**

```typescript
uploading: [
  "📤 Subiendo imagen a la nube...",
  "☁️ Optimizando calidad de imagen...",
  "🔒 Almacenamiento seguro en proceso..."
]

analyzing: [
  "🤖 IA analizando la imagen...",
  "🔍 Detectando producto, marca y características...",
  "🧠 Extrayendo información relevante...",
  "📊 Procesando datos visuales...",
  "✨ Identificando categoría y atributos..."
]

matching: [
  "🎯 Buscando productos coincidentes...",
  "🔎 Comparando con inventario...",
  "📈 Calculando porcentaje de similitud...",
  "⚡ Ordenando resultados por relevancia..."
]
```

### ImageMatchResults

**Características:**
- ✅ Vista de imagen original analizada
- ✅ Tags de características detectadas
- ✅ Tarjeta del mejor match con score destacado
- ✅ Lista de candidatos alternativos (top 5)
- ✅ Colores según confidence:
  - Verde (≥80%): Excelente
  - Amarillo (60-79%): Buena
  - Rojo (<60%): Baja

**Acciones:**
- Confirmar producto matcheado
- Seleccionar candidato alternativo
- Rechazar todos los matches

## 📊 Métricas de Performance

### Tiempos Esperados

| Operación | Tiempo Promedio |
|-----------|----------------|
| Upload a Cloudinary | 1-2s por imagen |
| Análisis OpenAI Vision | 2-4s por imagen |
| Matching en BD | 0.5-1s por imagen |
| **Total por imagen** | **3.5-7s** |

### Optimizaciones

1. **Upload Directo a Cloudinary**
   - No pasa por nuestro servidor
   - Reduce latencia y carga

2. **Batch Processing**
   - Una sola llamada al backend para N imágenes
   - Reduce overhead de red

3. **Progress Granular**
   - Feedback visual constante
   - Mejora UX percibido

## 🔒 Seguridad

### Cloudinary

- ✅ Upload directo con `upload_preset` público
- ✅ Transformaciones automáticas (resize, optimize)
- ✅ API Secret solo en servidor (no expuesto)

### OpenAI Vision

- ✅ API Key solo en backend
- ✅ Rate limiting en backend
- ✅ Validación de URLs de imágenes

### Backend API

- ✅ Validación de tamaño/formato
- ✅ Sanitización de inputs
- ✅ Error handling robusto

## 🐛 Troubleshooting

### Error: "Failed to upload to Cloudinary"

```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
echo $NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

# Verificar preset en Cloudinary dashboard
# Settings → Upload → Upload presets → virtago (Unsigned)
```

### Error: "Backend not responding"

```bash
# Verificar backend está corriendo
curl http://localhost:3001/api/health

# Ver logs del backend
# Debería mostrar endpoint /api/product-images disponible
```

### Error: "OpenAI Vision API timeout"

```python
# En backend, aumentar timeout
openai.timeout = 30  # segundos

# Verificar límites de rate
# https://platform.openai.com/account/limits
```

### Imágenes no analizan correctamente

- Verificar formato soportado (JPG, PNG, WEBP)
- Tamaño máximo: 10MB por imagen
- Resolución mínima recomendada: 800x800px
- Imagen debe tener buen contraste y estar bien iluminada

## 📈 Próximas Mejoras

- [ ] Caché de análisis para imágenes similares
- [ ] Entrenamiento del modelo con feedback de usuarios
- [ ] Soporte para análisis de videos
- [] OCR para detectar texto en productos
- [ ] Detección de códigos de barras/QR
- [ ] Integración con sistemas de inventario externos
- [ ] Analytics de accuracy del matching

## 📚 Referencias

- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Cloudinary Upload Widget](https://cloudinary.com/documentation/upload_widget)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Framer Motion](https://www.framer.com/motion/)

---

**Desarrollado para:** Virtago2  
**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
