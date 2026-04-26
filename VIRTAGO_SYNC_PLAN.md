# Virtago Sync — Plan de Integración Completo

> Generado: 2026-04-26 | Estado: Fase 1 y 2 completadas, pendiente confirmación para implementación

---

## Problema a resolver

Dos flujos de datos sin automatizar:

```
ERP Distribuidor ──(manual hoy)──▶ Virtago          [TEMA 1: entrada]
Virtago ──────────(inexistente)──▶ ERP Distribuidor  [TEMA 2: salida]
```

---

## TEMA 1: Virtago Sync (App Desktop)

### Tecnología elegida: Electron
- Stack 100% JS/TS, reutiliza componentes React existentes
- Acceso nativo al filesystem
- El equipo ya conoce el stack
- Bundle ~150MB, aceptable para distribuidores B2B

### Flujo completo

1. Distribuidor descarga `.exe`/`.dmg` desde portal Virtago
2. Login → `POST /api/auth/login` → JWT guardado en OS keychain (keytar)
3. Configura carpeta raíz → app crea subcarpetas automáticamente:
   - `/clientes`, `/productos`, `/listas-precio`, `/precios`, `/descuentos`
4. Botón "Sincronizar" dispara:
   - Escanea subcarpetas buscando `.xls`, `.xlsx`, `.csv`
   - Por cada archivo: calcula `SHA256(contenido)` → compara con procesados
   - Si ya procesado con mismo hash → **SKIP**
   - Si nuevo/modificado → parsea headers + 5 filas preview
   - Calcula `fileSignature = SHA256(headers.join('|'))`
   - Busca perfil de mapeo en Firestore para `{distributorId, entity, fileSignature}`
   - **Si existe perfil** → automapeo, no pregunta nada
   - **Si no existe** → modal de mapeo (usuario indica qué columna suya = qué campo Virtago)
   - Guarda perfil en Firestore → nunca más pregunta por ese formato
   - Transforma datos + `POST /api/sync/upload/:entity` en batches de 500
   - Registra hash como procesado

### Entidades soportadas
| Subcarpeta | Entidad Virtago |
|---|---|
| `/clientes` | Clientes / Comercios |
| `/productos` | Productos + SKUs |
| `/listas-precio` | Listas de Precio |
| `/precios` | Precios por lista |
| `/descuentos` | Descuentos / Promociones |

---

## TEMA 2: Exportación de Pedidos al ERP

### Flujo completo

**Configuración (solo primera vez):**
1. Panel Web → Configuración → "Exportar Pedidos"
2. Wizard Paso 1: formato de salida → `JSON` / `XLSX` / `CSV`
3. Wizard Paso 2: mapeo de campos
   - Izq: campos Virtago (`idPedido`, `fecha`, `cliente.nombre`, `producto.sku`, `cantidad`, `precio`, `total`, etc.)
   - Der: el distribuidor escribe cómo se llaman en su ERP
   - Preview con pedido real transformado
4. `POST /api/export/config` → guarda configuración

**Export manual (uso diario):**
1. Lista de Pedidos → filtrar → "Exportar al ERP"
2. Backend aplica mapeo + genera archivo → descarga automática
3. Distribuidor importa en su ERP

**Fase 2 — Auto-push:**
- Configurar URL + auth de API del ERP del distribuidor
- Al generarse pedidos → Virtago POST automático al ERP
- Reintentos automáticos en caso de fallo

---

## Modelo de Datos — Colecciones Firestore nuevas

### `distributors/{id}/mappingProfiles/{profileId}`
```
entity: 'clients' | 'products' | 'priceLists' | 'prices' | 'discounts'
fileSignature: string          // SHA256(headers.join('|'))
columnMapping: {               // { virtagoField: sourceColumnName }
  nombre: 'RAZON_SOCIAL',
  ruc: 'NRO_RUC',
  ...
}
createdAt: timestamp
updatedAt: timestamp
```

### `distributors/{id}/processedFiles/{fileId}`
```
filePath: string               // path relativo a la carpeta raíz
contentHash: string            // SHA256(file content)
entity: string
processedAt: timestamp
recordsProcessed: number
status: 'success' | 'partial' | 'error'
errors: string[]
```

### `distributors/{id}/exportConfig/{configId}`
```
format: 'json' | 'xlsx' | 'csv'
fieldMapping: {                // { virtagoField: erpColumnName }
  idPedido: 'NRO_ORDEN',
  ...
}
erpApiConfig?: {               // Fase 2
  url: string
  method: 'POST' | 'PUT'
  headers: Record<string, string>
  authType: 'bearer' | 'basic' | 'apikey'
  authValue: string
}
createdAt: timestamp
updatedAt: timestamp
```

---

## Rutas Backend nuevas (Express)

