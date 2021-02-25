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
  Animated,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSearch, faBookmark } from "@fortawesome/free-solid-svg-icons";
import {
  faPlaystation,
  faBattleNet,
  faXbox,
} from "@fortawesome/free-brands-svg-icons";
import { Snackbar } from "react-native-paper";
import { globalStyles } from "../config/globalStyles";
import * as constants from "../config/constants";
import { colors } from "../config/colors";
import { getRecentsList } from "../utils/userData";
import * as Analytics from 'expo-firebase-analytics';

const { width, height } = Dimensions.get("window");

const PlayerButton = ({ name, username, platform, isBookmarked, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.playersListButton}>
    <View>
      <Text style={{ color: colors.primaryText }}>{name}</Text>
      {isBookmarked && (
        <FontAwesomeIcon
          icon={faBookmark}
          size={14}
          color={colors.primary}
          style={{ position: "absolute", top: -10, right: -5 }}
        />
      )}
    </View>
  </TouchableOpacity>
);

const Home = ({ navigation }) => {
  const recentsFlatListRef = useRef();
  const topPlayersFlatListRef = useRef();
  const [username, setUsername] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [recents, setRecents] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (recents.length === 0) animateMessage();
  }, []);

  useEffect(() => {
    if (isFocused) {
      setSnackbarMessage("");

      getRecentsList().then((recents) => {
        setRecents(recents);
        recentsFlatListRef.current.scrollToOffset({
          animated: false,
          offset: 0,
        });
        topPlayersFlatListRef.current.scrollToOffset({
          animated: false,
          offset: 0,
        });
      });
    }
  }, [isFocused]);

  const animateMessage = () => {
    Animated.sequence([
      Animated.delay(3000),
      Animated.timing(fadeAnim1, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim2, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onPressPlatformToggleButton = (platform) => {
    setSelectedPlatform(platform);
    setSnackbarMessage("");
  };

  const onPressSearchProfile = () => {
    if (selectedPlatform === null) {
      setSnackbarMessage("Please select a platform.");
      return;
    } else if (username === "") {
      setSnackbarMessage("Please enter a username.");
      return;
    } else if (selectedPlatform === constants.platforms.BATTLENET) {
      let hashtagIndex = username.lastIndexOf("#");
      if (hashtagIndex < 0) {
        setSnackbarMessage(
          "Missing BattleTag '#' (ie. '" + username + "#1234')."
        );
        return;
      }
      let battleTag = username.substr(hashtagIndex + 1);
      if (battleTag === "" || isNaN(battleTag)) {
        setSnackbarMessage("Invalid Battle.net username.");
        return;
      }
    }

    setSnackbarMessage("");
    navigation.navigate("Profile", {
      username: username,
      platform: selectedPlatform,
    });
  };

  const renderTopPlayerButton = ({ item }) => (
    <PlayerButton
      name={item.name ?? item.username}
      username={item.username}
      platform={item.platform}
      isBookmarked={item.isBookmarked}
      onPress={() => {
        navigation.navigate("Profile", {
          username: item.username,
          platform: item.platform,
        });

        Analytics.logEvent('ClickTopPlayerButton', {
          username: item.username,
          platform: item.platform.code,
        });
      }}
    />
  );

  const renderRecentPlayerButton = ({ item }) => (
    <PlayerButton
      name={item.name ?? item.username}
      username={item.username}
      platform={item.platform}
      isBookmarked={item.isBookmarked}
      onPress={() => {
        navigation.navigate("Profile", {
          username: item.username,
          platform: item.platform,
        });

        Analytics.logEvent('ClickRecentPlayerButton', {
          username: item.username,
          platform: item.platform.code,
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
          <View style={styles.inputView}>
            <View style={{ flex: 1 }}>
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
                textContentType={"username"}
                returnKeyType={"search"}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => onPressSearchProfile()}
            >
              <FontAwesomeIcon
                icon={faSearch}
                color={colors.primaryText}
                size={22}
              />
            </TouchableOpacity>
          </View>
          {recents.length === 0 &&
          <View style={{ width: "100%" }}>
            <Animated.View
              style={{
                opacity: fadeAnim1,
                width: "100%",
                position: "absolute",
              }}
            >
              <Text style={styles.messageText}>
                <Text>Call of Duty usernames are</Text>
                <Text style={globalStyles.bold}> not</Text>
                <Text> supported.</Text>
              </Text>
            </Animated.View>
            <Animated.View
              style={{
                opacity: fadeAnim2,
                width: "100%",
                position: "absolute",
              }}
            >
              <Text style={styles.messageText}>
                <Text>Use a linked account instead.</Text>
              </Text>
            </Animated.View>
          </View>
          }
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.playersListTitle}>TOP PLAYERS</Text>
          <FlatList
            ref={topPlayersFlatListRef}
            horizontal={true}
            style={styles.playersListView}
            contentContainerStyle={{
              paddingRight: 2 * constants.defaultPadding,
            }}
            data={constants.topPlayers}
            renderItem={renderTopPlayerButton}
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
            ref={recentsFlatListRef}
            horizontal={true}
            style={styles.playersListView}
            contentContainerStyle={{
              paddingRight: 2 * constants.defaultPadding,
            }}
            data={recents}
            renderItem={renderRecentPlayerButton}
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
        visible={snackbarMessage !== ""}
        style={{ backgroundColor: colors.failure }}
        onDismiss={() => {
          setSnackbarMessage("");
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
  inputView: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  usernameInput: {
    flex: 1,
    height: height > constants.sH ? 60 : 50,
    padding: 8,
    color: colors.primaryText,
    fontSize: 20,
  },
  searchButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    height: height > constants.sH ? 60 : 50,
    width: height > constants.sH ? 60 : 50,
  },
  messageText: {
    color: colors.secondaryText,
    textAlign: "center",
    marginTop: constants.viewSpacing,
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
