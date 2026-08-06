/**
 * Pure JavaScript Google Play Store Web Scraper & Semantic Version Engine
 * Method 1: Direct JSON-LD Web Scraping & Play Store Version Extraction
 * Strict 3-Tier Filtering Implementation
 */

const PLAY_STORE_BASE_URL = 'https://play.google.com/store/apps/details?id=';
const DEFAULT_TIMEOUT_MS = 3000; // 3 seconds timeout limit

/**
 * Filter out user-facing vs background OS system apps for unified counting.
 * @param {Object} app - App metadata object from PackageManager
 * @returns {boolean} true if the app is a user-facing system app
 */
export const isUserFacingSystemApp = (app) => {
  if (!app || !app.isSystemApp) return true;

  const name = (app.appName || app.name || '').trim();
  const pkg = (app.packageName || '').trim().toLowerCase();

  if (!name || name.toLowerCase() === pkg) return false;

  const lowerName = name.toLowerCase();

  if (
    lowerName.startsWith('com.') ||
    lowerName.startsWith('org.') ||
    lowerName.startsWith('net.') ||
    lowerName.startsWith('android.') ||
    lowerName.startsWith('sys.') ||
    lowerName.startsWith('io.') ||
    lowerName.includes('.')
  ) {
    return false;
  }

  const OS_BACKGROUND_KEYWORDS = [
    'provider',
    'service',
    'services',
    'system',
    'framework',
    'installer',
    'spooler',
    'carrier',
    'companion',
    'dictionary',
    'overlay',
    'stub',
    'proxy',
    'captive',
    'fused',
    'storage',
    'telephony',
    'keychain',
    'feedback',
    'agent',
    'daemon',
    'engine',
    'component',
    'shell',
    'interface',
    'extension',
    'plugin',
    'helper',
    'wallpaper',
    'carousel',
    'analytics',
    'msa',
    'security core',
    'guard',
    'intent',
    'permission',
    'print',
    'bluetooth',
    'sim',
    'manager',
    'module',
    'handler',
  ];

  const PRIMARY_SYSTEM_NAMES = [
    'settings',
    'camera',
    'gallery',
    'photos',
    'phone',
    'dialer',
    'messages',
    'messaging',
    'contacts',
    'clock',
    'alarm',
    'calculator',
    'calendar',
    'files',
    'file manager',
    'my files',
    'chrome',
    'google',
    'youtube',
    'maps',
    'gmail',
    'drive',
    'play store',
    'notes',
    'keep',
    'voice recorder',
    'recorder',
    'compass',
    'weather',
    'radio',
    'fm radio',
    'music',
    'video',
    'browser',
    'screen recorder',
    'gboard',
    'duo',
    'meet',
  ];

  const isPrimaryName = PRIMARY_SYSTEM_NAMES.some((pName) => lowerName.includes(pName));
  if (isPrimaryName) return true;

  const isBackgroundKeyword = OS_BACKGROUND_KEYWORDS.some((kw) => lowerName.includes(kw));
  if (isBackgroundKeyword) return false;

  if (name.length > 30) return false;
  return true;
};

/**
 * Tier 1: Strict Native System App Filter
 * Filters out all System Apps & Pre-installed OS packages using native flags:
 * ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) === 0) AND ((appInfo.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) === 0)
 * Only returns true if the app is a user-installed, third-party app.
 * @param {Object} app - App metadata object from PackageManager
 * @returns {boolean} true if the app is a user-installed third-party app
 */
export const isUserThirdPartyApp = (app) => {
  if (!app) return false;
  return app.isSystemApp === false;
};

/**
 * Returns true if system app is excluded from third-party update scan list
 */
export const isSystemAppExcludedFromStore = (app) => {
  if (!app) return true;
  return app.isSystemApp === true;
};

/**
 * Compare two versions in descending order
 */
const compareVerDesc = (a, b) => {
  const pA = a.split('.').map(Number);
  const pB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pA.length, pB.length); i++) {
    const nA = pA[i] || 0;
    const nB = pB[i] || 0;
    if (nA !== nB) return nB - nA;
  }
  return 0;
};

/**
 * Select the exact Play Store release version matching installed app version major context
 */
