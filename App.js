globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import colors from './src/styles/colors';
import TextMessageItem from './src/components/TextMessageItem';
import AudioMessageItem from './src/components/AudioMessageItem';
import Error from './src/components/Error';

const MessageItem = ({ message, user }) => {
	switch (message.type) {
		case 'text':
			return <TextMessageItem message={message} user={user} />;
		case 'audio':
			return <AudioMessageItem message={message} user={user} />;
		default:
			return null;
	}
};

const conversationId = '00ikWIu59slPWL7Ys41o';

export default function App() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// authentification state
	const [user, setUser] = useState(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordVisible, setPasswordVisible] = useState(false);

	// text message state
	const flatListRef = useRef(null);
	const [conversation, setConversation] = useState(null);
	const [textMessage, setTextMessage] = useState('');
	const [sending, setSending] = useState(false);

	// audio messaging state
	const [isRecord, setIsRecord] = useState(false);
	const [recording, setRecording] = useState(null);
	const [audioMessage, setAudioMessage] = useState(null);

	const handleLogin = async () => {
		setError(null);
		let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

		if (email === '' || password === '') {
			setError('Veuillez remplir tous les champs');
			return;
		}

		if (reg.test(email) === false) {
			setError('Adresse email invalide');
			return;
		}

		setLoading(true);
		auth()
			.signInWithEmailAndPassword(email, password)
			.then(() => {
				setUser(user);
			})
			.catch(error => {
				if (error.code === 'auth/invalid-email') {
					setError('That email address is invalid!');
				}
				else {
					setError('Nous n\'avons pas pu vous connecter, veuillez verifier vos identifiants');
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}

	const handleLogout = () => {
		auth().signOut();
	}

	const startRecording = async () => {
		try {
			setIsRecord(true);
			await Audio.requestPermissionsAsync();
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});
			const { recording } = await Audio.Recording.createAsync(
				Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
			);
			setRecording(recording);
		} catch (err) {
			setIsRecord(false);
			console.error('Failed to start recording', err);
		}
	};

	const stopRecording = async () => {
		setRecording(undefined);
		setSending(true);
		await recording.stopAndUnloadAsync();
		const uri = recording.getURI();
		setAudioMessage(uri);
		setIsRecord(false);
		const downloadURL = await uploadAudio(uri);
		if (downloadURL) {
			handleSendMessage(downloadURL);
		}
		else {
			setSending(false);
		}
	};

	const uploadAudio = async (uri) => {
		setSending(true);
		try {
			const blob = await new Promise((resolve, reject) => {
				fetch(uri)
					.then(response => response.blob())
					.then(blob => resolve(blob))
					.catch(error => {
						console.log('Error reading file:', error);
						reject(error);
					});
			});

			if (blob != null) {
				const uriParts = uri.split(".");
				const fileType = uriParts[uriParts.length - 1];

				const storageRef = storage().ref(`audio/${Date.now()}.${fileType}`);
				await storageRef.put(blob);
				const downloadURL = await storageRef.getDownloadURL();

				return downloadURL;
			}
		} catch (error) {
			console.log("Error:", error);
		}
		setSending(false);
		return null;
	};

	const handleSendMessage = async (audioURL = null) => {
		if (textMessage.trim().length === 0 && !audioURL) {
			return;
		}

		let newMessage = {
			id: Date.now(),
			userId: user.uid,
			createdAt: firestore.Timestamp.now(),
			status: 'sent',
			type: 'text',
			content: textMessage,
		};

		if (audioURL) {
			newMessage = {
				...newMessage,
				type: 'audio',
				content: audioURL,
			};
			setAudioMessage(null);
		}

		setSending(true);

		try {
			const conversationDocRef = firestore().collection('Conversations').doc(conversationId);
			await conversationDocRef.update({
				messages: firestore.FieldValue.arrayUnion(newMessage)
			});
		} catch (error) {
			console.error('Failed to send message', error);
			setError('Nous n\'avons pas pu envoyer votre message');
		}

		setTextMessage('');
		setSending(false);
	};

	// listening auth state 
	useEffect(() => {
		const subscriber = auth().onAuthStateChanged((user) => {
			if (user) {
				setUser(user);
			}
			else {
				setUser(null);
			}
			if (loading) setLoading(false);
		});
		return subscriber;
	}, []);

	// listening conversations changes
	useEffect(() => {
		if (user) {
			const subscriber = firestore()
				.collection('Conversations')
				.doc(conversationId)
				.onSnapshot(documentSnapshot => {
					const data = documentSnapshot.data();
					setConversation(data);
				}, error => {
					console.error("Error fetching conversation: ", error);
				});

			return () => subscriber();
		}
	}, [user]);

	// scroll to bottom on conversations changes
	useEffect(() => {
		if (conversation && flatListRef.current) {
			flatListRef.current.scrollToEnd({ animated: true });
		}
	}, [conversation]);




	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator color={colors.primary} size={'large'} />
				<Text style={styles.loadingText}>Chargement en cours...</Text>
				<StatusBar style="auto" />
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.authContainer}>
				<Text style={styles.authTitle}>Connectez-vous </Text>
				<Text style={styles.authSubTitle}>connextez-vous a votre compte pour retrouvez vos anciennes conversations</Text>

				<TextInput
					style={styles.input}
					placeholder="Adresse Email"
					value={email}
					onChangeText={setEmail}
					keyboardType='email-address'
					autoCapitalize='none'
					autoCorrect={false}
					autoComplete='email'
				/>

				<View style={styles.passwordInput}>
					<TextInput
						style={styles.input}
						placeholder="Mot de passe"
						value={password}
						onChangeText={setPassword}
						autoCapitalize='none'
						autoCorrect={false}
						secureTextEntry={!passwordVisible}
					/>
					<TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.passwordVisible}>
						<MaterialCommunityIcons name={passwordVisible ? 'eye-off' : 'eye'} size={25} color="#666" />
					</TouchableOpacity>
				</View>

				<TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
					<Text style={styles.buttonText}>Se connecter</Text>
				</TouchableOpacity>

				{error ? <Error error={error} /> : null}

				<StatusBar style="auto" />

			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView style={{ flex: 1 }}>
				<View style={styles.container}>
					<View style={styles.header}>
						<TouchableOpacity onPress={handleLogout}>
							<MaterialCommunityIcons name="keyboard-backspace" size={24} color={colors.white} />
						</TouchableOpacity>
						<View style={styles.userInfo}>
							<Text style={styles.userName}>Jean-Marie</Text>
							<View style={styles.userStatusSection}>
								<Octicons name="dot-fill" size={24} color="green" />
								<Text style={styles.userStatus}>En ligne</Text>
							</View>
						</View>
						<TouchableOpacity>
							<MaterialCommunityIcons name="phone" size={24} color={colors.white} />
						</TouchableOpacity>
					</View>

					<View style={styles.messagesContainer}>
						{conversation ? <FlatList
							ref={flatListRef}
							data={conversation.messages}
							keyExtractor={item => item.createdAt.toString()}
							renderItem={({ item }) => <MessageItem message={item} user={user} />}
							contentContainerStyle={{ padding: 20 }}
							style={{ marginBottom: 80 }}
						/> : null}

						<View style={styles.inputContainer}>
							<TextInput
								style={styles.messageInput}
								placeholder="Tapez votre message..."
								value={textMessage}
								onChangeText={setTextMessage}
								onEndEditing={() => handleSendMessage()}
							/>
							{
								textMessage.length ? (
									<TouchableOpacity style={styles.sendButton}
										onPress={() => handleSendMessage()}
									>
										{
											sending ? <ActivityIndicator color={colors.white} /> : <MaterialCommunityIcons name={'send'} size={30} color={colors.white} />
										}
									</TouchableOpacity>
								) : (
									<TouchableOpacity style={styles.sendButton}
										onPress={isRecord ? stopRecording : startRecording}
									>
										<MaterialCommunityIcons name={isRecord ? 'stop' : 'microphone'} size={30} color={colors.white} />
									</TouchableOpacity>
								)
							}
						</View>
					</View>
				</View>
			</SafeAreaView>
			<StatusBar style="auto" />
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: '#666',
	},
	authContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
	},
	authTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	authSubTitle: {
		fontSize: 18,
		color: '#666',
		marginTop: 10,
		textAlign: 'center',
		marginBottom: 20,
	},
	input: {
		height: 50,
		width: '100%',
		backgroundColor: colors.gray,
		marginTop: 20,
		padding: 10,
		borderRadius: 5,
	},
	passwordInput: {
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
	},
	passwordVisible: {
		position: 'absolute',
		right: 10,
		top: 32,
	},
	button: {
		height: 50,
		width: '100%',
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		marginTop: 30,
	},
	buttonText: {
		color: colors.white,
		fontWeight: '800',
	},
	header: {
		height: '15%',
		padding: 30,
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
		color: colors.white,
	},
	userInfo: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	userName: {
		fontWeight: '800',
		fontSize: 16,
		color: colors.white,
	},
	userStatusSection: {
		flexDirection: 'row',
	},
	userStatus: {
		fontWeight: '300',
		textTransform: 'lowercase',
		marginStart: 5,
		color: colors.white,
	},
	messagesContainer: {
		backgroundColor: colors.white,
		borderTopStartRadius: 30,
		borderTopEndRadius: 30,
		height: '85%',
		position: 'relative',
	},
	inputContainer: {
		position: 'absolute',
		bottom: 5,
		width: '100%',
		paddingHorizontal: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	messageInput: {
		backgroundColor: colors.gray,
		width: '80%',
		height: 50,
		borderRadius: 30,
		paddingStart: 20,
	},
	sendButton: {
		width: '17%',
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 50,
		height: 50,
	},
});
