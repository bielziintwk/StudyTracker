import React,{useState} from 'react';
import {View,Text,StyleSheet,TextInput,Pressable,SafeAreaView,KeyboardAvoidingView,Platform,ScrollView,Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../theme/ThemeContext';
import {accountKey, migrateLegacyData} from '../utils/accountStorage';

const USER_KEY='studytracker_user';
const ACCOUNTS_KEY='studytracker_accounts';
const LOGIN_KEY='studytracker_logged_in';
const PROFILE_KEY='studytracker_profile';

export default function LoginScreen({navigation}){
 const {C}=useTheme(); const s=styles(C);
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false);
 const login=async()=>{
   try{
    const normalizedEmail=email.trim().toLowerCase();
    const accountsRaw=await AsyncStorage.getItem(ACCOUNTS_KEY);
    let accounts=accountsRaw?JSON.parse(accountsRaw):[];
    // Compatibilidade com a versão antiga, que armazenava apenas uma conta.
    if(!accounts.length){
      const raw=await AsyncStorage.getItem(USER_KEY);
      if(raw){
        try{
          const oldUser=JSON.parse(raw);
          if(oldUser?.email) accounts=[oldUser];
        }catch(e){}
      }
    }
    const user=accounts.find(account=>String(account.email||'').toLowerCase()===normalizedEmail && account.password===password);
    if(!user){Alert.alert('Dados incorretos','Confira seu e-mail e sua senha.');return;}
    await AsyncStorage.setItem(USER_KEY,JSON.stringify(user));
    if(accounts.length===1) await migrateLegacyData(user);
    await AsyncStorage.setItem(accountKey(PROFILE_KEY,user),JSON.stringify({name:user.name,email:user.email,photo:user.photo||null}));
    await AsyncStorage.setItem(LOGIN_KEY,'true');
    navigation.replace('Home');
   }catch(e){Alert.alert('Erro','Não foi possível entrar.');}
 };
 return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
   <View style={s.top}><View style={s.logo}><Ionicons name="book" size={28} color="#fff"/></View><Text style={s.brand}>Study<Text style={{color:C.p}}>Tracker</Text></Text></View>
   <Text style={s.title}>Bem-vindo de volta!</Text><Text style={s.subtitle}>Entre para continuar acompanhando seus estudos.</Text>
   <Field icon="mail-outline" placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" C={C} s={s}/>
   <Field icon="lock-closed-outline" placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={!show} C={C} s={s} right={<Pressable onPress={()=>setShow(v=>!v)}><Ionicons name={show?'eye-off-outline':'eye-outline'} size={20} color={C.sec}/></Pressable>}/>
   <Pressable style={({pressed})=>[s.button,pressed&&{opacity:.86}]} onPress={login}><Text style={s.buttonText}>ENTRAR</Text></Pressable>
   <View style={s.row}><Text style={s.text}>Ainda não possui uma conta? </Text><Pressable onPress={()=>navigation.navigate('Register')}><Text style={s.link}>Criar conta</Text></Pressable></View>
 </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
function Field({icon,placeholder,value,onChangeText,keyboardType,autoCapitalize,secureTextEntry,right,C,s}){
 return <View style={s.field}><Ionicons name={icon} size={20} color={C.sec}/><TextInput style={s.input} placeholder={placeholder} placeholderTextColor={C.muted} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} secureTextEntry={secureTextEntry}/>{right}</View>;
}
function styles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{flexGrow:1,padding:26,paddingTop:48,justifyContent:'center'},top:{alignItems:'center',marginBottom:30},logo:{width:64,height:64,borderRadius:20,backgroundColor:C.p,alignItems:'center',justifyContent:'center',marginBottom:12},brand:{fontSize:22,fontWeight:'800',color:C.text},title:{fontSize:28,fontWeight:'900',color:C.text,marginBottom:7},subtitle:{fontSize:14,lineHeight:21,color:C.sec,marginBottom:25},field:{height:54,borderRadius:15,backgroundColor:C.card,borderWidth:1,borderColor:C.border,flexDirection:'row',alignItems:'center',paddingHorizontal:15,marginBottom:12},input:{flex:1,color:C.text,fontSize:14,marginLeft:10,paddingVertical:0},button:{height:54,borderRadius:15,backgroundColor:C.purple,alignItems:'center',justifyContent:'center',marginTop:10},buttonText:{color:'#fff',fontSize:14,fontWeight:'900',letterSpacing:.3},row:{flexDirection:'row',justifyContent:'center',marginTop:22},text:{color:C.sec,fontSize:13},link:{color:C.p,fontSize:13,fontWeight:'800'}});}
