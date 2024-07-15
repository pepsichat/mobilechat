import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MenuScreen from './screens/MenuScreen';
import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import NewChatScreen from './screens/NewChatScreen';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name='Menu' component={MenuScreen} />
        <Stack.Screen name='Chat' component={ChatScreen} />
        <Stack.Screen name='History' component={HistoryScreen} />
        <Stack.Screen name='LiveChat' component={NewChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
