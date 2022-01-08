import {
  Button,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import React, { useEffect, useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';

import { Camera } from 'expo-camera';
import { Surface } from 'gl-react-expo';
import { GLSL, Node, Shaders } from 'gl-react';
import 'webgltexture-loader-expo-camera';

export default function App() {
  const [status, setStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef(null);

  const shaders = Shaders.create({
    helloBlue: {
      frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float blue;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`,
    },
  });

  useEffect(() => {
    (async () => {
      /** Audio permission */
      const audioPermission = await Audio.requestPermissionsAsync();
      /** Camera permission */
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      /** Media library permission */
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();

      if (
        audioPermission.status === 'granted' &&
        cameraPermission.status === 'granted' &&
        mediaPermission.status === 'granted'
      ) {
        setStatus('granted');
      }
    })();
  }, []);

  /** Allow manual manage permissions */
  if (status !== 'granted') {
    return (
      <View style={styles.container}>
        <Text style={styles.text_wrong}>Wrong permissions</Text>
        <Button
          title="Check permissions"
          onPress={async () => {
            await Linking.openSettings();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={{ width: '100%', height: '100%' }}>
        <Node
          shader={shaders.helloBlue}
          uniforms={
            {
              // t: () => cameraRef.current,
            }
          }>
          <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef}>
            <TouchableOpacity
              style={[styles.button, recording ? styles.recording_btn : styles.default_btn]}
              onPress={async () => {
                if (!recording) {
                  setRecording(true);
                  let video = await cameraRef.current.recordAsync({ maxDuration: 30 });
                  await MediaLibrary.createAssetAsync(video.uri);
                } else {
                  setRecording(false);
                  await cameraRef.current.stopRecording();
                }
              }}
            />
          </Camera>
        </Node>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text_wrong: {
    marginBottom: 20,
  },
  button: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    backgroundColor: 'red',
    opacity: 0.3,
    position: 'absolute',
    left: Dimensions.get('window').width / 2 - 50,
    top: Dimensions.get('window').height / 2 - 50,
  },
  recording_btn: {
    borderRadius: 0,
  },
  default_btn: {
    borderRadius: 50,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
});
