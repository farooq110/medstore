# Android Gradle Commands - Complete Guide

## 📱 Common Android Build Commands

### 1. **Build APK (Debug)**
```bash
cd /home/hyperdev-solutions/Desktop/projects/medstore/frontend/android
./gradlew assembleDebug
```
**Output:** `app/build/outputs/apk/debug/app-debug.apk`

### 2. **Build APK (Release)**
```bash
./gradlew assembleRelease
```
**Output:** `app/build/outputs/apk/release/app-release-unsigned.apk`

### 3. **Build Bundle (For Google Play)**
```bash
./gradlew bundleRelease
```
**Output:** `app/build/outputs/bundle/release/app-release.aab`

### 4. **Clean Build**
```bash
./gradlew clean
```
Removes all build artifacts

### 5. **Build with Dependencies Update**
```bash
./gradlew clean assembleDebug --refresh-dependencies
```

---

## 🧪 Testing Commands

### Run Unit Tests
```bash
./gradlew test
```

### Run Android Tests
```bash
./gradlew connectedAndroidTest
```

### Run Specific Test
```bash
./gradlew test --tests com.example.MyTest
```

---

## 📊 Information Commands

### Show Dependencies
```bash
./gradlew dependencies
```

### Show Build Info
```bash
./gradlew buildEnvironment
```

### List Available Tasks
```bash
./gradlew tasks
```

### Check Gradle Version
```bash
./gradlew --version
```

---

## 🔧 Advanced Commands

### Build with Custom Variant
```bash
./gradlew assembleDebugDevFlavor
```

### Lint Check
```bash
./gradlew lint
```

### Code Quality Analysis
```bash
./gradlew lint assembleDebug
```

### Build and Install on Device
```bash
./gradlew installDebug
```

### Uninstall from Device
```bash
./gradlew uninstallDebug
```

---

## ⚙️ Build Configuration

### View Build Configuration
**File:** `/android/build.gradle`
```gradle
buildscript {
    ext {
        buildToolsVersion = "XX.X.X"
        minSdkVersion = 24
        compileSdkVersion = 34
        targetSdkVersion = 34
    }
}
```

### View App Configuration
**File:** `/android/app/build.gradle`
- Defines the actual Android app settings
- Manages dependencies
- Configures signing keys

---

## 🚀 Typical Build Workflow

### 1. Development Build (Debug APK)
```bash
cd frontend/android
./gradlew clean
./gradlew assembleDebug
# Install on emulator/device
./gradlew installDebug
```

### 2. Release Build (Signed APK)
```bash
# Requires keystore setup first
./gradlew assembleRelease
```

### 3. Play Store Build (Bundle)
```bash
./gradlew bundleRelease
# Then upload the .aab file to Google Play Console
```

---

## 📁 Build Output Locations

| Type | Path |
|------|------|
| Debug APK | `app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `app/build/outputs/apk/release/app-release-unsigned.apk` |
| Bundle | `app/build/outputs/bundle/release/app-release.aab` |
| Build Logs | `app/build/outputs/logs/` |

---

## ✅ Troubleshooting Commands

### Clear Gradle Cache
```bash
./gradlew cleanBuildCache
```

### Force Download Dependencies
```bash
./gradlew assembleDebug --refresh-dependencies
```

### Check Java Version
```bash
java -version
```

### Check Gradle Version
```bash
./gradlew --version
```

---

## 🎯 Quick Commands

For your Ionic/Capacitor project:

```bash
# 1. Build the Angular app first
cd /home/hyperdev-solutions/Desktop/projects/medstore/frontend
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build Android debug APK
cd android
./gradlew clean assembleDebug

# 4. Build Android release bundle
./gradlew bundleRelease
```

---

## 📝 Notes

- Use `./gradlew` (with dot) for Linux/Mac
- Use `gradlew.bat` for Windows
- Always run from the `android/` directory
- Add `--info` flag for verbose output: `./gradlew assembleDebug --info`
- Add `--debug` flag for debug output: `./gradlew assembleDebug --debug`

---

## Example: Complete Build Sequence

```bash
# Navigate to frontend
cd /home/hyperdev-solutions/Desktop/projects/medstore/frontend

# Build Angular app
npm run build

# Sync Capacitor
npx cap sync android

# Navigate to Android folder
cd android

# Clean and build
./gradlew clean assembleDebug

# Output APK location
echo "APK generated at: app/build/outputs/apk/debug/app-debug.apk"
```

