import React from 'react';
import { Text, View } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import styles from '../styles';
import Toolbar from '../toolbar/Toolbar';

export default class CameraComponent extends React.Component {
  camera = null;

  state = {
    captures: [],
    capturing: null,
    hasCameraPermission: null,
    cameraType: Camera.Constants.Type.back,
    flashMode: Camera.Constants.FlashMode.off
  };

  setFlashMode = flashMode => this.setState({ flashMode });
  setCameraType = cameraType => this.setState({ cameraType });
  handleCaptureIn = () => this.setState({ capturing: true });

  handleCaptureOut = () => {
    if (this.state.capturing) this.camera.stopRecording();
  };

  handleShortCapture = async () => {
    const photoData = await this.camera.takePictureAsync();
    this.setState({
      capturing: false,
      captures: [photoData, ...this.state.captures]
    });
  };

  async componentDidMount() {
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    const hasCameraPermission =
      camera.status === 'granted' && audio.status === 'granted';

    this.setState({ hasCameraPermission });
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
        <View style={{
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
          borderWidth: 2,

        }}/>
        <Toolbar
          capturing={capturing}
          flashMode={flashMode}
          setFlashMode={this.setFlashMode}
          setCameraType={this.setCameraType}
          onCaptureIn={this.handleCaptureIn}
          onCaptureOut={this.handleCaptureOut}
          onShortCapture={this.handleShortCapture}
        >
        </Toolbar>
      </React.Fragment>
    );
  }
}
