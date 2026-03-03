---
description: Fix mismatch between JavaScript and native parts of react-native-worklets
---

1. **Clean existing build artifacts**
   ```
   cd C:\Users\Win10\CARSOS\android
   ./gradlew clean
   ```

2. **Remove and reinstall the worklets package**
   ```
   cd C:\Users\Win10\CARSOS
   npm uninstall react-native-worklets
   npm install react-native-worklets@0.7.2
   ```

3. **Reinstall native dependencies**
   // turbo
   ```
   npx react-native-clean-project clean-project-auto
   ```

4. **Sync Gradle and rebuild the Android project**
   ```
   cd C:\Users\Win10\CARSOS\android
   ./gradlew assembleDebug
   ```

5. **Run the app**
   ```
   cd C:\Users\Win10\CARSOS
   npx expo start
   ```

6. **Verify the version**
   - Open `android/app/src/main/java/com/carsos/MainApplication.java` (or appropriate file) and ensure the worklets native module version matches 0.7.2.
   - If still mismatched, delete `node_modules` and reinstall all packages:
     ```
     rm -rf node_modules
     npm install
     ```

7. **Optional: Clear Metro cache**
   ```
   npx expo start --clear
   ```

**Note:** After each step, ensure there are no errors before proceeding to the next.
