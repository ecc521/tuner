# Tuner

A cross-platform instrument tuner application built with Expo and React Native.

## Development / Testing

### Prerequisites

- Node.js (v20 recommended) and npm.
- For iOS development (Mac only): Xcode.
- For Android development: Android Studio and Android SDK.

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

    *Note: This command automatically runs the license generation script via a `postinstall` hook.*

### Running the App

Start the development server:

```bash
npm start
```

This will start the Metro bundler. You can then use the following commands or press the corresponding keys in the terminal:

-   **Web:** Press `w` or run `npm run web`.
-   **Android:** Press `a` or run `npm run android` (requires an Android emulator or connected device).
-   **iOS:** Press `i` or run `npm run ios` (requires Xcode and an iOS simulator, Mac only).

## Building for Release

### Web

#### Automated Deployment
This repository is configured with a GitHub Actions workflow that automatically builds and deploys the web version to GitHub Pages whenever changes are pushed to the `main` branch.

#### Manual Build
To manually build the web version for production:

```bash
npx expo export --platform web
```

The build artifacts will be created in the `dist` directory.

### Mobile (iOS & Android)

You can build the application using **EAS Build** (Expo Application Services) or locally using native tools.

#### EAS Build (Cloud)

1.  Install the EAS CLI: `npm install -g eas-cli`
2.  Login to your Expo account: `eas login`
3.  Configure the project: `eas build:configure`
4.  Run the build:

    ```bash
    eas build --platform android
    # or
    eas build --platform ios
    ```

#### Local Build

To build the native apps locally on your machine:

**Android:**

```bash
npx expo run:android --variant release
```

**iOS:**

```bash
npx expo run:ios --configuration Release
```

## Open Source Licenses

The application includes a credit screen for open-source dependencies. The list of licenses is generated automatically.

-   **Automatic Generation:** The `scripts/generate-licenses.js` script runs automatically after `npm install` (via the `postinstall` hook).
-   **Manual Generation:** You can manually regenerate the licenses file by running:

    ```bash
    node scripts/generate-licenses.js
    ```
