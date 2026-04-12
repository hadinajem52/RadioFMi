import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGACY_SORT_OPTIONS = {
  RECENTLY_PLAYED: 'recently_played',
};

export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  GENRE: 'genre',
  FAVORITES_FIRST: 'favorites_first',
  PLAYING_AND_FAVORITES: 'playing_and_favorites'
};

export const useSorting = () => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.NAME_ASC);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sort preference from AsyncStorage on hook initialization
  useEffect(() => {
    const loadSortPreference = async () => {
      try {
        const savedSortOption = await AsyncStorage.getItem('sortOption');
        const normalizedSortOption = savedSortOption === LEGACY_SORT_OPTIONS.RECENTLY_PLAYED
          ? SORT_OPTIONS.PLAYING_AND_FAVORITES
          : savedSortOption;

        if (normalizedSortOption && Object.values(SORT_OPTIONS).includes(normalizedSortOption)) {
          setSortOption(normalizedSortOption);
        }
      } catch (error) {
        console.error('Error loading sort preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSortPreference();
  }, []);

  // Save sort preference to AsyncStorage whenever it changes (after initial load)
  useEffect(() => {
    const saveSortPreference = async () => {
      if (isLoaded) {
        try {
          await AsyncStorage.setItem('sortOption', sortOption);
        } catch (error) {
          console.error('Error saving sort preference:', error);
        }
      }
    };

    saveSortPreference();
  }, [sortOption, isLoaded]);

  const setSortPreference = (option) => {
    if (Object.values(SORT_OPTIONS).includes(option)) {
      setSortOption(option);
    }
  };

  const sortStations = (stations, favorites = [], currentStation = null) => {
    const stationsCopy = [...stations];

    switch (sortOption) {
      case SORT_OPTIONS.NAME_ASC:
        return stationsCopy.sort((a, b) => a.name.localeCompare(b.name));
      
      case SORT_OPTIONS.NAME_DESC:
        return stationsCopy.sort((a, b) => b.name.localeCompare(a.name));
      
      case SORT_OPTIONS.GENRE:
        return stationsCopy.sort((a, b) => {
          // Handle genre as string or array
          const getGenreString = (station) => {
            if (Array.isArray(station.genre)) {
              return station.genre[0] || '';
            }
            return station.genre || '';
          };
          
          const aGenre = getGenreString(a);
          const bGenre = getGenreString(b);
          
          const genreComparison = aGenre.localeCompare(bGenre);
          if (genreComparison === 0) {
            return a.name.localeCompare(b.name);
          }
          return genreComparison;
        });
      
      case SORT_OPTIONS.FAVORITES_FIRST:
        return stationsCopy.sort((a, b) => {
          const aIsFavorite = favorites.some(fav => fav.id === a.id);
          const bIsFavorite = favorites.some(fav => fav.id === b.id);
          
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          
          // If both are favorites or both are not, sort by name
          return a.name.localeCompare(b.name);
        });
      
      case SORT_OPTIONS.PLAYING_AND_FAVORITES:
        return stationsCopy.sort((a, b) => {
          // Currently playing station comes first
          if (currentStation?.id === a.id) return -1;
          if (currentStation?.id === b.id) return 1;
          
          // Then favorites
          const aIsFavorite = favorites.some(fav => fav.id === a.id);
          const bIsFavorite = favorites.some(fav => fav.id === b.id);
          
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          
          // Finally by name
          return a.name.localeCompare(b.name);
        });
      
      default:
        return stationsCopy;
    }
  };

  return {
    sortOption,
    setSortPreference,
    sortStations,
    isLoaded
  };
};
