import ExcelJS from 'exceljs';

/**
 * Parse a CSV or XLSX file and return an array of objects
 * @param file The file to parse
 * @returns Promise with parsed data as array of objects
 */
export async function parseFile<T = Record<string, unknown>>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('No se pudo leer el archivo'));
          return;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data as ArrayBuffer);
        
        // Get the first sheet
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          reject(new Error('No se encontró ninguna hoja en el archivo'));
          return;
        }

        // Convert to JSON with header row
        const jsonData: T[] = [];
        const headers: string[] = [];
        
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            // First row - extract headers
            row.eachCell((cell, colNumber) => {
              headers[colNumber] = cell.value?.toString() || `Column${colNumber}`;
            });
          } else {
            // Data rows
            const rowData: Record<string, unknown> = {};
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber];
              if (header) {
                // Convert cell value to string for consistency (matching original behavior)
                const value = cell.value;
                rowData[header] = value !== null && value !== undefined ? value.toString() : '';
              }
            });
            // Fill missing columns with empty strings
            headers.forEach((header, index) => {
              if (index > 0 && !(header in rowData)) {
                rowData[header] = '';
              }
            });
            jsonData.push(rowData as T);
          }
        });

        resolve(jsonData);
      } catch (error) {
        reject(new Error(`Error al parsear el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    // Read as array buffer
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse client data from file with specific field mapping
 */
export async function parseClientFile(file: File): Promise<ClientFileData[]> {
  const rawData = await parseFile<Record<string, string>>(file);
  
  return rawData.map((row) => {
    // Parse distributorCodes if it's a string with comma-separated values
    let distributorCodes: string[] | undefined;
    if (row.distributorCodes) {
      distributorCodes = row.distributorCodes
        .split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0);
    }

    // Parse boolean fields
    const parseBoolean = (value: string | undefined): boolean | undefined => {
      if (!value) return undefined;
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si' || normalized === 'sí') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
      return undefined;
    };

    // Parse numeric fields
    const parseNumber = (value: string | undefined): number | undefined => {
      if (!value || value === '') return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    return {
      // Basic fields
      documentType: row.documentType || undefined,
      document: row.document || undefined,
      firstName: row.firstName || undefined,
      lastName: row.lastName || undefined,
      gender: row.gender as "M" | "F" | undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      phoneOptional: row.phoneOptional || undefined,
      
      // Location
      latitude: parseNumber(row.latitude),
      longitude: parseNumber(row.longitude),
      
      // Status
      status: (row.status || 'A') as "A" | "N" | "I",
      hasUser: parseBoolean(row.hasUser),
      
      // Customer classifications
      customerClass: row.customerClass || undefined,
      customerClassTwo: row.customerClassTwo || undefined,
      customerClassThree: row.customerClassThree || undefined,
      customerClassDist: row.customerClassDist || undefined,
      customerClassDistTwo: row.customerClassDistTwo || undefined,
      
      // Distributor codes
      distributorCodes,
      
      // Information object fields
      information: {
        companyCode: row['information.companyCode'] || undefined,
        clientCode: row['information.clientCode'] || undefined,
        distributorName: row['information.distributorName'] || undefined,
        sellerId: row['information.sellerId'] || undefined,
        salesmanName: row['information.salesmanName'] || undefined,
        routeId: row['information.routeId'] || undefined,
        routeName: row['information.routeName'] || undefined,
        pdv: row['information.pdv'] || undefined,
        pdvname: row['information.pdvname'] || undefined,
        visitDay: row['information.visitDay'] || undefined,
        deliveryDay: row['information.deliveryDay'] || undefined,
        frequency: row['information.frequency'] || undefined,
        paymentMethodCode: row['information.paymentMethodCode'] || undefined,
        paymentTerm: row['information.paymentTerm'] || undefined,
        priceList: row['information.priceList'] || undefined,
        withCredit: parseBoolean(row['information.withCredit']),
        warehouse: row['information.warehouse'] || undefined,
      }
    };
  });
}

/**
 * Type definition for parsed client file data
 */
export interface ClientFileData {
  documentType?: string;
  document?: string;
  firstName?: string;
  lastName?: string;
  gender?: "M" | "F";
  email?: string;
  phone?: string;
  phoneOptional?: string;
  latitude?: number;
  longitude?: number;
  status?: "A" | "N" | "I";
  hasUser?: boolean;
  customerClass?: string;
  customerClassTwo?: string;
  customerClassThree?: string;
  customerClassDist?: string;
  customerClassDistTwo?: string;
  distributorCodes?: string[];
  information?: {
    companyCode?: string;
    clientCode?: string;
    distributorName?: string;
    sellerId?: string;
    salesmanName?: string;
    routeId?: string;
    routeName?: string;
    pdv?: string;
    pdvname?: string;
    visitDay?: string;
    deliveryDay?: string;
    frequency?: string;
    paymentMethodCode?: string;
    paymentTerm?: string;
    priceList?: string;
    withCredit?: boolean;
    warehouse?: string;
  };
  // Allow any additional fields
  [key: string]: unknown;
}

/**
 * Parse price list data from file
 */
export async function parsePriceListFile(file: File) {
  const rawData = await parseFile<Record<string, string>>(file);
  
  return rawData.map((row) => {
    // Parse boolean fields
    const parseBoolean = (value: string | undefined): boolean | undefined => {
      if (!value) return undefined;
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si' || normalized === 'sí') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
      return undefined;
    };

    // Parse numeric fields
    const parseNumber = (value: string | undefined): number | undefined => {
      if (!value || value === '') return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    // Parse tags (split by comma or semicolon)
    const parseTags = (value: string | undefined): string[] | undefined => {
      if (!value) return undefined;
      return value.split(/[,;]/).map(tag => tag.trim()).filter(Boolean);
    };

    return {
      // IDs and basic info
      price_list_id: row.price_list_id || undefined,
      name: row.name || undefined,
      status: row.status || 'active',
      default: parseBoolean(row.default),
      priority: parseNumber(row.priority),
      
      // Descriptions
      description: row.description || undefined,
      notes: row.notes || undefined,
      
      // Application rules
      applies_to: row.applies_to || 'all',
      customer_type: row.customer_type || undefined,
      channel: row.channel || undefined,
      
      // Location
      country: row.country || undefined,
      region: row.region || undefined,
      
      // Pricing
      currency: row.currency || 'USD',
      discount_type: row.discount_type || undefined,
      
      // Dates
      start_date: row.start_date || undefined,
      end_date: row.end_date || undefined,
      
      // Quantities
      minimum_quantity: parseNumber(row.minimum_quantity),
      maximum_quantity: parseNumber(row.maximum_quantity),
      
      // Tags
      tags: parseTags(row.tags),
    };
  });
}

/**
 * Parse price data from file (old function kept for compatibility)
 */
export async function parsePriceFile(file: File) {
  const rawData = await parseFile<Record<string, string>>(file);
  
  return rawData.map((row) => {
    // Parse numeric fields
    const parseNumber = (value: string | undefined): number | undefined => {
      if (!value || value === '') return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    return {
      price_list_id: row.price_list_id || row.priceListId || undefined,
      productId: row.productId || row.product_id || row.productCode || row.product_code || row.sku || undefined,
      productName: row.productName || row.product_name || row.name || undefined,
      basePrice: parseNumber(row.basePrice || row.base_price || row.price),
      cost: parseNumber(row.cost || row.cost_price),
      margin: parseNumber(row.margin || row.margin_percentage),
      currency: row.currency || 'USD',
    };
  });
}

/**
 * Parse product data from file
 */
export async function parseProductFile(file: File) {
  const rawData = await parseFile<Record<string, string>>(file);
  
  return rawData.map((row) => {
    // Parse boolean fields
    const parseBoolean = (value: string | undefined): boolean | undefined => {
      if (!value) return undefined;
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si' || normalized === 'sí') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
      return undefined;
    };

    // Parse numeric fields
    const parseNumber = (value: string | undefined): number | undefined => {
      if (!value || value === '') return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    return {
      // IDs
      productId: row.productId || undefined,
      sku: row.sku || undefined,
      skuWithoutPrefix: row.skuWithoutPrefix || undefined,
      gtin: row.gtin || undefined,
      
      // Status and publishing
      status: row.status || 'active',
      published: parseBoolean(row.published),
      
      // Basic info
      name: row.name || undefined,
      title: row.title || undefined,
      shortDescription: row.shortDescription || undefined,
      fullDescription: row.fullDescription || undefined,
      
      // Categorization - Estos necesitan matching
      brand: row.brand || undefined,
      category: row.category || undefined,
      subCategory: row.subCategory || undefined,
      productTypeCode: row.productTypeCode || undefined,
      gama: row.gama || undefined,
      erpGama: row.erpGama || undefined,
      
      // Pricing
      price: parseNumber(row.price),
      priceSale: parseNumber(row.priceSale),
      priceInPoints: parseNumber(row.priceInPoints),
      tax: parseNumber(row.tax),
      
      // Availability dates
      availableStartDateTimeUtc: row.availableStartDateTimeUtc || undefined,
      availableEndDateTimeUtc: row.availableEndDateTimeUtc || undefined,
      availableInLoyaltyMarket: parseBoolean(row.availableInLoyaltyMarket),
      availableInPromoPack: parseBoolean(row.availableInPromoPack),
      
      // Marketing flags
      markAsNew: parseBoolean(row.markAsNew),
      markAsNewStartDateTimeUtc: row.markAsNewStartDateTimeUtc || undefined,
      markAsNewEndDateTimeUtc: row.markAsNewEndDateTimeUtc || undefined,
      isTopSelling: parseBoolean(row.isTopSelling),
      topSellingStartDateTimeUtc: row.topSellingStartDateTimeUtc || undefined,
      topSellingEndDateTimeUtc: row.topSellingEndDateTimeUtc || undefined,
      
      // Supplier info
      vendor: row.vendor || undefined,
      supplierCode: row.supplierCode || undefined,
      supplierMasterDataId: row.supplierMasterDataId || undefined,
      manufacturerCode: row.manufacturerCode || undefined,
      manufacturerPartNumber: row.manufacturerPartNumber || undefined,
      selectedManufacturerId: row.selectedManufacturerId || undefined,
      
      // Inventory
      quantity: parseNumber(row.quantity),
      stockQuantity: parseNumber(row.stockQuantity),
      trackInventory: parseBoolean(row.trackInventory),
      trackInventoryInMultipleWarehouse: parseBoolean(row.trackInventoryInMultipleWarehouse),
      manageInventoryMethodId: row.manageInventoryMethodId || undefined,
      warehouse: row.warehouse || undefined,
      
      // Physical properties
      uoM: row.uoM || undefined,
      weight: parseNumber(row.weight),
      inputWeight: parseNumber(row.inputWeight),
      packSize: parseNumber(row.packSize),
      piecesPerCase: parseNumber(row.piecesPerCase),
      pieceNetWeight: parseNumber(row.pieceNetWeight),
      pieceGrossWeight: parseNumber(row.pieceGrossWeight),
      pieceLength: parseNumber(row.pieceLength),
      pieceWidth: parseNumber(row.pieceWidth),
      pieceHeight: parseNumber(row.pieceHeight),
      
      // Nutritional info
      energyKcal: parseNumber(row.energyKcal),
      energykJ: parseNumber(row.energykJ),
      fatG: parseNumber(row.fatG),
      saturatedFatG: parseNumber(row.saturatedFatG),
      carbsG: parseNumber(row.carbsG),
      sugarsG: parseNumber(row.sugarsG),
      proteinsG: parseNumber(row.proteinsG),
      saltG: parseNumber(row.saltG),
      
      // SEO and store
      metaKeywords: row.metaKeywords || undefined,
      productSlug: row.productSlug || undefined,
      likes: parseNumber(row.likes),
      useApiDataInStore: parseBoolean(row.useApiDataInStore),
      storeCode: row.storeCode || undefined,
      targetStoreId: row.targetStoreId || undefined,
    };
  });
}

/**
 * Parse discount data from file
 */
export async function parseDiscountFile(file: File) {
  return parseFile(file);
}
