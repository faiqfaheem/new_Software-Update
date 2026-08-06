/**
 * Pure JavaScript Google Play Store Web Scraper & Semantic Version Engine
 * Method 1: Direct JSON-LD Web Scraping & Play Store Version Extraction
 */

const PLAY_STORE_BASE_URL = 'https://play.google.com/store/apps/details?id=';
const DEFAULT_TIMEOUT_MS = 3500; // Fast 3.5 seconds timeout limit

/**
 * Filter out internal kernel packages that lack a public Google Play Store listing.
 * @param {Object} app - App metadata object from PackageManager
 * @returns {boolean} true if the app should be excluded from Play Store scanning
 */
export const isSystemAppExcludedFromStore = (app) => {
  if (!app || !app.packageName) return true;

  const pkg = app.packageName.toLowerCase().trim();

  // Exclude core Android OS kernel & low-level framework packages that never have Play Store pages
  if (
    pkg === 'android' ||
    pkg.startsWith('com.android.internal') ||
    pkg.startsWith('com.android.providers.telephony') ||
    pkg.startsWith('com.android.providers.contacts') ||
    pkg.startsWith('com.android.providers.media')
  ) {
    return true;
  }

  // Include ALL other installed packages (User Apps + System Apps like Chrome, YouTube, WebView, Samsung/Xiaomi Apps, etc.)
  return false;
};

/**
 * Parse JSON-LD script and Play Store HTML source to extract software version.
 * @param {string} html - Raw HTML source code from Play Store page
 * @returns {string|null} Scraped software version or null
 */
export const parseJsonLdSoftwareVersion = (html) => {
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
    // Filter out Google web asset tracking versions: 24.04.47.09, 24.05.x, 124.0.0.0, 537.36, 10.0, 1.0.0, 2000.
    const verMatches = html.match(/\b\d{1,4}\.\d{1,4}\.\d{1,5}(?:\.\d{1,8}){0,4}\b/g);
    if (verMatches && verMatches.length > 0) {
      const cleanVers = verMatches.map((v) => v.trim());
      const validAppVers = cleanVers.filter(
        (v) =>
          !v.startsWith('124.') &&
          !v.startsWith('537.') &&
          !v.startsWith('10.0') &&
          !v.startsWith('1.0.0') &&
          !v.startsWith('0.') &&
          !v.startsWith('2000.') &&
          !v.startsWith('24.04.') && // Exclude Google internal Live Ops asset version
          !v.startsWith('24.05.') &&
          !v.startsWith('24.06.') &&
          v.includes('.')
      );

      if (validAppVers.length > 0) {
        validAppVers.sort((a, b) => {
          const pA = a.split('.').map(Number);
          const pB = b.split('.').map(Number);
          for (let i = 0; i < Math.max(pA.length, pB.length); i++) {
            const nA = pA[i] || 0;
            const nB = pB[i] || 0;
            if (nA !== nB) return nB - nA;
          }
          return 0;
        });

        return validAppVers[0];
      }
    }
  } catch (_e) {}

  return null;
};

/**
 * Asynchronously fetch Google Play Store page HTML and extract software version.
 * @param {string} packageName - e.g. "com.whatsapp"
 * @param {number} timeoutMs - Timeout limit in milliseconds (default 3500ms)
 * @returns {Promise<string|null>} Software version string or null
 */
export const fetchStoreVersion = async (packageName, timeoutMs = DEFAULT_TIMEOUT_MS) => {
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
      // 404 Not Found or Network Error
      return null;
    }

    const html = await response.text();
    const storeVersion = parseJsonLdSoftwareVersion(html);

    if (storeVersion && storeVersion.toLowerCase() !== 'varies with device') {
      return storeVersion;
    }

    return null;
  } catch (_error) {
    if (timeoutId) clearTimeout(timeoutId);
    // Timeout or network failure: gracefully return null without throwing
    return null;
  }
};

/**
 * Semantic Version Comparison (SemVer Engine)
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
 * Scan device installed apps and check for available updates via JSON-LD scraping.
 * Ultra-fast parallel worker pool execution across ALL installed packages.
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

  // 1. Separate installed user apps and system apps
  const userApps = rawApps.filter((a) => !a.isSystemApp);
  const systemApps = rawApps.filter((a) => a.isSystemApp);

  // 2. Include ALL installed packages except core OS kernel
  const validCandidateApps = rawApps.filter((app) => !isSystemAppExcludedFromStore(app));

  const availableUpdates = [];
  const upToDateApps = [];
  let completed = 0;

  // Process in high-concurrency parallel batches of 20 requests
  const BATCH_SIZE = 20;
  for (let i = 0; i < validCandidateApps.length; i += BATCH_SIZE) {
    const batch = validCandidateApps.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (app) => {
        const packageName = app.packageName;
        const installedVer = app.versionName || String(app.versionCode || '1.0.0');

        const storeVer = await fetchStoreVersion(packageName, 3500);

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
          onProgress(completed, validCandidateApps.length);
        }
      })
    );
  }

  return {
    availableUpdates,
    upToDateApps,
    installedCount: userApps.length,
    systemCount: systemApps.length,
    totalScanned: validCandidateApps.length,
  };
};

export default {
  fetchStoreVersion,
  parseJsonLdSoftwareVersion,
  compareVersions,
  isStoreVersionHigher,
  isSystemAppExcludedFromStore,
  scanInstalledAppsForUpdates,
};
