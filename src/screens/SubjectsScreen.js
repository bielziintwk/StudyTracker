import React,{useCallback,useState} from 'react';
import {View,Text,StyleSheet,TextInput,Pressable,FlatList,SafeAreaView,Modal,Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import SwipeTabs from '../components/SwipeTabs';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';
const STORAGE_KEY='studytracker_study_sessions';
const SUBJECTS_KEY='studytracker_subjects';
const DEFAULT_SUBJECTS=[
  {name:'Programação Mobile',info:'React Native',goal:360},
  {name:'Banco de Dados',info:'SQL e modelagem',goal:360},
  {name:'Engenharia de Software',info:'Requisitos e diagramas',goal:360},
  {name:'Projeto Integrador',info:'Desenvolvimento do projeto',goal:360},
];
const normalizeSubjects=(raw)=>{
  if(!raw) return DEFAULT_SUBJECTS;
  const parsed=JSON.parse(raw);
  if(!Array.isArray(parsed)) return DEFAULT_SUBJECTS;
  const saved=parsed.map(x=>typeof x==='string'?{name:x,info:'Disciplina cadastrada',goal:360}:{...x,goal:Number(x.goal)||360});
  const names=new Set(saved.map(x=>x.name.toLowerCase()));
  return [...DEFAULT_SUBJECTS.filter(x=>!names.has(x.name.toLowerCase())),...saved];
};
export default function SubjectsScreen({navigation}){
 const {C}=useTheme(); const s=makeStyles(C);
 const [sessions,setSessions]=useState([]); const [subjects,setSubjects]=useState(DEFAULT_SUBJECTS); const [search,setSearch]=useState('');
 const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null); const [name,setName]=useState(''); const [goal,setGoal]=useState('6h');
 const load=useCallback(async()=>{try{const user=await getCurrentUser(); if(!user){setSessions([]);setSubjects(DEFAULT_SUBJECTS);return;} const [raw,subjectsRaw]=await Promise.all([AsyncStorage.getItem(accountKey(STORAGE_KEY,user)),AsyncStorage.getItem(accountKey(SUBJECTS_KEY,user))]);setSessions(raw?JSON.parse(raw):[]);setSubjects(normalizeSubjects(subjectsRaw));}catch(e){setSessions([]);setSubjects(DEFAULT_SUBJECTS);}},[]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const data=subjects.map(subject=>{const own=sessions.filter(x=>x.discipline===subject.name);const minutes=own.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);return {...subject,minutes,count:own.length};}).filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
 const openAdd=()=>{setEditing(null);setName('');setGoal('6h');setModal(true);};
 const openEdit=(item)=>{setEditing(item);setName(item.name);setGoal(formatMinutesInput(item.goal));setModal(true);};
 const saveSubject=async()=>{
   const cleanName=name.trim(); const goalMinutes=parseGoal(goal);
   if(!cleanName){Alert.alert('Nome obrigatório','Digite o nome da disciplina.');return;}
   if(!goalMinutes){Alert.alert('Meta inválida','Informe uma meta como 6h, 4h30 ou 360min.');return;}
   const duplicate=subjects.some(x=>x.name.toLowerCase()===cleanName.toLowerCase() && x.name.toLowerCase()!==editing?.name?.toLowerCase());
   if(duplicate){Alert.alert('Disciplina já cadastrada','Essa disciplina já existe no StudyTracker.');return;}
   const next=editing
     ? subjects.map(x=>x.name===editing.name?{...x,name:cleanName,goal:goalMinutes}:x)
     : [...subjects,{name:cleanName,info:'Disciplina cadastrada',goal:goalMinutes}];
   const user=await getCurrentUser();
   if(editing && editing.name!==cleanName){
     const rawSessions=await AsyncStorage.getItem(user?accountKey(STORAGE_KEY,user):STORAGE_KEY);
     const savedSessions=rawSessions?JSON.parse(rawSessions):[];
     const renamed=savedSessions.map(x=>x.discipline===editing.name?{...x,discipline:cleanName}:x);
     if(user) await AsyncStorage.setItem(accountKey(STORAGE_KEY,user),JSON.stringify(renamed));
     setSessions(renamed);
   }
   if(user) await AsyncStorage.setItem(accountKey(SUBJECTS_KEY,user),JSON.stringify(next));
   setSubjects(next); setModal(false);
   Alert.alert(editing?'Disciplina atualizada!':'Disciplina cadastrada!',editing?'A meta e os dados da disciplina foram atualizados.':`${cleanName} foi adicionada às suas disciplinas.`);
 };
 return <SwipeTabs navigation={navigation} current="Subjects"><SafeAreaView style={s.safe}>
   <View style={s.container}>
    <View style={s.header}><View><Text style={s.title}>Minhas disciplinas</Text><Text style={s.subtitle}>Acompanhe seu progresso</Text></View><Pressable style={s.history} onPress={()=>navigation.navigate('Studies')}><Ionicons name="time-outline" size={21} color={C.text}/></Pressable></View>
    <View style={s.search}><Ionicons name="search-outline" size={20} color={C.sec}/><TextInput value={search} onChangeText={setSearch} placeholder="Pesquisar disciplina..." placeholderTextColor="#94A3B8" style={s.input}/></View>
    <FlatList data={data} keyExtractor={x=>x.name} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:100}} renderItem={({item})=><Subject item={item} onPress={()=>navigation.navigate('SubjectDetail',{discipline:item.name})} onEdit={()=>openEdit(item)}/>} ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>Nenhuma disciplina encontrada.</Text></View>}/>
   </View>
   <Pressable style={s.add} onPress={openAdd}><Ionicons name="add" size={25} color="#fff"/></Pressable>
   <Modal visible={modal} transparent animationType="fade" onRequestClose={()=>setModal(false)}>
    <View style={s.overlay}><View style={s.modalCard}>
      <View style={s.modalHeader}><View><Text style={s.modalTitle}>{editing?'Editar disciplina':'Nova disciplina'}</Text><Text style={s.modalSubtitle}>{editing?'Altere o nome e defina a nova meta.':'Cadastre uma disciplina e escolha sua própria meta de estudo.'}</Text></View><Pressable onPress={()=>setModal(false)}><Ionicons name="close" size={23} color={C.text}/></Pressable></View>
      <Text style={s.modalLabel}>Nome da disciplina</Text><View style={s.modalInput}><Ionicons name="book-outline" size={19} color={C.sec}/><TextInput value={name} onChangeText={setName} placeholder="Ex.: Cálculo" placeholderTextColor="#94A3B8" style={s.modalTextInput} autoFocus={!editing}/></View>
      <Text style={s.modalLabel}>Meta de estudo</Text><View style={s.modalInput}><Ionicons name="flag-outline" size={19} color={C.sec}/><TextInput value={goal} onChangeText={setGoal} placeholder="Ex.: 6h ou 360min" placeholderTextColor="#94A3B8" style={s.modalTextInput}/></View>
      <Text style={s.hint}>Você pode definir a meta que quiser para essa disciplina.</Text>
      <Pressable style={s.modalSave} onPress={saveSubject}><Ionicons name={editing?'save-outline':'checkmark-circle-outline'} size={20} color="#fff"/><Text style={s.modalSaveText}>{editing?'Salvar alterações':'Cadastrar disciplina'}</Text></Pressable>
    </View></View>
   </Modal>
   <View style={s.nav}><Nav icon="home-outline" label="Início" onPress={()=>navigation.navigate('Home')}/><Nav icon="book" label="Disciplinas" active/><Nav icon="calendar-outline" label="Calendário" onPress={()=>navigation.navigate('Calendar')}/><Nav icon="person-outline" label="Perfil" onPress={()=>navigation.navigate('Profile')}/></View>
 </SafeAreaView></SwipeTabs>
}
function Subject({item,onPress,onEdit}){const {C}=useTheme();const s=makeStyles(C);const percent=Math.min(100,Math.round((item.minutes/item.goal)*100));return <Pressable style={s.card} onPress={onPress}>
 <View style={s.cardTop}><View style={s.icon}><Ionicons name="book-outline" size={22} color={C.p}/></View><View style={s.info}><Text style={s.name}>{item.name}</Text><Text style={s.teacher}>{item.info} • Meta {formatMinutes(item.goal)}</Text></View><Pressable style={s.editButton} onPress={(e)=>{e.stopPropagation?.();onEdit();}}><Ionicons name="create-outline" size={18} color={C.p}/></Pressable><Ionicons name="chevron-forward" size={20} color="#94A3B8"/></View>
 <View style={s.timeRow}><View style={s.time}><Ionicons name="time-outline" size={15} color={C.sec}/><Text style={s.timeText}>{formatMinutes(item.minutes)} estudadas</Text></View><Text style={s.percent}>{percent}%</Text></View><View style={s.track}><View style={[s.fill,{width:`${percent}%`}]}/></View><View style={s.detailRow}><Text style={s.sessionCount}>{item.count} {item.count===1?'sessão registrada':'sessões registradas'}</Text><Text style={s.remaining}>{item.minutes>=item.goal?'Meta atingida':`Faltam ${formatMinutes(item.goal-item.minutes)}`}</Text></View>
 </Pressable>}
