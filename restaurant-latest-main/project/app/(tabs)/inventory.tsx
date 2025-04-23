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
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { CirclePlus as PlusCircle, X, CircleAlert as AlertCircle, CreditCard as Edit2 } from 'lucide-react-native';
import { inventoryData } from '@/data/dummyData';
import { InventoryItem as InventoryItemType } from '@/types/types';
import InventoryItemComponent from '@/components/InventoryItem';

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItemType[]>(inventoryData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [alertLevel, setAlertLevel] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const lowStockItems = items.filter(item => 
    item.quantity <= item.alertLevel
  );

  const resetForm = () => {
    setName('');
    setQuantity('');
    setUnit('');
    setAlertLevel('');
    setExpiryDate('');
    setEditingItem(null);
  };

  const handleAddItem = () => {
    if (!name.trim() || !quantity.trim() || !unit.trim()) return;
    
    const newItem: InventoryItemType = {
      id: editingItem?.id || Date.now().toString(),
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit: unit.trim(),
      alertLevel: parseFloat(alertLevel) || 0,
      expiryDate: expiryDate || null,
      lastChecked: new Date().toISOString(),
    };
    
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
    } else {
      setItems([...items, newItem]);
    }
    
    setModalVisible(false);
    resetForm();
  };

  const handleEdit = (item: InventoryItemType) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setAlertLevel(item.alertLevel?.toString() || '0');
    setExpiryDate(item.expiryDate || '');
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {lowStockItems.length > 0 && (
          <View style={styles.alertBanner}>
            <AlertCircle color="#FFF" size={20} />
            <Text style={styles.alertText}>
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum stock level
            </Text>
          </View>
        )}
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <InventoryItemComponent
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No inventory items found</Text>
              <Text style={styles.emptySubText}>Add items using the + button</Text>
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
        
        {/* Add/Edit Item Modal */}
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
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X color="#333" size={24} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.formContainer}>
                <Text style={styles.inputLabel}>Item Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Tomatoes"
                />
                
                <View style={styles.row}>
                  <View style={[styles.column, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.input}
                      value={quantity}
                      onChangeText={setQuantity}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={[styles.column, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <TextInput
                      style={styles.input}
                      value={unit}
                      onChangeText={setUnit}
                      placeholder="kg"
                    />
                  </View>
                </View>
                
                <Text style={styles.inputLabel}>Alert Level</Text>
                <TextInput
                  style={styles.input}
                  value={alertLevel}
                  onChangeText={setAlertLevel}
                  placeholder="Minimum quantity before alert"
                  keyboardType="numeric"
                />
                
                <Text style={styles.inputLabel}>Expiry Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="YYYY-MM-DD"
                />
                
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddItem}
                >
                  <Text style={styles.submitButtonText}>
                    {editingItem ? 'Update Item' : 'Add Item'}
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
  alertBanner: {
    backgroundColor: '#FF7F00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },
  alertText: {
    color: '#FFF',
    fontWeight: '600',
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
  },
  column: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});