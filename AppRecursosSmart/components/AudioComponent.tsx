import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [isLooping, setIsLooping] = useState(false);

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

  useEffect(() => {
    if (isLooping && playerStatus.didJustFinish) {
      const replayRecording = async () => {
        await player.seekTo(0);
        player.play();
      };

      replayRecording();
    }
  }, [isLooping, playerStatus.didJustFinish, player]);

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

  const startPlayback = async () => {
    if (!recordingUri) {
      Alert.alert('Nenhuma gravação', 'Faça uma gravação antes de reproduzi-la.');
      return;
    }

    if (playerStatus.didJustFinish || playerStatus.currentTime >= playerStatus.duration) {
      await player.seekTo(0);
    }

    player.play();
  };

  const pausePlayback = () => {
    player.pause();
  };

  const stopPlayback = async () => {
    if (!recordingUri) {
      return;
    }

    await player.seekTo(0);
    player.pause();
  };

  const toggleLoop = () => {
    const nextValue = !isLooping;
    setIsLooping(nextValue);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress =
    playerStatus.duration > 0
      ? Math.min(playerStatus.currentTime / playerStatus.duration, 1)
      : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleIcon}>🎙️ </Text>
        Gravação de áudio
      </Text>
      <Text style={styles.description}>
        Solte a voz: este microfone está pronto para ouvir sua genialidade!
      </Text>

      <TouchableOpacity
        style={[
          styles.recordButton,
          recorderState.isRecording && styles.recordButtonActive,
        ]}
        onPress={recorderState.isRecording ? stopRecording : startRecording}
        activeOpacity={0.8}
      >
        <Text style={styles.recordIcon}>
          {recorderState.isRecording ? '■' : '●'}
        </Text>
        <Text style={styles.recordButtonText}>
          {recorderState.isRecording ? 'Finalizar gravação' : 'Iniciar gravação'}
        </Text>
      </TouchableOpacity>

      <View style={[styles.player, !recordingUri && styles.playerDisabled]}>
        <View style={styles.progressHeader}>
          <Text style={styles.timeText}>{formatTime(playerStatus.currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(playerStatus.duration)}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.playerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={stopPlayback}
            disabled={!recordingUri}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>■</Text>
          </TouchableOpacity>

          {playerStatus.playing ? (
            <TouchableOpacity
              style={[styles.playButton, styles.pauseButton]}
              onPress={pausePlayback}
              disabled={!recordingUri}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>Ⅱ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.playButton}
              onPress={startPlayback}
              disabled={!recordingUri}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.controlButton,
              isLooping && styles.controlButtonActive,
            ]}
            onPress={toggleLoop}
            disabled={!recordingUri}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.controlIcon,
                isLooping && styles.controlIconActive,
              ]}
            >
              ↻
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {recordingUri && (
        <Text style={styles.status}>
          {isLooping ? 'Gravação pronta — repetição ativada.' : 'Gravação pronta para reprodução.'}
        </Text>
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
  recordButton: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#2d75b5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#b33a3a',
  },
  recordIcon: {
    color: '#ffffff',
    fontSize: 20,
    marginRight: 8,
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  player: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#edf4fa',
  },
  playerDisabled: {
    opacity: 0.55,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  timeText: {
    color: '#555555',
    fontSize: 12,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#b9cad8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#2d75b5',
  },
  playerControls: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#d4e5f3',
  },
  controlIcon: {
    color: '#425466',
    fontSize: 20,
  },
  controlIconActive: {
    color: '#1f64a1',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginHorizontal: 18,
    backgroundColor: '#2d75b5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#ef7c32',
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  status: {
    marginTop: 12,
    color: '#444444',
  },
});