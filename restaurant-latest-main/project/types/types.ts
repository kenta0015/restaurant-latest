export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  alertLevel: number;
  expiryDate: string | null;
  lastChecked: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
}

export interface MealCountAdjustment {
  id: string;
  timestamp: string;
  initialCount: number;
  remainingCount: number;
  difference: number;
  reason: 'served' | 'wastage' | 'physical_count';
  notes: string | null;
}

export interface MealLog {
  id: string;
  recipe: Recipe;
  date: string;
  quantity: number;
  notes: string | null;
  adjustments: MealCountAdjustment[];
  currentCount: number;
}

export interface PrepSuggestion {
  id: string;
  recipeId: string;
  recipeName: string;
  suggestedQuantity: number;
  userQuantity: number;
  weekday: string;
  date: string;
  status: 'pending' | 'approved' | 'completed';
  hasShortage: boolean;
}

export interface IngredientShortage {
  ingredientName: string;
  required: number;
  available: number;
  unit: string;
}

export interface PrepTaskNote {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  isUrgent: boolean;
}

export interface PrepTaskAdjustment {
  id: string;
  timestamp: string;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  reason: 'served' | 'wastage' | 'physical_count' | 'other';
  notes: string;
}

export interface PrepTask {
  id: string;
  recipeId: string;
  recipeName: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedTime: number;
  isCompleted: boolean;
  completedQuantity: number;
  notes: PrepTaskNote[];
  adjustments: PrepTaskAdjustment[];
  order: number;
}

export interface PrepSheet {
  id: string;
  date: string;
  weekday: string;
  tasks: PrepTask[];
  totalEstimatedTime: number;
  status: 'in-progress' | 'completed';
}