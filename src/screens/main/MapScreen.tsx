import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const MapScreen: React.FC = () => {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false} // we’re adding our own button
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
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Ionicons name="locate-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    backgroundColor: '#1E88E5',
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
