import { SORT_OPTIONS, sortStationsByOption } from '../hooks/useSorting';

const stations = [
  { id: 1, name: 'Bravo', genre: 'News & Talk' },
  { id: 2, name: 'Alpha', genre: 'Music & Entertainment' },
  { id: 3, name: 'Charlie', genre: 'Religious' },
];

describe('sortStationsByOption', () => {
  it('sorts favorites first using a Set without repeated array scans', () => {
    const favoriteIds = new Set([3]);
    const sorted = sortStationsByOption(stations, SORT_OPTIONS.FAVORITES_FIRST, favoriteIds);
    expect(sorted.map((station) => station.id)).toEqual([3, 2, 1]);
  });

  it('puts currently playing station first then favorites then name', () => {
    const favoriteIds = new Set([1]);
    const sorted = sortStationsByOption(
      stations,
      SORT_OPTIONS.PLAYING_AND_FAVORITES,
      favoriteIds,
      { id: 2 }
    );

    expect(sorted.map((station) => station.id)).toEqual([2, 1, 3]);
  });

  it('keeps deterministic sorting for genre option', () => {
    const sorted = sortStationsByOption(stations, SORT_OPTIONS.GENRE, new Set());
    expect(sorted.map((station) => station.id)).toEqual([2, 1, 3]);
  });
});
