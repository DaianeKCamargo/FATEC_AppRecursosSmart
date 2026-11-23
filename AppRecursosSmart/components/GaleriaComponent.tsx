import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function GaleriaComponent() {
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const openGallery = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à galeria para selecionar uma fotografia.',
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleIcon}>🖼️ </Text>
        Galeria
      </Text>
      <Text style={styles.description}>
        Escolha uma foto incrível: seu álbum merece um novo astro!
      </Text>

      {selectedUri ? (
        <View>
          <Image
            source={{ uri: selectedUri }}
            style={styles.preview}
            resizeMode="contain"
          />
          <View style={styles.buttonSpacing}>
            <Button
              title="Selecionar outra fotografia"
              onPress={openGallery}
            />
          </View>
        </View>
      ) : (
        <Button title="Abrir galeria" onPress={openGallery} />
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
  preview: {
    width: '100%',
    height: 420,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  buttonSpacing: {
    marginTop: 12,
  },
});