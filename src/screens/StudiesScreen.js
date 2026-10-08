import React,{useCallback,useState} from 'react';
import {View,Text,StyleSheet,FlatList,SafeAreaView,Pressable,Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';
const KEY='studytracker_study_sessions';
export default function StudiesScreen({navigation,route}){
 const {C}=useTheme();
 const s=makeStyles(C);
 const [sessions,setSessions]=useState([]);
 const filterToday=route?.params?.filterToday===true;
 const filterDate=route?.params?.filterDate;
 const activeFilterDate=filterDate&&!filterToday?filterDate:null;
 const todayKey=new Date().toLocaleDateString('pt-BR');
 const load=useCallback(async()=>{try{const user=await getCurrentUser(); if(!user){setSessions([]);return;} const raw=await AsyncStorage.getItem(accountKey(KEY,user));setSessions(raw?JSON.parse(raw):[]);}catch(e){setSessions([]);}},[]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const remove=async(id)=>{Alert.alert('Apagar estudo','Tem certeza que deseja apagar este registro?', [{text:'Cancelar',style:'cancel'},{text:'Apagar',style:'destructive',onPress:async()=>{const next=sessions.filter(x=>x.id!==id);const user=await getCurrentUser();if(user) await AsyncStorage.setItem(accountKey(KEY,user),JSON.stringify(next));setSessions(next);}}]);};
 const edit=(item)=>navigation.navigate('StudyRegistration',{study:item});
 const visibleSessions=filterToday?sessions.filter(x=>x.date===todayKey):activeFilterDate?sessions.filter(x=>x.date===activeFilterDate):sessions;
 const screenTitle=filterToday?'Estudos de hoje':activeFilterDate?`Estudos de ${activeFilterDate}`:'Histórico de estudos';
 return <SafeAreaView style={s.safe}><View style={s.container}>
  <View style={s.header}><View><Text style={s.title}>{screenTitle}</Text><Text style={s.subtitle}>{visibleSessions.length} {visibleSessions.length===1?'sessão registrada':'sessões registradas'}{filterToday?' hoje':activeFilterDate?'':''}</Text></View><Pressable style={s.add} onPress={()=>navigation.navigate('StudyRegistration')}><Ionicons name="add" size={23} color="#fff"/></Pressable></View>
  <FlatList data={visibleSessions} keyExtractor={x=>x.id} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:30}} ListEmptyComponent={<View style={s.empty}><Ionicons name="book-outline" size={42} color="#94A3B8"/><Text style={s.emptyTitle}>Nenhum estudo cadastrado</Text><Text style={s.emptyText}>Registre sua primeira sessão para acompanhar seu progresso.</Text><Pressable style={s.emptyButton} onPress={()=>navigation.navigate('StudyRegistration')}><Text style={s.emptyButtonText}>Cadastrar estudo</Text></Pressable></View>} renderItem={({item})=><View style={s.card}><View style={s.icon}><Ionicons name="book-outline" size={21} color={C.p}/></View><View style={s.info}><Text style={s.discipline}>{item.discipline}</Text><Text style={s.content}>{item.content}</Text><View style={s.meta}><Text style={s.metaText}><Ionicons name="calendar-outline" size={12}/> {item.date}</Text><Text style={s.metaText}><Ionicons name="time-outline" size={12}/> {item.duration}</Text></View></View><View style={s.actions}><Pressable style={s.action} onPress={()=>edit(item)}><Ionicons name="create-outline" size={19} color={C.p}/></Pressable><Pressable style={[s.action,{marginTop:7}]} onPress={()=>remove(item.id)}><Ionicons name="trash-outline" size={19} color={C.danger}/></Pressable></View></View>}/>
 </View></SafeAreaView>
}
function makeStyles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{flex:1,padding:24},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},title:{fontSize:23,fontWeight:'800',color:C.text},subtitle:{fontSize:12,color:C.sec,marginTop:4},add:{width:44,height:44,borderRadius:22,backgroundColor:C.p,alignItems:'center',justifyContent:'center'},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:15,padding:14,marginBottom:10,flexDirection:'row'},icon:{width:44,height:44,borderRadius:12,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:12},info:{flex:1,paddingRight:5},discipline:{fontSize:14,fontWeight:'800',color:C.text},content:{fontSize:11,color:C.sec,marginTop:4,lineHeight:16},meta:{flexDirection:'row',marginTop:8,gap:14},metaText:{fontSize:10,color:C.sec},actions:{justifyContent:'center',alignItems:'center',width:38},action:{width:34,height:34,borderRadius:10,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'},empty:{alignItems:'center',paddingHorizontal:25,paddingTop:90},emptyTitle:{fontSize:17,fontWeight:'800',color:C.text,marginTop:12},emptyText:{fontSize:12,color:C.sec,textAlign:'center',lineHeight:18,marginTop:5},emptyButton:{backgroundColor:C.p,borderRadius:12,paddingHorizontal:18,paddingVertical:12,marginTop:18},emptyButtonText:{color:'#fff',fontWeight:'800',fontSize:12}});}