### Sync (Tema 1)
```
POST   /api/auth/login                     ← ya existe, verificar compatibilidad con desktop
GET    /api/sync/mapping-profiles          ?entity=&fileSignature=
POST   /api/sync/mapping-profiles          { entity, fileSignature, columnMapping }
GET    /api/sync/processed-files           ?entity=&hashes[]=
POST   /api/sync/processed-files           { filePath, contentHash, entity, recordsProcessed, status }
POST   /api/sync/upload/:entity            { records: [...] }   // batch 500 registros
```

### Export (Tema 2)
```
GET    /api/export/config                  
POST   /api/export/config                  { format, fieldMapping, erpApiConfig? }
PUT    /api/export/config/:id              
POST   /api/export/orders                  { orderIds: [], configId } → archivo descargable
```

---

## Estructura App Electron

```
virtago-sync/
├── electron/
│   ├── main.ts              // proceso principal, IPC handlers
│   ├── preload.ts           // bridge seguro renderer ↔ main
│   ├── fileScanner.ts       // walk dirs, hash files, detect changes
│   ├── fileParser.ts        // xlsx + papaparse, extrae headers + rows
│   ├── mappingEngine.ts     // fuzzy match, aplica mapping, transforma datos
│   ├── apiClient.ts         // axios wrapper con JWT + refresh
│   └── store.ts             // electron-store para config local (carpeta raíz, etc.)
├── renderer/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Config.tsx       // selección carpeta + estado subcarpetas
│   │   ├── Sync.tsx         // botón sync + log en tiempo real
│   │   └── MappingModal.tsx // modal mapeo de columnas (reutiliza lógica del wizard web)
│   └── ...
├── package.json
└── electron-builder.config.js
```

---

## Priorización (Sprints)

| Sprint | Duración | Entregable |
|---|---|---|
| **1** | 2 sem | Backend: rutas `/api/sync/*` + colecciones Firestore |
| **2** | 2 sem | Electron: login + config carpeta + scanner + parser XLS/CSV |
| **3** | 1 sem | Electron: modal mapeo + persistencia de perfiles |
| **4** | 1 sem | Web: wizard exportación + `/api/export/*` + descarga |
| **5** | 1 sem | Packaging, firma ejecutable, auto-updater, distribución |
| **Fase 2** | TBD | Auto-push a API del ERP del distribuidor |

**Esfuerzo total MVP: ~20 días hábiles**

---

## Experiencia Día 1 del Distribuidor (objetivo: <30 min)

```
Min  0-5:  Descarga e instala Virtago Sync
Min  5-7:  Login con sus credenciales Virtago existentes
Min  7-10: Selecciona carpeta raíz → subcarpetas creadas automáticamente
Min 10-15: Exporta desde su ERP los 5 archivos → los deposita en subcarpetas
Min 15-20: Clic "Sincronizar" → modal de mapeo por cada tipo (~1 min c/u)
Min 20:    ✅ Todos sus datos en Virtago. Operativo.

Segunda sincronización: ~10 segundos (sin preguntas, sin intervención)
```

---

## Riesgos Principales

| Riesgo | Mitigación |
|---|---|
| Formatos de fecha/número inconsistentes entre ERPs | Parser con normalización; config de formato de fecha por distribuidor |
| Archivos grandes (>50k filas) bloquean UI | Worker Threads en main process; batches de 500 registros |
| Cambio de columnas en ERP (rompe automapeo) | Detectar columnas faltantes → re-pedir mapeo parcial solamente |
| Múltiples archivos del mismo tipo en carpeta | Procesar todos con el mismo perfil de mapeo |
| Antivirus bloquea el ejecutable | Firma con certificado EV + distribución desde dominio oficial |
| JWT vence durante sync larga | Refresh token silencioso antes de cada batch |

---

## Dependencias de librerías (Electron)

```json
{
  "xlsx": "^0.18.5",        // parse xls/xlsx
  "papaparse": "^5.4.1",   // parse csv cualquier delimitador
  "keytar": "^7.9.0",       // OS keychain para JWT
  "electron-store": "^8.1", // config local persistente
  "fuse.js": "^7.0.0",      // fuzzy match para sugerencias de mapeo
  "exceljs": "^4.4.0",      // generar xlsx en exportación (backend)
  "electron-updater": "^6.1" // auto-update
}
```

---

## Estado actual del plan

- [x] Fase 1 — Análisis de requisitos y user stories
- [x] Fase 2 — Arquitectura y flujos completos
- [ ] Fase 3 — Implementación (pendiente confirmación)
- [ ] Fase 4 — Code review
- [ ] Fase 5 — Testing
- [ ] Fase 6 — UI/UX
- [ ] Fase 7 — Documentación
