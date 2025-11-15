# 🤖 Sistema de Análisis de Imágenes con IA

Sistema inteligente de análisis de imágenes de productos utilizando **OpenAI GPT-4 Vision API**. Permite extraer automáticamente información de productos, marcas, categorías y especificaciones técnicas desde imágenes.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
  - [API Endpoints](#api-endpoints)
  - [Servicio de Visión](#servicio-de-visión)
- [Ejemplos](#ejemplos)
- [Costos](#costos)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

### Análisis Automático de Imágenes

- **Identificación de productos**: Reconoce el producto, marca, modelo y categoría
- **Extracción de especificaciones técnicas**: Detecta características visibles o deducibles
- **Generación de descripciones**: Crea descripciones comerciales optimizadas para e-commerce
- **Tags automáticos**: Genera etiquetas relevantes para SEO y búsqueda
- **Calidad de imagen**: Evalúa resolución, claridad, fondo y detecta marcas de agua
- **Detección de texto**: Extrae texto visible en la imagen (logos, etiquetas, etc.)
- **Múltiples imágenes**: Analiza varias fotos del mismo producto desde diferentes ángulos
- **Auto-asignación**: Encuentra productos coincidentes en el inventario automáticamente

### Información Extraída

```typescript
{
  productInfo: {
    name: "Nombre del producto",
    brand: "Marca",
    category: "Categoría principal",
    subcategory: "Subcategoría",
    model: "Modelo",
    color: "Color",
    condition: "new | used | refurbished"
  },
  technicalSpecs: {
    "Procesador": "Apple A17 Pro",
    "RAM": "8GB",
    "Almacenamiento": "256GB"
  },
  tags: ["smartphone", "apple", "5g", "premium"],
  description: "Descripción comercial generada automáticamente...",
  confidence: 95, // Nivel de confianza 0-100
  imageQuality: {
    resolution: "1920x1080",
    clarity: "excellent",
    hasWatermark: false,
    backgroundType: "white",
    recommendations: ["Sugerencias de mejora"]
  },
  additionalInfo: {
    textDetected: ["iPhone 15 Pro Max", "256GB"],
    logosBrands: ["Apple"],
    packaging: true,
    multipleProducts: false,
    productCount: 1
  }
}
```

---

## 📦 Requisitos

- **Node.js**: v18 o superior
- **pnpm**: v9.12.3 o superior
- **Next.js**: v15.5.3
- **OpenAI API Key**: Necesitas una cuenta en OpenAI

### Dependencias Instaladas

```json
{
  "openai": "^6.8.1",
  "sharp": "^0.34.5"
}
```

---

## 🚀 Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
pnpm add openai sharp
```

---

## ⚙️ Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Crea una nueva API key
4. Copia la API key (comienza con `sk-proj-...`)

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` y añade tu API key:

```bash
# ============================================
# OpenAI API Configuration
# ============================================
OPENAI_API_KEY=sk-proj-tu-api-key-aqui

# Configuración del modelo de visión
OPENAI_VISION_MODEL=gpt-4o
OPENAI_MAX_TOKENS=1000

# ============================================
# Configuración de Imágenes
# ============================================
MAX_IMAGE_SIZE_MB=10
ALLOWED_IMAGE_FORMATS=jpg,jpeg,png,webp
```

### 3. Verificar Configuración

Reinicia el servidor de desarrollo:

```bash
pnpm dev
```

---

## 🎯 Uso

### API Endpoints

#### 1. Analizar una Imagen

**Endpoint**: `POST /api/images/analyze`

Analiza una única imagen y extrae toda la información del producto.

**Request**:
```json
{
  "imageUrl": "https://example.com/product.jpg",
  // O alternativamente:
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  
  // Opcional: Contexto de productos
  "productContext": {
    "existingProducts": [
      {
        "sku": "SKU-001",
        "name": "iPhone 15 Pro Max",
        "brand": "Apple"
      }
    ],
    "categories": ["Smartphones", "Electrónica"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "productInfo": { ... },
    "technicalSpecs": { ... },
    "tags": [...],
    "description": "...",
    "confidence": 95,
    "imageQuality": { ... },
    "additionalInfo": { ... }
  },
  "message": "Imagen analizada exitosamente"
}
```

#### 2. Analizar Múltiples Imágenes

**Endpoint**: `POST /api/images/analyze-multiple`

Analiza varias imágenes del mismo producto (máximo 5).

**Request**:
```json
{
  "imageUrls": [
    "https://example.com/product-front.jpg",
    "https://example.com/product-back.jpg",
    "https://example.com/product-side.jpg"
  ],
  "productContext": {
    "categories": ["Electrónica", "Laptops"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": { ... },
  "imagesAnalyzed": 3,
  "message": "3 imágenes analizadas exitosamente"
}
```

#### 3. Encontrar Productos Coincidentes

**Endpoint**: `POST /api/images/find-matches`

Compara una imagen con productos existentes para encontrar coincidencias.

**Request**:
```json
{
  "imageUrl": "https://example.com/unknown-product.jpg",
  "existingProducts": [
    {
      "sku": "SKU-001",
      "name": "iPhone 15 Pro Max",
      "brand": "Apple",
      "category": "Smartphones"
    },
    {
      "sku": "SKU-002",
      "name": "Samsung Galaxy S24",
      "brand": "Samsung",
      "category": "Smartphones"
    }
  ],
  "minSimilarity": 70  // Opcional, por defecto 60
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "sku": "SKU-001",
        "name": "iPhone 15 Pro Max",
        "similarity": 95,
        "reason": "El producto en la imagen coincide exactamente con el iPhone 15 Pro Max por su diseño, cámara triple y acabado titanio"
      }
    ],
    "totalMatches": 1,
    "productsScanned": 2,
    "minSimilarity": 70
  },
  "message": "Se encontraron 1 productos coincidentes"
}
```

### Servicio de Visión (Uso Directo)

También puedes usar el servicio directamente en tu código:

```typescript
import { getVisionService, fileToBase64 } from '@/services/image-vision.service';

// Obtener instancia del servicio
const visionService = getVisionService();

// Analizar imagen desde URL
const analysis = await visionService.analyzeProductImage(
  'https://example.com/product.jpg',
  {
    existingProducts: [...],
    categories: [...]
  }
);

// Analizar múltiples imágenes
const multiAnalysis = await visionService.analyzeMultipleProductImages(
  [
    'https://example.com/img1.jpg',
    'https://example.com/img2.jpg'
  ]
);

// Encontrar coincidencias
const matches = await visionService.findMatchingProducts(
  'https://example.com/product.jpg',
  existingProducts
);
```

### Convertir File a Base64

```typescript
import { fileToBase64, validateImageFile } from '@/services/image-vision.service';

// Validar archivo
const validation = validateImageFile(file, 10, ['jpg', 'png', 'webp']);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Convertir a base64
const base64 = await fileToBase64(file);

// Usar en análisis
const analysis = await visionService.analyzeProductImage(base64);
```

---

## 📝 Ejemplos

### Ejemplo 1: Auto-Asignar Imagen a Producto

```typescript
async function autoAssignImage(imageFile: File, products: Product[]) {
  // 1. Convertir imagen a base64
  const base64 = await fileToBase64(imageFile);
  
  // 2. Buscar coincidencias
  const response = await fetch('/api/images/find-matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      existingProducts: products.map(p => ({
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        category: p.category
      })),
      minSimilarity: 80
    })
  });
  
  const data = await response.json();
  
  if (data.data.matches.length > 0) {
    const bestMatch = data.data.matches[0];
    console.log(`Imagen asignada a: ${bestMatch.name} (${bestMatch.similarity}% similitud)`);
    return bestMatch.sku;
  }
  
  return null;
}
```

### Ejemplo 2: Analizar y Crear Producto Automáticamente

```typescript
async function createProductFromImage(imageUrl: string) {
  const response = await fetch('/api/images/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl })
  });
  
  const { data } = await response.json();
  
  // Crear producto con información extraída
  const newProduct = {
    name: data.productInfo.name,
    brand: data.productInfo.brand,
    category: data.productInfo.category,
    description: data.description,
    tags: data.tags,
    specifications: data.technicalSpecs,
    images: [imageUrl],
    condition: data.productInfo.condition
  };
  
  return newProduct;
}
```

### Ejemplo 3: Validar Calidad de Imágenes

```typescript
async function validateImageQuality(imageUrl: string) {
  const response = await fetch('/api/images/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl })
  });
  
  const { data } = await response.json();
  const quality = data.imageQuality;
  
  if (quality.clarity === 'poor') {
    return {
      valid: false,
      message: 'Imagen de baja calidad. Por favor, usa una imagen más nítida.'
    };
  }
  
  if (quality.hasWatermark) {
    return {
      valid: false,
      message: 'La imagen contiene marcas de agua. Por favor, usa una imagen sin watermarks.'
    };
  }
  
  if (quality.backgroundType === 'complex') {
    return {
      valid: true,
      warning: 'Se recomienda usar fondo blanco o transparente para mejor presentación.'
    };
  }
  
  return { valid: true };
}
```

---

## 💰 Costos

### Modelo GPT-4o (Recomendado)

- **Input**: ~$2.50 por 1M tokens
- **Output**: ~$10.00 por 1M tokens
- **Estimación por imagen**: ~$0.01 - $0.05 USD por análisis

### Optimización de Costos

1. **Usar `detail: "low"`** para imágenes simples (reduce costos ~50%)
2. **Cachear resultados** para imágenes procesadas previamente
3. **Procesar en lotes** cuando sea posible
4. **Ajustar `maxTokens`** según necesidades (reducir si solo necesitas info básica)

---

## 🔧 Troubleshooting

### Error: "OPENAI_API_KEY no está configurada"

**Solución**: Verifica que hayas añadido tu API key en `.env.local` y reiniciado el servidor.

### Error: "Invalid API key"

**Solución**: Verifica que la API key sea correcta y tenga créditos disponibles en tu cuenta de OpenAI.

### Análisis con baja confianza

**Posibles causas**:
- Imagen borrosa o de baja resolución
- Producto no visible claramente
- Imagen con múltiples productos
- Marca o modelo desconocido

**Soluciones**:
- Usar imágenes de alta calidad
- Fondo blanco o simple
- Un producto por imagen
- Proporcionar contexto de productos existentes

### Respuesta lenta

**Causas**:
- Primera petición (cold start)
- Imágenes de alta resolución
- Análisis de múltiples imágenes

**Soluciones**:
- Comprimir imágenes antes de enviarlas
- Usar `detail: "low"` para análisis rápidos
- Implementar cache de resultados

---

## 📚 Recursos Adicionales

- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [GPT-4o Model Overview](https://platform.openai.com/docs/models/gpt-4o)
- [Best Practices for Image Analysis](https://platform.openai.com/docs/guides/vision/best-practices)

---

## 🎉 Listo para Usar

El sistema está completamente configurado y listo para usar. Solo necesitas:

1. ✅ Añadir tu `OPENAI_API_KEY` en `.env.local`
2. ✅ Reiniciar el servidor
3. ✅ Empezar a analizar imágenes

**Próximos pasos**: Continúa con los ajustes a la administración de imágenes según tus necesidades específicas.
