import {
  InventoryItem,
  Recipe,
  MealLog,
  PrepSuggestion,
  IngredientShortage,
  PrepTask,
  PrepSheet,
} from '../types/types';

export const inventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Tomatoes',
    quantity: 5,
    unit: 'kg',
    alertLevel: 2,
    expiryDate: '2025-04-10',
    lastChecked: '2025-03-15T10:30:00Z',
  },
];

export const recipeData: Recipe[] = [
  {
    id: '1',
    name: 'Tomato Sauce',
    description: 'Classic Italian tomato sauce for pasta',
    category: 'Sauces',
    ingredients: [
      { id: '1', name: 'Tomatoes', quantity: 2, unit: 'kg' },
      { id: '2', name: 'Onions', quantity: 0.5, unit: 'kg' },
    ],
    createdAt: '2025-02-20T14:30:00Z',
  },
];

export const mealLogData: MealLog[] = [
  {
    id: 'log1',
    recipe: recipeData[0],
    date: '2025-04-22T12:00:00Z',
    quantity: 3,
    notes: 'Lunch prep',
    adjustments: [],
    currentCount: 2.5,
  },
];
