import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  showsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  showCard: {
    alignItems: 'center',
  },
  showImage: {
    width: 120,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  showName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stationIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 15,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  stationDescription: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingBottom: 100,
  },
  bottomPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  playerIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 15,
  },
  playerInfo: {
    flex: 1,
  },
  playerStationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  playerDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFavoritesContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noFavoritesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginBottom: 5,
  },
  noFavoritesSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },

  // Search Modal Styles
  searchButton: {
    padding: 4,
  },
  menuButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBackButton: {
    marginRight: 15,
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchResultsCount: {
    fontSize: 14,
    color: '#666',
    marginVertical: 15,
    fontWeight: '500',
  },
  searchResultsList: {
    paddingBottom: 20,
  },
  searchResultItem: {
    paddingVertical: 15,
  },
  currentStationText: {
    color: '#007AFF',
  },
  stationGenre: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  searchPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  // Side Menu Styles
  sideMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  sideMenuBackdrop: {
    flex: 1,
  },
  sideMenuContainer: {
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sideMenuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  sideMenuCloseButton: {
    padding: 4,
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: 20,
  },
  sideMenuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  sideMenuItemIcon: {
    marginRight: 15,
    width: 24,
  },
  sideMenuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sideMenuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
    marginHorizontal: 20,
  },

  // Genre Radio Stations Styles
  genreContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  genreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  genreBackButton: {
    padding: 4,
  },
  genreHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  genreHeaderIcon: {
    marginRight: 8,
  },
  genreHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  genreDescriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  genreDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  genreStationsCount: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  genreStationsCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genreStationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  genreStationItem: {
    paddingVertical: 15,
  },
  genrePlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  noStationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noStationsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  noStationsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  // Settings Styles
  settingsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsBackButton: {
    padding: 4,
  },
  settingsHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
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
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  settingsItemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  volumeButton: {
    padding: 8,
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
    marginBottom: 30,
  },
  rtlSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlShowsContainer: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  rtlShowCard: {
    alignItems: 'center',
  },
  rtlShowName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rtlNoFavoritesContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  rtlNoFavoritesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginBottom: 5,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rtlNoFavoritesSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});

export default styles;