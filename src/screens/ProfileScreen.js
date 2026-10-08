import React,{useCallback,useState} from 'react';
import {View,Text,StyleSheet,Pressable,SafeAreaView,ScrollView,Switch,Alert,Modal,TextInput,KeyboardAvoidingView,Platform,Image} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {useFocusEffect} from '@react-navigation/native';
import SwipeTabs from '../components/SwipeTabs';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';

const SESSION_KEY='studytracker_study_sessions';
const PROFILE_KEY='studytracker_profile';
const USER_KEY='studytracker_user';
const ACCOUNTS_KEY='studytracker_accounts';
const LOGIN_KEY='studytracker_logged_in';
const SUBJECTS_KEY='studytracker_subjects';
const DEFAULT_SUBJECTS=['Programação Mobile','Banco de Dados','Engenharia de Software','Projeto Integrador'];

export default function ProfileScreen({navigation}){
 const {dark,C,setDark}=useTheme();
 const s=makeStyles(C);
 const [sessions,setSessions]=useState([]);
 const [profile,setProfile]=useState({name:'Usuário',email:'Não informado',photo:null});
 const [customSubjects,setCustomSubjects]=useState([]);
 const [editOpen,setEditOpen]=useState(false);
 const [editName,setEditName]=useState('');
 const [editEmail,setEditEmail]=useState('');
 const [saving,setSaving]=useState(false);

 const load=useCallback(async()=>{
  try{
   const user=await getCurrentUser();
   if(!user){setSessions([]);return;}
   const [raw,profileRaw,subjectsRaw]=await Promise.all([
    AsyncStorage.getItem(accountKey(SESSION_KEY,user)),
    AsyncStorage.getItem(accountKey(PROFILE_KEY,user)),
    AsyncStorage.getItem(accountKey(SUBJECTS_KEY,user))
   ]);
   setSessions(raw?JSON.parse(raw):[]);
   const savedProfile=profileRaw?JSON.parse(profileRaw):{};
   const merged={name:'Usuário',email:'Não informado',photo:null,...user,...savedProfile};
   setProfile(merged);
   setCustomSubjects(subjectsRaw?JSON.parse(subjectsRaw):[]);
  }catch(e){setSessions([]);}
 },[]);
 useFocusEffect(useCallback(()=>{load();},[load]));

 const totalMinutes=sessions.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
 const disciplines=[...new Set(sessions.map(x=>x.discipline).filter(Boolean))];
 const allSubjects=[...DEFAULT_SUBJECTS,...customSubjects];
 const visibleSubjects=disciplines.length?disciplines.slice(0,5):allSubjects.slice(0,5);

 const openEdit=()=>{
  setEditName(profile.name||'');
  setEditEmail(profile.email||'');
  setEditOpen(true);
 };

 const saveProfile=async()=>{
  const name=editName.trim(), email=editEmail.trim().toLowerCase();
  if(!name||!email){Alert.alert('Preencha os campos','Informe seu nome e e-mail.');return;}
  if(!email.includes('@')||!email.includes('.')){Alert.alert('E-mail inválido','Digite um e-mail válido.');return;}
  setSaving(true);
  try{
   const raw=await AsyncStorage.getItem(USER_KEY);
   const user=raw?JSON.parse(raw):{};
   const updatedUser={...user,name,email,photo:profile.photo||user.photo||null};
   const accountsRaw=await AsyncStorage.getItem(ACCOUNTS_KEY);
   let accounts=accountsRaw?JSON.parse(accountsRaw):[];
   const currentEmail=String(user.email||profile.email||'').toLowerCase();
   const idx=accounts.findIndex(account=>String(account.id||'')===String(user.id||'') || String(account.email||'').toLowerCase()===currentEmail);
   if(idx>=0){
     accounts[idx]=updatedUser;
   }else if(updatedUser.email){
     accounts.push(updatedUser);
   }
   await AsyncStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts));
   await AsyncStorage.setItem(USER_KEY,JSON.stringify(updatedUser));
   const updatedProfile={name,email,photo:updatedUser.photo||null};
   await AsyncStorage.setItem(accountKey(PROFILE_KEY,updatedUser),JSON.stringify(updatedProfile));
   setProfile({...profile,name,email,photo:updatedProfile.photo});
   setEditOpen(false);
   Alert.alert('Perfil atualizado','Seus dados foram salvos com sucesso.');
  }catch(e){Alert.alert('Erro','Não foi possível atualizar o perfil.');}
  finally{setSaving(false);}
 };

 const pickPhoto=async()=>{
  try{
   const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
   if(!permission.granted){
    Alert.alert('Permissão necessária','Permita o acesso às fotos para escolher uma imagem de perfil.');
    return;
   }
   const result=await ImagePicker.launchImageLibraryAsync({
    mediaTypes:['images'],
    allowsEditing:true,
    aspect:[1,1],
    quality:.8
   });
   if(result.canceled||!result.assets?.length)return;
   const uri=result.assets[0].uri;
   const raw=await AsyncStorage.getItem(USER_KEY);
   const user=raw?JSON.parse(raw):{};
   const updatedUser={...user,photo:uri};
   const accountsRaw=await AsyncStorage.getItem(ACCOUNTS_KEY);
   const accounts=accountsRaw?JSON.parse(accountsRaw):[];
   const currentEmail=String(user.email||profile.email||'').toLowerCase();
   const idx=accounts.findIndex(account=>String(account.id||'')===String(user.id||'') || String(account.email||'').toLowerCase()===currentEmail);
   if(idx>=0) accounts[idx]=updatedUser;
   await AsyncStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts));
   const updatedProfile={...profile,photo:uri};
   await AsyncStorage.setItem(USER_KEY,JSON.stringify(updatedUser));
   await AsyncStorage.setItem(accountKey(PROFILE_KEY,updatedUser),JSON.stringify(updatedProfile));
   setProfile(updatedProfile);
  }catch(e){Alert.alert('Erro','Não foi possível escolher a foto.');}
 };

 const removePhoto=async()=>{
  try{
   const raw=await AsyncStorage.getItem(USER_KEY);
   const user=raw?JSON.parse(raw):{};
   const updatedUser={...user,photo:null};
   const accountsRaw=await AsyncStorage.getItem(ACCOUNTS_KEY);
   const accounts=accountsRaw?JSON.parse(accountsRaw):[];
   const currentEmail=String(user.email||profile.email||'').toLowerCase();
   const idx=accounts.findIndex(account=>String(account.id||'')===String(user.id||'') || String(account.email||'').toLowerCase()===currentEmail);
   if(idx>=0) accounts[idx]=updatedUser;
   await AsyncStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts));
   const updatedProfile={...profile,photo:null};
   await AsyncStorage.setItem(USER_KEY,JSON.stringify(updatedUser));
   await AsyncStorage.setItem(accountKey(PROFILE_KEY,updatedUser),JSON.stringify(updatedProfile));
   setProfile(updatedProfile);
  }catch(e){Alert.alert('Erro','Não foi possível remover a foto.');}
 };

 const changePhoto=()=>Alert.alert('Foto de perfil','Escolha uma opção.',[
  {text:'Escolher da galeria',onPress:pickPhoto},
  ...(profile.photo?[{text:'Remover foto',style:'destructive',onPress:removePhoto}]:[]),
  {text:'Cancelar',style:'cancel'}
 ]);

 const clearData=()=>Alert.alert('Limpar dados dos estudos','Isso vai apagar todos os registros de estudos. Esta ação não pode ser desfeita.',[
  {text:'Cancelar',style:'cancel'},
  {text:'Apagar tudo',style:'destructive',onPress:async()=>{{const user=await getCurrentUser();if(user) await AsyncStorage.removeItem(accountKey(SESSION_KEY,user));setSessions([]);}}}
 ]);

 const logout=()=>Alert.alert('Sair da conta','Deseja realmente sair da sua conta?',[
  {text:'Cancelar',style:'cancel'},
  {text:'Sair',style:'destructive',onPress:async()=>{
    await AsyncStorage.setItem(LOGIN_KEY,'false');
    navigation.replace('Login');
  }}
 ]);

 const showSoon=(title,message)=>Alert.alert(title,message);
 return <SwipeTabs navigation={navigation} current="Profile"><SafeAreaView style={[s.safe,{backgroundColor:C.bg}]}>
  <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
   <View style={s.header}><Text style={[s.title,{color:C.text}]}>Perfil</Text><Pressable style={[s.settingsButton,{backgroundColor:C.card}]} onPress={()=>showSoon('Configurações','As opções de configuração do StudyTracker serão adicionadas aqui.') }><Ionicons name="settings-outline" size={21} color={C.text}/></Pressable></View>
   <View style={s.profileRow}>
    <Pressable onPress={changePhoto} style={[s.avatar,{backgroundColor:dark?'#5B4BB7':'#DDD6FE'}]}>
      {profile.photo?<Image source={{uri:profile.photo}} style={s.avatarImage}/>:<Ionicons name="person" size={38} color={C.purple}/>}
      <View style={[s.camera,{backgroundColor:C.purple,borderColor:C.bg}]}><Ionicons name="camera" size={12} color="#fff"/></View>
    </Pressable>
    <View style={s.profileInfo}><Text style={[s.name,{color:C.text}]}>{profile.name}</Text><Text style={[s.email,{color:C.sec}]}>{profile.email}</Text><Pressable onPress={openEdit}><Text style={[s.editLink,{color:C.p}]}>Editar perfil</Text></Pressable></View>
   </View>

   <View style={s.statsGrid}>
    <Stat icon="book-outline" label="Disciplinas cadastradas" value={allSubjects.length} C={C}/>
    <Stat icon="time-outline" label="Total de horas estudadas" value={formatMinutes(totalMinutes)} C={C}/>
    <Stat icon="bar-chart-outline" label="Estudos realizados" value={sessions.length} C={C}/>
    <Stat icon="radio-button-on-outline" label="Meta diária" value="3h" C={C} accent/>
   </View>

   <View style={s.sectionHeader}><Text style={[s.sectionTitle,{color:C.text}]}>Minhas disciplinas</Text><Pressable onPress={()=>navigation.navigate('Subjects')}><Text style={[s.seeAll,{color:C.p}]}>Ver todas</Text></Pressable></View>
   <View style={s.chips}>{visibleSubjects.map((subject,i)=><View key={subject} style={[s.chip,{backgroundColor:chipColors[i%chipColors.length]}]}><Text style={s.chipText}>{subject}</Text></View>)}</View>

   <View style={[s.menu,{backgroundColor:C.card,borderColor:C.border}]}>
    <MenuRow C={C} icon="moon-outline" title="Modo escuro" subtitle="Altera o tema do aplicativo" right={<Switch value={dark} onValueChange={setDark} trackColor={{false:'#CBD5E1',true:C.p}} thumbColor="#fff"/>}/>
    <MenuRow C={C} icon="notifications-outline" title="Lembretes" onPress={()=>showSoon('Lembretes','A área de lembretes será usada para organizar horários de estudo por disciplina.')} />
    <MenuRow C={C} icon="settings-outline" title="Configurações" onPress={()=>showSoon('Configurações','As configurações gerais do StudyTracker serão adicionadas aqui.')} />
    <MenuRow C={C} icon="trash-outline" title="Limpar dados dos estudos" onPress={clearData} danger />
    <MenuRow C={C} icon="log-out-outline" title="Sair da conta" subtitle="Encerrar a sessão atual" onPress={logout} danger />
    <MenuRow C={C} icon="information-circle-outline" title="Sobre o StudyTracker" onPress={()=>showSoon('Sobre o StudyTracker','StudyTracker\nSeu progresso, no seu ritmo.\nVersão 1.0.0')} last />
   </View>
   <View style={s.footer}><Text style={[s.footerTitle,{color:C.purple}]}>StudyTracker</Text><Text style={[s.footerText,{color:C.sec}]}>Seu progresso, no seu ritmo.</Text></View>
  </ScrollView>

  <Modal visible={editOpen} transparent animationType="fade" onRequestClose={()=>setEditOpen(false)}>
   <View style={s.modalOverlay}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.modalKeyboard}>
     <View style={[s.modalCard,{backgroundColor:C.card}]}>
      <View style={s.modalHeader}><Text style={[s.modalTitle,{color:C.text}]}>Editar perfil</Text><Pressable onPress={()=>setEditOpen(false)}><Ionicons name="close" size={24} color={C.sec}/></Pressable></View>
      <Pressable onPress={changePhoto} style={[s.editAvatar,{backgroundColor:dark?'#5B4BB7':'#DDD6FE'}]}>
       {profile.photo?<Image source={{uri:profile.photo}} style={s.editAvatarImage}/>:<Ionicons name="person" size={34} color={C.purple}/>}
       <View style={[s.camera,{backgroundColor:C.purple,borderColor:C.card}]}><Ionicons name="camera" size={12} color="#fff"/></View>
      </Pressable>
      <Text style={[s.photoHint,{color:C.sec}]}>Toque na foto para alterar</Text>
      <Text style={[s.inputLabel,{color:C.text}]}>Nome</Text>
      <View style={[s.inputBox,{borderColor:C.border,backgroundColor:C.bg}]}><Ionicons name="person-outline" size={19} color={C.sec}/><TextInput style={[s.input,{color:C.text}]} value={editName} onChangeText={setEditName} placeholder="Seu nome" placeholderTextColor={C.muted}/></View>
      <Text style={[s.inputLabel,{color:C.text}]}>E-mail</Text>
      <View style={[s.inputBox,{borderColor:C.border,backgroundColor:C.bg}]}><Ionicons name="mail-outline" size={19} color={C.sec}/><TextInput style={[s.input,{color:C.text}]} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Seu e-mail" placeholderTextColor={C.muted}/></View>
      <Pressable disabled={saving} onPress={saveProfile} style={({pressed})=>[s.saveButton,{opacity:saving?.6:pressed?.86:1}]}><Text style={s.saveButtonText}>{saving?'Salvando...':'SALVAR ALTERAÇÕES'}</Text></Pressable>
     </View>
    </KeyboardAvoidingView>
   </View>
  </Modal>

  <View style={[s.nav,{backgroundColor:C.card,borderTopColor:C.border}]}>
   <Nav icon="home-outline" label="Início" onPress={()=>navigation.navigate('Home')} C={C}/>
   <Nav icon="book-outline" label="Disciplinas" onPress={()=>navigation.navigate('Subjects')} C={C}/>
   <Nav icon="calendar-outline" label="Calendário" onPress={()=>navigation.navigate('Calendar')} C={C}/>
   <Nav icon="person" label="Perfil" active C={C}/>
  </View>
 </SafeAreaView></SwipeTabs>
}

