# MedStore Ionic Capacitor - Production Deployment Steps

**Quick reference for YOUR specific app deployment**

---

## TL;DR - The 10 Steps

```bash
# 1. Update version numbers
# Edit: package.json, capacitor.config.ts, android/app/build.gradle

# 2. Create keystore (ONE TIME)
keytool -genkey -v -keystore medstore-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias medstore-key

# 3. Move keystore
cp medstore-release.keystore frontend/android/

# 4. Create keystore.properties
echo "storeFile=medstore-release.keystore" > frontend/android/keystore.properties
echo "storePassword=YOUR_PASSWORD" >> frontend/android/keystore.properties
echo "keyAlias=medstore-key" >> frontend/android/keystore.properties
echo "keyPassword=YOUR_PASSWORD" >> frontend/android/keystore.properties

# 5. Add to .gitignore
echo "keystore.properties" >> frontend/android/.gitignore
echo "*.keystore" >> frontend/android/.gitignore

# 6. Build Ionic web app
cd frontend
npm run build -- --configuration production

# 7. Sync to Android
npx cap sync android

# 8. Clean gradle
cd android
./gradlew clean

# 9. Build release AAB
./gradlew bundleRelease

# 10. Upload to Play Store
# Go to play.google.com/console
# Upload: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Your Project Configuration

**Package Name:** `com.medstore.app`
**App Name:** `MedStore`
**Current Version:** 1.0.0
**Version Code:** 1

---

## Step-by-Step for YOUR App

### STEP 1: Update Version Numbers

#### Update `frontend/package.json`
```json
{
  "name": "medstore",
  "version": "1.0.0",
  "description": "Medical Store Management App"
}
```

#### Update `frontend/capacitor.config.ts`
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medstore.app',
  appName: 'MedStore',
  webDir: 'www'
};

export default config;
```

#### Update `frontend/android/app/build.gradle`
Find the `defaultConfig` section and update:
```gradle
defaultConfig {
    applicationId "com.medstore.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1              // First release = 1, next = 2, etc
    versionName "1.0.0"        // Semantic versioning
    testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
}
```

---

### STEP 2: Create Keystore (ONE TIME ONLY)

**Execute this command ONCE and save the password:**

```bash
keytool -genkey -v -keystore medstore-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias medstore-key
```

You'll be prompted for:
```
Enter keystore password: [TYPE YOUR PASSWORD - 8+ chars, save it!]
Re-enter new password: [REPEAT PASSWORD]

What is your first and last name?
  [? Enter your name or company name]

What is the name of your organizational unit?
  [? e.g., Engineering, Marketing]

What is the name of your organization?
  [? e.g., Your Company Inc]

What is the name of your City or Locality?
  [? e.g., San Francisco]

What is the name of your State or Province?
  [? e.g., California]

What is the two-letter country code for this unit?
  [? e.g., US]

Is CN=Your Name, OU=Your Unit, O=Your Company, L=Your City, ST=Your State, C=US correct?
  [no]:  yes
```

**⚠️ IMPORTANT:** Save the keystore password somewhere safe!

---

### STEP 3: Move Keystore to Project

```bash
# Copy keystore to Android directory
cp medstore-release.keystore frontend/android/

# Verify
ls -la frontend/android/medstore-release.keystore
```

---

### STEP 4: Create Keystore Properties File

Create `frontend/android/keystore.properties`:

```properties
storeFile=medstore-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=medstore-key
keyPassword=YOUR_KEY_PASSWORD
```

**Replace `YOUR_STORE_PASSWORD` and `YOUR_KEY_PASSWORD` with the password you entered in Step 2.**

---

### STEP 5: Add to .gitignore

```bash
echo "keystore.properties" >> frontend/android/.gitignore
echo "*.keystore" >> frontend/android/.gitignore
```

Verify:
```bash
cat frontend/android/.gitignore | tail -5
```

Should show:
```
keystore.properties
*.keystore
```

---

### STEP 6: Build Ionic Web App

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build -- --configuration production
```

This creates the `www/` folder with optimized web assets.

---

### STEP 7: Sync to Android

```bash
# Still in frontend directory
npx cap sync android
```

This:
- ✅ Copies web app from `www/` to `android/app/src/main/assets/public`
- ✅ Updates `AndroidManifest.xml`
- ✅ Generates Android configuration

---

### STEP 8: Build Gradle

```bash
cd frontend/android

