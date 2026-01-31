import { Product } from '@/types/Product';
import { useState } from 'react';

export type SortField = 'name' | 'date' | 'code';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('name');

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'date')
      return a.expirationDate.getTime() - b.expirationDate.getTime();
    return a.code.localeCompare(b.code);
  });

  return {
    products: sortedProducts,
    rawProducts: products,
    addProduct,
    updateProduct,
    deleteProduct,
    sortBy,
    setSortBy,
  };
}
