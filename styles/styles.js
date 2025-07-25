import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerIcon: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.3)',
  },
  sortButtonFullWidth: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  sortButtonText: {
    color: '#7C4DFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 5,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sortOptionItemSelected: {
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.4)',
  },
  sortOptionIconContainer: {
    marginRight: 15,
    width: 24,
    alignItems: 'center',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  sortOptionTextSelected: {
    color: '#7C4DFF',
    fontWeight: '600',
  },
  sortOptionCheckmark: {
    marginLeft: 'auto',
  },
  showsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  showCard: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  showImage: {
    width: 120,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  showName: {
    fontSize: 14,
    color: '#e0e0e0',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stationIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 15,
    // Add glow effect
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  stationDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
  },
  listContent: {
    paddingTop: 120,
    paddingBottom: 100,
    paddingHorizontal: 8,
  },
  bottomPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    // Enhanced bottom player styling
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  playerIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 20,
    // Enhanced icon styling
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  playerInfo: {
    flex: 1,
  },
  playerStationName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  playerDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // Enhanced button styling
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(124, 77, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced play button with glow effect
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noFavoritesContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noFavoritesText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  noFavoritesSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  // Search Modal Styles
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchBackButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchIcon: {
    marginRight: 10,
    color: '#ffffff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ffffff',
    paddingVertical: 0,
    placeholderTextColor: '#b0b0b0',
  },
  clearButton: {
    marginLeft: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#0a0e27',
  },
  searchResultsCount: {
    fontSize: 14,
    color: '#b0b0b0',
    marginVertical: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  searchResultsList: {
    paddingBottom: 20,
  },
  searchResultItem: {
    paddingVertical: 15,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currentStationText: {
    color: '#7C4DFF',
  },
  stationGenre: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9090a0',
    marginTop: 4,
  },
  searchPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.4)',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  // Side Menu Styles
  sideMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
  },
  sideMenuBackdrop: {
    flex: 1,
  },
  sideMenuContainer: {
    width: 280,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    paddingTop: 50,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sideMenuTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  sideMenuCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: 20,
  },
  sideMenuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#9090a0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sideMenuItemIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
    color: '#ffffff',
  },
  sideMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    fontWeight: '600',
  },
  sideMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  sideMenuLanguageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sideMenuLanguageContent: {
    flex: 1,
    marginLeft: 15,
  },
  sideMenuLanguageSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    marginTop: 2,
    fontWeight: '400',
  },

  // RTL Side Menu Styles
  rtlSideMenuContainer: {
    width: 280,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    paddingTop: 50,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  rtlSideMenuHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  rtlSideMenuTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSideMenuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#9090a0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSideMenuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rtlSideMenuItemIcon: {
    marginLeft: 15,
    marginRight: 0,
    width: 24,
    textAlign: 'center',
    color: '#7C4DFF',
  },
  rtlSideMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // RTL Side Menu Language Styles
  rtlSideMenuLanguageItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rtlSideMenuLanguageContent: {
    flex: 1,
    marginRight: 15,
    marginLeft: 0,
    alignItems: 'flex-end',
  },
  rtlSideMenuLanguageSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    marginTop: 2,
    fontWeight: '400',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Genre Radio Stations Styles
  genreContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  genreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  genreBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  genreHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  genreHeaderIcon: {
    marginRight: 8,
    color: '#7C4DFF',
  },
  genreHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  genreDescriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  genreDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  genreStationsCount: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  genreStationsCountText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#9090a0',
    fontWeight: '600',
  },
  genreStationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  genreStationItem: {
    paddingVertical: 15,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  genrePlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.4)',
  },
  noStationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noStationsText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  noStationsSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  // Settings Styles
  settingsContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  settingsBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  settingsContent: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#9090a0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingsItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemIcon: {
    marginRight: 15,
    width: 24,
    color: '#7C4DFF',
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
  },
  settingsItemValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9090a0',
    marginRight: 8,
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  volumeButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  volumeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  volumeBar: {
    width: 3,
    height: 20,
    marginHorizontal: 1,
    borderRadius: 1.5,
    backgroundColor: 'rgba(124, 77, 255, 0.3)',
  },

  // RTL Support Styles
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  rtlSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rtlShowsContainer: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  rtlShowCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rtlShowName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#e0e0e0',
    fontWeight: '600',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rtlNoFavoritesContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rtlNoFavoritesText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rtlNoFavoritesSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  // RTL Settings Styles
  rtlSettingsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rtlSettingsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSettingsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#9090a0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSettingsItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rtlSettingsItemLeft: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rtlSettingsItemRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rtlSettingsItemIcon: {
    marginLeft: 15,
    marginRight: 0,
    width: 24,
    color: '#7C4DFF',
  },
  rtlSettingsItemText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rtlSettingsItemTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSettingsItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlSettingsItemValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9090a0',
    marginLeft: 8,
    marginRight: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlVolumeSliderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginRight: 15,
    marginLeft: 0,
  },

  // Language Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  rtlLanguageModal: {
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  rtlLanguageModalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  rtlLanguageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageOptions: {
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rtlLanguageOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.4)',
  },
  languageOptionContent: {
    flex: 1,
  },
  rtlLanguageOptionContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  languageOptionName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginBottom: 2,
  },
  rtlLanguageOptionName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginBottom: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  languageOptionNative: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
  },
  rtlLanguageOptionNative: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectedLanguageOptionText: {
    color: '#7C4DFF',
  },
  selectedLanguageOptionSubtext: {
    color: '#7C4DFF',
  },
  
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Poppins-ExtraBold',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#b0b0b0',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingSpinner: {
    marginBottom: 20,
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#e0e0e0',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default styles;