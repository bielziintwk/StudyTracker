import React,{useCallback,useState} from 'react';
import {View,Text,StyleSheet,FlatList,SafeAreaView,Pressable} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';
const KEY='studytracker_study_sessions';
const DEFAULT_GOAL=360; // 6 horas padrão
const SUBJECTS_KEY='studytracker_subjects';

export default function SubjectDetailScreen({navigation,route}){
 const {C}=useTheme();
 const s=makeStyles(C);
 const discipline=route?.params?.discipline||'';
 const [sessions,setSessions]=useState([]);
 const [goal,setGoal]=useState(DEFAULT_GOAL);
 const load=useCallback(async()=>{try{const user=await getCurrentUser(); if(!user){setSessions([]);setGoal(DEFAULT_GOAL);return;} const [raw,subjectsRaw]=await Promise.all([AsyncStorage.getItem(accountKey(KEY,user)),AsyncStorage.getItem(accountKey(SUBJECTS_KEY,user))]);setSessions(raw?JSON.parse(raw):[]);const saved=subjectsRaw?JSON.parse(subjectsRaw):[];const found=saved.find(x=>(typeof x==='string'?x:x.name)===discipline);setGoal(Number(found?.goal)||DEFAULT_GOAL);}catch(e){setSessions([]);setGoal(DEFAULT_GOAL);}},[discipline]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const own=sessions.filter(x=>x.discipline===discipline);
 const minutes=own.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
 const remaining=Math.max(0,goal-minutes);
 const percent=Math.min(100,Math.round(minutes/goal*100));
 return <SafeAreaView style={s.safe}>
   <View style={s.container}>
    <View style={s.header}><Pressable style={s.back} onPress={()=>navigation.goBack()}><Ionicons name="arrow-back" size={22} color={C.text}/></Pressable><View style={{flex:1}}><Text style={s.title}>{discipline}</Text><Text style={s.subtitle}>Acompanhamento da disciplina</Text></View><Pressable style={s.add} onPress={()=>navigation.navigate('StudyRegistration')}><Ionicons name="add" size={23} color="#fff"/></Pressable></View>
    <View style={s.progressCard}>
      <View style={s.progressTop}><View><Text style={s.label}>Progresso</Text><Text style={s.percent}>{percent}%</Text></View><View style={s.circle}><Ionicons name="trophy-outline" size={27} color={C.p}/></View></View>
      <View style={s.track}><View style={[s.fill,{width:`${percent}%`}]}/></View>
      <View style={s.hoursRow}><View><Text style={s.smallLabel}>Estudadas</Text><Text style={s.hours}>{formatMinutes(minutes)}</Text></View><View style={s.right}><Text style={s.smallLabel}>{remaining>0?'Faltam para 100%':'Meta atingida'}</Text><Text style={s.hours}>{remaining>0?formatMinutes(remaining):'100%'}</Text></View></View>
      <Text style={s.goalText}>Meta da disciplina: {formatMinutes(goal)} de estudo</Text>
    </View>
    <View style={s.section}><View><Text style={s.sectionTitle}>Sessões registradas</Text><Text style={s.sectionSub}>{own.length} {own.length===1?'sessão':'sessões'} • {formatMinutes(minutes)} no total</Text></View></View>
    <FlatList data={own} keyExtractor={x=>x.id} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:30}} ListEmptyComponent={<View style={s.empty}><Ionicons name="book-outline" size={40} color="#94A3B8"/><Text style={s.emptyTitle}>Nenhum estudo ainda</Text><Text style={s.emptyText}>Cadastre uma sessão para começar a acompanhar esta disciplina.</Text><Pressable style={s.emptyButton} onPress={()=>navigation.navigate('StudyRegistration')}><Text style={s.emptyButtonText}>Registrar estudo</Text></Pressable></View>} renderItem={({item})=><View style={s.session}><View style={s.sessionIcon}><Ionicons name="time-outline" size={19} color={C.p}/></View><View style={s.sessionInfo}><Text style={s.sessionContent}>{item.content}</Text><Text style={s.sessionMeta}>{item.date} • {item.duration}</Text></View></View>}/>
   </View>
 </SafeAreaView>
}
function formatMinutes(minutes){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m}min`;if(!m)return `${h}h`;return `${h}h ${m}min`;}
function makeStyles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{flex:1,padding:24},header:{flexDirection:'row',alignItems:'center',marginBottom:18},back:{width:42,height:42,borderRadius:21,backgroundColor:C.card,alignItems:'center',justifyContent:'center',marginRight:12},title:{fontSize:20,fontWeight:'800',color:C.text},subtitle:{fontSize:11,color:C.sec,marginTop:3},add:{width:42,height:42,borderRadius:21,backgroundColor:C.p,alignItems:'center',justifyContent:'center'},progressCard:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:18,padding:18,marginBottom:22},progressTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},label:{fontSize:12,color:C.sec,fontWeight:'700'},percent:{fontSize:32,fontWeight:'900',color:C.text,marginTop:2},circle:{width:52,height:52,borderRadius:26,backgroundColor:C.soft,alignItems:'center',justifyContent:'center'},track:{height:9,backgroundColor:C.border,borderRadius:9,overflow:'hidden',marginTop:14},fill:{height:9,backgroundColor:C.p,borderRadius:9},hoursRow:{flexDirection:'row',justifyContent:'space-between',marginTop:18},smallLabel:{fontSize:10,color:C.sec},hours:{fontSize:17,fontWeight:'800',color:C.text,marginTop:3},right:{alignItems:'flex-end'},goalText:{fontSize:10,color:C.sec,marginTop:13},section:{marginBottom:11},sectionTitle:{fontSize:17,fontWeight:'800',color:C.text},sectionSub:{fontSize:11,color:C.sec,marginTop:3},session:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:14,padding:13,flexDirection:'row',alignItems:'center',marginBottom:9},sessionIcon:{width:40,height:40,borderRadius:12,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:11},sessionInfo:{flex:1},sessionContent:{fontSize:12,fontWeight:'700',color:C.text,lineHeight:17},sessionMeta:{fontSize:10,color:C.sec,marginTop:4},empty:{alignItems:'center',paddingHorizontal:22,paddingTop:45},emptyTitle:{fontSize:16,fontWeight:'800',color:C.text,marginTop:10},emptyText:{fontSize:11,color:C.sec,textAlign:'center',lineHeight:17,marginTop:5},emptyButton:{backgroundColor:C.p,borderRadius:12,paddingHorizontal:18,paddingVertical:11,marginTop:16},emptyButtonText:{color:'#fff',fontWeight:'800',fontSize:12}});}
