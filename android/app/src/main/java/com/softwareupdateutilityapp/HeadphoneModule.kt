package com.softwareupdateutilityapp

import android.bluetooth.BluetoothA2dp
import android.bluetooth.BluetoothHeadset
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class HeadphoneModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var receiver: BroadcastReceiver? = null

    override fun getName(): String {
        return "HeadphoneModule"
    }

    private fun checkIsHeadsetConnected(): Boolean {
        val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
            devices.any { device ->
                device.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                device.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                device.type == AudioDeviceInfo.TYPE_USB_HEADSET ||
                device.type == AudioDeviceInfo.TYPE_USB_DEVICE ||
                device.type == AudioDeviceInfo.TYPE_USB_ACCESSORY ||
                device.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                device.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
            }
        } else {
            @Suppress("DEPRECATION")
            audioManager.isWiredHeadsetOn || audioManager.isBluetoothA2dpOn
        }
    }

    @ReactMethod
    fun isHeadphoneConnected(promise: Promise) {
        try {
            val connected = checkIsHeadsetConnected()
            promise.resolve(connected)
        } catch (e: Exception) {
            promise.reject("HEADPHONE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            if (receiver == null) {
                receiver = object : BroadcastReceiver() {
                    override fun onReceive(context: Context?, intent: Intent?) {
                        val isConnected = checkIsHeadsetConnected()
                        sendHeadphoneStatusEvent(isConnected)
                    }
                }
                val filter = IntentFilter().apply {
                    addAction(Intent.ACTION_HEADSET_PLUG)
                    addAction(BluetoothA2dp.ACTION_CONNECTION_STATE_CHANGED)
                    addAction(BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED)
                    addAction(AudioManager.ACTION_AUDIO_BECOMING_NOISY)
                }
                reactContext.registerReceiver(receiver, filter)
            }
            sendHeadphoneStatusEvent(checkIsHeadsetConnected())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HEADPHONE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            receiver?.let {
                reactContext.unregisterReceiver(it)
                receiver = null
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HEADPHONE_ERROR", e.message, e)
        }
    }

    private fun sendHeadphoneStatusEvent(connected: Boolean) {
        if (reactContext.hasActiveReactInstance()) {
            val params = WritableNativeMap()
            params.putBoolean("connected", connected)
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("HeadphoneStatusEvent", params)
        }
    }
}
