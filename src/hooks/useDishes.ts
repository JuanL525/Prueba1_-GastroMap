// src/hooks/useDishes.ts
// TanStack Query gestiona el caché de platos:
// - useQuery: cachea la lista, evita releer AsyncStorage en cada render
// - useMutation: actualiza el caché inmediatamente sin refetch (UI optimista)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDish, deleteDish, loadDishes } from '../storage/dishStorage';
import { Dish } from '../types';

export function useDishes(userId: string) {
  const qc = useQueryClient();
  const queryKey = ['dishes', userId];

  const { data: dishes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => loadDishes(userId),
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: (dish: Dish) => addDish(userId, dish),
    onSuccess: (updatedDishes) => qc.setQueryData(queryKey, updatedDishes),
  });

  const deleteMutation = useMutation({
    mutationFn: (dishId: string) => deleteDish(userId, dishId),
    onSuccess: (updatedDishes) => qc.setQueryData(queryKey, updatedDishes),
  });

  return {
    dishes,
    isLoading,
    addDish: addMutation.mutate,
    deleteDish: deleteMutation.mutate,
  };
}
