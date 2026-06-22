# Agent Development Guidelines

Welcome to the Tuner AI Agent Workspace. This repository makes extensive use of Expo and React Native natively-linked libraries (such as `@saltmango/expo-audio-stream`).

Because of these native bindings, **you cannot test this app natively using standard Expo Go (`npm run android` / `npm run ios` without prebuild).** You must run the custom development client build.

## Running the App for Testing

### 1. The Web Target

The web target natively supports the Web Audio API (`AudioContext`). It is the fastest way to test basic typescript logic.

```bash
npm run web
```

### 2. The iOS/Android Targets (Requiring Native Compiling)

If you are asked to test Audio/Microphone logic across mobile, you must use the `host-mcp` tools provided to you.

**Provisioning an Emulator:**

1. Call `mcp_host-mcp_provision_ios_simulator` or `mcp_host-mcp_provision_android_emulator`.
2. Wait for the `device_id` to be returned (this confirms the simulator is booted and visible to the Host Mac).

**Building and Deploying the App:**

1. Once the simulator is booted, you must build the custom dev client.
2. Ensure you have sourced the Antigravity `env.sh` so your environment path is correct.
3. Run the expo dev client command:

   ```bash
   source ~/.antigravity/env.sh
   # For iOS:
   npx expo run:ios

   # For Android:
   npx expo run:android
   ```

4. This command will compile the `.xcworkspace` or `.apk` on the host machine and automatically launch the app inside the booted simulator/emulator.
5. The metro bundler will start automatically. Keep it running in a persistent terminal to see `console.log` output.

**Working with Permissions:**

- The pitch detection depends on `NSMicrophoneUsageDescription`. The system will prompt the simulator for microphone permissions upon pressing "Start Tuner". The human user or an automation UI tester agent may need to click "Allow".

## Coding Guidelines

- **Autocorrelation:** We use time-domain autocorrelation in `utils/pitchDetection.ts` rather than standard Max Peak FFT because harmonics fool the tuner otherwise. Do not revert to `getFloatFrequencyData()`.
- **Framework:** The UI is largely constructed utilizing React Native Reanimated for high-frame-rate spring physics interpolations and NativeWind for layout tokens.
- **Native Modules:** When adding new capabilities that require native code (Bluetooth, file system, low latency audio), ensure you run `npx expo prebuild` again to sync changes to `ios/` and `android/`.
