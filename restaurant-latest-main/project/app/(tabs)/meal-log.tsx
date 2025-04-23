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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CirclePlus as PlusCircle, X, Calendar, Clock, Utensils, Filter } from 'lucide-react-native';
import { mealLogData, recipeData } from '@/data/dummyData';
import { MealLog, Recipe } from '@/types/types';
import MealLogEntry from '@/components/MealLogEntry';

export default function MealLogScreen() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>(mealLogData);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>(recipeData);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredMealLogs = mealLogs
    .filter(log => {
      const recipeMatch = log.recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
      const notesMatch = log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      return recipeMatch || notesMatch;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  const resetForm = () => {
    setSelectedRecipe(null);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
    setQuantity('1');
    setNotes('');
  };

  const handleAddMealLog = () => {
    if (!selectedRecipe) return;
    
    setLoading(true);
    
    // Simulate processing and inventory deduction
    setTimeout(() => {
      const newMealLog: MealLog = {
        id: Date.now().toString(),
        recipe: selectedRecipe,
        date: `${date}T${time}:00Z`,
        quantity: parseInt(quantity),
        notes: notes.trim(),
      };
      
      setMealLogs([newMealLog, ...mealLogs]);
      setModalVisible(false);
      resetForm();
      setLoading(false);
      
      Alert.alert(
        "Meal Logged",
        `${selectedRecipe.name} has been added to the meal log and inventory has been updated.`,
        [{ text: "OK" }]
      );
    }, 1000);
  };

  const handleDelete = (id: string) => {
    setMealLogs(mealLogs.filter(log => log.id !== id));
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search meal logs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
            <Filter color="#666" size={20} />
            <Text style={styles.sortButtonText}>
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredMealLogs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MealLogEntry
              mealLog={item}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No meal logs found</Text>
              <Text style={styles.emptySubText}>Add meals using the + button</Text>
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
        
        {/* Add Meal Log Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log a Meal</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X color="#333" size={24} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.formContainer}>
                <TouchableOpacity 
                  style={styles.recipeSelector} 
                  onPress={() => setShowRecipeSelector(true)}
                >
                  <Utensils color="#666" size={20} />
                  <Text style={[
                    styles.recipeSelectorText,
                    selectedRecipe ? styles.selectedRecipeText : {}
                  ]}>
                    {selectedRecipe 
                      ? selectedRecipe.name 
                      : "Select a recipe"}
                  </Text>
                  <Text style={styles.recipeSelectorArrow}>›</Text>
                </TouchableOpacity>
                
                <View style={styles.row}>
                  <View style={[styles.column, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <View style={styles.dateContainer}>
                      <Calendar color="#666" size={18} />
                      <TextInput
                        style={styles.dateInput}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.column, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Time</Text>
                    <View style={styles.timeContainer}>
                      <Clock color="#666" size={18} />
                      <TextInput
                        style={styles.timeInput}
                        value={time}
                        onChangeText={setTime}
                        placeholder="HH:MM"
                      />
                    </View>
                  </View>
                </View>
                
                <Text style={styles.inputLabel}>Quantity (Servings)</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  keyboardType="numeric"
                />
                
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about this meal"
                  multiline
                  textAlignVertical="top"
                />
                
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !selectedRecipe && styles.disabledButton
                  ]}
                  onPress={handleAddMealLog}
                  disabled={!selectedRecipe || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Log Meal & Update Inventory
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        {/* Recipe Selector Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRecipeSelector}
          onRequestClose={() => setShowRecipeSelector(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Recipe</Text>
                <TouchableOpacity 
                  onPress={() => setShowRecipeSelector(false)}
                  style={styles.closeButton}
                >
                  <X color="#333" size={24} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={recipes}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.recipeItem}
                    onPress={() => {
                      setSelectedRecipe(item);
                      setShowRecipeSelector(false);
                    }}
                  >
                    <Text style={styles.recipeItemName}>{item.name}</Text>
                    <Text style={styles.recipeItemCategory}>{item.category}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyRecipes}>
                    <Text>No recipes available. Create recipes first.</Text>
                  </View>
                }
              />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    maxHeight: '80%',
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
  recipeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    marginBottom: 16,
  },
  recipeSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  selectedRecipeText: {
    color: '#333',
    fontWeight: '500',
  },
  recipeSelectorArrow: {
    fontSize: 22,
    color: '#666',
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
  },
  timeInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
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
  recipeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  recipeItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recipeItemCategory: {
    fontSize: 14,
    color: '#666',
  },
  emptyRecipes: {
    padding: 20,
    alignItems: 'center',
  },
});