import { base44 } from '@/api/base44Client';

const LANG_NAMES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
  it: 'Italian', zh: 'Chinese', ja: 'Japanese', ar: 'Arabic', hi: 'Hindi',
};

export async function translateNutritionItems(items, lang) {
  if (!lang || lang === 'en') return items;

  const toTranslate = items.map(i => ({
    id: i.id,
    name: i.name || '',
    benefits: i.benefits || '',
    where_to_buy: i.where_to_buy || '',
    recommended_brands: i.recommended_brands || '',
  }));

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following JSON array of nutrition items into ${LANG_NAMES[lang] || lang}. Translate each item's "name", "benefits", "where_to_buy", and "recommended_brands" fields. Keep "id" unchanged. Return translated array in the same order. Keep empty strings as empty. JSON:\n${JSON.stringify(toTranslate)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                benefits: { type: 'string' },
                where_to_buy: { type: 'string' },
                recommended_brands: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const translations = {};
    (response.items || []).forEach(t => { translations[t.id] = t; });

    return items.map(i => ({
      ...i,
      name: translations[i.id]?.name || i.name,
      benefits: translations[i.id]?.benefits || i.benefits,
      where_to_buy: translations[i.id]?.where_to_buy || i.where_to_buy,
      recommended_brands: translations[i.id]?.recommended_brands || i.recommended_brands,
    }));
  } catch {
    return items;
  }
}