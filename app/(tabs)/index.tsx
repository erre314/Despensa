import { ThemedView } from '@/components/themed-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Product {
  id: string;
  name: string;
  expirationDate: Date;
  expirationDateText: string;
  code: string;
  quantity: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [product, setProduct] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [expirationDateText, setExpirationDateText] = useState('');
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'code'>('name');

  const handleAddExpense = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleEditProduct = (productToEdit: Product) => {
    setEditingId(productToEdit.id);
    setProduct(productToEdit.name);
    setExpirationDate(productToEdit.expirationDate);
    setExpirationDateText(productToEdit.expirationDateText);
    setProductCode(productToEdit.code);
    setQuantity(productToEdit.quantity.toString());
    setModalVisible(true);
  };

  const resetForm = () => {
    setProduct('');
    setExpirationDate(new Date());
    setExpirationDateText('');
    setProductCode('');
    setQuantity('');
    setEditingId(null);
  };

  const handleSort = (field: 'name' | 'date' | 'code') => {
    setSortBy(field);
    setSortMenuVisible(false);
  };

  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
    } else if (sortBy === 'code') {
      sorted.sort((a, b) => a.code.localeCompare(b.code));
    }
    return sorted;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    if (selectedDate) {
      setExpirationDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setExpirationDateText(formattedDate);
      if (Platform.OS === 'ios') {
        setDatePickerVisible(false);
      }
    }
  };

  const handleQuantityChange = (text: string) => {
    // Aceita apenas números
    const numericValue = text.replace(/[^0-9]/g, '');
    setQuantity(numericValue);
  };

  const handleSave = () => {
    const quantityNum = parseInt(quantity);
    
    if (product.trim() && expirationDateText && productCode.trim() && quantity.trim() && quantityNum >= 0) {
      if (editingId) {
        // Editar produto existente
        setProducts(products.map(p => 
          p.id === editingId 
            ? {
                ...p,
                name: product,
                expirationDate: expirationDate,
                expirationDateText: expirationDateText,
                code: productCode,
                quantity: quantityNum,
              }
            : p
        ));
      } else {
        // Adicionar novo produto
        const newProduct: Product = {
          id: Date.now().toString(),
          name: product,
          expirationDate: expirationDate,
          expirationDateText: expirationDateText,
          code: productCode,
          quantity: quantityNum,
        };
        setProducts([...products, newProduct]);
      }
      setModalVisible(false);
      resetForm();
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    resetForm();
    setDatePickerVisible(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Modal */}
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</Text>
            
            <ScrollView style={styles.formContainer}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Produto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome do produto"
                  placeholderTextColor="#999"
                  value={product}
                  onChangeText={setProduct}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Data de Vencimento</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={expirationDate instanceof Date && !isNaN(expirationDate.getTime()) ? expirationDate.toISOString().split('T')[0] : ''}
                    onChange={(e: any) => {
                      if (e.target.value) {
                        const dateValue = e.target.value; // formato: YYYY-MM-DD
                        const [year, month, day] = dateValue.split('-');
                        setExpirationDateText(`${month}/${day}/${year}`);
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        setExpirationDate(date);
                      }
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      fontFamily: 'inherit',
                      width: '100%',
                    } as any}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setDatePickerVisible(true)}
                  >
                    <Text style={[styles.dateInputText, !expirationDateText && styles.placeholderText]}>
                      {expirationDateText || 'Selecione a data'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Código do Produto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o código"
                  placeholderTextColor="#999"
                  value={productCode}
                  onChangeText={setProductCode}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Quantidade</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const currentQty = parseInt(quantity) || 0;
                      if (currentQty > 0) {
                        setQuantity((currentQty - 1).toString());
                      }
                    }}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const currentQty = parseInt(quantity) || 0;
                      setQuantity((currentQty + 1).toString());
                    }}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {datePickerVisible && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {products.length > 0 && (
        <FlatList
          data={getSortedProducts()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDetail}>Código: {item.code}</Text>
                <Text style={styles.productDetail}>Quantidade: {item.quantity}</Text>
                <Text style={styles.productDetail}>Vencimento: {item.expirationDateText}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditProduct(item)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteProduct(item.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {sortMenuVisible && (
        <TouchableOpacity 
          style={styles.sortMenuOverlay}
          activeOpacity={1}
          onPress={() => setSortMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.sortMenu}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
              onPress={() => handleSort('name')}
            >
              <Text style={styles.sortOptionText}>Nome</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'date' && styles.sortOptionActive]}
              onPress={() => handleSort('date')}
            >
              <Text style={styles.sortOptionText}>Data de Vencimento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'code' && styles.sortOptionActive]}
              onPress={() => handleSort('code')}
            >
              <Text style={styles.sortOptionText}>Código</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setSortMenuVisible(!sortMenuVisible)}
        activeOpacity={0.8}
      >
        <Text style={styles.sortButtonText}>⛛</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddExpense}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A2F2EA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 44,
    fontWeight: '300',
    color: '#1a1a1a',
    lineHeight: 48,
  },
  sortButton: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A2F2EA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sortButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  sortMenuOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  sortMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
  },
  sortOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionActive: {
    backgroundColor: '#f5f5f5',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#A2F2EA',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#A2F2EA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});
