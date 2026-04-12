import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import radioStations from '../data/radioStations';

const FAVORITES_STORAGE_KEY = 'favorites';
const SAVE_DEBOUNCE_MS = 250;
const stationById = new Map(radioStations.map((station) => [station.id, station]));

const normalizeFavoriteIds = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    if (parsed.length === 0) {
      return [];
    }

    if (typeof parsed[0] === 'number') {
      return parsed.filter((id) => stationById.has(id));
    }

    return parsed
      .map((item) => item?.id)
      .filter((id) => typeof id === 'number' && stationById.has(id));
  } catch (error) {
    console.error('Error parsing favorites:', error);
    return [];
  }
};

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        const normalizedFavoriteIds = normalizeFavoriteIds(savedFavorites);
        if (isMounted) {
          setFavoriteIds(normalizedFavoriteIds);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        isInitialMount.current = false;
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      return undefined;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
      } catch (error) {
        console.error('Error saving favorites:', error);
      } finally {
        saveTimeoutRef.current = null;
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [favoriteIds]);

  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const favorites = useMemo(
    () => favoriteIds.map((id) => stationById.get(id)).filter(Boolean),
    [favoriteIds]
  );

  const toggleFavorite = (station) => {
    if (!station?.id) {
      return;
    }

    setFavoriteIds((prevFavoriteIds) => {
      if (prevFavoriteIds.includes(station.id)) {
        return prevFavoriteIds.filter((favoriteId) => favoriteId !== station.id);
      }
      return [...prevFavoriteIds, station.id];
    });
  };

  return {
    favorites,
    favoriteIds,
    favoriteIdsSet,
    toggleFavorite,
  };
};
