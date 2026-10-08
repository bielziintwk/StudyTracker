import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import StudyRegistrationScreen from './src/screens/StudyRegistrationScreen';
import StudiesScreen from './src/screens/StudiesScreen';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import {ThemeProvider,useTheme} from './src/theme/ThemeContext';
const Stack=createNativeStackNavigator();

export default function App(){
 return <ThemeProvider><AppNavigation/></ThemeProvider>
}

function AppNavigation(){
 const {dark}=useTheme();
 const baseTheme=dark?DarkTheme:DefaultTheme;
 const navigationTheme={...baseTheme,dark,colors:{...baseTheme.colors,primary:dark?'#818CF8':'#4F46E5',background:dark?'#0F172A':'#F8FAFC',card:dark?'#172033':'#FFFFFF',text:dark?'#F8FAFC':'#1E293B',border:dark?'#26334A':'#E2E8F0',notification:dark?'#A78BFA':'#7C3AED'}};
 return <><StatusBar style={dark?'light':'dark'} backgroundColor={dark?'#0F172A':'#F8FAFC'}/><NavigationContainer theme={navigationTheme}>
  <Stack.Navigator initialRouteName="Login"
   screenOptions={({route})=>({
    headerShown:false,
    gestureEnabled:false,
    animation:route.params?.swipeDirection==='backward'?'slide_from_left':'slide_from_right'
   })}
  >
   <Stack.Screen name="Login" component={LoginScreen}/>
   <Stack.Screen name="Register" component={RegisterScreen}/>
   <Stack.Screen name="Home" component={HomeScreen}/>
   <Stack.Screen name="Subjects" component={SubjectsScreen}/>
   <Stack.Screen name="StudyRegistration" component={StudyRegistrationScreen} options={{gestureEnabled:true}}/>
   <Stack.Screen name="Studies" component={StudiesScreen} options={{gestureEnabled:true}}/>
   <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} options={{gestureEnabled:true}}/>
   <Stack.Screen name="Calendar" component={CalendarScreen}/>
   <Stack.Screen name="Profile" component={ProfileScreen}/>
  </Stack.Navigator>
 </NavigationContainer></>
}
