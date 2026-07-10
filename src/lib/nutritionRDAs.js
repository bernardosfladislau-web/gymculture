export const MICRONUTRIENT_RDAS = {
  vitamins: [
    { key: 'vitamin_a', name: 'Vitamin A', unit: 'mcg', male: 900, female: 700 },
    { key: 'vitamin_c', name: 'Vitamin C', unit: 'mg', male: 90, female: 75 },
    { key: 'vitamin_d', name: 'Vitamin D', unit: 'mcg', male: 15, female: 15 },
    { key: 'vitamin_e', name: 'Vitamin E', unit: 'mg', male: 15, female: 15 },
    { key: 'vitamin_k', name: 'Vitamin K', unit: 'mcg', male: 120, female: 90 },
    { key: 'thiamin', name: 'Thiamin (B1)', unit: 'mg', male: 1.2, female: 1.1 },
    { key: 'riboflavin', name: 'Riboflavin (B2)', unit: 'mg', male: 1.3, female: 1.1 },
    { key: 'niacin', name: 'Niacin (B3)', unit: 'mg', male: 16, female: 14 },
    { key: 'vitamin_b6', name: 'Vitamin B6', unit: 'mg', male: 1.7, female: 1.5 },
    { key: 'folate', name: 'Folate (B9)', unit: 'mcg', male: 400, female: 400 },
    { key: 'vitamin_b12', name: 'Vitamin B12', unit: 'mcg', male: 2.4, female: 2.4 },
  ],
  minerals: [
    { key: 'calcium', name: 'Calcium', unit: 'mg', male: 1000, female: 1000 },
    { key: 'iron', name: 'Iron', unit: 'mg', male: 8, female: 18 },
    { key: 'magnesium', name: 'Magnesium', unit: 'mg', male: 400, female: 310 },
    { key: 'potassium', name: 'Potassium', unit: 'mg', male: 3400, female: 2600 },
    { key: 'sodium', name: 'Sodium', unit: 'mg', male: 2300, female: 2300 },
    { key: 'zinc', name: 'Zinc', unit: 'mg', male: 11, female: 8 },
    { key: 'selenium', name: 'Selenium', unit: 'mcg', male: 55, female: 55 },
    { key: 'phosphorus', name: 'Phosphorus', unit: 'mg', male: 700, female: 700 },
  ],
};

export function getRDATarget(nutrient, gender) {
  return gender === 'female' ? nutrient.female : nutrient.male;
}