package com.softwareupdateutilityapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class WifiModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var receiver: BroadcastReceiver? = null

    override fun getName(): String {
        return "WifiModule"
    }

    private fun checkIsWifiConnected(): Boolean {
        return try {
            val connManager = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val wifiManager = reactContext.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

            if (!wifiManager.isWifiEnabled) {
                return false
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val activeNet = connManager.activeNetwork
                if (activeNet != null) {
                    val caps = connManager.getNetworkCapabilities(activeNet)
                    if (caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                        return true
                    }
                }
                
                // Fallback check all active networks
                val networks = connManager.allNetworks
                networks.any { net ->
                    val caps = connManager.getNetworkCapabilities(net)
                    caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                }
            } else {
                @Suppress("DEPRECATION")
                val networkInfo = connManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI)
                networkInfo != null && networkInfo.isConnected
            }
        } catch (e: Exception) {
            false
        }
    }

    @ReactMethod
    fun isWifiConnected(promise: Promise) {
        try {
            val connected = checkIsWifiConnected()
            promise.resolve(connected)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            if (receiver == null) {
                receiver = object : BroadcastReceiver() {
                    override fun onReceive(context: Context?, intent: Intent?) {
                        val isConnected = checkIsWifiConnected()
                        sendWifiStatusEvent(isConnected)
                    }
                }
                val filter = IntentFilter().apply {
                    addAction(WifiManager.WIFI_STATE_CHANGED_ACTION)
                    addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION)
                    @Suppress("DEPRECATION")
                    addAction(ConnectivityManager.CONNECTIVITY_ACTION)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    reactContext.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
                } else {
                    reactContext.registerReceiver(receiver, filter)
                }
            }
            sendWifiStatusEvent(checkIsWifiConnected())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
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
            promise.resolve(false)
        }
    }

    private fun sendWifiStatusEvent(connected: Boolean) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                val params = WritableNativeMap()
                params.putBoolean("connected", connected)
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("WifiStatusEvent", params)
            }
        } catch (e: Exception) {}
    }
}
