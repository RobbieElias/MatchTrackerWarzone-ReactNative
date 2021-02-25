<img src="./assets/icons/icon.png" width="192" height="192">

# Match Tracker for COD Warzone
Mobile app for iOS and Android written in React Native/Expo for tracking player matches and stats for COD Warzone.

## Download
- Android: [Play Store Link](https://play.google.com/store/apps/details?id=ca.robbieelias.matchtrackerwarzone)
- iOS: [App Store Link](https://apps.apple.com/app/match-tracker-for-cod-warzone/id1553694298)

## Installation
1. Follow the instructions for installing Expo:  
https://docs.expo.io/get-started/installation/
2. Set your username and password for your Activision account in `app/config/accounts.js`. You can add multiple accounts to avoid rate limiting by the COD API.

## Firebase Setup
1. Follow these instructions (managed workflow):  
https://docs.expo.io/guides/setup-native-firebase/
2. Add the firebase config files for both iOS and Android to the `assets/firebase/` directory.

## API
This app uses a slightly modified version of the Call of Duty API found [here](https://github.com/Lierrmm/Node-CallOfDuty) (MIT License, Copyright 2020 Liam Gaskell).