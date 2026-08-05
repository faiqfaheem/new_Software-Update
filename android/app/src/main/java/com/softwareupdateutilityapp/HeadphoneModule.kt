package com.softwareupdateutilityapp

import android.bluetooth.BluetoothA2dp
import android.bluetooth.BluetoothHeadset
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
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
    fun playAudioChannel(channel: String, promise: Promise) {
        try {
            Thread {
                val sampleRate = 44100
                val durationSeconds = 2.0
                val numSamples = (durationSeconds * sampleRate).toInt()
                val sample = DoubleArray(numSamples)
                val generatedSnd = ByteArray(2 * numSamples)

                val freqOfTone = 523.25 // Pleasant C5 Musical Tone

                for (i in 0 until numSamples) {
                    val t = i.toDouble() / sampleRate
                    var envelope = 1.0
                    val attackTime = 0.1
                    val decayTime = 0.4
                    if (t < attackTime) {
                        envelope = t / attackTime
                    } else if (t > durationSeconds - decayTime) {
                        envelope = (durationSeconds - t) / decayTime
                    }

                    // Warm soft musical tone wave calculation
                    sample[i] = Math.sin(2.0 * Math.PI * freqOfTone * t) * envelope * 0.5
                }

                var idx = 0
                for (dVal in sample) {
                    val valShort = (dVal * 32767).toInt().toShort()
                    generatedSnd[idx++] = (valShort.toInt() and 0x00ff).toByte()
                    generatedSnd[idx++] = (valShort.toInt() and 0xff00 shr 8).toByte()
                }

                val minBufferSize = AudioTrack.getMinBufferSize(
                    sampleRate,
                    AudioFormat.CHANNEL_OUT_STEREO,
                    AudioFormat.ENCODING_PCM_16BIT
                )

                @Suppress("DEPRECATION")
                val track = AudioTrack(
                    AudioManager.STREAM_MUSIC,
                    sampleRate,
                    AudioFormat.CHANNEL_OUT_STEREO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    minBufferSize.coerceAtLeast(generatedSnd.size),
                    AudioTrack.MODE_STATIC
                )

                track.write(generatedSnd, 0, generatedSnd.size)

                if (channel.equals("LEFT", ignoreCase = true)) {
                    @Suppress("DEPRECATION")
                    track.setStereoVolume(1.0f, 0.0f) // 100% Left Channel Only
                } else if (channel.equals("RIGHT", ignoreCase = true)) {
                    @Suppress("DEPRECATION")
                    track.setStereoVolume(0.0f, 1.0f) // 100% Right Channel Only
                } else {
                    @Suppress("DEPRECATION")
                    track.setStereoVolume(1.0f, 1.0f)
                }

                track.play()
            }.start()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_ERROR", e.message, e)
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
