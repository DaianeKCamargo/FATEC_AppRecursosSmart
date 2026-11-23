import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export default function AudioComponent() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        setHasRecordingPermission(permission.granted);

        if (!permission.granted) {
          Alert.alert(
            'Permissão necessária',
            'Permita o acesso ao microfone para gravar áudio.',
          );
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch {
        Alert.alert(
          'Erro',
          'Não foi possível solicitar a permissão do microfone.',
        );
      }
    };

    requestPermission();
  }, []);

  const startRecording = async () => {
    if (!hasRecordingPermission) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso ao microfone antes de iniciar a gravação.',
      );
      return;
    }

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        Alert.alert('Erro', 'A gravação foi finalizada sem gerar um arquivo.');
        return;
      }

      setRecordingUri(uri);
      player.replace(uri);
    } catch {
      Alert.alert('Erro', 'Não foi possível finalizar a gravação.');
    }
  };

  const playRecording = () => {
    if (!recordingUri) {
      Alert.alert('Nenhuma gravação', 'Faça uma gravação antes de reproduzi-la.');
      return;
    }

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.play();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleIcon}>🎙️ </Text>
        Gravação de áudio
      </Text>
      <Text style={styles.description}>
        Solte a voz: este microfone está pronto para ouvir sua genialidade!
      </Text>
      <Button
        title={recorderState.isRecording ? 'Finalizar gravação' : 'Iniciar gravação'}
        onPress={recorderState.isRecording ? stopRecording : startRecording}
      />
      <View style={styles.buttonSpacing}>
        <Button
          title={playerStatus.playing ? 'Pausar áudio' : 'Reproduzir áudio'}
          onPress={playRecording}
          disabled={!recordingUri}
        />
      </View>
      {recordingUri && (
        <Text style={styles.status}>Gravação disponível para reprodução.</Text>
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
  buttonSpacing: {
    marginTop: 12,
  },
  status: {
    marginTop: 12,
    color: '#444444',
  },
});