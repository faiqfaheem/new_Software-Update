/**
 * Pure JavaScript Google Play Store Web Scraper & Semantic Version Engine
 * Method 1: Direct JSON-LD Web Scraping & Play Store Version Extraction
 * Strict 3-Tier Filtering Implementation
 */

const PLAY_STORE_BASE_URL = 'https://play.google.com/store/apps/details?id=';
const DEFAULT_TIMEOUT_MS = 3000;

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
    'provider', 'service', 'services', 'system', 'framework', 'installer',
    'spooler', 'carrier', 'companion', 'dictionary', 'overlay', 'stub',
    'proxy', 'captive', 'fused', 'storage', 'telephony', 'keychain',
    'feedback', 'agent', 'daemon', 'engine', 'component', 'shell',
    'interface', 'extension', 'plugin', 'helper', 'wallpaper', 'carousel',
    'analytics', 'msa', 'security core', 'guard', 'intent', 'permission',
    'print', 'bluetooth', 'sim', 'manager', 'module', 'handler',
  ];

  const PRIMARY_SYSTEM_NAMES = [
    'settings', 'camera', 'gallery', 'photos', 'phone', 'dialer',
    'messages', 'messaging', 'contacts', 'clock', 'alarm', 'calculator',
    'calendar', 'files', 'file manager', 'my files', 'chrome', 'google',
    'youtube', 'maps', 'gmail', 'drive', 'play store', 'notes', 'keep',
    'voice recorder', 'recorder', 'compass', 'weather', 'radio',
    'fm radio', 'music', 'video', 'browser', 'screen recorder', 'gboard',
    'duo', 'meet',
  ];

  const isPrimaryName = PRIMARY_SYSTEM_NAMES.some((pName) => lowerName.includes(pName));
  if (isPrimaryName) return true;

  const isBackgroundKeyword = OS_BACKGROUND_KEYWORDS.some((kw) => lowerName.includes(kw));
  if (isBackgroundKeyword) return false;

  if (name.length > 30) return false;
  return true;
};

export const parseJsonLdSoftwareVersion = (html, installedVersion = '') => {
  if (!html || typeof html !== 'string') return null;
  try {
    const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      const jsonContent = match[1] ? match[1].trim() : '';
      if (!jsonContent) continue;
      try {
        const parsed = JSON.parse(jsonContent);
        const extractFromNode = (node) => {
          if (!node || typeof node !== 'object') return null;
          if (node.softwareVersion && typeof node.softwareVersion === 'string') {
            const val = node.softwareVersion.trim();
            if (val.toLowerCase() !== 'varies with device' && val.toLowerCase() !== 'varies') {
              return val;
            }
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

    // Google Play Store removed 'softwareVersion' from JSON-LD on many apps.
    // Fallback: Safe AF_initDataCallback parsing (NO CSS/DOM SELECTORS)
    // EXCLUDING ds:4 and ds:3 to prevent matching fake versions inside user reviews
    const afBlockRegex = /AF_initDataCallback\s*\(\s*\{[^}]*key\s*:\s*'(?:ds:10|ds:5)'[\s\S]*?data\s*:\s*([\s\S]*?)\}\s*\)\s*;/gi;
    let afMatch;
    const candidates = [];
    const STATIC_BUNDLE_VERSIONS = ['1.43.35', '2.22.81', '3.06.56', '1.44.3', '1.25.81', '2.04.81', '24.04.47.09', '0.0.0', '124.0.0.0', '537.36'];

    while ((afMatch = afBlockRegex.exec(html)) !== null) {
      const blockText = afMatch[1];
      const verMatches = blockText.match(/\b\d{1,4}\.\d{1,4}(?:\.\d{1,5}){1,3}\b/g) || [];
      for (const v of verMatches) {
        if (!STATIC_BUNDLE_VERSIONS.includes(v) && !v.startsWith('0.') && !v.startsWith('1.0.0')) {
          candidates.push(v);
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => compareVersions(b, a)); // Sort descending
      
      if (installedVersion) {
        const instParts = installedVersion.split('.').map(Number);
        const instMajor = instParts[0];
        if (!isNaN(instMajor)) {
          const sameMajor = candidates.filter(c => parseInt(c.split('.')[0], 10) === instMajor);
          if (sameMajor.length > 0) return sameMajor[0];
          
          const nextMajor = candidates.filter(c => parseInt(c.split('.')[0], 10) === instMajor + 1);
          if (nextMajor.length > 0) return nextMajor[0];
        }
      }
      return candidates[0];
    }

  } catch (_e) {}
  return null;
};

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
      return null;
    }
    const html = await response.text();
    // Pass installedVersion to parsing if needed
    const storeVersion = parseJsonLdSoftwareVersion(html, installedVersion);
    return storeVersion;
  } catch (_error) {
    if (timeoutId) clearTimeout(timeoutId);
    return null;
  }
};

export const compareVersions = (storeVersion, installedVersion) => {
  if (!storeVersion || !installedVersion) return 0;
  const v1 = String(storeVersion).trim();
  const v2 = String(installedVersion).trim();
  if (v1 === v2) return 0;
  const parts1 = v1.match(/\d+/g)?.map(Number) || [];
  const parts2 = v2.match(/\d+/g)?.map(Number) || [];
  if (parts1.length === 0 || parts2.length === 0) return 0;
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] !== undefined ? parts1[i] : 0;
    const num2 = parts2[i] !== undefined ? parts2[i] : 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

export const isStoreVersionHigher = (storeVersion, installedVersion) => {
  return compareVersions(storeVersion, installedVersion) > 0;
};

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

  const userThirdPartyApps = rawApps.filter((a) => !a.isSystemApp && a.hasLaunchIntent);

  const availableUpdates = [];
  const upToDateApps = [];
  let completed = 0;

  const BATCH_SIZE = 15;
  for (let i = 0; i < userThirdPartyApps.length; i += BATCH_SIZE) {
    const batch = userThirdPartyApps.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (app) => {
        const packageName = app.packageName;
        const installedVer = app.versionName || String(app.versionCode || '1.0.0');

        const storeVer = await fetchStoreVersion(packageName, 3000, installedVer);

        if (storeVer && isStoreVersionHigher(storeVer, installedVer)) {
          availableUpdates.push({
            ...app,
            installedVersion: installedVer,
            storeVersion: storeVer,
            isUpdateAvailable: true,
            status: 'Available Update',
          });
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

  const trueInstalledCount = rawApps.filter((a) => !a.isSystemApp).length;
  
  const uiSystemCount = rawApps.filter(
    (a) => a.isSystemApp && (a.apkSize || 0) > 100 * 1024 && isUserFacingSystemApp(a)
  ).length;

  return {
    availableUpdates,
    upToDateApps,
    installedCount: trueInstalledCount,
    systemCount: uiSystemCount,
    totalScanned: userThirdPartyApps.length,
  };
};

export default {
  fetchStoreVersion,
  parseJsonLdSoftwareVersion,
  compareVersions,
  isStoreVersionHigher,
  isUserFacingSystemApp,
  scanInstalledAppsForUpdates,
};
