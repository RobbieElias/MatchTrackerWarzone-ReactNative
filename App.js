import React, { Component } from 'react';
import Home from './app/screens/Home';
import Profile from './app/screens/Profile';
import Match from './app/screens/Match';
import PlayerMatchStats from './app/screens/PlayerMatchStats';
import SBMMLobby from './app/screens/SBMMLobby';
import {
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { colors } from './app/config/colors';

enableScreens();
const Stack = createNativeStackNavigator();

class App extends Component {
  render() {
    return (
      <SafeAreaProvider style={{backgroundColor: colors.background}}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.navBarBackground,
              },
              cardStyle: { 
                backgroundColor: colors.background,
              },
              headerTintColor: colors.primaryText,
            }}
          >
            <Stack.Screen
              name='Home'
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen name='Profile' component={Profile} />
            <Stack.Screen name='Match' component={Match} options={{ title: 'Match Details' }} />
            <Stack.Screen name='PlayerMatchStats' component={PlayerMatchStats} options={{ title: 'Player Stats' }} />
            <Stack.Screen name='SBMMLobby' component={SBMMLobby} options={{ title: 'SBMMWarzone.com' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}

export default App;
