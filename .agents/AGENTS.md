# Workspace Rules

- Whenever native code changes (e.g. `AndroidManifest.xml`, `.kt`, `.java`, Gradle configuration, or new native dependencies) require an app rebuild, automatically execute `npx react-native run-android` without waiting for explicit user confirmation.
