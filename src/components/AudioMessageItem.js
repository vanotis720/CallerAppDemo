import { StyleSheet, Text, Touchable, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import storage from '@react-native-firebase/storage';

const AudioMessageItem = ({ message, user }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sound, setSound] = useState(null);

    const onPause = async () => {
        if (sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
        }
    }

    const onPlay = async () => {
        if (sound) {
            await sound.playAsync();
            setIsPlaying(true);
        } else {
            setIsLoading(true);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: message.content },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
            setIsLoading(false);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setSound(null);
                }
            });
        }
    }

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    return (
        <View style={[
            styles.messageItem,
            {
                alignSelf: message.userId === user.uid ? 'flex-end' : 'flex-start',
            },
        ]}>
            <View
                style={[
                    styles.message,
                    {
                        backgroundColor: message.userId === user.uid ? colors.primary : colors.gray,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={isPlaying ? onPause : onPlay}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={message.userId === user.uid ? colors.white : '#000'} />
                    ) : (
                        <MaterialIcons
                            name={isPlaying ? 'pause' : 'play-arrow'}
                            size={24}
                            color={message.userId === user.uid ? colors.white : '#000'}
                        />
                    )}
                    <View style={styles.waveform}>
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
                styles.messageDateContainer, { alignSelf: message.userId === user.uid ? 'flex-end' : 'flex-start' },
            ]}>
                <Text style={styles.messageDate}>
                    {new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {message.userId === user.uid && (
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
        backgroundColor: '#fff',
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