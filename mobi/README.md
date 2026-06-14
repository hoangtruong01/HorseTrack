# HorseTrack Mobile

Expo Router mobile app for the HorseTrack MVP demo.

## API URL

Copy `.env.example` to `.env` and set:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
```

Use the right host for your target:

- Android emulator: `http://10.0.2.2:<port>/api/v1`
- iOS simulator: `http://localhost:<port>/api/v1`
- Physical device / Expo Go: `http://<LAN-IP>:<port>/api/v1`

Restart Expo after changing `.env` because `EXPO_PUBLIC_` values are bundled at startup.

## Run

```bash
npm install
npx expo start
```

## Verify

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
npm ls expo expo-router expo-font expo-image-picker --depth=0
```
