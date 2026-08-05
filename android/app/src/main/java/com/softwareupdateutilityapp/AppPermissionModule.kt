package com.softwareupdateutilityapp

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.io.ByteArrayOutputStream
import java.io.File

class AppPermissionModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppPermissionModule"
    }

    private fun getAppIconBase64(pm: PackageManager, appInfo: ApplicationInfo?): String? {
        if (appInfo == null) return null
        return try {
            val drawable: Drawable = appInfo.loadIcon(pm) ?: return null
            val bitmap = if (drawable is BitmapDrawable && drawable.bitmap != null) {
                drawable.bitmap
            } else {
                val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
                val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
                val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bmp)
                drawable.setBounds(0, 0, canvas.width, canvas.height)
                drawable.draw(canvas)
                bmp
            }

            val scaledBitmap = Bitmap.createScaledBitmap(bitmap, 96, 96, true)
            val outputStream = ByteArrayOutputStream()
            scaledBitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            val byteArray = outputStream.toByteArray()
            "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (_: Exception) {
            null
        }
    }

    @ReactMethod
    fun openAppSettings(packageName: String, promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INTENT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun uninstallApp(packageName: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_UNINSTALL_PACKAGE).apply {
                data = Uri.parse("package:$packageName")
                putExtra(Intent.EXTRA_RETURN_RESULT, true)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(Intent.ACTION_DELETE).apply {
                    data = Uri.parse("package:$packageName")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactApplicationContext.startActivity(fallbackIntent)
                promise.resolve(true)
            } catch (e2: Exception) {
                promise.reject("UNINSTALL_ERROR", e2.message, e2)
            }
        }
    }

    @ReactMethod
    fun openPlayStoreUpdates(promise: Promise) {
        try {
            // Direct Play Store My Apps & Updates intent
            val intent = Intent("com.google.android.finsky.VIEW_MY_DOWNLOADS").apply {
                setPackage("com.android.vending")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (_: Exception) {
            try {
                val launchIntent = reactContext.packageManager.getLaunchIntentForPackage("com.android.vending")
                if (launchIntent != null) {
                    launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    launchIntent.putExtra("initial_tab", 1)
                    reactApplicationContext.startActivity(launchIntent)
                    promise.resolve(true)
                } else {
                    val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps")).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    reactApplicationContext.startActivity(webIntent)
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                promise.reject("PLAY_STORE_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getInstalledAppsPermissions(promise: Promise) {
        Thread {
            try {
                val pm = reactContext.packageManager
                val packages: List<PackageInfo> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    pm.getInstalledPackages(PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()))
                } else {
                    @Suppress("DEPRECATION")
                    pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
                }

                val appsList = WritableNativeArray()

                for (pkg in packages) {
                    val appMap = WritableNativeMap()
                    val appInfo = pkg.applicationInfo
                    val appName = appInfo?.loadLabel(pm)?.toString() ?: pkg.packageName
                    val packageName = pkg.packageName
                    val flags = appInfo?.flags ?: 0

                    val isSystemApp = ((flags and ApplicationInfo.FLAG_SYSTEM) != 0) || ((flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0)
                    val hasLaunchIntent = pm.getLaunchIntentForPackage(packageName) != null

                    val installer = try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                            pm.getInstallSourceInfo(packageName).installingPackageName
                        } else {
                            @Suppress("DEPRECATION")
                            pm.getInstallerPackageName(packageName)
                        }
                    } catch (_: Exception) {
                        null
                    }

                    val permissionsArray = WritableNativeArray()
                    pkg.requestedPermissions?.forEach { perm ->
                        permissionsArray.pushString(perm)
                    }

                    val versionName = pkg.versionName ?: "1.0.0"
                    val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        pkg.longVersionCode
                    } else {
                        @Suppress("DEPRECATION")
                        pkg.versionCode.toLong()
                    }

                    var apkSize: Long = 0
                    try {
                        if (appInfo?.sourceDir != null) {
                            val file = File(appInfo.sourceDir)
                            if (file.exists()) {
                                apkSize = file.length()
                            }
                        }
                    } catch (_: Exception) {}

                    val appIcon = getAppIconBase64(pm, appInfo)

                    appMap.putString("packageName", packageName)
                    appMap.putString("appName", appName)
                    appMap.putBoolean("isSystemApp", isSystemApp)
                    appMap.putBoolean("hasLaunchIntent", hasLaunchIntent)
                    appMap.putString("installer", installer ?: "")
                    appMap.putArray("requestedPermissions", permissionsArray)
                    appMap.putInt("permissionsCount", pkg.requestedPermissions?.size ?: 0)
                    appMap.putString("versionName", versionName)
                    appMap.putDouble("versionCode", versionCode.toDouble())
                    appMap.putDouble("apkSize", apkSize.toDouble())
                    if (appIcon != null) {
                        appMap.putString("appIcon", appIcon)
                    }

                    appsList.pushMap(appMap)
                }
                promise.resolve(appsList)
            } catch (e: Exception) {
                promise.reject("PM_ERROR", e.message, e)
            }
        }.start()
    }
}
