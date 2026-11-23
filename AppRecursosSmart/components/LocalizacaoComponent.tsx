import React, { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';

export default function LocalizacaoComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permission, requestPermission] =
    Location.useForegroundPermissions();
  const [isLoading, setIsLoading] = useState(false);

  const obterLocalizacao = async () => {
    setIsLoading(true);

    try {
      let currentPermission = permission;

      if (!currentPermission?.granted) {
        currentPermission = await requestPermission();
      }

      if (!currentPermission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à localização para obter suas coordenadas.',
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização atual.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleIcon}>📍 </Text>
        Localização
      </Text>
      <Text style={styles.description}>
        Descubra onde você está — sem precisar perguntar ao GPS do universo!
      </Text>

      <Button
        title={isLoading ? 'Obtendo localização...' : 'Obter localização atual'}
        onPress={obterLocalizacao}
        disabled={isLoading}
      />

      {location && (
        <View style={styles.result}>
          <Text style={styles.coordinates}>
            Latitude: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Longitude: {location.coords.longitude.toFixed(6)}
          </Text>
          {location.coords.accuracy !== null && (
            <Text style={styles.detail}>
              Precisão: {location.coords.accuracy.toFixed(1)} metros
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  title: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleIcon: {
    fontSize: 20,
  },
  description: {
    marginBottom: 12,
    color: '#555555',
  },
  result: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
  },
  coordinates: {
    marginBottom: 4,
    fontSize: 16,
  },
  detail: {
    marginTop: 4,
    color: '#555555',
  },
});