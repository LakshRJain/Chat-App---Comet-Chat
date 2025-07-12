/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, TextInput, Button, Text, Alert, TouchableOpacity } from 'react-native';
import Main from './Main';
import { useState } from 'react';
import { defaultColorDark } from '@cometchat/chat-uikit-react-native/src/theme/default';
import { defaultColorLight } from '@cometchat/chat-uikit-react-native/src/theme/default';
import { defaultLightTheme } from '@cometchat/chat-uikit-react-native/src/theme/default/default';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  
  const handleLogin = () => {
    if (username.trim() !== '') {
      setLoggedIn(true);
    } else {
      Alert.alert('Please enter a username');
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? defaultColorDark.background1 : defaultColorLight.background1,
  };

  return (
    <View style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      
      {loggedIn && (
        <Main UID={username} onLoginFail={() => { setLoggedIn(false) }} />
      )}
      
      {!loggedIn && (
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <Text style={[styles.title, { color: isDarkMode ? defaultColorLight.background1 : defaultColorDark.background1 }]}>
              Welcome
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? defaultColorLight.background1 : defaultColorDark.background1 }]}>
              Please enter your username to continue
            </Text>
            
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? defaultColorDark.background4 : defaultColorLight.background4,
                  borderColor: isDarkMode ? '#444' : '#ddd',
                  color: isDarkMode ? defaultColorLight.background2 : defaultColorDark.background2,
                }
              ]}
              placeholder="Username"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TouchableOpacity 
              style={[
                styles.loginButton,
                { opacity: username.trim() ? 1 : 0.6 }
              ]} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loginCard: {
    width: '100%',
    maxWidth: 350,
    padding: 30,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  input: {
    width: '100%',
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: defaultColorDark.primaryButtonBackground,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: defaultColorDark.secondaryButtonBackground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default App;