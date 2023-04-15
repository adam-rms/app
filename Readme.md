# AdamRMS App

The AdamRMS app is a companion to the [AdamRMS Rental Management System](https://github.com/bstudios/adam-rms)

# Debugging locally

Install Cordova on your machine, then run `cordova run browser`

# Android

## Known Issues

App fails if user has default browser set to firefox

## Setup

1. Install JDK version 8
1. Install Gradle
1. Install Android Studio (guide: https://cordova.apache.org/docs/en/11.x/guide/platforms/android/) targeting API 30
1. Run `export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_361.jdk/Contents/Home` (replace with your JDK path)


## Builds

Enable USB teathering on the device (might need to plug in and unplug a few times to get it to trust)

`cordova prepare android && cordova build android && cordova run android --debug --device`

Open to debug [chrome://inspect/#devices](chrome://inspect/#devices)

## Releases 

Copy `build.json.example` to `build.json` and set all 4 passwords for the certificate under `AdamRMS Android App Certificate Keystore`

Run `cordova prepare android && cordova build android --release`

Upload `platforms/android/app/build/outputs/apk/release/app-release.apk`

# iOS Builds

https://stackoverflow.com/a/19490759 

After making changes `cordova prepare ios` then rebuild in Xcode using `open -a Xcode platforms/ios`