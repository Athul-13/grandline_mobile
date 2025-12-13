import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { borderRadius, shadows, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const MapScreen: React.FC = () => {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<MapRegion>({
    latitude: 9.9312, // Kochi fallback
    longitude: 76.2673,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<MapRegion>(region);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Showing default location: Kochi');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const coords: MapRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(coords);
        setUserLocation(coords);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not fetch location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRecenter = (): void => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion(userLocation, 1000); // smooth animation (1 sec)
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false} // we're adding our own button
        onRegionChangeComplete={(newRegion: Region) => setRegion(newRegion)}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title="You are here"
          description="Current location or Kochi fallback"
        />
      </MapView>

      {/* Floating Recenter Button */}
      <TouchableOpacity 
        style={[
          styles.recenterButton, 
          { 
            backgroundColor: theme.primary,
            ...shadows.lg,
          }
        ]} 
        onPress={handleRecenter}
      >
        <Ionicons name="locate-outline" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingBottom: 100, // Space for floating tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 140,
    right: spacing.lg,
    borderRadius: borderRadius.full,
    padding: spacing.md,
  },
});
