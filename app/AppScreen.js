import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Image, InteractionManager, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import {
  BottomPlayer,
  Favorites,
  FeaturedRadios,
  FullscreenPlayer,
  GenreRadioStations,
  Header,
  LebaneseRadioStations,
  NetworkStatusIndicator,
  SearchModal,
  Settings,
  SideMenu,
  StationWebViewModal,
} from '../components';
import { FEATURED_STATION_IDS } from '../data/featuredStations';
import { useFavorites, usePlayer, useSorting } from '../hooks';
import radioStations from '../data/radioStations';
import { stopTrack, StreamUrlCache } from '../services';
import styles from '../styles/styles';
import { PLAYBACK_STATUS, registerWebViewOpener } from '../utils';

const AppScreen = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewTitle, setWebViewTitle] = useState('Web Player');
  const hasPrefetchedRef = useRef(false);

  const {
    isLoading,
    currentStation,
    connectionStatus,
    isPlaying,
    isConnected,
    isInternetReachable,
    hasGoodConnection,
    playStation,
    togglePlayPause,
    playNextStation,
    playPreviousStation,
  } = usePlayer();

  const { favorites, favoriteIdsSet, favoriteIds, toggleFavorite } = useFavorites();
  const { sortOption, setSortPreference, sortStations, isLoaded: isSortingLoaded } = useSorting();

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        await Font.loadAsync({
          'Poppins-Thin': Poppins_100Thin,
          'Poppins-ExtraLight': Poppins_200ExtraLight,
          'Poppins-Light': Poppins_300Light,
          'Poppins-Regular': Poppins_400Regular,
          'Poppins-Medium': Poppins_500Medium,
          'Poppins-SemiBold': Poppins_600SemiBold,
          'Poppins-Bold': Poppins_700Bold,
          'Poppins-ExtraBold': Poppins_800ExtraBold,
          'Poppins-Black': Poppins_900Black,
        });

        if (!isMounted) {
          return;
        }

        setFontsLoaded(true);
        setIsAppLoading(false);
      } catch (error) {
        console.error('Error setting up app:', error);
        Alert.alert('Setup Error', 'Failed to initialize app');
        if (isMounted) {
          setIsAppLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedStations = useMemo(() => {
    if (!isSortingLoaded) {
      return radioStations;
    }
    return sortStations(radioStations, favoriteIdsSet, currentStation);
  }, [currentStation, favoriteIdsSet, isSortingLoaded, sortStations]);

  const prefetchPriorityStationIds = useMemo(
    () => [...new Set([...favoriteIds, ...FEATURED_STATION_IDS])],
    [favoriteIds]
  );

  useEffect(() => {
    if (isAppLoading || !fontsLoaded || hasPrefetchedRef.current) {
      return undefined;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      StreamUrlCache.prefetchAll(radioStations, {
        limit: 10,
        priorityStationIds: prefetchPriorityStationIds,
        defer: true,
      });
      hasPrefetchedRef.current = true;
    });

    return () => {
      task.cancel();
    };
  }, [fontsLoaded, isAppLoading, prefetchPriorityStationIds]);

  useEffect(() => {
    return registerWebViewOpener(async (url, title) => {
      try {
        await stopTrack();
      } catch (_) {
        // ignore
      } finally {
        setWebViewUrl(url);
        setWebViewTitle(title || 'Web Player');
        setWebViewVisible(true);
      }
    });
  }, []);

  useEffect(() => {
    if (connectionStatus === PLAYBACK_STATUS.BUFFERING_FAILED && currentStation) {
      setShowFullscreenPlayer(true);
    }
  }, [connectionStatus, currentStation]);

  const onOpenSearch = useCallback(() => setShowSearchModal(true), []);
  const onOpenMenu = useCallback(() => setShowSideMenu(true), []);
  const onCloseSearch = useCallback(() => setShowSearchModal(false), []);
  const onCloseSideMenu = useCallback(() => setShowSideMenu(false), []);
  const onCloseGenreModal = useCallback(() => setShowGenreModal(false), []);
  const onCloseSettings = useCallback(() => setShowSettings(false), []);
  const onCloseWebView = useCallback(() => setWebViewVisible(false), []);
  const onOpenFullscreen = useCallback(() => setShowFullscreenPlayer(true), []);
  const onCloseFullscreen = useCallback(() => setShowFullscreenPlayer(false), []);
  const onGenreSelect = useCallback((genreId) => {
    setSelectedGenre(genreId);
    setShowGenreModal(true);
  }, []);
  const onSettingsPress = useCallback(() => setShowSettings(true), []);

  const stationListHeader = useMemo(
    () => (
      <View>
        <FeaturedRadios
          styles={styles}
          radioStations={radioStations}
          currentStation={currentStation}
          isPlaying={isPlaying}
          playStation={playStation}
          togglePlayPause={togglePlayPause}
        />
        <Favorites
          styles={styles}
          favorites={favorites}
          currentStation={currentStation}
          isPlaying={isPlaying}
          playStation={playStation}
          togglePlayPause={togglePlayPause}
        />
      </View>
    ),
    [currentStation, favorites, isPlaying, playStation, togglePlayPause]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#2d1b69', '#4a1c6e', '#5a2d5a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar style="light" />

        {isAppLoading || !fontsLoaded ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <Image source={require('../assets/icon.png')} style={styles.loadingLogo} resizeMode="contain" />
              <Text style={styles.loadingTitle}>Lebanese Radio Player</Text>
              <Text style={styles.loadingSubtitle}>Your favorite radio stations</Text>
              <ActivityIndicator size="large" color="#7C4DFF" style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        ) : (
          <>
            <LebaneseRadioStations
              styles={styles}
              radioStations={sortedStations}
              currentStation={currentStation}
              playStation={playStation}
              togglePlayPause={togglePlayPause}
              sortOption={sortOption}
              onSortOptionChange={setSortPreference}
              listHeaderComponent={stationListHeader}
            />

            <Header styles={styles} onSearchPress={onOpenSearch} onMenuPress={onOpenMenu} />

            <NetworkStatusIndicator
              isConnected={isConnected}
              isInternetReachable={isInternetReachable}
              hasGoodConnection={hasGoodConnection}
              styles={styles}
            />

            {currentStation && (
              <BottomPlayer
                styles={styles}
                currentStation={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                connectionStatus={connectionStatus}
                togglePlayPause={togglePlayPause}
                onPress={onOpenFullscreen}
                favorites={favorites}
                favoriteIdsSet={favoriteIdsSet}
                toggleFavorite={toggleFavorite}
              />
            )}

            {showFullscreenPlayer && (
              <FullscreenPlayer
                visible={showFullscreenPlayer}
                onClose={onCloseFullscreen}
                currentStation={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                connectionStatus={connectionStatus}
                togglePlayPause={togglePlayPause}
                playNextStation={playNextStation}
                playPreviousStation={playPreviousStation}
                favorites={favorites}
                favoriteIdsSet={favoriteIdsSet}
                toggleFavorite={toggleFavorite}
              />
            )}

            {showSearchModal && (
              <SearchModal
                visible={showSearchModal}
                onClose={onCloseSearch}
                radioStations={radioStations}
                currentStation={currentStation}
                isPlaying={isPlaying}
                playStation={playStation}
                togglePlayPause={togglePlayPause}
                styles={styles}
              />
            )}

            <SideMenu
              visible={showSideMenu}
              onClose={onCloseSideMenu}
              onGenreSelect={onGenreSelect}
              onSettingsPress={onSettingsPress}
              styles={styles}
            />

            {showGenreModal && (
              <GenreRadioStations
                visible={showGenreModal}
                onClose={onCloseGenreModal}
                genreId={selectedGenre}
                radioStations={radioStations}
                currentStation={currentStation}
                isPlaying={isPlaying}
                playStation={playStation}
                togglePlayPause={togglePlayPause}
                styles={styles}
              />
            )}

            {showSettings && <Settings visible={showSettings} onClose={onCloseSettings} styles={styles} />}

            <StationWebViewModal visible={webViewVisible} url={webViewUrl} title={webViewTitle} onClose={onCloseWebView} />
          </>
        )}
      </LinearGradient>
    </View>
  );
};

export default AppScreen;
