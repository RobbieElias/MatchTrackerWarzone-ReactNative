import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationCircle, faUserLock, faLongArrowAltDown, faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons';
import {
  faPlaystation,
  faBattleNet,
  faXbox,
} from '@fortawesome/free-brands-svg-icons';
import { globalStyles } from '../config/globalStyles';
import { colors } from '../config/colors';
import { accounts } from '../config/accounts';
import * as constants from '../config/constants';
import { addToRecents } from '../utils/userData';
import { formatDate } from '../utils/helpers';

const API = require('../libraries/API')({ platform: 'battle' });
const { width, height } = Dimensions.get('window');
var recentMatches = [];

const MatchView = ({ mode, placement, kills, date, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.statsView}>
    <View style={styles.statsRow}>
      <View style={styles.statsViewSubView}>
        <Text style={styles.statsViewSubtitle}>MODE</Text>
        <Text adjustsFontSizeToFit={true} numberOfLines={2} style={styles.statsViewTitle}>{mode}</Text>
      </View>
      <View style={styles.statsViewSubView}>
        <Text style={styles.statsViewSubtitle}>KILLS</Text>
        <Text adjustsFontSizeToFit={true} numberOfLines={2} style={styles.statsViewTitle}>{kills}</Text>
      </View>
      <View style={{ 
        width: 100,
      }}
      >
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.matchDate}>{date}</Text>
        <View style={placement === 1 ? [styles.placementView, styles.placementViewSuccess] : [styles.placementView]}>
          <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.placementText}>{placement}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const Profile = ({ route, navigation }) => {

  const { username, platform } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorStatus, setErrorStatus] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({});
  const insets = useSafeAreaInsets();
  var isMounted = false;

  useEffect(() => {
    isMounted = true;
    getProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async () => {
    if (!API.isLoggedIn()) {
      console.log('Logging in');
      // Get a random account to login with (to avoid rate limiting)
      let account = accounts[Math.floor(Math.random() * accounts.length)];
      await API.login(account.username, account.password);
    }
  }

  const getProfileData = async () => {
    login().then(async () => {
      let matchData = await API.MWcombatwz(username, platform.code);
      if (!isMounted) return;
      recentMatches = filterMatchData(matchData);

      // update recents list
      if (platform.code === constants.platforms.BATTLENET.code) {
        let lastIndexHashtag = username.lastIndexOf('#');
        let name = lastIndexHashtag === -1 ? username : username.substr(0, lastIndexHashtag);
        addToRecents(name, username, platform);
      }
      else {
        addToRecents(username, username, platform);
      }
    })
    .then(async () => {
      let data = await API.MWwz(username, platform.code);
      if (!isMounted) return;
      let lifetimeData = data.lifetime.mode.br_all.properties;
      let weeklyData = data.weekly.all.properties;
      setStats({
        profile: {
          username: username,
          platform: platform,
          level: data.level,
        },
        lifetime: {
          gamesPlayed: lifetimeData.gamesPlayed ?? 0,
          wins: lifetimeData.wins ?? 0,
          gamesPlayed: lifetimeData.gamesPlayed ?? 0,
          kills: lifetimeData.kills ?? 0,
          deaths: lifetimeData.deaths ?? 0,
          kdRatio: lifetimeData.kdRatio ?? 0,
        },
        weekly: {
          kills: weeklyData.kills ?? 0,
          deaths: weeklyData.deaths ?? 0,
          kdRatio: weeklyData.kdRatio ?? 0,
        }
      });
      // console.log(JSON.stringify(data));
    })
    .catch((error) => {
      if (!isMounted) return;
      console.log(error);
      setErrorStatus(typeof error === 'string' ? 1 : error.status);
      setErrorMessage(typeof error === 'string' ? error : error.message);
    })
    .finally(() => {
      if (!isMounted) return;
      setIsLoading(false);
      setIsRefreshing(false);
    });
  }

  const filterMatchData = (data) => {
    let matches = [];

    for (const match of data.matches) {
      matches.push({
        id: match.matchID,
        uno: match.player.uno,
        mode: API.getGameMode(match.mode),
        placement: match.playerStats.teamPlacement ?? 'N/A',
        kills: match.playerStats.kills,
        date: formatDate(match.utcEndSeconds),
      });
    }

    return matches;
  }

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    getProfileData();
  }, []);

  const renderMatchView = ({ item }) => (
    <MatchView 
      mode={item.mode} 
      placement={item.placement} 
      kills={item.kills} 
      date={item.date} 
      onPress={() => {
        navigation.navigate('Match', {
          matchID: item.id,
          uno: item.uno,
        });
      }}
    />
  );

  const getErrorTitle = () => {
    switch (errorStatus) {
      case 404:
        return 'Profile Not Found';
      case 500:
        if (errorMessage === 'Not permitted: not allowed') {
          return 'Private Profile';
        }
    }
    return 'Something Went Wrong';
  }

  const getErrorMessage = () => {
    switch (errorStatus) {
      case 404:
        return (
          <Text style={globalStyles.errorMessage}>
            <Text style={{fontWeight: 'bold'}}>{username}</Text>
            <Text> on </Text>
            <Text style={{fontWeight: 'bold'}}>{platform.name}</Text>
            <Text> does not exist.{'\n'}(Do not use your Activision username)</Text>
          </Text>
        );
      case 500:
        if (errorMessage === 'Not permitted: not allowed') {
          return (
            <Text style={[globalStyles.errorMessage, { textAlign: 'left' }]}>
              <Text>
                If you are <Text style={{fontWeight: 'bold'}}>{username}</Text>, perform these steps to make your profile public:{'\n'}{'\n'}
                1. Login to the <Text style={{color: colors.primary}} onPress={() => Linking.openURL('https://profile.callofduty.com/cod/profile')}>Call of Duty</Text> website.{'\n'}{'\n'}
                2. Go to the Linked Accounts page.{'\n'}{'\n'}
                3. Set 'Data Visible' to 'None', then refresh.{'\n'}{'\n'}
                4. Set 'Data Visible' to 'All'.{'\n'}{'\n'}
                5. Search for your profile using one of your linked accounts!
              </Text>
            </Text>
          );
        }
    }
    return (<Text style={globalStyles.errorMessage}>Please try again later.</Text>);
  }

  const HeaderView = () => {
    return (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
          <FontAwesomeIcon
            icon={stats.profile.platform.code === constants.platforms.PLAYSTATION.code ? faPlaystation : stats.profile.platform.code === constants.platforms.BATTLENET.code ? faBattleNet : faXbox}
            color={colors.primaryText}
            size={20}
            style={{ marginRight: constants.viewSpacing }}
          />
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
            {stats.profile.username}
          </Text>
        </View>
        <View style={globalStyles.line} />
        <Text style={styles.subtitle}>LIFETIME STATS</Text>
        <View style={[styles.statsView, globalStyles.defaultBorder]}>
          <View style={styles.statsRow}>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>MATCHES</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>WINS</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>WIN %</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.lifetime.gamesPlayed}</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.lifetime.wins}</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{(stats.lifetime.gamesPlayed === 0 ? 0 : stats.lifetime.wins/stats.lifetime.gamesPlayed*100).toFixed(2)}</Text>
            </View>
          </View>
          <View style={[styles.statsRow, {marginTop: 2*constants.viewSpacing}]}>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>KILLS</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>DEATHS</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>K/D RATIO</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.lifetime.kills}</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.lifetime.deaths}</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.lifetime.kdRatio.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.subtitle, {marginTop: constants.viewSpacing}]}>WEEKLY STATS</Text>
        <View style={[styles.statsView, {borderWidth: 1, borderColor: colors.primary}]}>
          <View style={styles.statsRow}>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>KILLS</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>DEATHS</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewSubtitle}>K/D RATIO</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.weekly.kills}</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsViewTitle}>{stats.weekly.deaths}</Text>
            </View>
            <View style={styles.statsViewSubView}>
              <Text style={styles.statsViewTitle}>
                {stats.weekly.kdRatio.toFixed(2)}
                {
                  stats.weekly.kdRatio >= stats.lifetime.kdRatio ? 
                    <FontAwesomeIcon icon={ faLongArrowAltUp } color={colors.success} /> :
                    <FontAwesomeIcon icon={ faLongArrowAltDown } color={colors.failure} />
                }
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.subtitle, {marginTop: constants.viewSpacing}]}>RECENT MATCHES</Text>
      </View>
    );
  };
  
  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle='light-content' translucent={true} backgroundColor={colors.navBarBackground} />
      {!isLoading &&
          <FlatList
            style={styles.listContainer}
            contentContainerStyle={{paddingBottom: insets.bottom+(constants.defaultPadding*2)}}
            data={recentMatches}
            extraData={isLoading}
            renderItem={renderMatchView}
            keyExtractor={match => match.id}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.white} />
            }
            ListHeaderComponent={errorStatus === 0 ? HeaderView : null}
          />
      }
      {isLoading &&
        <View style={globalStyles.loadingView}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      }
      {!isLoading && errorStatus !== 0 &&
        <View style={globalStyles.errorView}>
          <Text>
            <FontAwesomeIcon icon={ getErrorTitle() === 'Private Profile' ? faUserLock : faExclamationCircle } color={colors.primaryText} size={80} />
          </Text>
          <Text adjustsFontSizeToFit={true} numberOfLines={1} style={globalStyles.errorTitle}>{getErrorTitle()}</Text>
          {getErrorMessage()}
        </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: { 
    flex: 1,
    width: '100%',
    height: '100%',
    padding: constants.defaultPadding,
  },
  title: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: colors.primaryText,
    fontSize: 20,
  },
  statsView: {
    flex: 1,
    backgroundColor: colors.viewBackground,
    width: '100%',
    borderRadius: 4,
    marginTop: 8,
    padding: 8,
  },
  statsRow: { 
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', 
  },
  statsViewSubView: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  statsViewSubtitle: { 
    color: colors.secondaryText, 
    textAlign: 'center', 
    fontSize: width > 360 ? 16 : 12,
    fontWeight: 'bold',
  },
  statsViewTitle: { 
    color: colors.primaryText, 
    textAlign: 'center', 
    fontSize: width > 360 ? 20 : 16, 
    marginTop: 6,
    textTransform: 'uppercase',
  },
  matchDate: { 
    color: colors.secondaryText,
    textAlign: 'right', 
    fontSize: 12, 
    marginBottom: 8 
  },
  placementView: {
    alignSelf: 'flex-end',
    width: width > 360 ? 64 : 48,
    height: width > 360 ? 64 : 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    borderRadius: 4,
  },
  placementViewSuccess: {
    backgroundColor: colors.success,
  },
  placementText: {
    textAlign: 'center',
    color: colors.primaryText,
    fontSize: width > 360 ? 32 : 26,
    fontWeight: 'bold',
    padding: 4,
  }
});

export default Profile;
