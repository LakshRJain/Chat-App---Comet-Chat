/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, TextInput, Button, Text,Alert } from 'react-native';
import Main from './Main';
import { useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const handleLogin = () => {
    if (username.trim() !== '') {
      setLoggedIn(true);
    } else {
      Alert.alert('Please enter a ');
    }
  };
  return (
      <View style={styles.container}>
        {loggedIn &&(
        <Main UID={username} onLoginFail={()=>{setLoggedIn(false)}}/>
      )}
      {!loggedIn && (
        <View style={styles.loginContainer}>
          <Text style={styles.label}>Enter Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <Button title="Login" onPress={handleLogin} />
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
    alignItems: 'center',
    paddingHorizontal:20
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
  },
});


export default App;