const selectBestStoreVersion = (validAppVers, installedVersion) => {
  if (!validAppVers || validAppVers.length === 0) return null;
  if (!installedVersion) {
    validAppVers.sort(compareVerDesc);
    return validAppVers[0];
  }

  const instParts = installedVersion.split('.').map(Number);
  const instMajor = instParts[0];

  if (!isNaN(instMajor)) {
    // 1. First priority: Candidates matching installed major version (e.g. 2.x -> 2.x)
    const sameMajor = validAppVers.filter((v) => parseInt(v.split('.')[0], 10) === instMajor);
    if (sameMajor.length > 0) {
      sameMajor.sort(compareVerDesc);
      return sameMajor[0];
    }

    // 2. Second priority: Candidates with next major version (e.g. 1.x -> 2.x or 4.x -> 5.x)
    const nextMajor = validAppVers.filter((v) => parseInt(v.split('.')[0], 10) === instMajor + 1);
    if (nextMajor.length > 0) {
      nextMajor.sort(compareVerDesc);
      return nextMajor[0];
    }
  }

  // Fallback: highest valid version
  validAppVers.sort(compareVerDesc);
  return validAppVers[0];
};

/**
 * Tier 2: Parse JSON-LD script and Play Store HTML source to extract software version.
 * @param {string} html - Raw HTML source code from Play Store page
 * @param {string} [installedVersion=''] - Device installed version for format context
 * @returns {string|null} Scraped software version or null
 */
export const parseJsonLdSoftwareVersion = (html, installedVersion = '') => {
  if (!html || typeof html !== 'string') return null;

  try {
    // 1. Search for JSON-LD script tags (<script type="application/ld+json">)
    const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      const jsonContent = match[1] ? match[1].trim() : '';
      if (!jsonContent) continue;

      try {
        const parsed = JSON.parse(jsonContent);

        const extractFromNode = (node) => {
          if (!node || typeof node !== 'object') return null;
          if (
            (node['@type'] === 'SoftwareApplication' || node.softwareVersion) &&
            typeof node.softwareVersion === 'string' &&
            node.softwareVersion.trim() !== ''
          ) {
            return node.softwareVersion.trim();
          }
          return null;
        };

        let version = extractFromNode(parsed);
        if (version) return version;

        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            version = extractFromNode(item);
            if (version) return version;
          }
        }

        if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          for (const item of parsed['@graph']) {
            version = extractFromNode(item);
            if (version) return version;
          }
        }
      } catch (_jsonErr) {}
    }

    // 2. Direct JSON Key Fallback ("softwareVersion":"x.y.z" or "versionName":"x.y.z")
    const directRegex = /"(?:softwareVersion|versionName|version)"\s*:\s*"([^"]+)"/i;
    const directMatch = html.match(directRegex);
    if (directMatch && directMatch[1] && directMatch[1].trim() !== '') {
      return directMatch[1].trim();
    }

    // 3. Play Store Embedded Version Pattern Extraction
    const verMatches = html.match(/\b\d{1,4}\.\d{1,4}\.\d{1,5}(?:\.\d{1,8}){0,4}\b/g);
    if (verMatches && verMatches.length > 0) {
      const cleanVers = [...new Set(verMatches.map((v) => v.trim()))];
      const installedIsYear = installedVersion.startsWith('202') || installedVersion.startsWith('201');

      const validAppVers = cleanVers.filter((v) => {
        if (
          v.startsWith('124.') ||
          v.startsWith('537.') ||
          v.startsWith('10.0') ||
          v.startsWith('1.0.0') ||
          v.startsWith('0.') ||
          v.startsWith('2000.')
        ) {
          return false;
        }
        if (
          v.startsWith('24.04.') ||
          v.startsWith('24.05.') ||
          v.startsWith('24.06.') ||
          v.startsWith('24.07.')
        ) {
          return false;
        }
        // Exclude footer dates like 2024.x, 2025.x, 2026.x UNLESS installed version is a year version
        if (
          !installedIsYear &&
          (v.startsWith('2024.') ||
            v.startsWith('2025.') ||
            v.startsWith('2026.') ||
            v.startsWith('2027.'))
        ) {
          return false;
        }
        return v.includes('.');
      });

      return selectBestStoreVersion(validAppVers, installedVersion);
    }
  } catch (_e) {}

  return null;
};

/**
 * Asynchronously fetch Google Play Store page HTML and extract software version.
 * If 404 or missing tag occurs, returns null.
 * @param {string} packageName - e.g. "com.whatsapp"
 * @param {number} timeoutMs - Timeout limit in milliseconds (default 3000ms)
 * @param {string} [installedVersion=''] - Optional installed version for format context
 * @returns {Promise<string|null>} Software version string or null
 */
export const fetchStoreVersion = async (
  packageName,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  installedVersion = ''
) => {
  if (!packageName) return null;

  const url = `${PLAY_STORE_BASE_URL}${encodeURIComponent(packageName)}&hl=en`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      // 404 Not Found or Network Error: Immediately return null
      return null;
    }

    const html = await response.text();
    const storeVersion = parseJsonLdSoftwareVersion(html, installedVersion);

    if (storeVersion && storeVersion.toLowerCase() !== 'varies with device') {
      return storeVersion;
    }

    return null;
  } catch (_error) {
    if (timeoutId) clearTimeout(timeoutId);
    // Timeout or network failure: gracefully return null
    return null;
  }
};

