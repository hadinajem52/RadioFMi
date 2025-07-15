export const strings = {
  en: {
    // App Header
    appTitle: 'Radio FM',
    
    // Main Sections
    featuredRadios: 'Featured Radios',
    favorites: 'Favorites',
    lebaneseRadioStations: 'Lebanese Radio Stations',
    
    // Player
    nowPlaying: 'Now Playing',
    liveRadio: 'Live Radio',
    
    // Search
    searchPlaceholder: 'Search radio stations...',
    searchResults: 'Search Results',
    searchResultsCount: 'results found',
    noResults: 'No results found',
    noResultsSubtext: 'Try searching with different keywords',
    
    // Favorites
    noFavorites: 'No favorites yet',
    noFavoritesSubtext: 'Add stations to your favorites by tapping the heart icon',
    
    // Side Menu
    browseByGenre: 'Browse by Genre',
    
    // Genres
    newsAndTalk: 'News & Talk',
    musicAndEntertainment: 'Music & Entertainment',
    religious: 'Religious',
    
    // Genre Descriptions
    newsDescription: 'Stay informed with news and talk shows',
    musicDescription: 'Enjoy music and entertainment programs',
    religiousDescription: 'Spiritual and religious content',
    
    // Genre Stations
    stationsAvailable: 'stations available',
    station: 'station',
    stations: 'stations',
    noStations: 'No stations found',
    noStationsSubtext: 'No stations available for this genre',
    
    // Settings
    settings: 'Settings',
    audio: 'Audio',
    general: 'General',
    autoPlay: 'Auto-play next station',
    autoPlaySub: 'Automatically play next station when current ends',
    notifications: 'Notifications',
    notificationsSub: 'Show notifications for now playing',
    quality: 'High Quality Audio',
    qualitySub: 'Use higher bitrate streams when available',
    language: 'Language',
    languageSub: 'Choose your preferred language',
    about: 'About',
    aboutSub: 'App information and version',
    volume: 'Volume',
    
    // Language Selection
    selectLanguage: 'Select Language',
    selectLanguageSubtitle: 'Choose your preferred language',
    english: 'English',
    arabic: 'العربية',
    cancel: 'Cancel',
    
    // About
    aboutTitle: 'About Radio FM',
    aboutContent: 'Radio FM - Lebanese Radio Stations\nVersion 1.0.0\n\nEnjoy listening to your favorite Lebanese radio stations.',
    ok: 'OK',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    close: 'Close',
    back: 'Back',
  },
  ar: {
    // App Header
    appTitle: 'راديو FM',
    
    // Main Sections
    featuredRadios: 'الإذاعات المميزة',
    favorites: 'المفضلة',
    lebaneseRadioStations: 'محطات الراديو اللبنانية',
    
    // Player
    nowPlaying: 'يتم تشغيله الآن',
    liveRadio: 'راديو مباشر',
    
    // Search
    searchPlaceholder: 'البحث عن محطات الراديو...',
    searchResults: 'نتائج البحث',
    searchResultsCount: 'نتيجة موجودة',
    noResults: 'لا توجد نتائج',
    noResultsSubtext: 'جرب البحث بكلمات مختلفة',
    
    // Favorites
    noFavorites: 'لا توجد مفضلة بعد',
    noFavoritesSubtext: 'أضف المحطات إلى المفضلة من خلال النقر على أيقونة القلب',
    
    // Side Menu
    browseByGenre: 'تصفح حسب النوع',
    
    // Genres
    newsAndTalk: 'الأخبار والحديث',
    musicAndEntertainment: 'الموسيقى والترفيه',
    religious: 'ديني',
    
    // Genre Descriptions
    newsDescription: 'ابق على اطلاع بالأخبار والبرامج الحوارية',
    musicDescription: 'استمتع بالموسيقى وبرامج الترفيه',
    religiousDescription: 'محتوى روحي وديني',
    
    // Genre Stations
    stationsAvailable: 'محطة متاحة',
    station: 'محطة',
    stations: 'محطات',
    noStations: 'لا توجد محطات',
    noStationsSubtext: 'لا توجد محطات متاحة لهذا النوع',
    
    // Settings
    settings: 'الإعدادات',
    audio: 'الصوت',
    general: 'عام',
    autoPlay: 'التشغيل التلقائي للمحطة التالية',
    autoPlaySub: 'تشغيل المحطة التالية تلقائياً عند انتهاء الحالية',
    notifications: 'الإشعارات',
    notificationsSub: 'إظهار إشعارات للعرض الحالي',
    quality: 'جودة صوت عالية',
    qualitySub: 'استخدام بث بمعدل أعلى عند توفره',
    language: 'اللغة',
    languageSub: 'اختر لغتك المفضلة',
    about: 'حول',
    aboutSub: 'معلومات التطبيق والإصدار',
    volume: 'مستوى الصوت',
    
    // Language Selection
    selectLanguage: 'اختر اللغة',
    selectLanguageSubtitle: 'اختر لغتك المفضلة',
    english: 'English',
    arabic: 'العربية',
    cancel: 'إلغاء',
    
    // About
    aboutTitle: 'حول راديو FM',
    aboutContent: 'راديو FM - محطات الراديو اللبنانية\nالإصدار 1.0.0\n\nاستمتع بالاستماع إلى محطات الراديو اللبنانية المفضلة لديك.',
    ok: 'موافق',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    close: 'إغلاق',
    back: 'رجوع',
  }
};

export const getLocalizedString = (key, language = 'en') => {
  return strings[language]?.[key] || strings.en[key] || key;
};
