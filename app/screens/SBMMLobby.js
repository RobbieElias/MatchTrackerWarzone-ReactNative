import React from "react";
import { WebView } from "react-native-webview";

const SBMMLobby = ({ route, navigation }) => {
  const { matchID, activisionUsername } = route.params;

  return (
    <WebView
      source={{
        uri:
          "https://SBMMWarzone.com/lobby/" +
          matchID +
          "/player/" +
          activisionUsername,
      }}
    />
  );
};

export default SBMMLobby;
