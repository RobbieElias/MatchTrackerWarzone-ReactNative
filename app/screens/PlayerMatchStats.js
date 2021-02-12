import React, { useState, useEffect, useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faExclamationCircle,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { globalStyles } from "../config/globalStyles";
import { colors } from "../config/colors";
import * as constants from "../config/constants";
import { formatDate } from "../utils/helpers";

const PlayerMatchStats = ({ route, navigation }) => {
  const { mode, date, player } = route.params;
  const insets = useSafeAreaInsets();

  const getTimePlayed = () => {
    if (player.timePlayed === 0) return "0m";
    let minutes = Math.floor(player.timePlayed / 60);
    let seconds = player.timePlayed % 60;

    if (minutes === 0) {
      return seconds + "s";
    } else if (seconds === 0) {
      return minutes + "m";
    } else {
      return minutes + "m " + seconds + "s";
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor={colors.navBarBackground}
      />
      <ScrollView
        contentContainerStyle={{
          padding: constants.defaultPadding,
          paddingBottom: constants.defaultPadding + insets.bottom,
        }}
      >
        <View style={styles.statsRow}>
          <View style={styles.statsViewSubView}>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
              {player.username}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.subtitle}
            >
              {mode} | {date}
            </Text>
          </View>
          <View
            style={
              player.placement === 1
                ? [styles.placementView, styles.placementViewSuccess]
                : [styles.placementView]
            }
          >
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={styles.placementText}
            >
              {player.placement}
            </Text>
          </View>
        </View>
        <View style={globalStyles.line} />
        <View style={styles.statsRow}>
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>KILLS</Text>
            <Text style={styles.statsViewTitle}>{player.kills}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>DEATHS</Text>
            <Text style={styles.statsViewTitle}>{player.deaths}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>ASSISTS</Text>
            <Text style={styles.statsViewTitle}>{player.assists}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>HEADSHOTS</Text>
            <Text style={styles.statsViewTitle}>{player.headshots}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>DAMAGE</Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewTitle}
            >
              {player.damage}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statsView}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewSubtitle}
            >
              DAMAGE TAKEN
            </Text>
            <Text style={styles.statsViewTitle}>{player.damageTaken}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
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
              {getTimePlayed()}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statsView}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewSubtitle}
            >
              % TIME MOVING
            </Text>
            <Text style={styles.statsViewTitle}>
              {player.percentTimeMoving.toFixed(1)}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>SPM</Text>
            <Text style={styles.statsViewTitle}>
              {player.scorePerMinute.toFixed(1)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statsView}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewSubtitle}
            >
              LONGEST STREAK
            </Text>
            <Text style={styles.statsViewTitle}>{player.longestStreak}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsView}>
            <Text style={styles.statsViewSubtitle}>SCORE</Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewTitle}
            >
              {player.score}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statsView}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewSubtitle}
            >
              TOTAL XP
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.statsViewTitle}
            >
              {player.totalXp}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statsView: {
    flex: 1,
    backgroundColor: colors.viewBackground,
    borderRadius: 4,
    marginBottom: constants.viewSpacing,
    padding: constants.defaultPadding,
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
    marginTop: constants.viewSpacing,
    fontSize: 30,
  },
  placementView: {
    width: 46,
    height: 46,
    backgroundColor: colors.primary,
    justifyContent: "center",
    borderRadius: 4,
  },
  placementViewSuccess: {
    backgroundColor: colors.success,
  },
  placementText: {
    textAlign: "center",
    color: colors.primaryText,
    fontSize: 28,
    fontWeight: "bold",
    padding: 4,
  },
  separator: {
    width: constants.viewSpacing,
  },
});

export default PlayerMatchStats;
