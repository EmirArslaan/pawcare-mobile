// src/store/authStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pawCareUser';

export const useAuthStore = create((set, get) => ({
    // State
    user: null,
    token: null,
    isLoading: true,

    // Initialize auth from storage
    initAuth: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                set({ user: data.user || null, token: data.token || null, isLoading: false });
            } else {
                set({ user: null, token: null, isLoading: false });
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            set({ user: null, token: null, isLoading: false });
        }
    },

    // Login action
    login: async (data) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            set({ user: data.user || null, token: data.token || null });
        } catch (error) {
            console.error('Error saving auth state:', error);
            throw error;
        }
    },

    // Logout action
    logout: async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            set({ user: null, token: null });
        } catch (error) {
            console.error('Error clearing auth state:', error);
        }
    },

    // Update user data
    updateUser: async (userData) => {
        try {
            const currentToken = get().token;
            const newData = { user: userData, token: currentToken };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            set({ user: userData });
        } catch (error) {
            console.error('Error updating user:', error);
        }
    },
}));
