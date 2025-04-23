import { Recipe, InventoryItem, PrepTask, PrepSheet, PrepSuggestion } from '@/types/types';
import { formatDate, getWeekday } from './prepSuggestionUtils';

// Generate prep tasks from approved prep suggestions
export function generatePrepTasks(
  approvedSuggestions: PrepSuggestion[],
  recipes: Recipe[],
  inventory: InventoryItem[]
): PrepTask[] {
  const tasks: PrepTask[] = [];
  
  approvedSuggestions.forEach(suggestion => {
    const recipe = recipes.find(r => r.id === suggestion.recipeId);
    if (!recipe) return;
    
    recipe.ingredients.forEach(ingredient => {
      const totalRequired = ingredient.quantity * suggestion.userQuantity;
      const inventoryItem = inventory.find(item => item.name === ingredient.name);
      const currentStock = inventoryItem ? inventoryItem.quantity : 0;
      const necessaryAmount = Math.max(0, totalRequired - currentStock);
      
      // Only create tasks for ingredients that need to be prepped
      if (necessaryAmount > 0) {
        // Estimate time based on ingredient and quantity (simplified example)
        const estimatedTime = calculateEstimatedTime(ingredient.name, necessaryAmount);
        
        tasks.push({
          id: `${suggestion.id}-${ingredient.id}`,
          recipeId: recipe.id,
          recipeName: recipe.name,
          ingredientName: ingredient.name,
          quantity: necessaryAmount,
          unit: ingredient.unit,
          estimatedTime,
          isCompleted: false,
          completedQuantity: 0
        });
      }
    });
  });
  
  return tasks;
}

// Simple function to estimate prep time based on ingredient and quantity
function calculateEstimatedTime(ingredientName: string, quantity: number): number {
  // This is a simplified example - in a real app, you might have a more sophisticated algorithm
  // or a database of standard prep times for different ingredients
  const baseTimeMap: Record<string, number> = {
    'Tomatoes': 5, // 5 minutes per kg
    'Onions': 8,    // 8 minutes per kg
    'Chicken Breasts': 12, // 12 minutes per kg
    'Rice': 5,      // 5 minutes per kg
    'Carrots': 10,  // 10 minutes per kg
    'Peas': 3,      // 3 minutes per kg
    'Olive Oil': 1, // 1 minute per liter
    'Salt': 1,      // 1 minute per kg
    'Black Pepper': 1, // 1 minute per kg
    'Flour': 2      // 2 minutes per kg
  };
  
  const baseTime = baseTimeMap[ingredientName] || 5; // Default to 5 minutes if not found
  return Math.ceil(baseTime * quantity); // Round up to nearest minute
}

// Create a prep sheet from tasks
export function createPrepSheet(
  tasks: PrepTask[],
  date: Date = new Date()
): PrepSheet {
  const totalEstimatedTime = tasks.reduce((total, task) => total + task.estimatedTime, 0);
  
  return {
    id: date.getTime().toString(),
    date: formatDate(date),
    weekday: getWeekday(date.toISOString()),
    tasks,
    totalEstimatedTime,
    status: 'in-progress'
  };
}

// Update a task's completion status
export function updateTaskCompletion(
  prepSheet: PrepSheet,
  taskId: string,
  isCompleted: boolean,
  completedQuantity: number
): PrepSheet {
  const updatedTasks = prepSheet.tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        isCompleted,
        completedQuantity: isCompleted ? completedQuantity : 0
      };
    }
    return task;
  });
  
  // Check if all tasks are completed
  const allCompleted = updatedTasks.every(task => task.isCompleted);
  
  return {
    ...prepSheet,
    tasks: updatedTasks,
    status: allCompleted ? 'completed' : 'in-progress'
  };
}

// Update inventory based on completed prep tasks
export function updateInventoryFromCompletedTasks(
  inventory: InventoryItem[],
  completedTasks: PrepTask[]
): InventoryItem[] {
  // Create a deep copy of the inventory
  const updatedInventory = JSON.parse(JSON.stringify(inventory)) as InventoryItem[];
  
  // Process each completed task
  completedTasks.forEach(task => {
    if (!task.isCompleted || task.completedQuantity <= 0) return;
    
    // Find the corresponding inventory item
    const inventoryItemIndex = updatedInventory.findIndex(
      item => item.name === task.ingredientName
    );
    
    if (inventoryItemIndex !== -1) {
      // Add the completed quantity to inventory
      updatedInventory[inventoryItemIndex].quantity += task.completedQuantity;
      
      // Update the last checked timestamp
      updatedInventory[inventoryItemIndex].lastChecked = new Date().toISOString();
    } else {
      // If the item doesn't exist in inventory, create it
      const newId = `new-${Date.now()}-${task.ingredientName}`;
      updatedInventory.push({
        id: newId,
        name: task.ingredientName,
        quantity: task.completedQuantity,
        unit: task.unit,
        alertLevel: task.completedQuantity * 0.2, // Set a default alert level at 20% of quantity
        expiryDate: null,
        lastChecked: new Date().toISOString()
      });
    }
  });
  
  return updatedInventory;
}

// Calculate remaining time for prep sheet
export function calculateRemainingTime(prepSheet: PrepSheet): number {
  const remainingTime = prepSheet.tasks
    .filter(task => !task.isCompleted)
    .reduce((total, task) => total + task.estimatedTime, 0);
  
  return remainingTime;
}

// Group tasks by recipe
export function groupTasksByRecipe(tasks: PrepTask[]): Record<string, PrepTask[]> {
  const grouped: Record<string, PrepTask[]> = {};
  
  tasks.forEach(task => {
    if (!grouped[task.recipeId]) {
      grouped[task.recipeId] = [];
    }
    grouped[task.recipeId].push(task);
  });
  
  return grouped;
}

// Format time in minutes to hours and minutes
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}