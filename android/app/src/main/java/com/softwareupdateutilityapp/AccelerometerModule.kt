package com.softwareupdateutilityapp

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class AccelerometerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {

    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var isListening = false

    override fun getName(): String {
        return "AccelerometerModule"
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            if (sensorManager == null) {
                sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
                accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            }
            if (accelerometer != null && !isListening) {
                sensorManager?.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI)
                isListening = true
                promise.resolve(true)
            } else {
                promise.resolve(isListening)
            }
        } catch (e: Exception) {
            promise.reject("ACCEL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            if (isListening) {
                sensorManager?.unregisterListener(this)
                isListening = false
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ACCEL_ERROR", e.message, e)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event != null && event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]

            val params = WritableNativeMap()
            params.putDouble("x", x.toDouble())
            params.putDouble("y", y.toDouble())
            params.putDouble("z", z.toDouble())

            if (reactContext.hasActiveReactInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("AccelerometerData", params)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
