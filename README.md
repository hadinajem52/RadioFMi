# RadioFMi 📻

A modern, feature-rich React Native mobile application for streaming Lebanese radio stations. Built with Expo and React Native, RadioFMi provides seamless access to over 85 radio stations from Lebanon and the region.

## 🌟 Features

- **📡 85+ Radio Stations**: Access a comprehensive collection of Lebanese and regional radio stations
- **🎵 Multiple Genres**: Music & Entertainment, News, Religious, Talk Shows, and more
- **⭐ Favorites**: Save and quickly access your favorite radio stations
- **🔍 Smart Search**: Find stations quickly with an intuitive search function
- **🌐 Bilingual Support**: Full support for English and Arabic languages
- **🎨 Beautiful UI**: Modern, gradient-based design with smooth animations
- **📱 Cross-Platform**: Runs on both iOS and Android devices
- **🔊 Background Playback**: Continue listening while using other apps
- **📊 Stream Health Monitoring**: Real-time stream quality indicators
- **🌙 Keep Screen Awake**: Optional setting to prevent screen dimming during playback
- **📶 Network Status Indicator**: Shows connectivity status
- **🔄 Sorting Options**: Sort stations by name, popularity, or genre

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS development: [Xcode](https://developer.apple.com/xcode/) (macOS only)
- For Android development: [Android Studio](https://developer.android.com/studio)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hadinajem52/RadioFMi.git
   cd RadioFMi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## 🏃 Running the App

### Development Mode

Start the Expo development server:
```bash
npm start
```
or
```bash
expo start
```

This will open the Expo DevTools in your browser. From there, you can:
- Press `i` to open iOS Simulator (macOS only)
- Press `a` to open Android Emulator
- Scan the QR code with the Expo Go app on your physical device

### Platform-Specific Commands

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

## 📁 Project Structure

```
RadioFMi/
├── android/              # Android native files
├── assets/               # Images, icons, and splash screens
├── components/           # React components
│   ├── BackgroundWebViewService.js
│   ├── BottomPlayer.js
│   ├── Favorites.js
│   ├── FeaturedRadios.js
│   ├── FullscreenPlayer.js
│   ├── GenreRadioStations.js
│   ├── Header.js
│   ├── LebaneseRadioStations.js
│   ├── NetworkStatusIndicator.js
│   ├── SearchModal.js
│   ├── Settings.js
│   ├── SideMenu.js
│   ├── SortOptionsModal.js
│   ├── StationWebViewModal.js
│   ├── StreamHealthIndicator.js
│   ├── StreamMonitor.js
│   └── StreamStatus.js
├── contexts/             # React Context providers
├── data/                 # Radio stations data
├── hooks/                # Custom React hooks
├── localization/         # Language files (English/Arabic)
├── radioimg/             # Radio station logos
├── services/             # Service layer (TrackPlayer, etc.)
├── styles/               # Styling files
├── utils/                # Utility functions
├── App.js                # Main application component
├── app.json              # Expo configuration
├── index.js              # Entry point
└── package.json          # Dependencies and scripts
```

## 🛠️ Technologies Used

- **[React Native](https://reactnative.dev/)** - Mobile app framework
- **[Expo](https://expo.dev/)** - Development platform
- **[React Native Track Player](https://react-native-track-player.js.org/)** - Audio streaming
- **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)** - Audio/video playback
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data persistence
- **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradient styling
- **[NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)** - Network status monitoring
- **[React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)** - Icon library
- **[Poppins Font](https://fonts.google.com/specimen/Poppins)** - Custom typography

## 📱 App Configuration

The app is configured in `app.json` with the following settings:

- **App Name**: Lebanese Radio Player
- **Package Name**: com.hhhhjjj.RadioFMi
- **Version**: 1.0.0
- **Orientation**: Portrait
- **Required Permissions**:
  - Internet access
  - Audio settings modification
  - Foreground service (for background playback)
  - Wake lock (to keep device awake)

## 🎨 Features in Detail

### Radio Station Management
- Browse all available stations in a scrollable list
- View featured stations at the top
- Organize stations by genre
- Search for stations by name (English or Arabic)

### Playback Controls
- Play/Pause functionality
- Stream health monitoring
- Volume control
- Background playback support
- Fullscreen player view

### User Preferences
- Add/remove favorite stations
- Sort stations by different criteria
- Language toggle (English/Arabic)
- Keep screen awake option

### Network Handling
- Automatic network status detection
- Graceful handling of connection issues
- WebView fallback for problematic streams

## 🌍 Localization

The app supports two languages:
- **English** (en)
- **Arabic** (ar)

Language files are located in the `localization/` directory.

## 🔧 Development

### Adding a New Radio Station

To add a new radio station, edit `data/radioStations.js`:

```javascript
{
  id: 90,
  name: 'Station Name',
  nameAr: 'اسم المحطة',
  url: 'https://stream-url.com/stream',
  description: 'Station description',
  descriptionAr: 'وصف المحطة',
  color: ['#COLOR1', '#COLOR2'],
  image: require('../radioimg/station-logo.png'),
  genre: 'Music & Entertainment',
  webViewFallbackUrl: 'https://fallback-url.com'
}
```

### Customizing Styles

Global styles are defined in the `styles/` directory. Modify these files to change the app's appearance.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**hadinajem52**

## 🙏 Acknowledgments

- Radio station data and streams from various Lebanese broadcasters
- Icons and assets from the respective stations
- Expo and React Native communities for excellent documentation and support

---

Made with ❤️ for Lebanese radio listeners worldwide
