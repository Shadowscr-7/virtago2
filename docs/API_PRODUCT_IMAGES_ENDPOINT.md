# API Endpoint: POST /api/product-images

## 📋 Descripción

Endpoint para procesar imágenes de productos usando OpenAI Vision API (GPT-4o) y encontrar productos coincidentes en el inventario mediante matching inteligente.

## 🔗 URL

```
POST http://localhost:3001/api/product-images
```

## � Autenticación

Este endpoint requiere autenticación mediante Bearer Token (igual que todas las APIs del sistema).

### Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
```

El token se obtiene automáticamente del `localStorage` cuando se usa el `http-client` de la aplicación.

### Body Schema

```typescript
{
  images: Array<{
    imageUrl: string;        // URL de imagen (preferiblemente Cloudinary)
    metadata: {
      filename: string;      // Nombre del archivo original
      size: number;          // Tamaño en bytes
      format: string;        // MIME type (image/jpeg, image/png, etc.)
    }
  }>
}
```

### Ejemplo de Request

```json
{
  "images": [
    {
      "imageUrl": "https://res.cloudinary.com/dyy8hc876/image/upload/v1699123456/products/smartphone.jpg",
      "metadata": {
        "filename": "samsung-galaxy-s23.jpg",
        "size": 1024000,
        "format": "image/jpeg"
      }
    },
    {
      "imageUrl": "https://res.cloudinary.com/dyy8hc876/image/upload/v1699123457/products/laptop.jpg",
      "metadata": {
        "filename": "dell-xps-13.jpg",
        "size": 2048000,
        "format": "image/jpeg"
      }
    }
  ]
}
```

## 📤 Response

### Success Response (200 OK)

```typescript
{
  success: boolean;
  summary: {
    total: number;         // Total de imágenes procesadas
    successful: number;    // Procesadas exitosamente
    failed: number;        // Fallidas
  };
  results: Array<{
    imageUrl: string;
    matchScore: number;    // 0-100 (porcentaje de confianza)
    matchedProduct: {
      id: string;
      nombre: string;
      codigo: string;
      precio: number;
      categoria: string;
      imagen?: string;
      stock?: number;
      marca?: string;
    } | null;
    visionData: {
      description: string;              // Descripción generada por IA
      detectedFeatures: string[];       // Lista de características detectadas
      suggestedCategory: string;        // Categoría sugerida
      detectedBrand: string;            // Marca detectada
      detectedModel?: string;           // Modelo detectado
      detectedColor?: string;           // Color detectado
      confidence: number;               // 0-1
      additionalInfo?: {
        estimatedSize?: string;
        estimatedPrice?: string;
        targetAudience?: string;
        features?: string[];
      }
    };
    allMatches: Array<{
      product: { /* mismo schema que matchedProduct */ };
      score: number;                    // 0-100
      matchReasons: string[];           // Razones del match
    }>;
    processingTime: number;             // Milisegundos
  }>;
  errors?: Array<{
    imageUrl: string;
    error: string;
    message: string;
  }>;
  metadata?: {
    apiVersion: string;
    totalProcessingTime: number;
    model: string;
    timestamp: string;
  }
}
```

### Ejemplo de Response Exitosa

Ver archivo: `product_images_response_ejemplo.json`

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Se requiere un array de imágenes",
  "summary": {
    "total": 0,
    "successful": 0,
    "failed": 0
  }
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "OpenAI API timeout",
  "summary": {
    "total": 3,
    "successful": 1,
    "failed": 2
  },
  "results": [ /* resultados parciales */ ],
  "errors": [
    {
      "imageUrl": "https://...",
      "error": "API timeout",
      "message": "La API de OpenAI no respondió a tiempo"
    }
  ]
}
```

## 🔍 Proceso de Matching

### 1. Análisis con OpenAI Vision (GPT-4o)

