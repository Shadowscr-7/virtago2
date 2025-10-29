# 📋 CAMBIOS EN EL WIZARD - PASO DE CLIENTES

## 🎯 OBJETIVO
Implementar correctamente el flujo de carga de clientes en el wizard, respetando que:
1. Solo se puede cargar **un tipo** (Excel O JSON, no ambos)
2. La API se llama **al confirmar**, no al subir el archivo/JSON
3. Se usa el endpoint correcto según el método de carga

---

## ✅ CAMBIOS REALIZADOS

### 1. **Separación de Carga y Confirmación** 
**Antes**: La API se llamaba inmediatamente al subir el archivo/JSON
**Ahora**: 
- Al subir archivo/JSON → Solo se cargan los datos en memoria
- Al presionar "Confirmar y Continuar" → Se llama a la API

### 2. **Validación de Método Único**
**Implementado**:
- Si carga Excel → Bloquea el botón de JSON
- Si carga JSON → Bloquea el botón de Excel
- Mensaje informativo mostrando el método seleccionado
- Para cambiar de método → Debe eliminar los datos primero (botón "🔄 Cargar Otros Datos")

### 3. **Uso de Endpoints Correctos**

#### 📤 **Si usa JSON**:
```javascript
POST /api/clients/
Content-Type: application/json
Body: Array de ClientBulkData[]
```

#### 📁 **Si usa Archivo** (Excel/CSV/TXT):
```javascript
POST /api/clients/import
Content-Type: multipart/form-data
Body: FormData con el archivo
```

---

## 🔧 COMPONENTES MODIFICADOS

### `ClientStep.tsx`

#### **Nuevos Estados**:
```typescript
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [uploadMethod, setUploadMethod] = useState<'file' | 'json' | null>(null);
```

#### **Nueva Función: `handleConfirmAndContinue()`**
```typescript
const handleConfirmAndContinue = async () => {
  if (uploadMethod === 'json') {
    // Envía JSON a POST /api/clients/
    const clientsForAPI = transformToAPIFormat(uploadedData);
    await api.admin.clients.bulkCreate(clientsForAPI);
  } else if (uploadMethod === 'file' && uploadedFile) {
    // Envía archivo a POST /api/clients/import
    const formData = new FormData();
    formData.append('file', uploadedFile);
    await fetch('/api/clients/import', { method: 'POST', body: formData });
  }
  
  // Continúa al siguiente paso
  onNext({ uploadedClients: uploadedData });
};
```

#### **Validación de Método Único**:
```typescript
<motion.button
  onClick={() => {
    if (uploadedData.length === 0 || uploadMethod === null) {
      setMethod("file");
    }
  }}
  disabled={uploadMethod === 'json' && uploadedData.length > 0}
>
  📁 Subir Archivo
</motion.button>
```

### `FileUploadComponent.tsx`

#### **Nueva Prop**:
```typescript
onFileSelect?: (file: File) => void;
```

#### **Callback en `handleFile()`**:
```typescript
const handleFile = (file: File) => {
  setUploadedFile(file);
  
  if (onFileSelect) {
    onFileSelect(file); // Notifica al padre
  }
  
  onUpload({ data: sampleData, success: true });
};
```

---

## 📊 FLUJO COMPLETO

### **Método 1: JSON**
```
1. Usuario selecciona "📋 Importar JSON"
2. Usuario pega JSON
3. Usuario presiona "Procesar JSON"
   → Se valida y muestra la vista previa
4. Usuario revisa los datos
5. Usuario presiona "✅ Confirmar y Continuar"
   → Se llama a POST /api/clients/ con el JSON
   → Se espera respuesta
   → Se continúa al siguiente paso
```

### **Método 2: Archivo (Excel/CSV/TXT)**
```
1. Usuario selecciona "📁 Subir Archivo"
2. Usuario arrastra o selecciona archivo
   → Se guarda el File en uploadedFile
3. Se muestra vista previa con datos de ejemplo
4. Usuario revisa los datos
5. Usuario presiona "✅ Confirmar y Continuar"
   → Se crea FormData con el archivo
   → Se llama a POST /api/clients/import
   → Se espera respuesta
   → Se continúa al siguiente paso
```

---

## ⚠️ ENDPOINTS REQUERIDOS EN EL BACKEND

### ✅ **Ya Existe**: `POST /api/clients/`
```typescript
// Ya implementado en el API
api.admin.clients.bulkCreate(clients: ClientBulkData[])
```

### ❌ **FALTA IMPLEMENTAR**: `POST /api/clients/import`
```typescript
// Endpoint para importación de archivos
// Debe aceptar: FormData con archivo (Excel/CSV/TXT)
// Debe retornar:
{
  "success": true,
  "message": "Importación completada. 50 clientes guardados.",
  "details": {
    "totalProcessed": 52,
    "savedCount": 50,
    "errorCount": 2
  },
  "errors": ["Fila 15: Error...", "Fila 23: Error..."]
}
```

---

## 🎨 UI/UX MEJORADA

### **Indicadores Visuales**:
1. ✅ Spinner animado durante el envío a la API
2. ✅ Texto dinámico: "Enviando JSON..." o "Importando archivo..."
3. ✅ Mensaje informativo sobre método seleccionado
4. ✅ Botones bloqueados cuando ya se cargó un método
5. ✅ Manejo de errores con mensajes descriptivos

### **Validaciones**:
1. ✅ Solo un método activo a la vez
2. ✅ No se puede cambiar de método sin limpiar los datos
3. ✅ Feedback visual de método seleccionado
4. ✅ Mensajes de error/éxito claros

---

## 🚀 PRÓXIMOS PASOS

### **Backend**:
1. Implementar endpoint `POST /api/clients/import`
2. Agregar parser para Excel/CSV/TXT
3. Validar formato de archivos
4. Retornar errores detallados por fila

### **Frontend** (Opcional):
1. Implementar parser real en `FileUploadComponent` para vista previa
2. Agregar validación de columnas del Excel
3. Mostrar errores específicos en la UI
4. Agregar barra de progreso para archivos grandes

---

## 📝 NOTAS TÉCNICAS

- **Estado del archivo se guarda en `uploadedFile`** para enviarlo al confirmar
- **Estado del método se guarda en `uploadMethod`** para saber qué endpoint usar
- **Los datos se transforman al formato de la API** antes de enviar (solo para JSON)
- **El archivo se envía tal cual** en el FormData (para import)
- **Validación de método único** previene confusión y errores

---

## 🧪 TESTING RECOMENDADO

### **Casos de Prueba**:
1. ✅ Cargar JSON válido → Confirmar → Verificar llamada a POST /api/clients/
2. ✅ Cargar Excel → Confirmar → Verificar llamada a POST /api/clients/import
3. ✅ Cargar JSON → Intentar cambiar a Excel → Debe estar bloqueado
4. ✅ Cargar Excel → Limpiar → Cargar JSON → Debe permitirlo
5. ✅ Verificar errores de API se muestran correctamente
6. ✅ Verificar spinner durante procesamiento

---

**Fecha**: Octubre 18, 2025  
**Autor**: GitHub Copilot  
**Archivos modificados**:
- `src/components/admin/quick-setup/steps/ClientStep.tsx`
- `src/components/admin/quick-setup/shared/FileUploadComponent.tsx`
