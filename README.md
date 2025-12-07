# PawCare Mobile App

React Native mobile application for the PawCare platform - helping street animals find homes (sahiplendirme), report lost pets (kayıp), connect with community (forum), and map feeding/shelter points.

## 📱 Features

- **Authentication**: Login/Register with JWT tokens
- **Home Dashboard**: Latest adoptions, lost pets, and forum posts
- **Adoption Module**: Browse, create, and manage pet adoption listings
- **Lost Pets Module**: Report and search for missing pets
- **Forum**: Community discussions with comments
- **Interactive Map**: View/add feeding stations, shelters, and emergencies
- **Profile**: User stats and manage your listings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator (Android Studio) or Expo Go app

### Installation

```bash
cd pawcare-mobile
npm install
```

### Configuration

1. **API URL**: Edit `src/constants/api.js` and set `API_BASE_URL` to your backend address:
   - iOS Simulator: `http://localhost:5001/api`
   - Android Emulator: `http://10.0.2.2:5001/api`
   - Physical device: `http://YOUR_LOCAL_IP:5001/api`

   To find your local IP:
   ```bash
   # macOS
   ipconfig getifaddr en0
   ```

2. **Backend**: Make sure the backend is running:
   ```bash
   cd ../pawcare-backend
   npm run dev
   ```

### Running the App

```bash
# Start Expo development server
npx expo start

# Or run directly on platform
npx expo start --ios
npx expo start --android
```

## 📁 Project Structure

```
pawcare-mobile/
├── App.js                    # Entry point
├── src/
│   ├── api/
│   │   └── client.js         # Axios instance with auth
│   ├── components/
│   │   ├── cards/            # AdoptionCard, LostPetCard, ForumPostCard
│   │   └── common/           # Button, LoadingSpinner, ErrorMessage
│   ├── constants/
│   │   └── api.js            # API URL and colors
│   ├── navigation/
│   │   ├── AppNavigator.js   # Root navigator
│   │   ├── AuthStack.js      # Login/Register
│   │   └── MainTabs.js       # Bottom tabs with stacks
│   ├── screens/
│   │   ├── adoption/         # Adoption list, detail, create
│   │   ├── auth/             # Login, Register
│   │   ├── forum/            # Forum list, detail, create
│   │   ├── home/             # Home dashboard
│   │   ├── lost/             # Lost pet list, detail
│   │   ├── map/              # Interactive map
│   │   └── profile/          # User profile
│   └── store/
│       └── authStore.js      # Zustand auth state
└── assets/                   # App icons and splash
```

## 🔗 Backend API

The app connects to the same backend as the web version at `/api`:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET/POST /api/adoption` - Adoption listings
- `GET/POST /api/lostpets` - Lost pet reports
- `GET/POST /api/forum` - Forum posts
- `GET/POST /api/feeds` - Feeding stations
- `GET/POST /api/shelters` - Shelters
- `GET/POST /api/emergency` - Emergency reports
- `POST /api/upload` - Image upload

## 📝 Notes

- The app uses the same backend as the web version
- Images are uploaded to Cloudinary via the backend
- Map markers use react-native-maps with native components
- Long-press on map to add new points (requires login)
