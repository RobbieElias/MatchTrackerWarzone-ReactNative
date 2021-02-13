import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faPlaystation,
  faBattleNet,
  faXbox,
} from "@fortawesome/free-brands-svg-icons";
import { Snackbar } from "react-native-paper";
import { globalStyles } from "../config/globalStyles";
import * as constants from "../config/constants";
import { colors } from "../config/colors";
import { getRecents } from "../utils/userData";

const { width, height } = Dimensions.get("window");

const PlayerButton = ({ name, username, platform, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.playersListButton}>
    <Text style={{ color: colors.primaryText }}>{name}</Text>
  </TouchableOpacity>
);

const Home = ({ navigation }) => {
  const recentsFlatListRef = useRef();
  const topPlayersFlatListRef = useRef();
  const [username, setUsername] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [recents, setRecents] = useState([]);
  const [snackbarIsVisible, setSnackbarIsVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getRecents().then((recents) => {
      setRecents(recents);
      recentsFlatListRef.current.scrollToOffset({ animated: false, offset: 0 });
      topPlayersFlatListRef.current.scrollToOffset({
        animated: false,
        offset: 0,
      });
    });
  }, [isFocused]);

  const onPressPlatformToggleButton = (platform) => {
    setSelectedPlatform(platform);
    setSnackbarIsVisible(false);
  };

  const onPressSearchProfile = () => {
    if (selectedPlatform === null) {
      setSnackbarMessage("Please select a platform.");
      setSnackbarIsVisible(true);
    } else if (username === "") {
      setSnackbarMessage("Please enter a username.");
      setSnackbarIsVisible(true);
    } else {
      setSnackbarIsVisible(false);
      navigation.navigate("Profile", {
        username: username,
        platform: selectedPlatform,
      });
    }
  };

  const renderPlayerButton = ({ item }) => (
    <PlayerButton
      name={item.name ?? item.username}
      username={item.username}
      platform={item.platform}
      onPress={() => {
        navigation.navigate("Profile", {
          username: item.username,
          platform: item.platform,
        });
      }}
    />
  );

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={globalStyles.container}
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor={colors.background}
      />
      <View style={styles.homeView}>
        <View style={styles.logoView}>
          <Image
            width={276}
            height={136}
            resizeMode={"contain"}
            source={require("../../assets/images/wz-logo.png")}
            style={{ marginTop: insets.top }}
          />
        </View>
        <View style={styles.middleView}>
          <View style={globalStyles.toggleButtonView}>
            <TouchableOpacity
              style={
                selectedPlatform === constants.platforms.PLAYSTATION
                  ? globalStyles.toggleButtonSelected
                  : globalStyles.toggleButton
              }
              onPress={() =>
                onPressPlatformToggleButton(constants.platforms.PLAYSTATION)
              }
            >
              <FontAwesomeIcon
                icon={faPlaystation}
                color={
                  selectedPlatform === constants.platforms.PLAYSTATION
                    ? colors.primary
                    : colors.white
                }
                style={{ marginRight: 4 }}
              />
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={
                  selectedPlatform === constants.platforms.PLAYSTATION
                    ? globalStyles.toggleButtonTextSelected
                    : globalStyles.toggleButtonText
                }
              >
                {constants.platforms.PLAYSTATION.name}
              </Text>
            </TouchableOpacity>
            <View style={{ width: constants.viewSpacing }} />
            <TouchableOpacity
              style={
                selectedPlatform === constants.platforms.BATTLENET
                  ? globalStyles.toggleButtonSelected
                  : globalStyles.toggleButton
              }
              onPress={() =>
                onPressPlatformToggleButton(constants.platforms.BATTLENET)
              }
            >
              <FontAwesomeIcon
                icon={faBattleNet}
                color={
                  selectedPlatform === constants.platforms.BATTLENET
                    ? colors.primary
                    : colors.white
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={
                  selectedPlatform === constants.platforms.BATTLENET
                    ? globalStyles.toggleButtonTextSelected
                    : globalStyles.toggleButtonText
                }
              >
                {constants.platforms.BATTLENET.name}
              </Text>
            </TouchableOpacity>
            <View style={{ width: constants.viewSpacing }} />
            <TouchableOpacity
              style={
                selectedPlatform === constants.platforms.XBOX
                  ? globalStyles.toggleButtonSelected
                  : globalStyles.toggleButton
              }
              onPress={() =>
                onPressPlatformToggleButton(constants.platforms.XBOX)
              }
            >
              <FontAwesomeIcon
                icon={faXbox}
                color={
                  selectedPlatform === constants.platforms.XBOX
                    ? colors.primary
                    : colors.white
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={
                  selectedPlatform === constants.platforms.XBOX
                    ? globalStyles.toggleButtonTextSelected
                    : globalStyles.toggleButtonText
                }
              >
                {constants.platforms.XBOX.name}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.usernameInput}
            placeholderTextColor={colors.secondaryText}
            placeholder={
              selectedPlatform === constants.platforms.BATTLENET
                ? "Username#XXXX"
                : "Username"
            }
            onChangeText={(username) => setUsername(username.trim())}
            onSubmitEditing={() => onPressSearchProfile()}
            defaultValue={username}
            autoCorrect={false}
            autoCompleteType={"off"}
            returnKeyType={"search"}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => onPressSearchProfile()}
          >
            <Text style={styles.buttonText}>SEARCH PROFILE</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.playersListTitle}>TOP PLAYERS</Text>
          <FlatList
            ref={recentsFlatListRef}
            horizontal={true}
            style={styles.playersListView}
            contentContainerStyle={{
              paddingRight: 2 * constants.defaultPadding,
            }}
            data={constants.topPlayers}
            renderItem={renderPlayerButton}
            keyExtractor={(player) =>
              player.username + "-" + player.platform.code
            }
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ width: constants.viewSpacing }} />
            )}
          />
          {recents.length > 0 && (
            <Text
              style={[
                styles.playersListTitle,
                { marginTop: height > constants.sH ? 32 : 16 },
              ]}
            >
              RECENTS
            </Text>
          )}
          <FlatList
            ref={topPlayersFlatListRef}
            horizontal={true}
            style={styles.playersListView}
            contentContainerStyle={{
              paddingRight: 2 * constants.defaultPadding,
            }}
            data={recents}
            renderItem={renderPlayerButton}
            keyExtractor={(player) =>
              player.username + "-" + player.platform.code
            }
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ width: constants.viewSpacing }} />
            )}
          />
        </View>
      </View>
      <Snackbar
        visible={snackbarIsVisible}
        style={{ backgroundColor: colors.failure }}
        onDismiss={() => {
          setSnackbarIsVisible(false);
        }}
        duration={5000}
      >
        <Text style={{ color: colors.primaryText }}>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  homeView: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  logoView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: constants.defaultPadding,
  },
  middleView: {
    flex: 0,
    height: "auto",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: constants.defaultPadding,
  },
  usernameInput: {
    height: height > constants.sH ? 70 : 50,
    padding: 8,
    alignSelf: "stretch",
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 4,
    color: colors.primaryText,
    fontSize: 20,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    height: height > constants.sH ? 70 : 50,
    borderRadius: 4,
    alignSelf: "stretch",
    marginTop: constants.viewSpacing,
  },
  buttonText: {
    fontSize: height > constants.sH ? 26 : 22,
    color: colors.primaryText,
  },
  playersListTitle: {
    textAlign: "center",
    color: colors.primaryText,
    fontSize: height > constants.sH ? 20 : 16,
  },
  playersListView: {
    flexGrow: 0,
    marginTop: constants.viewSpacing,
    paddingLeft: constants.defaultPadding,
  },
  playersListButton: {
    height: "auto",
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.white,
    padding: constants.viewSpacing,
  },
});

export default Home;
