import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CreditCard as Edit2, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { InventoryItem as InventoryItemType } from '@/types/types';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: () => void;
  onDelete: () => void;
}

export default function InventoryItem({ item, onEdit, onDelete }: InventoryItemProps) {
  // Calculate if item is low on stock
  const isLowStock = item.quantity <= item.alertLevel;
  
  // Calculate if item is expiring soon (within 7 days)
  const isExpiringSoon = item.expiryDate 
    ? new Date(item.expiryDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 
    : false;
  
  // Get status styling
  const getStatusStyle = () => {
    if (isLowStock) return styles.lowStockText;
    if (isExpiringSoon) return styles.expiringSoonText;
    return styles.regularStatusText;
  };
  
  // Format date to readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          {(isLowStock || isExpiringSoon) && (
            <AlertTriangle 
              color={isLowStock ? '#FF7F00' : '#FFD700'} 
              size={18} 
            />
          )}
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.quantityContainer}>
            <Text style={[styles.quantityText, getStatusStyle()]}>
              {item.quantity} {item.unit}
            </Text>
            {isLowStock && (
              <Text style={styles.lowStockIndicator}>
                Low stock
              </Text>
            )}
          </View>
          
          <View>
            <Text style={styles.expiryLabel}>Expiry</Text>
            <Text style={[
              styles.expiryDate,
              isExpiringSoon && styles.expiringSoonText,
            ]}>
              {formatDate(item.expiryDate)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onEdit}
        >
          <Edit2 color="#4CAF50" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onDelete}
        >
          <Trash2 color="#FF5252" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'column',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  regularStatusText: {
    color: '#333',
  },
  lowStockText: {
    color: '#FF7F00',
  },
  expiringSoonText: {
    color: '#FFD700',
  },
  lowStockIndicator: {
    fontSize: 12,
    color: '#FF7F00',
    fontWeight: '500',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 6,
  },
});