function parseGoal(value){const v=value.trim().toLowerCase().replace(/,/g,'.');if(!v)return 0;let m=v.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(?:e|\+)?\s*(\d+)\s*min)?$/);if(m)return Math.round(Number(m[1])*60+(Number(m[2])||0));m=v.match(/^(\d+(?:\.\d+)?)\s*min$/);if(m)return Math.round(Number(m[1]));if(/^\d+$/.test(v))return Number(v);return 0;}
function formatMinutesInput(minutes){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m}min`;if(!m)return `${h}h`;return `${h}h ${m}min`;}
function formatMinutes(minutes){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m}min`;if(!m)return `${h}h`;return `${h}h ${m}min`;}
function Nav({icon,label,active,onPress}){const {C}=useTheme();const s=makeStyles(C);return <Pressable style={s.navItem} onPress={onPress}><Ionicons name={icon} size={22} color={active?C.p:C.muted}/><Text style={[s.navLabel,active&&{color:C.p}]}>{label}</Text></Pressable>}
function makeStyles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{flex:1,paddingHorizontal:24,paddingTop:20},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:19},title:{fontSize:24,fontWeight:'800',color:C.text},subtitle:{fontSize:13,color:C.sec,marginTop:4},history:{width:40,height:40,borderRadius:20,backgroundColor:C.card,alignItems:'center',justifyContent:'center'},search:{height:48,backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:13,flexDirection:'row',alignItems:'center',paddingHorizontal:13,marginBottom:16},input:{flex:1,marginLeft:8,color:C.text,fontSize:13},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:16,padding:15,marginBottom:12},cardTop:{flexDirection:'row',alignItems:'center'},icon:{width:45,height:45,borderRadius:13,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:12},info:{flex:1},name:{fontSize:14,fontWeight:'800',color:C.text},teacher:{fontSize:10,color:C.sec,marginTop:3},editButton:{width:32,height:32,borderRadius:10,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:7},timeRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:15},time:{flexDirection:'row',alignItems:'center'},timeText:{fontSize:11,color:C.sec,marginLeft:5},percent:{fontSize:12,fontWeight:'800',color:C.p},track:{height:6,backgroundColor:C.border,borderRadius:6,overflow:'hidden',marginTop:7},fill:{height:6,backgroundColor:C.p,borderRadius:6},sessionCount:{fontSize:10,color:C.sec,marginTop:7},detailRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:7},remaining:{fontSize:10,color:C.p,fontWeight:'700'},overlay:{flex:1,backgroundColor:'rgba(15,23,42,0.45)',justifyContent:'center',padding:24},modalCard:{backgroundColor:C.card,borderRadius:20,padding:20},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},modalTitle:{fontSize:20,fontWeight:'800',color:C.text},modalSubtitle:{fontSize:12,color:C.sec,marginTop:4,maxWidth:280},modalLabel:{fontSize:12,fontWeight:'700',color:C.text,marginTop:18,marginBottom:7},modalInput:{height:50,borderWidth:1,borderColor:C.border,borderRadius:12,flexDirection:'row',alignItems:'center',paddingHorizontal:12},modalTextInput:{flex:1,marginLeft:8,color:C.text,fontSize:13},hint:{fontSize:10,color:C.sec,marginTop:7},modalSave:{height:50,borderRadius:12,backgroundColor:C.p,flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:18},modalSaveText:{color:'#fff',fontSize:13,fontWeight:'800',marginLeft:7},add:{position:'absolute',right:24,bottom:91,width:54,height:54,borderRadius:27,backgroundColor:C.p,alignItems:'center',justifyContent:'center',elevation:5},nav:{height:76,backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.border,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItem:{alignItems:'center',justifyContent:'center',minWidth:65},navLabel:{color:C.muted,fontSize:10,marginTop:3,fontWeight:'600'},empty:{paddingTop:40,alignItems:'center'},emptyText:{color:C.sec,fontSize:13}});}
