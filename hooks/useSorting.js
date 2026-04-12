import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGACY_SORT_OPTIONS = {
  RECENTLY_PLAYED: 'recently_played',
};

export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  GENRE: 'genre',
  FAVORITES_FIRST: 'favorites_first',
  PLAYING_AND_FAVORITES: 'playing_and_favorites',
};

const VALID_SORT_OPTIONS = new Set(Object.values(SORT_OPTIONS));

const toFavoriteIdSet = (favorites) => {
  if (favorites instanceof Set) {
    return favorites;
  }
  if (!Array.isArray(favorites)) {
    return new Set();
  }
  return new Set(favorites.map((favorite) => favorite.id));
};

export const sortStationsByOption = (
  stations,
  sortOption,
  favorites = [],
  currentStation = null
) => {
  const stationsCopy = [...stations];
  const favoriteIdSet = toFavoriteIdSet(favorites);

  switch (sortOption) {
    case SORT_OPTIONS.NAME_ASC:
      return stationsCopy.sort((a, b) => a.name.localeCompare(b.name));

    case SORT_OPTIONS.NAME_DESC:
      return stationsCopy.sort((a, b) => b.name.localeCompare(a.name));

    case SORT_OPTIONS.GENRE:
      return stationsCopy.sort((a, b) => {
        const aGenre = Array.isArray(a.genre) ? a.genre[0] || '' : a.genre || '';
        const bGenre = Array.isArray(b.genre) ? b.genre[0] || '' : b.genre || '';

        const genreComparison = aGenre.localeCompare(bGenre);
        if (genreComparison === 0) {
          return a.name.localeCompare(b.name);
        }
        return genreComparison;
      });

    case SORT_OPTIONS.FAVORITES_FIRST:
      return stationsCopy.sort((a, b) => {
        const aIsFavorite = favoriteIdSet.has(a.id);
        const bIsFavorite = favoriteIdSet.has(b.id);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

    case SORT_OPTIONS.PLAYING_AND_FAVORITES:
      return stationsCopy.sort((a, b) => {
        if (currentStation?.id === a.id) return -1;
        if (currentStation?.id === b.id) return 1;

        const aIsFavorite = favoriteIdSet.has(a.id);
        const bIsFavorite = favoriteIdSet.has(b.id);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

    default:
      return stationsCopy;
  }
};

export const useSorting = () => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.NAME_ASC);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSortPreference = async () => {
      try {
        const savedSortOption = await AsyncStorage.getItem('sortOption');
        const normalizedSortOption =
          savedSortOption === LEGACY_SORT_OPTIONS.RECENTLY_PLAYED
            ? SORT_OPTIONS.PLAYING_AND_FAVORITES
            : savedSortOption;

        if (normalizedSortOption && VALID_SORT_OPTIONS.has(normalizedSortOption)) {
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

  useEffect(() => {
    const saveSortPreference = async () => {
      if (!isLoaded) return;

      try {
        await AsyncStorage.setItem('sortOption', sortOption);
      } catch (error) {
        console.error('Error saving sort preference:', error);
      }
    };

    saveSortPreference();
  }, [sortOption, isLoaded]);

  const setSortPreference = useCallback((option) => {
    if (VALID_SORT_OPTIONS.has(option)) {
      setSortOption(option);
    }
  }, []);

  const sortStations = useCallback(
    (stations, favorites = [], currentStation = null) =>
      sortStationsByOption(stations, sortOption, favorites, currentStation),
    [sortOption]
  );

  return useMemo(
    () => ({
      sortOption,
      setSortPreference,
      sortStations,
      isLoaded,
    }),
    [isLoaded, setSortPreference, sortOption, sortStations]
  );
};
