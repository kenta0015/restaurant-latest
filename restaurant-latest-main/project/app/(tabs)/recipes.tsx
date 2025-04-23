import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { CirclePlus as PlusCircle, X, Tag, CreditCard as Edit2, Trash2 } from 'lucide-react-native';
import { recipeData } from '@/data/dummyData';
import { Recipe, RecipeIngredient } from '@/types/types';
import RecipeCard from '@/components/RecipeCard';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>(recipeData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setIngredients([]);
    setEditingRecipe(null);
  };

  const handleAddRecipe = () => {
    if (!name.trim() || ingredients.length === 0) return;
    
    const newRecipe: Recipe = {
      id: editingRecipe?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'Uncategorized',
      ingredients: ingredients,
      createdAt: new Date().toISOString(),
    };
    
    if (editingRecipe) {
      setRecipes(recipes.map(recipe => 
        recipe.id === editingRecipe.id ? newRecipe : recipe
      ));
    } else {
      setRecipes([...recipes, newRecipe]);
    }
    
    setModalVisible(false);
    resetForm();
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setName(recipe.name);
    setDescription(recipe.description);
    setCategory(recipe.category);
    setIngredients([...recipe.ingredients]);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const handleAddIngredient = () => {
    if (!newIngredientName.trim() || !newIngredientQuantity.trim() || !newIngredientUnit.trim()) return;
    
    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      name: newIngredientName.trim(),
      quantity: parseFloat(newIngredientQuantity),
      unit: newIngredientUnit.trim(),
    };
    
    setIngredients([...ingredients, newIngredient]);
    setNewIngredientName('');
    setNewIngredientQuantity('');
    setNewIngredientUnit('');
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptySubText}>Create your first recipe with the + button</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <PlusCircle color="#FFF" size={24} />
        </TouchableOpacity>
        
        {/* Add/Edit Recipe Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X color="#333" size={24} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.formContainer}>
                <Text style={styles.inputLabel}>Recipe Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Spaghetti Bolognese"
                />
                
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Brief description or preparation notes"
                  multiline
                  textAlignVertical="top"
                />
                
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryContainer}>
                  <Tag color="#666" size={18} />
                  <TextInput
                    style={styles.categoryInput}
                    value={category}
                    onChangeText={setCategory}
                    placeholder="e.g. Main Course, Dessert"
                  />
                </View>
                
                <View style={styles.ingredientsHeader}>
                  <Text style={styles.ingredientsTitle}>Ingredients</Text>
                  <Text style={styles.ingredientsCount}>
                    ({ingredients.length})
                  </Text>
                </View>
                
                {ingredients.length > 0 && (
                  <View style={styles.ingredientsList}>
                    {ingredients.map(ingredient => (
                      <View key={ingredient.id} style={styles.ingredientItem}>
                        <Text style={styles.ingredientName}>
                          {ingredient.name} 
                          <Text style={styles.ingredientQuantity}>
                            {' - '}{ingredient.quantity} {ingredient.unit}
                          </Text>
                        </Text>
                        <TouchableOpacity 
                          onPress={() => handleRemoveIngredient(ingredient.id)}
                          style={styles.deleteIngredientButton}
                        >
                          <Trash2 color="#FF5252" size={16} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.addIngredientContainer}>
                  <View style={styles.ingredientInputRow}>
                    <TextInput
                      style={[styles.input, { flex: 2 }]}
                      value={newIngredientName}
                      onChangeText={setNewIngredientName}
                      placeholder="Ingredient name"
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={newIngredientQuantity}
                      onChangeText={setNewIngredientQuantity}
                      placeholder="Qty"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={newIngredientUnit}
                      onChangeText={setNewIngredientUnit}
                      placeholder="Unit"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addIngredientButton}
                    onPress={handleAddIngredient}
                  >
                    <Text style={styles.addIngredientButtonText}>
                      Add Ingredient
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!name.trim() || ingredients.length === 0) && styles.disabledButton
                  ]}
                  onPress={handleAddRecipe}
                  disabled={!name.trim() || ingredients.length === 0}
                >
                  <Text style={styles.submitButtonText}>
                    {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8B0000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
  },
  categoryInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 8,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ingredientsCount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  ingredientsList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  ingredientName: {
    fontSize: 16,
    flex: 1,
  },
  ingredientQuantity: {
    color: '#666',
  },
  deleteIngredientButton: {
    padding: 6,
  },
  addIngredientContainer: {
    marginBottom: 16,
  },
  ingredientInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addIngredientButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addIngredientButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});