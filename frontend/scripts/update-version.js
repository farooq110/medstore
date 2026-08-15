#!/usr/bin/env node

/**
 * Frontend Version Update Script
 * 
 * Updates version across frontend files and optionally runs backend version update
 * 
 * Usage:
 *   npm run update:version 1.0.4                 # Update frontend only
 *   npm run update:version 1.0.4 dev             # Update frontend + dev backend
 *   npm run update:version 1.0.4 prod            # Update frontend + prod backend
 *   npm run update:version dev                   # Update dev backend only
 *   npm run update:version prod                  # Update prod backend only
 * 
 * What it does:
 *   - Updates package.json version
 *   - Updates src/environments/version.ts APP_VERSION
 *   - Increments android/app/build.gradle versionCode by 1
 *   - Updates android/app/build.gradle versionName
 *   - Optionally runs backend update-version script (if server param: "prod" or "dev")
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get parameters
const firstParam = process.argv[2];
const secondParam = process.argv[3];

// Helper to check if string is a valid version
function isVersion(str) {
  return /^\d+\.\d+\.\d+/.test(str);
}

// Helper to check if string is a valid server param
function isServerParam(str) {
  return ['prod', 'dev'].includes(str);
}

// Determine mode
let version = null;
let serverParam = null;
let serverOnlyMode = false;

if (!firstParam) {
  console.error('❌ Error: Version or server argument is required');
  console.error('\nUsage:');
  console.error('  npm run update:version 1.0.4                 # Update frontend only');
  console.error('  npm run update:version 1.0.4 dev             # Update frontend + dev backend');
  console.error('  npm run update:version 1.0.4 prod            # Update frontend + prod backend');
  console.error('  npm run update:version dev                   # Update dev backend only');
  console.error('  npm run update:version prod                  # Update prod backend only');
  process.exit(1);
}

// Check if first param is a version or server param
if (isVersion(firstParam)) {
  version = firstParam;
  if (secondParam) {
    if (isServerParam(secondParam)) {
      serverParam = secondParam;
    } else {
      console.error(`❌ Error: Invalid server param "${secondParam}". Must be "prod" or "dev"`);
      process.exit(1);
    }
  }
} else if (isServerParam(firstParam)) {
  // Server-only mode
  serverOnlyMode = true;
  serverParam = firstParam;
  if (secondParam) {
    console.error('❌ Error: Too many parameters in server-only mode');
    process.exit(1);
  }
} else {
  console.error(`❌ Error: Invalid first parameter "${firstParam}". Must be a version (e.g., 1.0.4) or "prod"/"dev"`);
  process.exit(1);
}

// Execute server-only mode
if (serverOnlyMode) {
  console.log(`\n🔄 Updating backend version...`);
  const env = serverParam === 'prod' ? 'production' : 'development';
  try {
    const versionFromPackage = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
    ).version;

    console.log(`📍 Environment: ${serverParam}`);
    console.log(`📱 Version: ${versionFromPackage}`);

    const command = `cd ${path.join(__dirname, '../../backend')} && NODE_ENV=${env} npm run update:version ${versionFromPackage}`;
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ Backend version updated successfully\n`);
  } catch (error) {
    console.error(`❌ Error updating backend version:`, error.message);
    process.exit(1);
  }
  process.exit(0);
}

// Execute frontend update (and optionally backend)
console.log(`\n🔄 Updating app version to ${version}...`);

try {
  // 1. Update package.json
  console.log('\n📝 Updating frontend files...');
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldPackageVersion = packageJson.version;
  packageJson.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ package.json: ${oldPackageVersion} → ${version}`);

  // 2. Update version.ts
  const versionTsPath = path.join(__dirname, '../src/environments/version.ts');
  const versionTsContent = `/**
 * App Version
 * Exported at build time from package.json
 * Current version: ${version}
 */

export const APP_VERSION = '${version}';
`;
  fs.writeFileSync(versionTsPath, versionTsContent);
  console.log(`✅ version.ts: APP_VERSION = '${version}'`);

  // 3. Update build.gradle (increment versionCode and update versionName)
  const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

  // Extract current versionCode and increment it
  const versionCodeMatch = buildGradleContent.match(/versionCode\s+(\d+)/);
  if (!versionCodeMatch) {
    throw new Error('Could not find versionCode in build.gradle');
  }
  const currentVersionCode = parseInt(versionCodeMatch[1], 10);
  const newVersionCode = currentVersionCode + 1;

  // Extract current versionName for comparison
  const versionNameMatch = buildGradleContent.match(/versionName\s+"([^"]*)"/);
  const oldVersionName = versionNameMatch ? versionNameMatch[1] : 'unknown';

  // Replace versionCode and versionName
  buildGradleContent = buildGradleContent
    .replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`)
    .replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);

  fs.writeFileSync(buildGradlePath, buildGradleContent);
  console.log(`✅ build.gradle:`);
  console.log(`   • versionCode: ${currentVersionCode} → ${newVersionCode}`);
  console.log(`   • versionName: ${oldVersionName} → ${version}`);

  // 4. Update backend if server param provided
  if (serverParam) {
    console.log(`\n🔄 Updating backend version...`);
    const env = serverParam === 'prod' ? 'production' : 'development';
    console.log(`📍 Environment: ${serverParam}`);

    const command = `cd ${path.join(__dirname, '../../backend')} && NODE_ENV=${env} npm run update:version ${version}`;
    execSync(command, { stdio: 'inherit' });
  }

  console.log(`\n✅ Version update completed successfully!\n`);
  process.exit(0);
} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
}
