import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Category, ProductDirectory, Unit } from '../types/api';

export function useProductDirectory() {
  return useQuery<ProductDirectory[]>({
    queryKey: ['product-directory'],
    queryFn: async () => {
      const res = await fetch('/api/product-directory');
      if (!res.ok) throw new Error('Failed to fetch product directory');
      return res.json();
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation<
    ProductDirectory,
    Error,
    { foods_name: string; category_id: number; unit_id: number }
  >({
    mutationFn: async data => {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || 'Failed to create product');
      }

      return res.json();
    },
    onSuccess: product => {
      qc.setQueryData<ProductDirectory[]>(['product-directory'], current => {
        if (!current) return [product];
        return [...current, product];
      });
      qc.invalidateQueries({ queryKey: ['product-directory'] });
    },
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
}

export function useUnits() {
  return useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await fetch('/api/units');
      if (!res.ok) throw new Error('Failed to fetch units');
      return res.json();
    },
  });
}
