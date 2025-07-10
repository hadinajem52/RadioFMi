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
});

export default styles;
