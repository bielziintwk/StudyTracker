import React,{useState} from 'react';
import {View,Text,StyleSheet,TextInput,Pressable,SafeAreaView,KeyboardAvoidingView,Platform,ScrollView,Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../theme/ThemeContext';
import {accountKey} from '../utils/accountStorage';

const USER_KEY='studytracker_user';
const ACCOUNTS_KEY='studytracker_accounts';
const PROFILE_KEY='studytracker_profile';
const LOGIN_KEY='studytracker_logged_in';

export default function RegisterScreen({navigation}){
 const {C}=useTheme();
 const s=styles(C);
 const [name,setName]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [showConfirm,setShowConfirm]=useState(false);
 const [loading,setLoading]=useState(false);

 const createAccount=async()=>{
   const cleanName=name.trim();
   const cleanEmail=email.trim().toLowerCase();
   if(!cleanName||!cleanEmail||!password||!confirm){
     Alert.alert('Preencha os campos','Informe todos os dados para criar sua conta.');
     return;
   }
   if(!cleanEmail.includes('@')||!cleanEmail.includes('.')){
     Alert.alert('E-mail inválido','Digite um e-mail válido.');
     return;
   }
   if(password.length<6){
     Alert.alert('Senha fraca','A senha deve ter pelo menos 6 caracteres.');
     return;
   }
   if(password!==confirm){
     Alert.alert('Senhas diferentes','A senha e a confirmação precisam ser iguais.');
     return;
   }
   setLoading(true);
   try{
     const accountsRaw=await AsyncStorage.getItem(ACCOUNTS_KEY);
     let accounts=accountsRaw?JSON.parse(accountsRaw):[];
     // Migra a conta antiga (formato de uma única conta) para a lista de contas.
     if(!accounts.length){
       const oldRaw=await AsyncStorage.getItem(USER_KEY);
       if(oldRaw){
         try{
           const oldUser=JSON.parse(oldRaw);
           if(oldUser?.email) accounts=[oldUser];
         }catch(e){}
       }
     }
     if(accounts.some(account=>String(account.email||'').toLowerCase()===cleanEmail)){
       Alert.alert('E-mail já cadastrado','Já existe uma conta com esse e-mail. Entre com ela ou use outro e-mail.');
       return;
     }
     const user={id:Date.now().toString(),name:cleanName,email:cleanEmail,password,photo:null};
     accounts.push(user);
     await AsyncStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts));
     await AsyncStorage.setItem(USER_KEY,JSON.stringify(user));
     await AsyncStorage.setItem(PROFILE_KEY,JSON.stringify({name:cleanName,email:cleanEmail,photo:null}));
     await AsyncStorage.setItem(accountKey(PROFILE_KEY,user),JSON.stringify({name:cleanName,email:cleanEmail,photo:null}));
     await AsyncStorage.setItem(LOGIN_KEY,'true');
     Alert.alert('Conta criada!','Seu cadastro foi realizado com sucesso.',[
       {text:'Continuar',onPress:()=>navigation.replace('Home')}
     ]);
   }catch(e){
     Alert.alert('Erro','Não foi possível salvar seu cadastro.');
   }finally{setLoading(false);}
 };

 return <SafeAreaView style={s.safe}>
   <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.top}>
        <View style={s.logo}><Ionicons name="book" size={28} color="#fff"/></View>
        <Text style={s.brand}>Study<Text style={{color:C.p}}>Tracker</Text></Text>
      </View>
      <Text style={s.title}>Crie sua conta</Text>
      <Text style={s.subtitle}>Comece a organizar seus estudos de forma simples e prática.</Text>

      <Field icon="person-outline" placeholder="Nome" value={name} onChangeText={setName} C={C} s={s}/>
      <Field icon="mail-outline" placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" C={C} s={s}/>
      <Field icon="lock-closed-outline" placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} C={C} s={s} right={<Pressable onPress={()=>setShowPassword(v=>!v)}><Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={C.sec}/></Pressable>}/>
      <Field icon="lock-closed-outline" placeholder="Confirmar senha" value={confirm} onChangeText={setConfirm} secureTextEntry={!showConfirm} C={C} s={s} right={<Pressable onPress={()=>setShowConfirm(v=>!v)}><Ionicons name={showConfirm?'eye-off-outline':'eye-outline'} size={20} color={C.sec}/></Pressable>}/>

      <Pressable style={({pressed})=>[s.button,pressed&&{opacity:.86}]} onPress={createAccount} disabled={loading}>
        <Text style={s.buttonText}>{loading?'Criando...':'CRIAR CONTA'}</Text>
      </Pressable>

      <View style={s.loginRow}>
        <Text style={s.loginText}>Já possui uma conta? </Text>
        <Pressable onPress={()=>navigation.navigate('Login')}><Text style={s.loginLink}>Entrar</Text></Pressable>
      </View>
    </ScrollView>
   </KeyboardAvoidingView>
 </SafeAreaView>;
}

function Field({icon,placeholder,value,onChangeText,keyboardType,autoCapitalize,secureTextEntry,right,C,s}){
 return <View style={s.field}>
   <Ionicons name={icon} size={20} color={C.sec}/>
   <TextInput style={s.input} placeholder={placeholder} placeholderTextColor={C.muted} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} secureTextEntry={secureTextEntry}/>
   {right}
 </View>;
}

function styles(C){return StyleSheet.create({
 safe:{flex:1,backgroundColor:C.bg},
 container:{flexGrow:1,padding:26,paddingTop:48,justifyContent:'center'},
 top:{alignItems:'center',marginBottom:30},
 logo:{width:64,height:64,borderRadius:20,backgroundColor:C.p,alignItems:'center',justifyContent:'center',marginBottom:12},
 brand:{fontSize:22,fontWeight:'800',color:C.text},
 title:{fontSize:28,fontWeight:'900',color:C.text,marginBottom:7},
 subtitle:{fontSize:14,lineHeight:21,color:C.sec,marginBottom:25},
 field:{height:54,borderRadius:15,backgroundColor:C.card,borderWidth:1,borderColor:C.border,flexDirection:'row',alignItems:'center',paddingHorizontal:15,marginBottom:12},
 input:{flex:1,color:C.text,fontSize:14,marginLeft:10,paddingVertical:0},
 button:{height:54,borderRadius:15,backgroundColor:C.purple,alignItems:'center',justifyContent:'center',marginTop:10,shadowColor:C.purple,shadowOpacity:.2,shadowRadius:10,shadowOffset:{width:0,height:5},elevation:4},
 buttonText:{color:'#fff',fontSize:14,fontWeight:'900',letterSpacing:.3},
 loginRow:{flexDirection:'row',justifyContent:'center',marginTop:22},
 loginText:{color:C.sec,fontSize:13},
 loginLink:{color:C.p,fontSize:13,fontWeight:'800'}
});}
