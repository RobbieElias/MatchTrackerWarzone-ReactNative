import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faExclamationCircle,
  faUser,
  faUsers,
  faSkullCrossbones,
  faCrosshairs,
} from "@fortawesome/free-solid-svg-icons";
import { globalStyles } from "../config/globalStyles";
import { colors } from "../config/colors";
import * as constants from "../config/constants";
import { formatDate, gulagResult } from "../utils/helpers";

const API = require("../libraries/API")({ platform: "battle" });
const { width, height } = Dimensions.get("window");
var matchData = [];
var activisionUsername = "";

const TeamView = React.memo(
  ({ isCurrentTeam, placement, kills, deaths, damage, players, onPress }) => (
    <View
      style={[styles.statsView, isCurrentTeam ? styles.statsViewCurrent : {}]}
    >
      {players.map((player, index) => {
        return (
          <TouchableOpacity
            key={player.uno}
            style={[styles.statsRow, { paddingVertical: 4 }]}
            onPress={() => onPress(index)}
          >
            <View style={[styles.statsViewSubView, { flex: 2 }]}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={[
                  styles.statsViewTitle,
                  { textAlign: "left", marginLeft: constants.viewSpacing },
                ]}
              >
                {player.username}
              </Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {player.kills}
              </Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {player.deaths}
              </Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.statsViewTitle}
              >
                {player.damage}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      <View
        style={[
          globalStyles.line,
          {
            backgroundColor: colors.background,
            marginHorizontal: constants.viewSpacing,
          },
        ]}
      />
      <View style={styles.statsRow}>
        <View style={[styles.statsViewSubView, { flex: 2 }]}>
          <View
            style={
              placement === 1
                ? [styles.placementView, styles.placementViewSuccess]
                : [styles.placementView]
            }
          >
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={styles.placementText}
            >
              {placement}
            </Text>
          </View>
        </View>
        <View style={styles.statsViewSubView}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={[styles.statsViewTitle, { fontWeight: "bold" }]}
          >
            {players.length > 1 ? kills : ""}
          </Text>
        </View>
        <View style={styles.statsViewSubView}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={styles.statsViewTitle}
          >
            {players.length > 1 ? deaths : ""}
          </Text>
        </View>
        <View style={styles.statsViewSubView}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={styles.statsViewTitle}
          >
            {players.length > 1 ? damage : ""}
          </Text>
        </View>
      </View>
    </View>
  )
);

const PlayerView = React.memo(
  ({ isCurrentPlayer, username, kills, deaths, gulag, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.statsView,
        styles.statsRow,
        isCurrentPlayer ? styles.statsViewCurrent : {},
      ]}
    >
      <View style={[styles.statsViewSubView, { flex: 2 }]}>
        <Text
          adjustsFontSizeToFit={true}
          numberOfLines={1}
          style={[
            styles.statsViewTitle,
            { textAlign: "left", marginLeft: constants.viewSpacing },
          ]}
        >
          {username}
        </Text>
      </View>
      <View style={styles.statsViewSubView}>
        <Text
          adjustsFontSizeToFit={true}
          numberOfLines={1}
          style={styles.statsViewTitle}
        >
          {kills}
        </Text>
      </View>
      <View style={styles.statsViewSubView}>
        <Text
          adjustsFontSizeToFit={true}
          numberOfLines={1}
          style={styles.statsViewTitle}
        >
          {deaths}
        </Text>
      </View>
      {gulag === 0 ? (
        <View style={styles.statsViewSubView}>
          <Text style={styles.statsViewTitle}>-</Text>
        </View>
      ) : (
        <View
          style={[
            styles.statsViewSubView,
            { paddingTop: 1, alignItems: "center" },
          ]}
        >
          <FontAwesomeIcon
            icon={gulag === 1 ? faCrosshairs : faSkullCrossbones}
            style={styles.gulagIcon}
            size={14}
          />
        </View>
      )}
    </TouchableOpacity>
  )
);

const Match = ({ route, navigation }) => {
  const { matchID, uno } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState(null);
  const [filterByTeam, setFilterByTeam] = useState(true);
  const [errorStatus, setErrorStatus] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const insets = useSafeAreaInsets();
  var isMounted = false;

  useEffect(() => {
    isMounted = true;
    getMatchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getMatchData = async () => {
    try {
      let data = await API.MWFullMatchInfowz(matchID);
      if (!isMounted) return;
      matchData = filterMatchData(data);
    } catch (error) {
      if (!isMounted) return;
      console.log(error);
      setErrorStatus(typeof error === "string" ? 1 : error.status);
      setErrorMessage(typeof error === "string" ? error : error.message);
    } finally {
      if (!isMounted) return;
      setIsLoading(false);
    }
  };

  const filterMatchData = (data) => {
    if (data.allPlayers.length === 0) {
      setErrorStatus(1);
      setErrorMessage("Match not loaded properly.");
      return;
    }

    setMatchDetails({
      matchID: matchID,
      date: formatDate(data.allPlayers[0].utcEndSeconds),
      mode: API.getGameMode(data.allPlayers[0].mode),
      playerCount: data.allPlayers[0].playerCount,
      teamCount: data.allPlayers[0].teamCount,
    });

    let matchData = {
      matchID: matchID,
      date: formatDate(data.allPlayers[0].utcEndSeconds),
      mode: API.getGameMode(data.allPlayers[0].mode),
      playerCount: data.allPlayers[0].playerCount,
      teamCount: data.allPlayers[0].teamCount,
      players: [],
      teams: [],
    };

    for (const player of data.allPlayers) {
      let isCurrentPlayer = player.player.uno === uno ? true : false;
      let playerObject = {
        uno: player.player.uno,
        isCurrentPlayer: isCurrentPlayer,
        username: player.player.username,
        team: player.player.team,
        placement: player.playerStats.teamPlacement ?? "N/A",
        kills: player.playerStats.kills,
        deaths: player.playerStats.deaths,
        headshots: player.playerStats.headshots,
        assists: player.playerStats.assists,
        damage: player.playerStats.damageDone,
        damageTaken: player.playerStats.damageTaken,
        gulag: gulagResult(
          player.playerStats.gulagKills,
          player.playerStats.gulagDeaths
        ),
        timePlayed: player.playerStats.timePlayed,
        percentTimeMoving: player.playerStats.percentTimeMoving,
        scorePerMinute: player.playerStats.scorePerMinute,
        longestStreak: player.playerStats.longestStreak,
        timePlayed: player.playerStats.timePlayed,
        score: player.playerStats.score,
        totalXp: player.playerStats.totalXp,
      };

      matchData.players.push(playerObject);

      if (isCurrentPlayer) {
        activisionUsername = player.player.username;
      }
    }

    matchData.players.sort((a, b) => b.kills - a.kills);

    for (const player of matchData.players) {
      let team = matchData.teams.find((x) => x.team === player.team);
      if (team) {
        team.players.push(player);
        team.kills += player.kills;
        team.deaths += player.deaths;
        team.damage += player.damage;
        if (player.isCurrentPlayer) {
          team.isCurrentTeam = true;
        }
      } else {
        matchData.teams.push({
          team: player.team,
          placement: player.placement,
          kills: player.kills,
          deaths: player.deaths,
          damage: player.damage,
          players: [player],
          isCurrentTeam: player.isCurrentPlayer,
        });
      }
    }

    matchData.teams.sort((a, b) => a.placement - b.placement);
    let currentTeam = matchData.teams.find((x) => x.isCurrentTeam);
    if (currentTeam && currentTeam.placement > 1) {
      let currentTeamCopy = { ...currentTeam };
      matchData.teams.unshift(currentTeamCopy); // add copy of object to start of array
      currentTeam.isCurrentTeam = false;
    }

    return matchData;
  };

  const onPressTeamPlayer = (teamIndex, playerIndex) => {
    navigation.navigate("PlayerMatchStats", {
      mode: matchDetails.mode,
      date: matchDetails.date,
      player: matchData.teams[teamIndex].players[playerIndex],
    });
  };

  const onPressPlayer = (index) => {
    navigation.navigate("PlayerMatchStats", {
      mode: matchDetails.mode,
      date: matchDetails.date,
      player: matchData.players[index],
    });
  };

  const keyExtractorTeams = (team, index) => "team-" + index;

  const keyExtractorPlayers = (player) => player.uno;

  const renderTeamView = ({ item, index }) => (
    <TeamView
      isCurrentTeam={item.isCurrentTeam}
      team={item.team}
      placement={item.placement}
      kills={item.kills}
      deaths={item.deaths}
      damage={item.damage}
      players={item.players}
      onPress={(playerIndex) => onPressTeamPlayer(index, playerIndex)}
    />
  );

  const renderPlayerView = ({ item, index }) => (
    <PlayerView
      isCurrentPlayer={item.isCurrentPlayer}
      username={item.username}
      kills={item.kills}
      deaths={item.deaths}
      gulag={item.gulag}
      onPress={() => onPressPlayer(index)}
    />
  );

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor={colors.navBarBackground}
      />
      {!isLoading && matchDetails && (
        <View
          style={{
            backgroundColor: colors.background,
            padding: constants.defaultPadding,
            paddingBottom: 0,
          }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
                {matchDetails.mode}
              </Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.title,
                  { color: colors.secondaryText, textAlign: "right" },
                ]}
              >
                {matchDetails.date}
              </Text>
            </View>
          </View>
          <View style={[globalStyles.line, { marginBottom: 0 }]} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: constants.viewSpacing,
            }}
          >
            <Text style={{ color: colors.primaryText }}>
              Bot lobby? Check out{" "}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("SBMMLobby", {
                  matchID: matchID,
                  activisionUsername: activisionUsername,
                })
              }
            >
              <Text style={{ color: colors.primary }}>SBMMWarzone.com</Text>
            </TouchableOpacity>
          </View>
          <View style={globalStyles.toggleButtonView}>
            <TouchableOpacity
              style={
                filterByTeam
                  ? globalStyles.toggleButtonSelected
                  : globalStyles.toggleButton
              }
              onPress={() => setFilterByTeam(true)}
            >
              <FontAwesomeIcon
                icon={faUsers}
                color={filterByTeam ? colors.primary : colors.white}
                size={22}
                style={{ marginRight: 12 }}
              />
              <Text
                style={
                  filterByTeam
                    ? globalStyles.toggleButtonTextSelected
                    : globalStyles.toggleButtonText
                }
              >
                TEAMS
              </Text>
            </TouchableOpacity>
            <View style={{ width: constants.viewSpacing }} />
            <TouchableOpacity
              style={
                !filterByTeam
                  ? globalStyles.toggleButtonSelected
                  : globalStyles.toggleButton
              }
              onPress={() => setFilterByTeam(false)}
            >
              <FontAwesomeIcon
                icon={faUser}
                color={!filterByTeam ? colors.primary : colors.white}
                style={{ marginRight: 12 }}
              />
              <Text
                style={
                  !filterByTeam
                    ? globalStyles.toggleButtonTextSelected
                    : globalStyles.toggleButtonText
                }
              >
                PLAYERS
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.statsRow,
              {
                marginTop: constants.defaultPadding,
                marginBottom: constants.viewSpacing,
              },
            ]}
          >
            <View style={{ flex: 2 }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.statsViewSubtitle,
                  { textAlign: "left", marginLeft: constants.viewSpacing },
                ]}
              >
                NAME
              </Text>
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
                {filterByTeam ? "DAMAGE" : "GULAG"}
              </Text>
            </View>
          </View>
        </View>
      )}
      {!isLoading && (
        <FlatList
          style={
            filterByTeam ? styles.listContainer : styles.listContainerHidden
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + constants.defaultPadding,
          }}
          data={matchData.teams}
          renderItem={renderTeamView}
          keyExtractor={keyExtractorTeams}
          scrollIndicatorInsets={{ top: 1 }}
          initialNumToRender={0}
          removeClippedSubviews={true}
          windowSize={3}
        />
      )}
      {!isLoading && (
        <FlatList
          style={
            !filterByTeam ? styles.listContainer : styles.listContainerHidden
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + constants.defaultPadding * 2,
          }}
          data={matchData.players}
          renderItem={renderPlayerView}
          keyExtractor={keyExtractorPlayers}
          scrollIndicatorInsets={{ top: 1 }}
          initialNumToRender={0}
          removeClippedSubviews={true}
          windowSize={10}
        />
      )}
      {isLoading && (
        <View style={globalStyles.loadingView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!isLoading && errorStatus !== 0 && (
        <View style={globalStyles.errorView}>
          <Text>
            <FontAwesomeIcon
              icon={faExclamationCircle}
              color={colors.primaryText}
              size={80}
            />
          </Text>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={globalStyles.errorTitle}
          >
            MATCH NOT LOADED
          </Text>
          <Text style={globalStyles.errorMessage}>Please try again later.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    display: "flex",
    flex: 1,
    paddingHorizontal: constants.defaultPadding,
  },
  listContainerHidden: {
    display: "none",
  },
  title: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subtitle: {
    color: colors.primaryText,
    fontSize: 20,
  },
  statsView: {
    backgroundColor: colors.viewBackground,
    borderRadius: 4,
    marginBottom: constants.viewSpacing,
    paddingVertical: constants.viewSpacing,
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
    fontSize: width > constants.sW ? 16 : 12,
    fontWeight: "bold",
  },
  statsViewTitle: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 16,
  },
  matchDate: {
    color: colors.secondaryText,
    textAlign: "right",
    fontSize: 12,
    marginBottom: 8,
  },
  placementView: {
    width: 32,
    height: 32,
    marginHorizontal: constants.viewSpacing,
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
    fontSize: 22,
    fontWeight: "bold",
    padding: 4,
  },
  gulagIcon: {
    color: colors.primaryText,
  },
});

export default Match;
