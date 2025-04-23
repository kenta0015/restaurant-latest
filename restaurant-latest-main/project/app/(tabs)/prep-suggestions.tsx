import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, RefreshCw, TriangleAlert as AlertTriangle, Check } from 'lucide-react-native';
import { PrepSuggestion, Recipe, InventoryItem, IngredientShortage } from '@/types/types';
import { recipeData, inventoryData, mealLogData, ingredientShortagesData } from '@/data/dummyData';
import { 
  generatePrepSuggestions, 
  checkIngredientShortages,
  calculateInventoryImpact,
  calculateNecessaryPrepAmount
} from '@/utils/prepSuggestionUtils';
import PrepSuggestionItem from '@/components/PrepSuggestionItem';
import ShortageAlert from '@/components/ShortageAlert';
import PrepQuantityAdjuster from '@/components/PrepQuantityAdjuster';
import NecessaryPrepList from '@/components/NecessaryPrepList';

export default function PrepSuggestionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<PrepSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<PrepSuggestion | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shortages, setShortages] = useState<IngredientShortage[]>([]);
  const [showShortageAlert, setShowShortageAlert] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryData);
  const [recipes] = useState<Recipe[]>(recipeData);
  const [necessaryPrepInfo, setNecessaryPrepInfo] = useState<{
    necessaryIngredients: Array<{
      name: string;
      necessaryAmount: number;
      unit: string;
      currentStock: number;
    }>;
    canPrepWithCurrentStock: boolean;
  } | null>(null);

  // Load initial suggestions
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newSuggestions = generatePrepSuggestions(recipes, mealLogData, inventory);
      setSuggestions(newSuggestions);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSuggestions();
  };

  const handleSuggestionPress = (suggestion: PrepSuggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Check for ingredient shortages
    const recipe = recipes.find(r => r.id === suggestion.recipeId);
    if (recipe) {
      const shortagesList = checkIngredientShortages(recipe, suggestion.userQuantity, inventory);
      setShortages(shortagesList);
      setShowShortageAlert(shortagesList.length > 0);
      
      // Calculate necessary prep amounts
      const prepInfo = calculateNecessaryPrepAmount(recipe, suggestion.userQuantity, inventory);
      setNecessaryPrepInfo(prepInfo);
    }
    
    setModalVisible(true);
  };

  const handleQuantityChange = (quantity: number) => {
    if (!selectedSuggestion) return;
    
    // Update the selected suggestion with the new quantity
    setSelectedSuggestion({
      ...selectedSuggestion,
      userQuantity: quantity
    });
    
    // Recalculate shortages and necessary prep based on new quantity
    const recipe = recipes.find(r => r.id === selectedSuggestion.recipeId);
    if (recipe) {
      const shortagesList = checkIngredientShortages(recipe, quantity, inventory);
      setShortages(shortagesList);
      setShowShortageAlert(shortagesList.length > 0);
      
      // Update necessary prep amounts
      const prepInfo = calculateNecessaryPrepAmount(recipe, quantity, inventory);
      setNecessaryPrepInfo(prepInfo);
    }
  };

  const handleApprove = () => {
    if (!selectedSuggestion) return;
    
    // Check if there are shortages
    if (shortages.length > 0) {
      Alert.alert(
        "Ingredient Shortage",
        "There are ingredient shortages for this prep. Do you want to continue anyway?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Continue",
            onPress: () => approveSuggestion()
          }
        ]
      );
    } else {
      approveSuggestion();
    }
  };

  const approveSuggestion = () => {
    if (!selectedSuggestion) return;
    
    setLoading(true);
    
    // Update the suggestion status
    const updatedSuggestion = {
      ...selectedSuggestion,
      status: 'approved' as const
    };
    
    // Update the suggestions list
    const updatedSuggestions = suggestions.map(s => 
      s.id === updatedSuggestion.id ? updatedSuggestion : s
    );
    
    // Calculate the impact on inventory
    const updatedInventory = calculateInventoryImpact(
      [updatedSuggestion],
      recipes,
      inventory
    );
    
    // Simulate API call delay
    setTimeout(() => {
      setSuggestions(updatedSuggestions);
      setInventory(updatedInventory);
      setModalVisible(false);
      setLoading(false);
      
      Alert.alert(
        "Prep Approved",
        `${updatedSuggestion.recipeName} prep has been approved and inventory has been updated.`,
        [{ text: "OK" }]
      );
    }, 1000);
  };

  const getRecipeDetails = (recipeId: string) => {
    return recipes.find(r => r.id === recipeId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar color="#666" size={18} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={loading || refreshing}
        >
          <RefreshCw color="#666" size={18} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Today's Prep Suggestions</Text>
      <Text style={styles.sectionSubtitle}>
        Based on 3-week moving average for this weekday
      </Text>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Calculating suggestions...</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PrepSuggestionItem
              item={item}
              onPress={() => handleSuggestionPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No prep suggestions available</Text>
              <Text style={styles.emptySubText}>Pull down to refresh or add more recipes</Text>
            </View>
          }
        />
      )}
      
      {/* Prep Details Modal */}
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
                {selectedSuggestion?.recipeName} Prep
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {showShortageAlert && (
                <ShortageAlert 
                  shortages={shortages} 
                  onClose={() => setShowShortageAlert(false)} 
                />
              )}
              
              <View style={styles.recipeInfoContainer}>
                <Text style={styles.recipeInfoTitle}>Recipe Information</Text>
                
                {selectedSuggestion && (
                  <>
                    <Text style={styles.recipeInfoText}>
                      <Text style={styles.boldText}>Category:</Text> {getRecipeDetails(selectedSuggestion.recipeId)?.category}
                    </Text>
                    
                    <Text style={styles.recipeInfoText}>
                      <Text style={styles.boldText}>Description:</Text> {getRecipeDetails(selectedSuggestion.recipeId)?.description}
                    </Text>
                  </>
                )}
              </View>
              
              {/* Necessary Prep Section */}
              {necessaryPrepInfo && (
                <NecessaryPrepList 
                  items={necessaryPrepInfo.necessaryIngredients}
                  canPrepWithCurrentStock={necessaryPrepInfo.canPrepWithCurrentStock}
                />
              )}
              
              <View style={styles.ingredientsContainer}>
                <Text style={styles.ingredientsTitle}>Total Required Ingredients</Text>
                
                {selectedSuggestion && getRecipeDetails(selectedSuggestion.recipeId)?.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientQuantity}>
                      {(ingredient.quantity * (selectedSuggestion?.userQuantity || 0)).toFixed(2)} {ingredient.unit}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.adjustContainer}>
                {selectedSuggestion && (
                  <PrepQuantityAdjuster
                    value={selectedSuggestion.userQuantity}
                    suggestedValue={selectedSuggestion.suggestedQuantity}
                    onChange={handleQuantityChange}
                    min={0}
                  />
                )}
                
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={styles.boldText}>Note:</Text> This suggestion is based on historical prep data for this weekday.
                    You can adjust the quantity before approving.
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.approveButton,
                  loading && styles.disabledButton
                ]}
                onPress={handleApprove}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Check color="#FFF" size={20} />
                    <Text style={styles.approveButtonText}>
                      Approve & Update Inventory
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              {shortages.length > 0 && (
                <View style={styles.warningContainer}>
                  <AlertTriangle color="#FF7F00" size={18} />
                  <Text style={styles.warningText}>
                    Approving will continue despite ingredient shortages
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshText: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    textAlign: 'center',
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
    padding: 8,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  modalScrollView: {
    padding: 16,
  },
  recipeInfoContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  recipeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recipeInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  ingredientName: {
    fontSize: 15,
    color: '#333',
  },
  ingredientQuantity: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  adjustContainer: {
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#E6F7FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  approveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#FF7F00',
    flex: 1,
  },
});