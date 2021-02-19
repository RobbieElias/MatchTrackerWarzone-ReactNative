import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faPlaystation,
  faBattleNet,
  faXbox,
} from "@fortawesome/free-brands-svg-icons";
import { globalStyles } from "../config/globalStyles";
import { colors } from "../config/colors";
import * as constants from "../config/constants";
import { getTimePlayed } from "../utils/helpers";

const API = require("../libraries/API")({ platform: "battle" });

const ModeButton = ({ mode, name, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.modesListButton,
      selected ? styles.modesListButtonSelected : null,
    ]}
  >
    <Text style={{ color: selected ? colors.primary : colors.primaryText }}>
      {name}
    </Text>
  </TouchableOpacity>
);

const LifetimeStats = ({ route }) => {
  const { username, platform, lifetimeStats } = route.params;
  const [modeStats, setModeStats] = useState(null);
  const [modes, setModes] = useState([
    {
      mode: "br_all",
      name: "All",
      selected: true,
    },
    {
      mode: "br",
      name: "Battle Royale",
      selected: false,
    },
    {
      mode: "br_dmz",
      name: "Plunder",
      selected: false,
    },
  ]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    updateStats(modes[0].mode);
  }, []);

  const updateStats = (newMode) => {
    setModeStats(lifetimeStats.mode[newMode].properties);
  };

  const setSelectedMode = (mode) => {
    setModes(
      modes.map((item) =>
        item.mode === mode
          ? { ...item, selected: true }
          : { ...item, selected: false }
      )
    );

    updateStats(mode);
  };

  const renderModeButton = ({ item }) => (
    <ModeButton
      mode={item.mode}
      name={item.name}
      selected={item.selected}
      onPress={() => {
        setSelectedMode(item.mode);
      }}
    />
  );

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor={colors.navBarBackground}
      />
      {modeStats && (
        <ScrollView
          contentContainerStyle={{
            padding: constants.defaultPadding,
            paddingBottom: constants.defaultPadding + insets.bottom,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesomeIcon
              icon={
                platform.code === constants.platforms.PLAYSTATION.code
                  ? faPlaystation
                  : platform.code === constants.platforms.BATTLENET.code
                  ? faBattleNet
                  : faXbox
              }
              color={colors.primaryText}
              size={20}
              style={{ marginRight: constants.viewSpacing }}
            />
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
              {username}
            </Text>
          </View>
          <View style={globalStyles.line} />
          <FlatList
            horizontal={true}
            style={styles.modesListView}
            data={modes}
            renderItem={renderModeButton}
            keyExtractor={(mode) => mode.mode}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ width: constants.viewSpacing }} />
            )}
          />
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>MATCHES</Text>
              <Text style={styles.statsViewTitle}>{modeStats.gamesPlayed}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                TIME PLAYED
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {getTimePlayed(modeStats.timePlayed)}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>KILLS</Text>
              <Text style={styles.statsViewTitle}>{modeStats.kills}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>DEATHS</Text>
              <Text style={styles.statsViewTitle}>{modeStats.deaths}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>KILLS/GAME</Text>
              <Text style={styles.statsViewTitle}>
                {(modeStats.kills / modeStats.gamesPlayed).toFixed(1)}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>K/D RATIO</Text>
              <Text style={styles.statsViewTitle}>
                {modeStats.kdRatio.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>DOWNS</Text>
              <Text style={styles.statsViewTitle}>{modeStats.downs}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>REVIVES</Text>
              <Text style={styles.statsViewTitle}>{modeStats.revives}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>WINS</Text>
              <Text style={styles.statsViewTitle}>{modeStats.wins}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text style={styles.statsViewSubtitle}>WIN %</Text>
              <Text style={styles.statsViewTitle}>
                {((modeStats.wins / modeStats.gamesPlayed) * 100).toFixed(1)}
              </Text>
            </View>
          </View>
          {!modes[2].selected && ( // Don't show this row for plunder
            <View style={styles.statsRow}>
              <View style={styles.statsView}>
                <Text style={styles.statsViewSubtitle}>TOP 5</Text>
                <Text style={styles.statsViewTitle}>{modeStats.topFive}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.statsView}>
                <Text style={styles.statsViewSubtitle}>TOP 5 %</Text>
                <Text style={styles.statsViewTitle}>
                  {((modeStats.topFive / modeStats.gamesPlayed) * 100).toFixed(
                    1
                  )}
                </Text>
              </View>
            </View>
          )}
          {!modes[2].selected && ( // Don't show this row for plunder
            <View style={styles.statsRow}>
              <View style={styles.statsView}>
                <Text style={styles.statsViewSubtitle}>TOP 10</Text>
                <Text style={styles.statsViewTitle}>{modeStats.topTen}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.statsView}>
                <Text style={styles.statsViewSubtitle}>TOP 10 %</Text>
                <Text style={styles.statsViewTitle}>
                  {((modeStats.topTen / modeStats.gamesPlayed) * 100).toFixed(
                    1
                  )}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subtitle: {
    color: colors.primaryText,
    fontSize: 20,
    marginTop: constants.viewSpacing,
  },
  statsView: {
    flex: 1,
    backgroundColor: colors.viewBackground,
    borderRadius: 4,
    marginBottom: constants.viewSpacing,
    padding: constants.viewSpacing,
  },
  statsViewCurrent: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsViewSubView: {
    flex: 1,
    justifyContent: "center",
  },
  statsViewSubtitle: {
    color: colors.secondaryText,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsViewTitle: {
    color: colors.primaryText,
    textAlign: "center",
    marginVertical: constants.viewSpacing,
    fontSize: 30,
  },
  separator: {
    width: constants.viewSpacing,
  },
  modesListView: {
    marginTop: constants.viewSpacing,
    marginBottom: constants.viewSpacing * 2,
    overflow: "visible",
  },
  modesListButton: {
    height: "auto",
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.white,
    paddingVertical: constants.viewSpacing,
    paddingHorizontal: constants.viewSpacing + 4,
  },
  modesListButtonSelected: {
    borderColor: colors.primary,
  },
});

export default LifetimeStats;
