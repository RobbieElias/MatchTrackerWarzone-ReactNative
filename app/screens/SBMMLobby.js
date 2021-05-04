import React from "react";
import { WebView } from "react-native-webview";

const SBMMLobby = ({ route, navigation }) => {
  const { matchID, activisionUsername } = route.params;

  return (
    <WebView
      source={{
        uri:
          "https://wzstats.gg/match/" +
          matchID +
          "/player/" +
          activisionUsername,
      }}
    />
  );
};

export default SBMMLobby;
