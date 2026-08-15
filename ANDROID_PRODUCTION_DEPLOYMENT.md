# Ionic Capacitor Android App - Production Deployment Guide

**Step-by-step instructions for deploying MedStore Ionic Capacitor app to Google Play Store**

⚠️ **THIS GUIDE IS FOR IONIC CAPACITOR APPS ONLY**

Your app type: **Ionic Capacitor** (Angular + TypeScript web app wrapped in Android)
Package Name: **com.medstore.app**

---

## Table of Contents

1. [Step 1: Prepare Your Project](#step-1-prepare-your-project)
2. [Step 2: Create Keystore (Sign Your App)](#step-2-create-keystore-sign-your-app)
3. [Step 3: Build Ionic Web App](#step-3-build-ionic-web-app)
4. [Step 4: Sync to Android](#step-4-sync-to-android)
5. [Step 5: Build Release Bundle](#step-5-build-release-bundle)
6. [Step 6: Test on Real Device](#step-6-test-on-real-device)
7. [Step 7: Submit to Google Play Store](#step-7-submit-to-google-play-store)
8. [Step 8: Monitor After Launch](#step-8-monitor-after-launch)

---

## Step 1: Prepare Your Project

### What This Step Does:
Updates version numbers in 3 files so Google Play Store recognizes your app as a new release.

### 1.1: Update `package.json`

**File:** `frontend/package.json`

```json
{
  "name": "medstore",
  "version": "1.0.0",
  "description": "Medical Store Management App"
}
```

**Explanation:** This is your Node.js package version. Update this for each release.

---

### 1.2: Update `capacitor.config.ts`

**File:** `frontend/capacitor.config.ts`

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medstore.app',        // Package name (don't change after first release)
  appName: 'MedStore',               // App name shown on device
  webDir: 'www'                      // Built web folder
};

export default config;
```

**Explanation:** 
- `appId` is your unique package name (must be globally unique on Play Store)
- `appName` is what users see on their home screen
- `webDir` is where Angular builds your app (always `www`)

---

### 1.3: Update `android/app/build.gradle`

**File:** `frontend/android/app/build.gradle`

Find this section and update:

```gradle
android {
    namespace = "com.medstore.app"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.medstore.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1              // Start: 1, Next: 2, Next: 3, etc
        versionName "1.0.0"        // 1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
}
```

**Explanation:**
- `applicationId`: Must match `appId` from capacitor.config.ts
- `versionCode`: MUST increase by 1 for each Play Store release (1, 2, 3...)
- `versionName`: User-facing version (use semantic versioning)

**⚠️ IMPORTANT:**
- Never decrease versionCode
- Never reuse same versionCode
- Each release must have higher versionCode than previous

---

## Step 2: Create Keystore (Sign Your App)

### What This Step Does:
Creates a digital certificate that proves the app is from you. Required only ONCE per app.

### ⚠️ DO THIS ONLY ONCE!
After this, save the keystore file and password in a safe place. You'll need them for every future update.

### 2.1: Create Keystore File

**Command:**

```bash
keytool -genkey -v -keystore medstore-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias medstore-key
```

**Explanation:**
- `keystore medstore-release.keystore` - Output file name
- `keyalg RSA -keysize 2048` - Encryption type (standard for Android)
- `validity 10000` - Valid for ~27 years
- `alias medstore-key` - Key name inside keystore

### 2.2: Answer Prompts

When prompted, enter:

```
Enter keystore password: [TYPE 8+ CHARACTERS] → SAVE THIS!
Re-enter new password: [REPEAT SAME PASSWORD]

What is your first and last name?
  → Your name or company name

What is the name of your organizational unit?
  → Your department (e.g., Engineering)

What is the name of your organization?
  → Company name

What is the name of your City or Locality?
  → Your city

What is the name of your State or Province?
  → Your state

What is the two-letter country code for this unit?
  → Country code (e.g., US, UK, IN)

Is CN=Your Name, OU=Your Unit, O=Your Company, L=Your City, ST=Your State, C=US correct?
  [no]: yes
```

**Explanation:** Google uses this info to verify your app is authentic.

**📝 SAVE THIS INFORMATION:**
```
Keystore password: ________________
Key password: ________________
```

### 2.3: Move Keystore to Project

**Commands:**

```bash
# Copy keystore to Android directory
cp medstore-release.keystore frontend/android/

# Verify it exists
ls -la frontend/android/medstore-release.keystore
```

**Explanation:** Gradle needs the keystore file to sign your app.

### 2.4: Create Keystore Configuration File

**Create file:** `frontend/android/keystore.properties`

```properties
storeFile=medstore-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=medstore-key
keyPassword=YOUR_KEY_PASSWORD
```

Replace:
- `YOUR_STORE_PASSWORD` with the password from Step 2.2
- `YOUR_KEY_PASSWORD` same as store password (usually)

**Explanation:** Gradle reads this file to unlock and use your keystore.

### 2.5: Hide Keystore From Git

**Commands:**

```bash
# Add to gitignore
echo "keystore.properties" >> frontend/android/.gitignore
echo "*.keystore" >> frontend/android/.gitignore

# Verify
cat frontend/android/.gitignore | tail -5
```

**Explanation:** NEVER commit keystore files to GitHub. Anyone with the keystore file can upload fake app updates!

---

## Step 3: Build Ionic Web App

### What This Step Does:
Converts your Angular/TypeScript code into optimized JavaScript/HTML/CSS that runs on Android devices.

### 3.1: Install Dependencies (First Time Only)

**Command:**

```bash
cd frontend
npm install
```

**Explanation:** Downloads all required libraries (Angular, Ionic, RxJS, etc.)

### 3.2: Build for Production

**Command:**

```bash
npm run build -- --configuration production
```

**Output:** Creates `frontend/www/` folder

**What it does:**
- ✅ Minifies JavaScript (removes spaces, shortens variable names)
- ✅ Minifies CSS (removes unused styles)
- ✅ Tree shakes (removes unused code)
- ✅ Optimizes images
- ✅ Creates source maps for debugging

**How long:** 1-3 minutes

**Verification:**

```bash
ls -la www/ | head -20
```

Should show files like: `index.html`, `main.*.js`, `styles.*.css`

---

## Step 4: Sync to Android

### What This Step Does:
Takes your built web app and integrates it into the Android native code. This step updates Android files based on your Capacitor config.

### 4.1: Run Sync Command

**Command:**

```bash
npx cap sync android
```

**What it does:**
- ✅ Copies `www/` files to `android/app/src/main/assets/public`
- ✅ Updates `AndroidManifest.xml` with your app's package name
- ✅ Generates native Android code
- ✅ Updates app icons and config

**How long:** 20-30 seconds

**Success indicator:**
```
✔ Updating android files in (path)/frontend/android
```

### 4.2: Verify Sync Worked

**Command:**

```bash
ls -la frontend/android/app/src/main/assets/public/
```

Should show many files (index.html, JavaScript bundles, etc.)

**If empty:** Sync failed, troubleshoot Step 3

---

## Step 5: Build Release Bundle

### What This Step Does:
Packages your Android app into a file that Google Play Store uses to generate APKs for different devices (phones, tablets, different screen sizes).

### ⚠️ Why AAB instead of APK?
- Google Play Store REQUIRES AAB for new apps
- AAB is smaller and optimized per device
- Old APK method still works for updates

### 5.1: Clean Previous Builds

**Commands:**

```bash
cd frontend/android
./gradlew clean
```

**Explanation:** Removes old build files to ensure fresh build. Takes 10-20 seconds.

### 5.2: Build Release Bundle

**Command:**

```bash
./gradlew bundleRelease
```

**What it does:**
- ✅ Compiles Java code
- ✅ Bundles resources
- ✅ Signs app with your keystore
- ✅ Optimizes for production
- ✅ Generates AAB file

**How long:** 2-5 minutes

**Output location:**
```
frontend/android/app/build/outputs/bundle/release/app-release.aab
```

### 5.3: Verify Bundle Created

**Command:**

```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

Should show file size (typically 20-50 MB)

**Example output:**
```
-rw-r--r-- 1 user group 35M May 6 10:30 app-release.aab
```

If file doesn't exist: Build failed, check error messages above

---

## Step 6: Test on Real Device

### What This Step Does:
Installs the app on an Android device to verify it works before uploading to Play Store.

### 6.1: Build Debug APK (For Testing)

**Commands:**

```bash
cd frontend

# Build web app
npm run build

# Sync to Android
npx cap sync android

# Build debug APK
cd android
./gradlew assembleDebug
cd ..
```

**Explanation:** Debug version is faster to build and doesn't require signing.

### 6.2: Connect Android Device

**Commands:**

```bash
# Connect device via USB
adb devices
```

Should show:
```
List of attached devices
emulator-5554    device
```

If device not showing:
- Enable "Developer Mode" on phone
- Enable "USB Debugging" in Developer Options
- Check USB cable connection

### 6.3: Install App

**Command:**

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Output:** Should say "Success"

### 6.4: Run App

**Command:**

```bash
adb shell am start -n com.medstore.app/.MainActivity
```

App should launch on your phone.

### 6.5: Test Key Features

**Checklist:**

```
Web Features:
[ ] App launches without crashing
[ ] All pages load
[ ] Forms work
[ ] API calls work
[ ] Loading indicators show
[ ] Images display

Android Features:
[ ] Permissions requested (if used)
[ ] App works in portrait mode
[ ] App works in landscape mode (rotate phone)
[ ] Back button works
[ ] Can logout

Performance:
[ ] App doesn't freeze
[ ] No memory errors in logs
[ ] No crash messages
```

### 6.6: View Logs

**Command:**

```bash
adb logcat | grep -E "Capacitor|medstore|Error|Exception"
```

Look for any red error messages. If found, fix them before uploading.

### 6.7: Uninstall Debug App

**Command:**

```bash
adb uninstall com.medstore.app
```

**Explanation:** Clear space before testing release version.

---

## Step 7: Submit to Google Play Store

### What This Step Does:
Uploads your app to Google Play Store for billions of Android users to download.

### 7.1: Create Google Play Developer Account

**Steps:**

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create account" or login with Google
3. Accept terms and pay $25 (one-time fee)
4. Fill in your developer information:
   - Name
   - Email
   - Address
   - Phone

**Time:** 5-10 minutes

### 7.2: Create New App

**Steps:**

1. Click **"Create app"**
2. Enter:
   - App name: `MedStore`
   - Default language: `English`
   - App or game: Select `App`
3. Fill declaration: Check all boxes
4. Click **"Create app"**

### 7.3: Fill Store Listing

**Navigate to:** Left menu → "Store listing"

**Fill these fields:**

| Field | Value |
|-------|-------|
| App name | MedStore |
| Short description | Medical Store Management App |
| Full description | MedStore is a comprehensive medical store management application designed for retail pharmacies and medical shops. It provides inventory management, order processing, client management, payment tracking, and comprehensive analytics. |
| Category | Business or Medical |

### 7.4: Add App Icon

**Requirements:**
- Size: 512x512 pixels
- Format: PNG
- Square image (no rounded corners)

**Steps:**

1. Navigate to "App icon"
2. Upload your icon image

### 7.5: Add Screenshots

**Requirements:**
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Size: 1440x2560 pixels
- Format: PNG or JPG
- Show your app's key screens

**Steps:**

1. Navigate to "Screenshots"
2. Upload 4-5 screenshots showing:
   - Home screen
   - Main features
   - Order management
   - Analytics

### 7.6: Content Rating Questionnaire

**Steps:**

1. Navigate to "Content rating"
2. Click "Set content rating"
3. Select category: `Apps` (not games)
4. Answer questions about your app's content
5. Click "Save questionnaire"
6. Google assigns rating automatically

### 7.7: Set Up Testing (Internal)

**Steps:**

1. Go to **"Testing"** (left menu) → **"Internal testing"**
2. Click **"Create new release"**
3. Click **"Browse files"**
4. Select your AAB file: `app-release.aab`
5. Add release notes:
   ```
   v1.0.0 Initial Release
   
   Features:
   - Complete inventory management
   - Client database
   - Order management
   - Payment tracking
   - Analytics dashboard
   ```
6. Click **"Review release"**
7. Click **"Start testing"**

### 7.8: Add Internal Testers

**Steps:**

1. Still in Internal testing
2. Scroll to "Testers"
3. Click "Add testers"
4. Enter your email addresses (comma-separated)
5. Click "Add testers"

**Explanation:** You should test before production release.

### 7.9: Test Version First

**Steps:**

1. Open the testing link (sent to your email)
2. Install app from Play Store (testing version)
3. Test thoroughly
4. Wait 2-3 days
5. Fix any bugs

### 7.10: Move to Production

**After internal testing works:**

1. Go to **"Release"** (left menu) → **"Production"**
2. Click **"Create new release"**
3. A dialog appears with your internal version
4. Click **"Add release from internal testing"**
5. Change "versionCode" if needed
6. Add release notes:
   ```
   v1.0.0 - Initial Release
   - Medical store management system
   - Inventory & order management
   - Client and payment tracking
   - Analytics & reporting
   ```
7. Review everything
8. Click **"Review release"**
9. Accept terms and conditions
10. Click **"Start rollout to production"**

### 7.11: Choose Rollout Strategy

**Google asks:** "Roll out to 100% of users immediately?"

**Recommended for first release:**

1. Select **"Staged rollout"**
2. Start with **5%** of users
3. Monitor for 2 days
4. If no crashes, increase to **25%**
5. Monitor for 1 day
6. If still good, increase to **100%**

**Explanation:** Catches problems before all users get it.

**Your app is now LIVE! 🎉**

---

## Step 8: Monitor After Launch

### What This Step Does:
Watches for crashes, reviews, and user feedback after your app goes live.

### 8.1: Check Crash Reports

**Where to look:**

1. Google Play Console → **"Android vitals"**
2. Check **"Crashes"** section
3. Read error messages
4. Identify patterns

**If crashes exist:**
1. Fix the bug
2. Increment version (1.0.1)
3. Rebuild and upload new AAB
4. Monitor again

### 8.2: Read User Reviews

**Where to look:**

1. Google Play Console → **"Reviews"**
2. Read 1-star and 5-star reviews
3. Look for:
   - Common complaints
   - Feature requests
   - Bugs

**Action:**
- Reply to critical issues
- Thank positive reviewers
- Fix reported bugs

### 8.3: Monitor Analytics

**Where to look:**

1. Google Play Console → **"Statistics"**
2. Check:
   - Downloads
   - Daily active users
   - Crash rates
   - Uninstall rate

**Good metrics:**
- Low crash rate (< 1%)
- Low uninstall rate (< 30%)
- Growing downloads

### 8.4: Check Server Logs

**What to check:**

```bash
# SSH to your server
ssh your-server

# Check API logs for errors
tail -f /var/log/api/error.log | grep -E "medstore|5xx|Exception"
```

Look for:
- 500 errors
- Database issues
- Authentication failures

### 8.5: Plan Next Update

**Schedule:**
- Check weekly for first month
- Check monthly after that
- Plan updates 1-2 times per month

**For next release (1.0.1):**
1. Fix bugs from user reports
2. Add small features
3. Increment version code
4. Repeat Steps 1-7

---

## Complete Deployment Checklist

Before uploading to Play Store:

**Configuration:**
- [ ] Version updated in 3 files (package.json, capacitor.config.ts, build.gradle)
- [ ] Keystore created and saved securely
- [ ] keystore.properties created with correct passwords
- [ ] keystore.properties added to .gitignore

**Build:**
- [ ] Ionic web app built (npm run build)
- [ ] Sync completed (npx cap sync android)
- [ ] Release bundle built (./gradlew bundleRelease)
- [ ] AAB file exists and is 20-50 MB

**Testing:**
- [ ] App installed and tested on real device
- [ ] No crashes during testing
- [ ] All key features work
- [ ] Permissions working correctly
- [ ] API calls succeed

**Play Store:**
- [ ] Developer account created
- [ ] App information filled
- [ ] Icons and screenshots added
- [ ] Content rating completed
- [ ] AAB uploaded
- [ ] Release notes written
- [ ] Testing completed
- [ ] No critical errors in Android vitals

---

## Troubleshooting

### Problem: "Could not find gradle"

**Solution:**

```bash
cd frontend/android
./gradlew --version
```

### Problem: "Signing error - Invalid keystore format"

**Solution:**

```bash
keytool -list -v -keystore medstore-release.keystore
```

### Problem: "App won't install on device"

**Solution:**

```bash
adb uninstall com.medstore.app
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Problem: "AAB file not created"

**Solution:**

```bash
cd frontend/android
./gradlew clean
./gradlew bundleRelease
ls -la app/build/outputs/bundle/release/
```

### Problem: "White screen when app launches"

**Cause:** Web build didn't sync properly

**Solution:**

```bash
npm run build -- --configuration production
npx cap sync android
./gradlew bundleRelease
```

---

## Quick Reference

| Step | Command | Time |
|------|---------|------|
| 1. Build web | `npm run build -- --configuration production` | 2 min |
| 2. Sync Android | `npx cap sync android` | 30 sec |
| 3. Clean build | `cd android && ./gradlew clean` | 20 sec |
| 4. Build release | `./gradlew bundleRelease` | 3 min |
| 5. Upload | Upload AAB to Play Store | - |

**Total time:** ~6 minutes (first build)

---

**Last Updated:** May 6, 2026
**App Type:** Ionic Capacitor
**Package Name:** com.medstore.app