function Stat({icon,label,value,C,accent}){const s=makeStyles(C);return <View style={[s.stat,{backgroundColor:C.card,borderColor:C.border}]}><Ionicons name={icon} size={20} color={accent?C.purple:C.p}/><Text style={[s.statLabel,{color:C.sec}]}>{label}</Text><Text style={[s.statValue,{color:C.text}]}>{value}</Text></View>}
function MenuRow({C,icon,title,subtitle,onPress,right,danger,last}){const s=makeStyles(C);return <Pressable disabled={!onPress} onPress={onPress} style={[s.menuRow,!last&&{borderBottomWidth:1,borderBottomColor:C.border}]}><Ionicons name={icon} size={21} color={danger?'#EF4444':C.text}/><View style={s.menuInfo}><Text style={[s.menuTitle,{color:danger?'#EF4444':C.text}]}>{title}</Text>{subtitle&&<Text style={[s.menuSubtitle,{color:C.sec}]}>{subtitle}</Text>}</View>{right||<Ionicons name="chevron-forward" size={19} color={C.sec}/>}</Pressable>}
function Nav({icon,label,active,onPress,C}){const s=makeStyles(C);return <Pressable style={s.navItem} onPress={onPress}><Ionicons name={icon} size={22} color={active?C.p:C.muted}/><Text style={[s.navLabel,{color:active?C.p:C.muted}]}>{label}</Text></Pressable>}
function formatMinutes(minutes){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m}min`;if(!m)return `${h}h`;return `${h}h ${m}min`;}
const chipColors=['#EDE9FE','#FCE7F3','#DBEAFE','#FEF3C7','#DCFCE7'];
function makeStyles(C){return StyleSheet.create({
 safe:{flex:1},
 container:{padding:24,paddingBottom:105},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
 title:{fontSize:25,fontWeight:'800'},
 settingsButton:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'},
 profileRow:{flexDirection:'row',alignItems:'center',marginBottom:22},
 avatar:{width:82,height:82,borderRadius:41,alignItems:'center',justifyContent:'center',position:'relative',marginRight:16,overflow:'visible'},
 avatarImage:{width:82,height:82,borderRadius:41},
 camera:{position:'absolute',right:-1,bottom:0,width:25,height:25,borderRadius:13,borderWidth:3,alignItems:'center',justifyContent:'center'},
 profileInfo:{flex:1},
 name:{fontSize:19,fontWeight:'800'},
 email:{fontSize:12,marginTop:4},
 editLink:{fontSize:12,fontWeight:'700',marginTop:8},
 statsGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginBottom:25},
 stat:{width:'48.5%',minHeight:112,borderRadius:15,borderWidth:1,padding:13,marginBottom:10},
 statLabel:{fontSize:11,marginTop:7,lineHeight:15},
 statValue:{fontSize:21,fontWeight:'800',marginTop:3},
 sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:11},
 sectionTitle:{fontSize:17,fontWeight:'800'},
 seeAll:{fontSize:12,fontWeight:'700'},
 chips:{flexDirection:'row',flexWrap:'wrap',marginBottom:22},
 chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:16,marginRight:7,marginBottom:7},
 chipText:{fontSize:11,color:'#334155',fontWeight:'700'},
 menu:{borderRadius:16,borderWidth:1,overflow:'hidden'},
 menuRow:{minHeight:58,flexDirection:'row',alignItems:'center',paddingHorizontal:15},
 menuInfo:{flex:1,marginLeft:12},
 menuTitle:{fontSize:13,fontWeight:'700'},
 menuSubtitle:{fontSize:10,marginTop:2},
 footer:{alignItems:'center',paddingVertical:24},
 footerTitle:{fontSize:18,fontWeight:'900'},
 footerText:{fontSize:11,marginTop:3},
 nav:{position:'absolute',bottom:0,left:0,right:0,height:76,borderTopWidth:1,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},
 navItem:{alignItems:'center',justifyContent:'center',minWidth:65},
 navLabel:{fontSize:10,marginTop:3,fontWeight:'600'},
 modalOverlay:{flex:1,backgroundColor:'rgba(15,23,42,.55)',justifyContent:'flex-end'},
 modalKeyboard:{width:'100%'},
 modalCard:{borderTopLeftRadius:26,borderTopRightRadius:26,padding:22,paddingBottom:30},
 modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
 modalTitle:{fontSize:21,fontWeight:'900'},
 editAvatar:{width:78,height:78,borderRadius:39,alignSelf:'center',alignItems:'center',justifyContent:'center',position:'relative',marginBottom:5},
 editAvatarImage:{width:78,height:78,borderRadius:39},
 photoHint:{fontSize:11,textAlign:'center',marginBottom:17},
 inputLabel:{fontSize:12,fontWeight:'800',marginBottom:6,marginTop:7},
 inputBox:{height:52,borderRadius:14,borderWidth:1,flexDirection:'row',alignItems:'center',paddingHorizontal:13},
 input:{flex:1,fontSize:14,marginLeft:9},
 saveButton:{height:52,borderRadius:14,backgroundColor:C.purple,alignItems:'center',justifyContent:'center',marginTop:18},
 saveButtonText:{color:'#fff',fontSize:13,fontWeight:'900'}
});}
