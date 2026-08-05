package com.softwareupdateutilityapp

import android.content.Context
import android.hardware.camera2.CameraManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class FlashlightModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FlashlightModule"
    }

    @ReactMethod
    fun setTorchMode(enabled: Boolean, promise: Promise) {
        try {
            val cameraManager = reactContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = cameraManager.cameraIdList[0]
            cameraManager.setTorchMode(cameraId, enabled)
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("TORCH_ERROR", e.message, e)
        }
    }
}
