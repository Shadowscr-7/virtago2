import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, PriceList, UploadMethod, UploadResult } from '../shared/types';

// Datos de ejemplo para listas de precios
const samplePriceLists: PriceList[] = [
  {
    id: "lista_001",
    name: "Lista Mayorista",
    description: "Precios especiales para clientes mayoristas con descuentos por volumen",
    discountPercentage: 15,
    products: [
      {
        productCode: "LAP001",
        productName: "Laptop Gaming RGB Ultra",
        basePrice: 1299.99,
        listPrice: 1104.99,
        discountPercentage: 15
      },
      {
        productCode: "MON002",
        productName: "Monitor Curvo 27 pulgadas",
        basePrice: 399.99,
        listPrice: 339.99,
        discountPercentage: 15
      }
    ]
  },
  {
    id: "lista_002",
    name: "Lista Minorista",
    description: "Precios regulares para clientes finales y pequeños distribuidores",
    discountPercentage: 5,
    products: [
      {
        productCode: "LAP001",
        productName: "Laptop Gaming RGB Ultra",
        basePrice: 1299.99,
        listPrice: 1234.99,
        discountPercentage: 5
      },
      {
        productCode: "TEC003",
        productName: "Teclado Mecánico RGB",
        basePrice: 89.99,
        listPrice: 85.49,
        discountPercentage: 5
      }
    ]
  },
  {
    id: "lista_003",
    name: "Lista VIP",
    description: "Precios preferenciales para clientes premium y distribuidores exclusivos",
    discountPercentage: 25,
    products: [
      {
        productCode: "GPU009",
        productName: "Tarjeta Gráfica RTX Super",
        basePrice: 899.99,
        listPrice: 674.99,
        discountPercentage: 25
      },
      {
        productCode: "RAM008",
        productName: "Memoria RAM DDR4 32GB",
        basePrice: 189.99,
        listPrice: 142.49,
        discountPercentage: 25
      }
    ]
  }
];

interface PriceListStepProps extends StepProps {
  stepData?: {
    uploadedPriceLists?: PriceList[];
  };
}

export function PriceListStep({ onNext, onBack, themeColors, stepData }: PriceListStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<PriceList[]>(
    Array.isArray(stepData?.uploadedPriceLists) ? stepData.uploadedPriceLists : []
  );

  const handleUpload = (result: UploadResult<PriceList>) => {
    if (result.success) {
      setIsProcessing(true);
      
      // Validar que los datos tengan la estructura correcta
      const validatedData = result.data.map(list => ({
        ...list,
        products: Array.isArray(list.products) ? list.products : []
      }));
      
      // Simular procesamiento
      setTimeout(() => {
        setUploadedData(validatedData);
        setIsProcessing(false);
        onNext({ uploadedPriceLists: validatedData });
      }, 2000);
    } else {
      // Manejar error
      console.error('Error uploading price lists:', result.error);
    }
  };

  if (uploadedData.length > 0 && !isProcessing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
            Listas de Precios Cargadas
          </h3>
          <motion.button
            onClick={() => setUploadedData([])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent 
            }}
          >
            Cargar Otras
          </motion.button>
        </div>

        {/* Resumen de listas */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Resumen de Carga
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                {uploadedData.length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Listas Cargadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                {uploadedData.reduce((total, list) => total + (list.products?.length || 0), 0)}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Productos Total
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                {uploadedData.length > 0 ? Math.round(uploadedData.reduce((total, list) => total + (list.discountPercentage || 0), 0) / uploadedData.length) : 0}%
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Descuento Promedio
              </div>
            </div>
          </div>
        </div>

        {/* Lista de listas de precios */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
            Listas de Precios
          </h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {uploadedData.map((priceList, index) => (
              <motion.div
                key={priceList.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: `${themeColors.surface}20`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold" style={{ color: themeColors.text.primary }}>
                      {priceList.name}
                    </h5>
                    <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                      {priceList.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div 
                      className="px-2 py-1 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }}
                    >
                      {priceList.discountPercentage}% desc.
                    </div>
                  </div>
                </div>

                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  <span className="font-medium">Productos:</span> {priceList.products?.length || 0}
                </div>

                {/* Muestra algunos productos de ejemplo */}
                <div className="mt-3 space-y-1">
                  {(priceList.products || []).slice(0, 2).map((product) => (
                    <div 
                      key={product.productCode}
                      className="flex justify-between text-xs p-2 rounded"
                      style={{ backgroundColor: `${themeColors.surface}40` }}
                    >
                      <span style={{ color: themeColors.text.primary }}>
                        {product.productName}
                      </span>
                      <span style={{ color: themeColors.text.secondary }}>
                        ${product.basePrice} → ${product.listPrice}
                      </span>
                    </div>
                  ))}
                  {(priceList.products?.length || 0) > 2 && (
                    <div className="text-xs text-center" style={{ color: themeColors.text.secondary }}>
                      +{(priceList.products?.length || 0) - 2} productos más...
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
            }}
          >
            Anterior
          </motion.button>
          <motion.button
            onClick={() => onNext({ uploadedPriceLists: uploadedData })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
          >
            Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de método */}
      <div className="flex items-center justify-center">
        <div 
          className="flex p-1 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.button
            onClick={() => setMethod("file")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "file" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "file" ? themeColors.primary : "transparent",
              color: method === "file" ? "white" : themeColors.text.primary,
            }}
          >
            Subir Archivo
          </motion.button>
          <motion.button
            onClick={() => setMethod("json")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "json" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "json" ? themeColors.primary : "transparent",
              color: method === "json" ? "white" : themeColors.text.primary,
            }}
          >
            Importar JSON
          </motion.button>
        </div>
      </div>

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={samplePriceLists}
        title="Listas de Precios"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
      />
    </div>
  );
}