```python
# Prompt usado para análisis
prompt = """
Analiza esta imagen de producto y extrae:
1. Descripción detallada del producto
2. Marca y modelo (si es identificable)
3. Color principal
4. Características físicas observables
5. Categoría sugerida
6. Precio estimado (rango)
7. Público objetivo
8. Palabras clave relevantes

Responde en formato JSON estructurado.
"""

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        }
    ],
    max_tokens=1000,
    temperature=0.3
)
```

### 2. Búsqueda en Base de Datos

```sql
-- Búsqueda multi-criterio
SELECT p.*,
  -- Similitud de texto
  similarity(p.nombre, :detected_brand || ' ' || :detected_model) as text_score,
  -- Coincidencia de categoría
  CASE WHEN p.categoria = :suggested_category THEN 0.3 ELSE 0 END as category_score,
  -- Coincidencia de características
  (SELECT COUNT(*) FROM unnest(p.caracteristicas) 
   WHERE unnest IN (:detected_features)) / :feature_count as feature_score
FROM productos p
WHERE 
  p.marca ILIKE '%' || :detected_brand || '%'
  OR p.nombre ILIKE '%' || :detected_model || '%'
  OR p.categoria ILIKE '%' || :suggested_category || '%'
ORDER BY (text_score + category_score + feature_score) DESC
LIMIT 10;
```

### 3. Cálculo de Match Score

```python
def calculate_match_score(product, vision_data):
    score = 0
    
    # Marca exacta: +30 puntos
    if product.marca.lower() == vision_data.detected_brand.lower():
        score += 30
    
    # Modelo en nombre: +25 puntos
    if vision_data.detected_model and vision_data.detected_model.lower() in product.nombre.lower():
        score += 25
    
    # Color coincidente: +15 puntos
    if vision_data.detected_color and vision_data.detected_color.lower() in product.color.lower():
        score += 15
    
    # Categoría exacta: +20 puntos
    if product.categoria == vision_data.suggested_category:
        score += 20
    # Categoría similar: +10 puntos
    elif vision_data.suggested_category in product.categoria:
        score += 10
    
    # Características coincidentes: hasta +10 puntos
    matched_features = sum(
        1 for feature in vision_data.detected_features
        if feature.lower() in product.descripcion.lower() or 
           feature.lower() in product.caracteristicas
    )
    score += min(10, matched_features * 2)
    
    return min(100, score)  # Máximo 100
```

### 4. Ordenamiento de Resultados

Los resultados se ordenan por:
1. **Match Score** (descendente)
2. **Disponibilidad** (en stock primero)
3. **Popularidad** (ventas recientes)

## 🎯 Criterios de Calidad del Match

| Match Score | Calidad | Descripción | Acción Recomendada |
|------------|---------|-------------|--------------------|
| 90-100% | Excelente | Coincidencia casi perfecta | Auto-asignar |
| 80-89% | Muy Buena | Alta probabilidad de ser correcto | Confirmar con usuario |
| 70-79% | Buena | Probable coincidencia | Mostrar con precaución |
| 60-69% | Regular | Posible coincidencia | Mostrar alternativas |
| < 60% | Baja | Baja confiabilidad | Solicitar más información |

## ⚙️ Configuración OpenAI

### Variables de Entorno Requeridas

```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.3
OPENAI_TIMEOUT=30
```

### Rate Limits

| Tier | RPM | TPM | Límite Diario |
|------|-----|-----|---------------|
| Free | 3 | 40,000 | 200 requests |
| Tier 1 | 500 | 90,000 | Ilimitado |
| Tier 2 | 5,000 | 450,000 | Ilimitado |

**Recomendación:** Tier 1 mínimo para producción

### Costos Estimados

- GPT-4o Vision: ~$0.01 por imagen (promedio)
- 1000 imágenes/día: ~$10/día = ~$300/mes

## 🔒 Seguridad y Validación

### Validaciones del Request

