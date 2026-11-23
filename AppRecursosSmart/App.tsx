import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  type ScrollViewInstance,
} from 'react-native';

import AudioComponent from './components/AudioComponent';
import CameraComponent from './components/CameraComponent';
import GaleriaComponent from './components/GaleriaComponent';
import LocalizacaoComponent from './components/LocalizacaoComponent';

export default function App() {
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const [resetKey, setResetKey] = useState(0);

  const resetApp = () => {
    setResetKey((currentKey) => currentKey + 1);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>

      <Text style={styles.title}>
        App Recursos Smart
      </Text>
      <Text style={styles.subtitle}>
        Explorando os recursos disponíveis no ambiente smartphone.
      </Text>

      <View key={resetKey}>
        <CameraComponent />

        <GaleriaComponent />

        <LocalizacaoComponent />

        <AudioComponent />
      </View>

      <View style={styles.resetButton}>
        <Button title="Resetar" onPress={resetApp} color="#b33a3a" />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#79aed1',
    padding: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    marginTop: 32,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 32,
  },

});