# Clean previous builds
./gradlew clean
```

---

### STEP 9: Build Release Bundle

```bash
# Still in frontend/android
./gradlew bundleRelease
```

**Output location:**
```
frontend/android/app/build/outputs/bundle/release/app-release.aab
```

**Verify:**
```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

### STEP 10: Upload to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Enter:
   - App name: `MedStore`
   - Package name: `com.medstore.app`
   - Default language: `English`
   - App or Game: `App`
4. Click **"Create"**
5. Go to **"Release"** → **"Production"**
6. Click **"Create new release"**
7. Upload your AAB file:
   ```
   app-release.aab
   ```
8. Fill in release notes:
   ```
   v1.0.0 - Initial Release
   - Complete medical store management system
   - Inventory management
   - Client and order management
   - Payment tracking
   - Analytics and reporting
   ```
9. Click **"Review"** → **"Start rollout to Production"**

---

## Testing Before Upload

### Test on Real Device

```bash
cd frontend

# Build debug version
npm run build -- --configuration development
npx cap sync android
cd android
./gradlew assembleDebug
cd ..

# Connect device
adb devices

# Install
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Run
adb shell am start -n com.medstore.app/.MainActivity

# View logs
adb logcat | grep -E "Capacitor|medstore|Error"
```

### Verify Release Build

```bash
cd frontend/android

# Build release
./gradlew assembleRelease

# Uninstall debug
adb uninstall com.medstore.app

# Install release
adb install app/build/outputs/apk/release/app-release.apk

# Test all features...
```

---

## For Next Releases

**When updating to version 1.0.1:**

1. Update `package.json`: `"version": "1.0.1"`
2. Update `build.gradle`:
   ```gradle
   versionCode 2              // Increment by 1
   versionName "1.0.1"        // Update version
   ```
3. Make code changes
4. Build web app: `npm run build -- --configuration production`
5. Sync: `npx cap sync android`
6. Build release: `cd android && ./gradlew bundleRelease`
7. Upload new AAB to Play Store

**Note:** `versionCode` MUST increase (1, 2, 3, etc.)

---

## Important Notes

✅ **Always do this order:**
1. npm build
2. npx cap sync
3. gradlew build

❌ **Never skip steps or go out of order**

✅ **Always increment versionCode**

❌ **Never reuse same versionCode**

✅ **Keep keystore.properties secret**

❌ **Never commit keystore.properties to git**

✅ **Test on real device before uploading**

❌ **Don't build directly without syncing web changes**

---

## Files You Modified

- ✅ `frontend/capacitor.config.ts` - Package name and app name
- ✅ `frontend/android/app/build.gradle` - Version and package
- ✅ `frontend/android/keystore.properties` - Created for signing
- ✅ `frontend/android/.gitignore` - Added keystore files

---

## Ready to Deploy?

```bash
cd frontend

# Final checks
cat capacitor.config.ts | grep appId
cat package.json | grep version
cat android/app/build.gradle | grep versionName

# Deploy!
npm run build -- --configuration production
npx cap sync android
cd android
./gradlew bundleRelease
```

Then upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Store! 🚀

---

**Last Updated:** May 6, 2026
**For:** Ionic Capacitor Apps


Varify
1.verify the bundle is signed using jarsigner:

  `jarsigner -verify -verbose -certs /home/hyperdev-solutions/Desktop/projects/medstore/frontend/android/app/build/outputs/bundle/release/app-release.aab 2>&1 | head -30`

2.Let me verify the end of the jarsigner output to confirm it says "verified":

  `jarsigner -verify /home/hyperdev-solutions/Desktop/projects/medstore/frontend/android/app/build/outputs/bundle/release/app-release.aab 2>&1 | tail -5`

3. Let me check the overall status: for jar verified.

    `jarsigner -verify /home/hyperdev-solutions/Desktop/projects/medstore/frontend/android/app/build/outputs/bundle/release/app-release.aab 2>&1 | grep -i "jar verified\|warning"`