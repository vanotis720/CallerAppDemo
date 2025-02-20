import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../styles/colors';

const TextMessageItem = ({ message, user }) => {
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
                <Text
                    style={[
                        styles.messageText,
                        { color: message.userId === user.id ? colors.white : '#000' },
                    ]}
                >
                    {message.content}
                </Text>
            </View>
            <View style={[
                styles.messageDateContainer, { alignSelf: message.userId === user.id ? 'flex-end' : 'flex-start' },
            ]}>
                <Text style={styles.messageDate}>
                    {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default TextMessageItem;

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