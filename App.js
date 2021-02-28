import React, { useRef, useState } from "react";
import { Platform, Dimensions, SafeAreaView } from "react-native";
import Home from "./app/screens/Home";
import Profile from "./app/screens/Profile";
import Match from "./app/screens/Match";
import PlayerMatchStats from "./app/screens/PlayerMatchStats";
import SBMMLobby from "./app/screens/SBMMLobby";
import LifetimeStats from "./app/screens/LifetimeStats";
import WeeklyStats from "./app/screens/WeeklyStats";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { colors } from "./app/config/colors";
import * as Analytics from "expo-firebase-analytics";
import Constants from "expo-constants";
import { AdMobBanner } from "expo-ads-admob";

enableScreens();
const Stack = createNativeStackNavigator();

// Disable Firebase warning messages
Analytics.setUnavailabilityLogging(false);

const App = () => {
  const navigationRef = useRef();
  const routeNameRef = useRef();
  const [hasAd, setHasAd] = useState(false);
  const { width, height } = Dimensions.get("window");

  // Get the banner size
  let bannerSize = Platform.select({
    ios: "smartBannerPortrait",
    android: width >= 468 ? "fullBanner" : "banner",
  });

  // Get the banner Ad Unit ID
  let bannerAdUnitId = Constants.manifest.extra.bannerAdUnitIdAndroidTest;
  if (Constants.appOwnership === "standalone" && Constants.isDevice) {
    bannerAdUnitId = Platform.select({
      ios: Constants.manifest.extra.bannerAdUnitIdIos,
      android: Constants.manifest.extra.bannerAdUnitIdAndroid,
    });
  } else {
    bannerAdUnitId = Platform.select({
      ios: Constants.manifest.extra.bannerAdUnitIdIosTest,
      android: Constants.manifest.extra.bannerAdUnitIdAndroidTest,
    });
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <NavigationContainer
        ref={navigationRef}
        onReady={async () => {
          const currentRouteName = navigationRef.current.getCurrentRoute().name;
          await Analytics.setCurrentScreen(currentRouteName);
          routeNameRef.current = currentRouteName;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            await Analytics.setCurrentScreen(currentRouteName);
          }

          // Save the current route name for later comparison
          routeNameRef.current = currentRouteName;
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.navBarBackground,
            },
            cardStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.primaryText,
          }}
        >
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen
            name="Match"
            component={Match}
            options={{ title: "Match Details" }}
          />
          <Stack.Screen
            name="PlayerMatchStats"
            component={PlayerMatchStats}
            options={{ title: "Player Stats" }}
          />
          <Stack.Screen
            name="SBMMLobby"
            component={SBMMLobby}
            options={{ title: "SBMMWarzone.com" }}
          />
          <Stack.Screen
            name="LifetimeStats"
            component={LifetimeStats}
            options={{ title: "Lifetime Stats" }}
          />
          <Stack.Screen
            name="WeeklyStats"
            component={WeeklyStats}
            options={{ title: "Weekly Stats" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <SafeAreaView
        style={hasAd ? { backgroundColor: colors.black } : { height: 0 }}
      >
        <AdMobBanner
          bannerSize={bannerSize}
          adUnitID={bannerAdUnitId}
          servePersonalizedAds={false}
          onAdViewDidReceiveAd={() => setHasAd(true)}
          onDidFailToReceiveAdWithError={() => setHasAd(false)}
          style={{ alignSelf: "center" }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
