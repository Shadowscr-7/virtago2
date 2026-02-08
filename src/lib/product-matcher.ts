import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Solo para desarrollo
});

export interface MatchResult {
  matched: boolean;
  matchedId?: string;
  matchedName?: string;
  confidence: number;
  shouldCreate: boolean;
  reason?: string;
}

/**
 * Match inteligente de texto usando OpenAI
 * @param inputText Texto a buscar (ej: "KeyMaster", "ELECTRONICA", etc)
 * @param existingItems Lista de items existentes en el sistema
 * @param itemType Tipo de item (brand, category, subcategory)
 */
export async function matchWithAI(
  inputText: string | undefined,
  existingItems: Array<{ id: string; name: string; [key: string]: unknown }>,
  itemType: 'brand' | 'category' | 'subcategory'
): Promise<MatchResult> {
  // Si no hay texto, no hacer match
  if (!inputText || inputText.trim() === '') {
    return {
      matched: false,
      confidence: 0,
      shouldCreate: false,
      reason: 'No input text provided'
    };
  }

  // Si no hay items existentes, crear nuevo
  if (existingItems.length === 0) {
    return {
      matched: false,
      confidence: 1,
      shouldCreate: true,
      reason: `No existing ${itemType}s in system`
    };
  }

  // Primero hacer matching exacto (case-insensitive)
  const exactMatch = existingItems.find(
    item => item.name.toLowerCase().trim() === inputText.toLowerCase().trim()
  );
  
  if (exactMatch) {
    return {
      matched: true,
      matchedId: exactMatch.id,
      matchedName: exactMatch.name,
      confidence: 1,
      shouldCreate: false,
      reason: 'Exact match found'
    };
  }

  // Si no hay match exacto, usar OpenAI para matching inteligente
  try {
    const existingNames = existingItems.map(item => item.name).join(', ');
    
    console.log(`[matchWithAI] Llamando a OpenAI para "${inputText}" (${itemType})`);
    console.log(`[matchWithAI] Items existentes:`, existingNames);
    
    const prompt = `You are a product data matcher. Given an input ${itemType} name and a list of existing ${itemType}s, determine if the input matches any existing item.

Input ${itemType}: "${inputText}"
Existing ${itemType}s: ${existingNames}

Rules:
1. Match if it's the same ${itemType} with different capitalization (e.g., "Sony" = "SONY" = "sony")
2. Match if it's a common abbreviation or variation (e.g., "HP" = "Hewlett Packard", "LG" = "LG Electronics")
3. Match if there are minor typos or spacing differences (e.g., "KeyMaster" = "Key Master")
4. DO NOT match if it's clearly a different ${itemType}
5. Consider industry-standard naming conventions

Respond ONLY with a JSON object (no markdown, no code blocks):
{
  "matched": boolean,
  "matchedName": "exact name from the list if matched, null otherwise",
  "confidence": number between 0 and 1,
  "shouldCreate": boolean (true if this is clearly a new ${itemType}),
  "reason": "brief explanation"
}`;

    console.log(`[matchWithAI] Enviando request a OpenAI...`);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise data matching assistant. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    console.log(`[matchWithAI] Respuesta de OpenAI:`, content);
    
    // Limpiar markdown si existe
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const result = JSON.parse(jsonContent);
    console.log(`[matchWithAI] JSON parseado:`, result);
    
    // Si hay match, buscar el ID
    if (result.matched && result.matchedName) {
      const matchedItem = existingItems.find(
        item => item.name.toLowerCase() === result.matchedName.toLowerCase()
      );
      
      if (matchedItem) {
        return {
          matched: true,
          matchedId: matchedItem.id,
          matchedName: matchedItem.name,
          confidence: result.confidence,
          shouldCreate: false,
          reason: result.reason
        };
      }
    }
    
    // Si no hay match, respetar la decisión de OpenAI
    return {
      matched: false,
      confidence: result.confidence,
      shouldCreate: result.shouldCreate || false, // Respetar decisión de OpenAI
      reason: result.reason
    };
    
  } catch (error) {
    console.error(`[matchWithAI] ❌ Error matching ${itemType} with AI:`, error);
    console.error(`[matchWithAI] Error details:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Fallback: matching simple por similitud de strings
    console.log(`[matchWithAI] Usando fallback para "${inputText}"`);
    const normalized = inputText.toLowerCase().trim();
    const similarMatch = existingItems.find(item => {
      const itemNormalized = item.name.toLowerCase().trim();
      return (
        itemNormalized.includes(normalized) ||
        normalized.includes(itemNormalized) ||
        levenshteinDistance(normalized, itemNormalized) <= 2
      );
    });
    
    if (similarMatch) {
      return {
        matched: true,
        matchedId: similarMatch.id,
        matchedName: similarMatch.name,
        confidence: 0.7,
        shouldCreate: false,
        reason: 'Similarity match (fallback)'
      };
    }
    
    return {
      matched: false,
      confidence: 0.8,
      shouldCreate: true,
      reason: 'AI matching failed, suggesting new creation'
    };
  }
}

/**
 * Calcula la distancia de Levenshtein entre dos strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Match múltiples productos en batch
 */
export async function matchProductsBatch(
  products: Array<{
    name: string;
    brand?: string;
    category?: string;
    subCategory?: string;
  }>,
  existingBrands: Array<{ id: string; name: string }>,
  existingCategories: Array<{ id: string; name: string }>,
  existingSubcategories: Array<{ id: string; name: string }>
) {
  const results = [];
  
  for (const product of products) {
    const brandMatch = await matchWithAI(product.brand, existingBrands, 'brand');
    const categoryMatch = await matchWithAI(product.category, existingCategories, 'category');
    const subcategoryMatch = await matchWithAI(product.subCategory, existingSubcategories, 'subcategory');
    
    results.push({
      productName: product.name,
      brandMatch,
      categoryMatch,
      subcategoryMatch,
    });
  }
  
  return results;
}
