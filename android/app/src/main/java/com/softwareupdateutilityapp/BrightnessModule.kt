package com.softwareupdateutilityapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.UiThreadUtil

class BrightnessModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BrightnessModule"
    }

    @ReactMethod
    fun setScreenBrightness(brightness: Double, promise: Promise) {
        try {
            UiThreadUtil.runOnUiThread {
                val activity = currentActivity
                if (activity != null) {
                    val window = activity.window
                    val layoutParams = window.attributes
                    val value = brightness.toFloat().coerceIn(0.01f, 1.0f)
                    layoutParams.screenBrightness = value
                    window.attributes = layoutParams
                    promise.resolve(true)
                } else {
                    promise.resolve(false)
                }
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun restoreSystemBrightness(promise: Promise) {
        try {
            UiThreadUtil.runOnUiThread {
                val activity = currentActivity
                if (activity != null) {
                    val window = activity.window
                    val layoutParams = window.attributes
                    layoutParams.screenBrightness = -1.0f // System default
                    window.attributes = layoutParams
                    promise.resolve(true)
                } else {
                    promise.resolve(false)
                }
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