```python
def validate_request(data):
    # 1. Validar estructura
    if 'images' not in data or not isinstance(data['images'], list):
        raise ValidationError("Campo 'images' requerido y debe ser array")
    
    if len(data['images']) == 0:
        raise ValidationError("Debe incluir al menos una imagen")
    
    if len(data['images']) > 10:
        raise ValidationError("Máximo 10 imágenes por request")
    
    # 2. Validar cada imagen
    for img in data['images']:
        if 'imageUrl' not in img:
            raise ValidationError("Cada imagen debe tener 'imageUrl'")
        
        # Validar URL
        if not is_valid_url(img['imageUrl']):
            raise ValidationError(f"URL inválida: {img['imageUrl']}")
        
        # Solo URLs de Cloudinary permitidas (opcional)
        if not img['imageUrl'].startswith('https://res.cloudinary.com/'):
            raise ValidationError("Solo se permiten URLs de Cloudinary")
        
        # Validar metadata
        if 'metadata' not in img:
            raise ValidationError("Cada imagen debe tener 'metadata'")
        
        metadata = img['metadata']
        
        # Validar tamaño (máx 10MB)
        if metadata.get('size', 0) > 10 * 1024 * 1024:
            raise ValidationError(f"Archivo muy grande: {metadata.get('filename')}")
        
        # Validar formato
        valid_formats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if metadata.get('format') not in valid_formats:
            raise ValidationError(f"Formato no soportado: {metadata.get('format')}")
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/product-images")
@limiter.limit("10/minute")  # 10 requests por minuto
async def process_product_images(request: Request):
    # ... implementación
```

## 📊 Monitoreo y Logs

### Métricas a Trackear

```python
import prometheus_client as prom

# Contadores
total_requests = prom.Counter('product_images_requests_total', 'Total requests')
successful_matches = prom.Counter('product_images_matches_success', 'Successful matches')
failed_matches = prom.Counter('product_images_matches_failed', 'Failed matches')

# Histogramas
processing_time = prom.Histogram('product_images_processing_seconds', 'Processing time')
match_score = prom.Histogram('product_images_match_score', 'Match scores')

# Gauges
openai_api_calls = prom.Gauge('openai_api_calls_active', 'Active OpenAI API calls')
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

logger.info(
    "Processing image batch",
    extra={
        "image_count": len(images),
        "user_id": user_id,
        "request_id": request_id
    }
)

logger.debug(
    "OpenAI Vision analysis",
    extra={
        "image_url": image_url,
        "detected_brand": vision_data.detected_brand,
        "confidence": vision_data.confidence
    }
)

logger.warning(
    "Low match score",
    extra={
        "image_url": image_url,
        "match_score": match_score,
        "matched_product_id": product.id
    }
)
```

## 🧪 Testing

### Casos de Prueba

```python
import pytest

def test_single_image_success():
    response = client.post('/api/product-images', json={
        'images': [{
            'imageUrl': 'https://res.cloudinary.com/.../test.jpg',
            'metadata': {
                'filename': 'test.jpg',
                'size': 500000,
                'format': 'image/jpeg'
            }
        }]
    })
    
    assert response.status_code == 200
    assert response.json()['success'] == True
    assert len(response.json()['results']) == 1

def test_multiple_images_batch():
    # ... test con 5 imágenes

def test_invalid_url():
    # ... test con URL inválida

def test_too_large_file():
    # ... test con archivo > 10MB

def test_rate_limit():
    # ... test de rate limiting
```

## 🚀 Deployment

### Requisitos del Servidor

- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recomendado)
- **Storage**: 20GB+
- **Network**: 100Mbps+

### Variables de Entorno Producción

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_ORGANIZATION=org-...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/virtago

# Cache (Redis)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

## 📚 Referencias

- [OpenAI Vision Guide](https://platform.openai.com/docs/guides/vision)
- [GPT-4o Pricing](https://openai.com/pricing)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

---

**Implementar en Backend:** FastAPI, Node.js/Express, Django, etc.  
**Versión API:** 1.0.0  
**Última actualización:** Noviembre 2025
