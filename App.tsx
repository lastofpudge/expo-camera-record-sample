import {StatusBar} from 'expo-status-bar';
import {Alert, Button, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera} from 'expo-camera';
import React, {useEffect, useRef, useState} from "react";
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';

export default function App() {
    const [status, setStatus] = useState( '' );
    const [recording, setRecording] = useState( false );
    const cameraRef = useRef( null );

    useEffect( () => {
        (async () => {
            /** Audio permission */
            const audioPermission = await Audio.requestPermissionsAsync();
            if (!audioPermission.canAskAgain || audioPermission.status === "denied") {
                throw new Error(`Cannot get Audio permission`);
            }

            /** Camera permission */
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            if (!cameraPermission.canAskAgain || cameraPermission.status === "denied") {
                throw new Error(`Cannot get Camera permission`);
            }

            /** Media library permission */
            const mediaPermission = await MediaLibrary.requestPermissionsAsync();
            if (!mediaPermission.canAskAgain || mediaPermission.status === "denied") {
                throw new Error(`Cannot get MediaLibrary permissions`);
            }

            if (cameraPermission.status === 'granted' && mediaPermission.status === 'granted' && audioPermission.status === 'granted') {
                setStatus( 'granted' );
            }
        })();

    }, [] );

    /** Allow manual manage permissions */
    if (status !== 'granted') {
        return <View style={styles.container}>
            <Text style={styles.text_wrong}>Wrong permissions</Text>
            <Button title="Recheck" onPress={async () => {
                await Linking.openSettings();
            }}/>
        </View>
    }

    return (
        <View style={styles.container}>
            <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef}>
                <TouchableOpacity style={[styles.button, recording ? styles.recording_btn : styles.default_btn]}
                                  onPress={async () => {
                                      if (!recording) {
                                          setRecording( true );
                                          // @ts-ignore
                                          let video = await cameraRef.current.recordAsync( {maxDuration: 30,} );
                                          await MediaLibrary.createAssetAsync( video.uri );
                                      } else {
                                          setRecording( false );
                                          // @ts-ignore
                                          await cameraRef.current.stopRecording();
                                      }
                                  }}/>
            </Camera>
            <StatusBar style="auto"/>
        </View>
    );
}

const styles = StyleSheet.create( {
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
        opacity: .3,
        position: 'absolute',
        left: Dimensions.get( 'window' ).width / 2 - 50,
        top: Dimensions.get( 'window' ).height / 2 - 50,
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
    }
} );
