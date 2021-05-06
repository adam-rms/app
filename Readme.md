# AdamRMS App

The AdamRMS app is a companion to the [AdamRMS Rental Management System](https://github.com/bstudios/adam-rms)

# Debugging locally

Install Cordova on your machine, then run `cordova serve`

# Android

## Builds

`cordova prepare android && cordova build android && cordova run android --debug`

Open to debug [chrome://inspect/#devices](chrome://inspect/#devices)

## Releases 

Copy `build.json.example` to `build.json` and set all 4 passwords for the certificate under `AdamRMS Android App Certificate Keystore`

Run `cordova prepare android && cordova build android --release`

Upload `platforms/android/app/build/outputs/apk/release/app-release.apk`

# iOS Builds

https://stackoverflow.com/a/19490759 

After making changes `cordova prepare ios` then rebuild in Xcode