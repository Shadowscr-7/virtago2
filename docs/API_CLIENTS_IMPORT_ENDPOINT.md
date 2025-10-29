# 📁 ENDPOINT FALTANTE: POST /api/clients/import

## 🎯 DESCRIPCIÓN
Endpoint para importar clientes desde archivos (Excel, CSV, TXT).

---

## 📋 ESPECIFICACIONES

### **URL**
```
POST /api/clients/import
```

### **Headers**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### **Body (FormData)**
```javascript
{
  file: File // Archivo Excel (.xlsx), CSV (.csv) o TXT (.txt)
}
```

---

## 📊 FORMATOS DE ARCHIVO SOPORTADOS

### **1. Excel (.xlsx)**
- Primera hoja del libro
- Primera fila = encabezados de columna
- Resto de filas = datos de clientes

### **2. CSV (.csv)**
```csv
email,firstName,lastName,phone,gender,status,distributorCodes
cliente1@example.com,Juan,Pérez,+1234567890,M,A,"DIST001,DIST002"
cliente2@example.com,María,González,+0987654321,F,A,DIST001
```

### **3. TXT (.txt)**
Delimitado por tabs o comas:
```txt
email	firstName	lastName	phone	gender	status	distributorCodes
cliente1@example.com	Juan	Pérez	+1234567890	M	A	DIST001,DIST002
cliente2@example.com	María	González	+0987654321	F	A	DIST001
```

---

## ✅ CAMPOS ESPERADOS

### **Campos Obligatorios**:
- `email` (string) - Email único del cliente
- `firstName` (string) - Nombre
- `lastName` (string) - Apellido

### **Campos Opcionales**:
```
- gender (M/F)
- phone (string)
- phoneOptional (string)
- documentType (string)
- document (string)
- customerClass (string)
- customerClassTwo (string)
- customerClassThree (string)
- customerClassDist (string)
- customerClassDistTwo (string)
- latitude (number)
- longitude (number)
- status (A/N/I) - Default: "A"
- distributorCodes (string separado por comas: "DIST001,DIST002")

// Campos anidados en "information":
- paymentMethodCode
- companyCode
- salesmanName
- visitDay
- pdv
- deliveryDay
- warehouse
- frequency
- priceList
- routeName
- withCredit (boolean)
- distributorName
- sellerId
- routeId
- clientCode
- pdvname
- paymentTerm
```

---

## 📤 RESPUESTA ESPERADA

### **Éxito (200 OK)**
```json
{
  "success": true,
  "message": "Importación completada. 50 clientes guardados.",
  "details": {
    "totalProcessed": 52,
    "savedCount": 50,
    "errorCount": 2
  },
  "errors": [
    "Fila 15: El email es obligatorio",
    "Fila 23: El email ya existe en la base de datos"
  ]
}
```

### **Error (400/500)**
```json
{
  "success": false,
  "message": "Error procesando el archivo",
  "error": "Descripción del error",
  "details": {
    "totalProcessed": 0,
    "savedCount": 0,
    "errorCount": 0
  }
}
```

---

## 🔧 EJEMPLO DE IMPLEMENTACIÓN (Node.js/Express)

