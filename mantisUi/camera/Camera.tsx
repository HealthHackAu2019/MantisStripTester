import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

class CameraComponent extends Component<{}> {
  camera = null;

  state = {
    hasCameraPermission: null
  };

  async componentDidMount() {
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    const hasCameraPermission =
      camera.status === 'granted' && audio.status === 'granted';

    this.setState({ hasCameraPermission });
  }

  render(): any {
    const { hasCameraPermission } = this.state;
    console.log(hasCameraPermission, 'react');
    if (hasCameraPermission === null) {
      return (
        <View>
          <Text>Hello</Text>
        </View>
      );
    } else if (hasCameraPermission === false) {
      return <Text>Access to camera has been denied.</Text>;
    }

    return (
      <View style={{ flex: 1 }}>
        <Camera style={{ flex: 1 }} type={this.state.type}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              flexDirection: 'row'
            }}
          >
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: 'flex-end',
                alignItems: 'center'
              }}
              onPress={() => {
                this.setState({
                  type:
                    this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                });
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                {' '}
                Flip{' '}
              </Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }
}

export default CameraComponent;
