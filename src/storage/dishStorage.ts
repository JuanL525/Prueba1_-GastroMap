// src/storage/dishStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dish } from '../types';

const getKey = (userId: string) => `dishes:${userId}`;

export async function loadDishes(userId: string): Promise<Dish[]> {
  const raw = await AsyncStorage.getItem(getKey(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function saveDishes(userId: string, dishes: Dish[]): Promise<void> {
  await AsyncStorage.setItem(getKey(userId), JSON.stringify(dishes));
}

export async function addDish(userId: string, dish: Dish): Promise<Dish[]> {
  const current = await loadDishes(userId);
  const updated = [dish, ...current]; // el plato nuevo va al inicio
  await saveDishes(userId, updated);
  return updated;
}

export async function deleteDish(userId: string, dishId: string): Promise<Dish[]> {
  const current = await loadDishes(userId);
  const updated = current.filter((d) => d.id !== dishId);
  await saveDishes(userId, updated);
  return updated;
}
