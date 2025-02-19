import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
	const [user, setUser] = useState(null);
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
			<View style={styles.container}>
				<Text>Loading...</Text>
				<StatusBar style="auto" />
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.container}>
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
				</View>
				<StatusBar style="auto" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text>Open up App.js to start working on your app!</Text>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 20,
	},
	authContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
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
		backgroundColor: '#F2F2F2',
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
		backgroundColor: '#6B57F1',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		marginTop: 30,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '800',
	}
});
