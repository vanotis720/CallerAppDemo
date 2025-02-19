import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import colors from './src/styles/colors';

export default function App() {
	const [user, setUser] = useState({ name: 'Vander Otis' });
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [passwordVisible, setPasswordVisible] = useState(false);

	const handleLogin = async () => {
		// 
	}

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
					<Text style={styles.buttonText}>Continuer</Text>
				</TouchableOpacity>

				{error ? <Error error={error} /> : null}

				<StatusBar style="auto" />

			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity>
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

				<View style={styles.inputContainer}>
					<TextInput
						style={styles.messageInput}
						placeholder="Tapez votre message..."
					/>
					<TouchableOpacity style={styles.sendButton}>
						<Feather name="mic" size={25} color={colors.white} />
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
		paddingHorizontal: 20,
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
	}
});
