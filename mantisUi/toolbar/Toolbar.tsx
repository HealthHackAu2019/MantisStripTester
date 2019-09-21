import { Camera } from "expo-camera";
import React, { Component } from "react";
import { Col, Row, Grid } from "react-native-easy-grid";
import Popover from "react-native-popover-view";
import {
  View,
  TouchableWithoutFeedback,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  Button,
  StyleSheet,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles";
import iconSet from "@expo/vector-icons/build/FontAwesome5";
const { FlashMode: CameraFlashModes, Type: CameraTypes } = Camera.Constants;

class Toolbar extends Component<{
  capturing: boolean;
  flashMode: boolean;
  setFlashMode: any;
  onCaptureIn: any;
  onCaptureOut: any;
  onShortCapture: any;
}> {
  state = {
    modalVisible: false
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  render() {
    const {
      capturing = false,
      flashMode = CameraFlashModes.off,
      setFlashMode,
      onCaptureIn,
      onCaptureOut,
      onShortCapture
    } = this.props;

    return (
      <Grid style={styles.bottomToolbar}>
        {this.state.modalVisible && (
          <Row>
            <Col>
              <View>
                <Modal visible={true} transparent={true}>
                  <View
                    style={{
                      alignContent: "center",
                      marginHorizontal: 20,
                      marginTop: 100,
                      backgroundColor: "red",
                      width: 275,
                      height: 400
                    }}
                  >
                    <TouchableHighlight
                      onPress={() => {
                        this.setModalVisible(!this.state.modalVisible);
                      }}
                    >
                      <View>
                        <View
                          style={{
                            marginLeft: 5,
                            marginTop: 5
                          }}
                        >
                          <Ionicons
                            name="md-close-circle"
                            color="white"
                            size={30}
                          />
                        </View>
                        <View
                          style={{
                            marginTop: 20,
                            marginLeft: 20,
                            marginRight: 15
                          }}
                        >
                          <Text>
                            Hello Hello Hello Hello Hello Hello Hello Hello
                            Hello Hello Hello Hello Hello Hello
                          </Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                </Modal>
              </View>
            </Col>
          </Row>
        )}
        <Row>
          <Col style={styles.alignCenter}>
            <TouchableOpacity
              onPress={() =>
                setFlashMode(
                  flashMode === CameraFlashModes.on
                    ? CameraFlashModes.off
                    : CameraFlashModes.on
                )
              }
            >
              <Ionicons
                name={
                  flashMode == CameraFlashModes.on ? "md-flash" : "md-flash-off"
                }
                color="white"
                size={30}
              />
            </TouchableOpacity>
          </Col>
          <Col size={2} style={styles.alignCenter}>
            <TouchableWithoutFeedback
              onPressIn={onCaptureIn}
              onPressOut={onCaptureOut}
              onPress={onShortCapture}
            >
              <View
                style={[
                  styles.captureBtn,
                  capturing && styles.captureBtnActive
                ]}
              >
                {capturing && <View style={styles.captureBtnInternal} />}
              </View>
            </TouchableWithoutFeedback>
          </Col>
          <Col style={styles.alignCenter}></Col>
          <Col>
            <TouchableHighlight
              onPress={() => {
                this.setModalVisible(true);
              }}
            >
              <Ionicons name="md-information-circle" color="white" size={30} />
            </TouchableHighlight>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default Toolbar;
