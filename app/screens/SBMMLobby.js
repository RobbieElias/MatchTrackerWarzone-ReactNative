import React, { useState, useEffect } from "react";
import { WebView } from "react-native-webview";

const SBMMLobby = ({ route, navigation }) => {
  const { matchID, activisionUsername } = route.params;

  console.log(
    "https://SBMMWarzone.com/lobby/" + matchID + "/player/" + activisionUsername
  );

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
