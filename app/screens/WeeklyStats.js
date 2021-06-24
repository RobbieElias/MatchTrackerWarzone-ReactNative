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
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faLongArrowAltDown,
  faLongArrowAltUp,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
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

const WeeklyStats = ({ route }) => {
  const {
    username,
    platform,
    lifetimeStats,
    weeklyStats,
    dailyStats,
  } = route.params;
  const [modeStats, setModeStats] = useState(null);
  const [modeDayStats, setModeDayStats] = useState(null);
  const [modes, setModes] = useState([]);

  useEffect(() => {
    let modesArray = [];
    for (const property in weeklyStats.mode) {
      modesArray.push({
        mode: property,
        name: API.getGameMode(property),
        selected: property === "br_all" ? true : false,
      });
    }

    modesArray.sort((a, b) => (a.mode === "br_all" ? -1 : 1));
    setModes(modesArray);

    updateStats("br_all");
  }, []);

  const updateStats = (newMode) => {
    if (weeklyStats.mode[newMode]) {
      setModeStats(weeklyStats.mode[newMode].properties);
    }

    let dailyStatsArray = [];

    // Mode is "all" instead of "br_all" for daily stats
    newMode = newMode === "br_all" ? "all" : newMode;

    for (const utc in dailyStats) {
      if (dailyStats[utc][newMode]) {
        dailyStatsArray.push({
          utc: utc,
          kills: dailyStats[utc][newMode].kills,
          deaths: dailyStats[utc][newMode].deaths,
          kdRatio: dailyStats[utc][newMode].kdRatio,
        });
      } else {
        dailyStatsArray.push({
          utc: utc,
          kills: "-",
          deaths: "-",
          kdRatio: "-",
        });
      }
    }
    dailyStatsArray.sort((a, b) => a.utc < b.utc);
    setModeDayStats(dailyStatsArray);
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

  const getDay = (utc) => {
    var date = new Date(parseInt(utc));
    return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
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
          contentContainerStyle={{ padding: constants.defaultPadding }}
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
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                MATCHES
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.matchesPlayed}
              </Text>
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
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                AVG LIFETIME
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {getTimePlayed(
                  Math.round(modeStats.avgLifeTime),
                  false,
                  true,
                  true
                )}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                KILLS
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.kills}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                DEATHS
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.deaths}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                K/D RATIO
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={styles.statsViewTitle}
                >
                  {modeStats.kdRatio.toFixed(2)}
                </Text>
                {modeStats.kdRatio >= lifetimeStats.kdRatio ? (
                  <FontAwesomeIcon
                    icon={faLongArrowAltUp}
                    color={colors.success}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faLongArrowAltDown}
                    color={colors.failure}
                  />
                )}
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                ASSISTS
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.assists}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                DAMAGE
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.damageDone}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                HEADSHOT %
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {(modeStats.headshotPercentage * 100).toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                GULAG KILLS
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.gulagKills ?? "-"}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                TEAM WIPES
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {modeStats.objectiveTeamWiped}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statsView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                KILLS/GAME
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={styles.statsViewTitle}
                >
                  {modeStats.killsPerGame.toFixed(1)}
                </Text>
                {modeStats.killsPerGame >=
                lifetimeStats.kills / lifetimeStats.gamesPlayed ? (
                  <FontAwesomeIcon
                    icon={faLongArrowAltUp}
                    color={colors.success}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faLongArrowAltDown}
                    color={colors.failure}
                  />
                )}
              </View>
            </View>
          </View>
          <Text style={styles.subtitle}>LAST 7 DAYS</Text>
          <View style={[styles.statsRow, { margin: constants.viewSpacing }]}>
            <View style={{ flex: 0.5 }}>
              <FontAwesomeIcon
                icon={faCalendarAlt}
                color={colors.secondaryText}
                size={14}
                style={{ marginTop: 3 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                KILLS
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                DEATHS
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.statsViewSubtitle}
              >
                K/D RATIO
              </Text>
            </View>
          </View>
          <View style={[styles.statsView, { paddingVertical: 0 }]}>
            {modeDayStats.map((item, key) => {
              return (
                <View
                  key={item.utc}
                  style={[
                    styles.statsRow,
                    {
                      borderBottomColor: colors.background,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View style={{ flex: 0.5, justifyContent: "center" }}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[
                        styles.dayText,
                        key === 0 ? styles.dayTextToday : null,
                      ]}
                    >
                      {getDay(item.utc)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={styles.dayStatsText}
                    >
                      {item.kills}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={styles.dayStatsText}
                    >
                      {item.deaths}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={styles.dayStatsText}
                    >
                      {isNaN(item.kdRatio)
                        ? item.kdRatio
                        : item.kdRatio.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
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
    height: 16,
    color: colors.secondaryText,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  statsViewTitle: {
    color: colors.primaryText,
    textAlign: "center",
    marginVertical: constants.viewSpacing,
    fontSize: 20,
  },
  dayText: {
    textAlign: "center",
    backgroundColor: colors.primary,
    borderRadius: 4,
    overflow: "hidden",
    width: 44,
    padding: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primaryText,
  },
  dayTextToday: {
    backgroundColor: colors.success,
  },
  dayStatsText: {
    color: colors.primaryText,
    textAlign: "center",
    marginVertical: constants.viewSpacing,
    fontSize: 18,
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

export default WeeklyStats;
