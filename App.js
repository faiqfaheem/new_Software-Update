import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LanguageProvider } from './src/i18n/LanguageContext';
import SplashScreen from './src/screens/SplashScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import PermissionScreen from './src/screens/PermissionScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanAppsScreen from './src/screens/ScanAppsScreen';
import OSUpdateScreen from './src/screens/OSUpdateScreen';
import AllAppsScreen from './src/screens/AllAppsScreen';
import BulkUninstallerScreen from './src/screens/BulkUninstallerScreen';
import StorageInfoScreen from './src/screens/StorageInfoScreen';
import PermissionManagerScreen from './src/screens/PermissionManagerScreen';
import PhoneSensorScreen from './src/screens/PhoneSensorScreen';
import DisplayTestScreen from './src/screens/DisplayTestScreen';
import FlashlightTestScreen from './src/screens/FlashlightTestScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
          <Stack.Screen name="PermissionScreen" component={PermissionScreen} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ScanAppsScreen" component={ScanAppsScreen} />
          <Stack.Screen name="OSUpdateScreen" component={OSUpdateScreen} />
          <Stack.Screen name="AllAppsScreen" component={AllAppsScreen} />
          <Stack.Screen name="BulkUninstallerScreen" component={BulkUninstallerScreen} />
          <Stack.Screen name="StorageInfoScreen" component={StorageInfoScreen} />
          <Stack.Screen name="PermissionManagerScreen" component={PermissionManagerScreen} />
          <Stack.Screen name="PhoneSensorScreen" component={PhoneSensorScreen} />
          <Stack.Screen name="DisplayTestScreen" component={DisplayTestScreen} />
          <Stack.Screen name="FlashlightTestScreen" component={FlashlightTestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
};

export default App;