```javascript
import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/clients/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const { file } = req;
    const clients = [];
    const errors = [];

    // Detectar tipo de archivo y parsear
    if (file.originalname.endsWith('.xlsx')) {
      // Parsear Excel
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      clients.push(...data);
      
    } else if (file.originalname.endsWith('.csv')) {
      // Parsear CSV
      const stream = fs.createReadStream(file.path).pipe(csv());
      for await (const row of stream) {
        clients.push(row);
      }
      
    } else if (file.originalname.endsWith('.txt')) {
      // Parsear TXT (tab-delimited)
      const content = fs.readFileSync(file.path, 'utf8');
      const lines = content.split('\n');
      const headers = lines[0].split('\t');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        clients.push(row);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato de archivo no soportado'
      });
    }

    // Validar y guardar clientes
    let savedCount = 0;
    
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const rowNumber = i + 2; // +2 porque empezamos en 1 y la primera es header
      
      try {
        // Validaciones
        if (!client.email) {
          errors.push(`Fila ${rowNumber}: El email es obligatorio`);
          continue;
        }
        
        if (!client.firstName) {
          errors.push(`Fila ${rowNumber}: El nombre es obligatorio`);
          continue;
        }
        
        if (!client.lastName) {
          errors.push(`Fila ${rowNumber}: El apellido es obligatorio`);
          continue;
        }
        
        // Validar email único
        const existingClient = await ClientModel.findOne({ email: client.email });
        if (existingClient) {
          errors.push(`Fila ${rowNumber}: El email ${client.email} ya existe`);
          continue;
        }
        
        // Transformar distributorCodes si viene como string
        if (typeof client.distributorCodes === 'string') {
          client.distributorCodes = client.distributorCodes.split(',').map(c => c.trim());
        }
        
        // Crear cliente
        await ClientModel.create({
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          phoneOptional: client.phoneOptional,
          gender: client.gender,
          documentType: client.documentType,
          document: client.document,
          customerClass: client.customerClass,
          customerClassTwo: client.customerClassTwo,
          customerClassThree: client.customerClassThree,
          customerClassDist: client.customerClassDist,
          customerClassDistTwo: client.customerClassDistTwo,
          latitude: client.latitude ? parseFloat(client.latitude) : undefined,
          longitude: client.longitude ? parseFloat(client.longitude) : undefined,
          status: client.status || 'A',
          distributorCodes: client.distributorCodes,
          information: {
            paymentMethodCode: client.paymentMethodCode,
            companyCode: client.companyCode,
            salesmanName: client.salesmanName,
            visitDay: client.visitDay,
            pdv: client.pdv,
            deliveryDay: client.deliveryDay,
            warehouse: client.warehouse,
            frequency: client.frequency,
            priceList: client.priceList,
            routeName: client.routeName,
            withCredit: client.withCredit === 'true' || client.withCredit === true,
            distributorName: client.distributorName,
            sellerId: client.sellerId,
            routeId: client.routeId,
            clientCode: client.clientCode || client.code,
            pdvname: client.pdvname,
            paymentTerm: client.paymentTerm
          }
        });
        
        savedCount++;
        
      } catch (error) {
        errors.push(`Fila ${rowNumber}: ${error.message}`);
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(file.path);

    // Responder
    return res.json({
      success: true,
      message: `Importación completada. ${savedCount} clientes guardados.`,
      details: {
        totalProcessed: clients.length,
        savedCount,
        errorCount: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error importando clientes:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignorar error de limpieza
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error procesando el archivo',
      error: error.message
    });
  }
});

export default router;
```

---

## 📦 DEPENDENCIAS NECESARIAS (Node.js)

```bash
npm install multer xlsx csv-parser
```

```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5",
    "csv-parser": "^3.0.0"
  }
}
```

---

## 🧪 TESTING CON CURL

### **Subir Excel**
```bash
curl -X POST http://localhost:3001/api/clients/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@clientes.xlsx"
```

### **Subir CSV**
```bash
curl -X POST http://localhost:3001/api/clients/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@clientes.csv"
```

### **Subir TXT**
```bash
curl -X POST http://localhost:3001/api/clients/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@clientes.txt"
```

---

## ⚠️ CONSIDERACIONES DE SEGURIDAD

1. **Validar tipo de archivo** (MIME type)
2. **Limitar tamaño de archivo** (ej: máx 10MB)
3. **Validar autenticación** (token JWT)
4. **Sanitizar datos** antes de guardar en BD
5. **Eliminar archivos temporales** después de procesar
6. **Rate limiting** para prevenir abuse

---

## 🔄 FLUJO COMPLETO

```
Frontend                        Backend
   |                              |
   |-- POST /api/clients/import --|
   |   (file: clientes.xlsx)      |
   |                              |
   |                         [Recibir archivo]
   |                              |
   |                         [Detectar tipo]
   |                              |
   |                         [Parsear datos]
   |                              |
   |                         [Validar cada fila]
   |                              |
   |                         [Guardar en BD]
   |                              |
   |<-- Response (200 OK) --------|
   |   {success, message, details}|
   |                              |
```

---

**Fecha**: Octubre 18, 2025  
**Autor**: GitHub Copilot  
**Estado**: Pendiente de implementación
