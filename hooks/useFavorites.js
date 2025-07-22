import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const isInitialMount = useRef(true);

  // Load favorites from AsyncStorage on hook initialization
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        isInitialMount.current = false;
      } catch (error) {
        console.error('Error loading favorites:', error);
        isInitialMount.current = false;
      }
    };
    
    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever favorites change (after initial load)
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };
    
    // Only save after the initial mount to avoid overwriting on app start
    if (!isInitialMount.current) {
      saveFavorites();
    }
  }, [favorites]);

  const toggleFavorite = (station) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === station.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== station.id);
      } else {
        return [...prev, station];
      }
    });
  };

  return {
    favorites,
    toggleFavorite,
  };
};