/**
 * Tier 3: Semantic Version Comparison (SemVer Engine)
 * Compares two version strings numerically segment by segment.
 * @param {string} storeVersion - Version scraped from Google Play Store
 * @param {string} installedVersion - Installed version on device
 * @returns {number} 1 if storeVersion > installedVersion, -1 if lower, 0 if equal
 */
export const compareVersions = (storeVersion, installedVersion) => {
  if (!storeVersion || !installedVersion) return 0;

  const v1 = String(storeVersion).trim();
  const v2 = String(installedVersion).trim();

  if (v1 === v2) return 0;

  // Extract numerical parts (e.g. "2.24.15.78" -> [2, 24, 15, 78])
  const getParts = (str) => {
    const matched = str.match(/\d+/g);
    return matched ? matched.map((n) => parseInt(n, 10)) : [];
  };

  const parts1 = getParts(v1);
  const parts2 = getParts(v2);

  if (parts1.length === 0 || parts2.length === 0) {
    // Fallback locale comparison
    return v1.localeCompare(v2, undefined, { numeric: true, sensitivity: 'base' });
  }

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] !== undefined ? parts1[i] : 0;
    const num2 = parts2[i] !== undefined ? parts2[i] : 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
};

/**
 * Helper condition: returns true ONLY if Store Version > Installed Device Version.
 * @param {string} storeVersion
 * @param {string} installedVersion
 * @returns {boolean}
 */
export const isStoreVersionHigher = (storeVersion, installedVersion) => {
  return compareVersions(storeVersion, installedVersion) > 0;
};

/**
 * Scan device installed apps and check for available updates using Strict 3-Tier Filtering.
 * @param {Array} rawApps - Installed apps from Android PackageManager
 * @param {Function} [onProgress] - Optional progress callback (scannedCount, totalCount)
 * @returns {Promise<Object>} Scan results containing availableUpdates, upToDateApps, counts
 */
export const scanInstalledAppsForUpdates = async (rawApps = [], onProgress = null) => {
  if (!Array.isArray(rawApps) || rawApps.length === 0) {
    return {
      availableUpdates: [],
      upToDateApps: [],
      installedCount: 0,
      systemCount: 0,
      totalScanned: 0,
    };
  }

  // Tier 1: Strict Native System App Filter
  // Filter out ALL System Apps & Pre-installed OS packages. ONLY pass third-party user apps.
  const userThirdPartyApps = rawApps.filter((a) => !a.isSystemApp);
  const systemApps = rawApps.filter(
    (a) => a.isSystemApp && (a.apkSize || 0) > 100 * 1024 && isUserFacingSystemApp(a)
  );

  const availableUpdates = [];
  const upToDateApps = [];
  let completed = 0;

  // Process in parallel batches of 15 requests
  const BATCH_SIZE = 15;
  for (let i = 0; i < userThirdPartyApps.length; i += BATCH_SIZE) {
    const batch = userThirdPartyApps.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (app) => {
        const packageName = app.packageName;
        const installedVer = app.versionName || String(app.versionCode || '1.0.0');

        // Tier 2: Play Store Verification & JSON-LD Scraping (Returns null on 404 / non-market)
        const storeVer = await fetchStoreVersion(packageName, 3000, installedVer);

        // Tier 3: Strict Semantic Version Check (ONLY push if Store Version > Installed Device Version)
        if (storeVer && isStoreVersionHigher(storeVer, installedVer)) {
          const appWithUpdate = {
            ...app,
            installedVersion: installedVer,
            storeVersion: storeVer,
            isUpdateAvailable: true,
            status: 'Available Update',
          };
          availableUpdates.push(appWithUpdate);
        } else {
          upToDateApps.push({
            ...app,
            installedVersion: installedVer,
            storeVersion: storeVer || installedVer,
            isUpdateAvailable: false,
            status: 'Up to Date',
          });
        }

        completed++;
        if (typeof onProgress === 'function') {
          onProgress(completed, userThirdPartyApps.length);
        }
      })
    );
  }

  return {
    availableUpdates,
    upToDateApps,
    installedCount: userThirdPartyApps.length,
    systemCount: systemApps.length,
    totalScanned: userThirdPartyApps.length,
  };
};

export default {
  fetchStoreVersion,
  parseJsonLdSoftwareVersion,
  compareVersions,
  isStoreVersionHigher,
  isUserThirdPartyApp,
  isSystemAppExcludedFromStore,
  isUserFacingSystemApp,
  scanInstalledAppsForUpdates,
};
