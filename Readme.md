# AdamRMS App

https://about.adam-rms.com

# Debugging

`phonegap serve`

# Android

## Builds

`phonegap prepare android && phonegap build android && phonegap run android --debug`

Open to debug [chrome://inspect/#devices](chrome://inspect/#devices)

## Releases 

Copy `build.json.example` to `build.json` and set all 4 passwords in from LastPass under `AdamRMS Android App Certificate Keystore`

Run `phonegap prepare android && phonegap build android --release`

Upload `platforms/android/app/build/outputs/apk/release/app-release.apk`

# iOS Builds

https://stackoverflow.com/a/19490759 

After making changes `phonegap prepare ios` then rebuild in Xcode