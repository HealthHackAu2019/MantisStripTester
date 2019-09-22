import React from 'react';
import { Text, View } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import styles from '../styles';
import Toolbar from '../toolbar/Toolbar';
import Gallery from '../capture/Capture';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export default class CameraComponent extends React.Component {
  camera = null;

  state = {
    captures: [],
    capturing: null,
    hasCameraPermission: null,
    cameraType: Camera.Constants.Type.back,
    flashMode: Camera.Constants.FlashMode.off,
    cropData: {
      crop: { originX: 1350, originY: 1600, width: 250, height: 450 }
    },
    resizeData: {
      resize: { width: 25, height: 50 }
    },
    isTfReady: false,
  };

  setFlashMode = flashMode => this.setState({ flashMode });
  handleCaptureIn = () => this.setState({ capturing: true });

  handleCaptureOut = () => {
    if (this.state.capturing) this.camera.stopRecording();
  };

  handleShortCapture = async () => {
    this.state.captures.length >= 1 ? this.setState({ captures: [] }) : null;
    const photoData = await this.camera.takePictureAsync();
    await ImageManipulator.manipulateAsync(
      photoData.uri,
      [this.state.cropData, this.state.resizeData],
      { format: ImageManipulator.SaveFormat.JPEG }
    ).then(async image => {
      const asset = await MediaLibrary.createAssetAsync(image.uri);
      MediaLibrary.createAlbumAsync('MantisUi', asset)
        .then(stuff => {})
        .catch(error => {});
      this.setState({
        capturing: false,
        captures: [image, ...this.state.captures]
      });
    });
  };

  async componentDidMount() {
     // Wait for tf to be ready.
     await tf.ready();
     // Signal to the app that tensorflow.js can now be used.
     this.setState({
       isTfReady: true,
     });

    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const cameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    const hasCameraPermission =
      camera.status === 'granted' &&
      audio.status === 'granted' &&
      cameraRoll.status === 'granted';

    this.setState({ hasCameraPermission });
    console.log(this.state.isTfReady)
  }



  render() {
    const {
      hasCameraPermission,
      flashMode,
      cameraType,
      capturing,
      captures
    } = this.state;

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Access to camera has been denied.</Text>;
    }
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Access to camera has been denied.</Text>;
    }

    return (
      <React.Fragment>
        <View>
          <Camera
            type={cameraType}
            flashMode={flashMode}
            style={styles.preview}
            ref={camera => (this.camera = camera)}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            display: 'flex',
            justifyContent: 'center',
            height: 400,
            width: 50,
            padding: 20,
            top: 200,
            left: 178,
            borderRadius: 5,
            borderStyle: 'solid',
            borderColor: '#686868',
            borderWidth: 2
          }}
        />

        {captures.length > 0 && <Gallery captures={captures} />}

        <Toolbar
          capturing={capturing}
          flashMode={flashMode}
          setFlashMode={this.setFlashMode}
          onCaptureIn={this.handleCaptureIn}
          onCaptureOut={this.handleCaptureOut}
          onShortCapture={this.handleShortCapture}
        ></Toolbar>
      </React.Fragment>
    );
  }
}
