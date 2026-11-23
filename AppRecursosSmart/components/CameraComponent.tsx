import React, { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

export default function CameraComponent() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const openCamera = async () => {
    setCapturedUri(null);

    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmera para tirar fotografias.',
        );
        return;
      }
    }

    setIsCameraReady(false);
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setIsCameraReady(false);
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (picture?.uri) {
        setCapturedUri(picture.uri);
        setIsCameraOpen(false);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a fotografia.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleIcon}>📷 </Text>
        Câmera
      </Text>
      <Text style={styles.description}>
        Clique rápido, pare o tempo e capture aquele momento digníssimo!
      </Text>

      {isCameraOpen ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="picture"
            mirror={facing === 'front'}
            onCameraReady={() => setIsCameraReady(true)}
            onMountError={() => {
              Alert.alert('Erro', 'Não foi possível iniciar a câmera.');
              setIsCameraOpen(false);
            }}
          />

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFacing}
            >
              <Text style={styles.controlText}>Virar câmera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                (!isCameraReady || isCapturing) && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={!isCameraReady || isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={closeCamera}
            >
              <Text style={styles.controlText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          {capturedUri ? (
            <View>
              <Image
                source={{ uri: capturedUri }}
                style={styles.preview}
                resizeMode="contain"
              />
              <View style={styles.buttonSpacing}>
                <Button title="Tirar outra fotografia" onPress={openCamera} />
              </View>
            </View>
          ) : (
            <Button title="Abrir câmera" onPress={openCamera} />
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
  cameraContainer: {
    height: 480,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  controlButton: {
    minWidth: 86,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  controlText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
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