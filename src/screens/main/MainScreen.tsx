import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { DashboardScreen } from './DashboardScreen';
import { MapScreen } from './MapScreen';
import { SettingsScreen } from './SettingsScreen';
import { BottomTabBar } from '../../components/navigation/BottomTabBar';

export const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'map':
        return <MapScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        key={activeTab} 
        entering={FadeIn.duration(250)} 
        exiting={FadeOut.duration(250)} 
        style={{ flex: 1 }}
      >
        {renderActiveScreen()}
      </Animated.View>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
