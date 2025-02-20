import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import colors from './src/styles/colors';
import TextMessageItem from './src/components/TextMessageItem';
import AudioMessageItem from './src/components/AudioMessageItem';
import { Audio } from 'expo-av';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Error from './src/components/Error';

const fakeConversation = {
	id: 1,
	userId: 1,
	messages: [
		{
			id: 1,
			userId: 1,
			content: 'Salut, comment vas-tu ?',
			createdAt: new Date(),
			status: 'sent',
			type: 'text',
		},
		{
			id: 2,
			userId: 2,
			content: 'Salut, je vais bien et toi ?',
			createdAt: new Date(),
			status: 'read',
			type: 'text',
		},
		{
			id: 3,
			userId: 1,
			content: 'Je vais bien aussi, merci.',
			createdAt: new Date(),
			status: 'read',
			type: 'text',
		},
		{
			id: 4,
			userId: 2,
			content: require('./assets/sample.wav'),
			createdAt: new Date(),
			status: 'read',
			type: 'audio',
		},
	]
};


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

export default function App() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [passwordVisible, setPasswordVisible] = useState(false);

	const [recording, setRecording] = useState();
	const [permissionResponse, requestPermission] = Audio.usePermissions();

	async function startRecording() {
		try {
			if (permissionResponse.status !== 'granted') {
				console.log('Requesting permission..');
				await requestPermission();
			}
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			console.log('Starting recording..');
			const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
			setRecording(recording);
			console.log('Recording started');
		} catch (err) {
			console.error('Failed to start recording', err);
		}
	}

	async function stopRecording() {
		console.log('Stopping recording..');
		setRecording(undefined);
		await recording.stopAndUnloadAsync();
		await Audio.setAudioModeAsync(
			{
				allowsRecordingIOS: false,
			}
		);
		const uri = recording.getURI();
		console.log('Recording stopped and stored at', uri);
	}

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
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				const user = userCredential.user;
				setUser(user);
			})
			.catch((error) => {
				const errorMessage = error.message;
				setError(errorMessage);
			})
			.finally(() => {
				setLoading(false);
			});
	}

	const handleLogout = () => {
		setUser(null);
	}

	useEffect(() => {
		setLoading(true);
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
			}
			else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

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
				<FlatList
					data={fakeConversation.messages}
					keyExtractor={item => item.id.toString()}
					renderItem={({ item }) => <MessageItem message={item} user={user} />}
					contentContainerStyle={{ padding: 20 }}
				/>

				<View style={styles.inputContainer}>
					<TextInput
						style={styles.messageInput}
						placeholder="Tapez votre message..."
					/>
					<TouchableOpacity style={styles.sendButton}
						onPress={recording ? stopRecording : startRecording}
					>
						<MaterialCommunityIcons name={recording ? 'stop' : 'microphone'} size={30} color={colors.white} />
					</TouchableOpacity>
				</View>
			</View>
			<StatusBar style="auto" />
		</View>
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
