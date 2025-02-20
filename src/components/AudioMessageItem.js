import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

const AudioMessageItem = ({ message, user }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    async function onPlayPausePress() {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(message.content);
        setSound(sound);

        console.log('Playing Sound');
        setIsPlaying(true);
        await sound.playAsync();
    }

    async function onPause() {
        console.log('Pausing Sound');
        setIsPlaying(false);
        await sound.pauseAsync();
    }

    useEffect(() => {
        if (sound) {
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    message.status = 'played';
                }
            });
        }
    }, [sound]);

    return (
        <View style={[
            styles.messageItem,
            {
                alignSelf: message.userId === user.id ? 'flex-end' : 'flex-start',
            },
        ]}>
            <View
                style={[
                    styles.message,
                    {
                        backgroundColor: message.userId === user.id ? colors.primary : colors.gray,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={isPlaying ? onPause : onPlayPausePress}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                    <MaterialIcons
                        name={isPlaying ? 'pause' : 'play-arrow'}
                        size={24}
                        color={message.userId === user.id ? colors.white : '#000'}
                    />
                    <View style={styles.waveform}>
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                        <View style={styles.waveformBar} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={[
                styles.messageDateContainer, { alignSelf: message.userId === user.id ? 'flex-end' : 'flex-start' },
            ]}>
                <Text style={styles.messageDate}>
                    {message.createdAt.toLocaleTimeString()}
                </Text>
                {message.userId === user.id && (
                    <MaterialCommunityIcons
                        name={message.status === 'read' ? 'check-all' : 'check'}
                        size={16}
                        color={message.status === 'read' ? 'green' : '#666'}
                        style={{ marginLeft: 5 }}
                    />
                )}
            </View>
        </View>
    );
}

export default AudioMessageItem;

const styles = StyleSheet.create({

    messageItem: {
        marginVertical: 10,
    },
    message: {
        backgroundColor: colors.gray,
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
        maxWidth: '70%',
    },
    messageText: {
        color: '#000',
        fontSize: 15,
    },
    waveform: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    waveformBar: {
        width: 2,
        height: 20,
        backgroundColor: '#000',
        marginHorizontal: 1,
    },
    messageDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 5,
    },
    messageDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'right',
        textTransform: 'lowercase',
    },
});