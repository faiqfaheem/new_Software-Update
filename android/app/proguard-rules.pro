# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.

# Add any project specific keep options here:

# Keep Hermes and its components
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.reactexecutor.** { *; }

# Keep SoLoader
-keep class com.facebook.soloader.** { *; }

# Keep React Native core
-keep class com.facebook.react.turbomodule.core.** { *; }
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Keep OkHttp (used by RN)
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep native methods for JNI
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep our specific App classes just in case
-keep public class com.softwareupdateutilityapp.** { *; }
