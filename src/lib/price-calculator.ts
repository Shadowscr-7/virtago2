/**
 * Calculadora de precios con descuentos
 * 
 * Maneja la lógica de cálculo de precios considerando:
 * - Descuentos por cantidad (tiered volume)
 * - Descuentos promocionales
 * - Descuentos por monto mínimo
 * - Configuración de descuento del producto
 * 
 * Prioridad: Tabla descuentos > Configuración del producto
 */

export interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered_volume' | 'min_purchase' | 'promotional';
  value: number;
  min_quantity?: number;
  max_quantity?: number;
  min_purchase_amount?: number;
  conditions?: {
    quantity_tiers?: Array<{
      min_quantity: number;
      max_quantity?: number;
      discount_percentage?: number;
      discount_fixed?: number;
    }>;
  };
}

export interface PriceCalculationResult {
  basePrice: number;
  quantity: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  finalPrice: number;
  totalSavings: number;
  appliedDiscounts: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    savings: number;
  }>;
}

/**
 * Calcula el precio final considerando cantidad y descuentos aplicables
 */
export function calculatePrice(
  basePrice: number,
  quantity: number,
  discounts: DiscountRule[] = [],
  productDiscountConfig?: {
    priceSale?: number;
    discountPercentage?: number;
  }
): PriceCalculationResult {
  
  const subtotal = basePrice * quantity;
  let finalPrice = subtotal;
  let totalSavings = 0;
  const appliedDiscounts: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    savings: number;
  }> = [];

  // 1. Buscar descuentos por cantidad (tiered volume) - MÁXIMA PRIORIDAD
  const tieredDiscounts = discounts.filter(d => d.type === 'tiered_volume');
  let bestTieredDiscount: DiscountRule | null = null;
  let bestTieredSavings = 0;

  for (const discount of tieredDiscounts) {
    if (discount.conditions?.quantity_tiers) {
      for (const tier of discount.conditions.quantity_tiers) {
        // Verificar si la cantidad actual cae en este tier
        const meetsMin = quantity >= tier.min_quantity;
        const meetsMax = !tier.max_quantity || quantity <= tier.max_quantity;
        
        if (meetsMin && meetsMax) {
          let tierSavings = 0;
          
          if (tier.discount_percentage) {
            tierSavings = subtotal * (tier.discount_percentage / 100);
          } else if (tier.discount_fixed) {
            tierSavings = tier.discount_fixed * quantity;
          }
          
          if (tierSavings > bestTieredSavings) {
            bestTieredSavings = tierSavings;
            bestTieredDiscount = discount;
          }
        }
      }
    }
  }

  if (bestTieredDiscount && bestTieredSavings > 0) {
    totalSavings += bestTieredSavings;
    finalPrice -= bestTieredSavings;
    appliedDiscounts.push({
      id: bestTieredDiscount.id,
      name: bestTieredDiscount.name,
      type: bestTieredDiscount.type,
      value: bestTieredDiscount.value,
      savings: bestTieredSavings,
    });
  }

  // 2. Descuentos por monto mínimo
  const minPurchaseDiscounts = discounts.filter(
    d => d.type === 'min_purchase' && 
    d.min_purchase_amount && 
    subtotal >= d.min_purchase_amount
  );

  for (const discount of minPurchaseDiscounts) {
    let savings = 0;
    
    if (discount.value) {
      // Si es porcentaje
      if (discount.type === 'min_purchase') {
        savings = (finalPrice * discount.value) / 100;
      }
    }
    
    if (savings > 0) {
      totalSavings += savings;
      finalPrice -= savings;
      appliedDiscounts.push({
        id: discount.id,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        savings,
      });
    }
  }

  // 3. Descuentos promocionales generales
  const promotionalDiscounts = discounts.filter(
    d => d.type === 'promotional' && 
    (!d.min_quantity || quantity >= d.min_quantity)
  );

  for (const discount of promotionalDiscounts) {
    let savings = 0;
    
    if (discount.type === 'promotional') {
      savings = (finalPrice * discount.value) / 100;
    }
    
    if (savings > 0) {
      totalSavings += savings;
      finalPrice -= savings;
      appliedDiscounts.push({
        id: discount.id,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        savings,
      });
    }
  }

  // 4. Si NO hay descuentos de la tabla, aplicar configuración del producto
  if (appliedDiscounts.length === 0 && productDiscountConfig) {
    if (productDiscountConfig.priceSale && productDiscountConfig.priceSale > 0) {
      // Precio de oferta fijo
      const salePrice = productDiscountConfig.priceSale * quantity;
      const savings = subtotal - salePrice;
      
      if (savings > 0) {
        totalSavings = savings;
        finalPrice = salePrice;
        appliedDiscounts.push({
          id: 'product-sale',
          name: 'Precio de Oferta',
          type: 'fixed',
          value: productDiscountConfig.priceSale,
          savings,
        });
      }
    } else if (productDiscountConfig.discountPercentage && productDiscountConfig.discountPercentage > 0) {
      // Descuento porcentual
      const savings = subtotal * (productDiscountConfig.discountPercentage / 100);
      
      if (savings > 0) {
        totalSavings = savings;
        finalPrice = subtotal - savings;
        appliedDiscounts.push({
          id: 'product-discount',
          name: 'Descuento del Producto',
          type: 'percentage',
          value: productDiscountConfig.discountPercentage,
          savings,
        });
      }
    }
  }

  const discountPercentage = subtotal > 0 ? (totalSavings / subtotal) * 100 : 0;

  return {
    basePrice,
    quantity,
    subtotal,
    discount: totalSavings,
    discountPercentage: Math.round(discountPercentage * 100) / 100,
    finalPrice: Math.max(0, finalPrice),
    totalSavings,
    appliedDiscounts,
  };
}

/**
 * Formatea el cálculo de precio para mostrar en UI
 */
export function formatPriceCalculation(result: PriceCalculationResult) {
  return {
    subtotal: `$${result.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    discount: result.discount > 0 ? `-$${result.discount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
    discountPercentage: result.discountPercentage > 0 ? `${result.discountPercentage}%` : null,
    finalPrice: `$${result.finalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    savings: result.totalSavings > 0 ? `$${result.totalSavings.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
  };
}
