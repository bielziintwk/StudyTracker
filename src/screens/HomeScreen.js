import React,{useCallback,useEffect,useRef,useState} from 'react';
import {View,Text,StyleSheet,Pressable,ScrollView,SafeAreaView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import Svg,{Circle} from 'react-native-svg';
import {Animated,Easing} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import SwipeTabs from '../components/SwipeTabs';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';
const STORAGE_KEY='studytracker_study_sessions';
export default function HomeScreen({navigation}){
 const {C}=useTheme();
 const s=makeStyles(C);
 const [sessions,setSessions]=useState([]);
 const [userName,setUserName]=useState('Usuário');
 const load=useCallback(async()=>{
  try{
   const user=await getCurrentUser();
   if(!user){setSessions([]);setUserName('Usuário');return;}
   const raw=await AsyncStorage.getItem(accountKey(STORAGE_KEY,user));
   setSessions(raw?JSON.parse(raw):[]);
   if(user?.name) setUserName(user.name.split(' ')[0]);
  }catch(e){
   setSessions([]);
   setUserName('Usuário');
  }
 },[]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const totalMinutes=sessions.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
 const todayKey=new Date().toLocaleDateString('pt-BR');
 const todayMinutes=sessions.filter(x=>x.date===todayKey).reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
 const todayPercent=Math.min(100,Math.round(todayMinutes/240*100));
 const totalSubjects=new Set(sessions.map(x=>x.discipline)).size;
 const recent=sessions[0];
 const weekData=getWeekData(sessions);
 const weekTotal=weekData.reduce((sum,x)=>sum+x.minutes,0);
 return <SwipeTabs navigation={navigation} current="Home"><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
<View style={s.header}><View style={s.brandRow}><View style={s.logo}><Text style={s.logoText}>S</Text></View><Text style={s.brand}>Study<Text style={{color:C.p}}>Tracker</Text></Text></View><Pressable style={s.notification}><Ionicons name="notifications-outline" size={22} color={C.text}/></Pressable></View>
<Text style={s.greeting}>Olá, {userName} 👋</Text><Text style={s.subtitle}>Vamos estudar hoje?</Text><Pressable style={s.registerButton} onPress={()=>navigation.navigate('StudyRegistration')}><Ionicons name="add-circle-outline" size={20} color="#fff"/><Text style={s.registerButtonText}>Registrar estudo</Text></Pressable>
<Pressable style={s.dashboardCard} onPress={()=>navigation.navigate('Studies',{filterToday:true})}><View style={s.dashboardHeader}><Text style={s.cardLabel}>Estudos de hoje</Text><View style={s.arrow}><Ionicons name="arrow-forward" size={19} color="#fff"/></View></View><CircleDashboard percent={todayPercent} time={formatMinutes(todayMinutes)} C={C} s={s}/><Text style={s.todayCount}>{sessions.filter(x=>x.date===todayKey).length} {sessions.filter(x=>x.date===todayKey).length===1?'sessão':'sessões'} hoje</Text></Pressable>
<View style={s.statsRow}><View style={[s.stat,{marginRight:8}]}><Ionicons name="book-outline" size={21} color={C.p}/><Text style={s.statLabel}>Disciplinas</Text><Text style={s.statNumber}>{totalSubjects}</Text></View><View style={[s.stat,{marginLeft:8}]}><Ionicons name="time-outline" size={21} color={C.purple}/><Text style={s.statLabel}>Tempo estudado</Text><Text style={s.statSmall}>{formatMinutes(totalMinutes)}</Text></View></View>
<View style={s.section}><Text style={s.sectionTitle}>Último estudo</Text><Pressable onPress={()=>navigation.navigate('Studies')}><Text style={s.link}>Ver histórico</Text></Pressable></View>
<Pressable style={s.next} onPress={()=>navigation.navigate('Studies')}><View style={s.subjectIcon}><Ionicons name="book-outline" size={20} color={C.p}/></View><View style={s.nextInfo}><Text style={s.nextTitle}>{recent?.discipline||'Nenhum estudo registrado'}</Text><Text style={s.meta}>{recent?recent.date:'Comece registrando uma sessão'}</Text><Text style={s.meta}>{recent?recent.content:'Seu último estudo aparecerá aqui'}</Text></View><Ionicons name="chevron-forward" size={20} color={C.sec}/></Pressable>
<View style={s.section}><View><Text style={s.sectionTitle}>Resumo semanal</Text><Text style={s.weekTotal}>{formatMinutes(weekTotal)} estudados</Text></View><Pressable onPress={()=>navigation.navigate('Studies')}><Text style={s.link}>Ver detalhes</Text></Pressable></View>
<View style={s.week}><View style={s.chart}>{weekData.map((item,i)=><View key={item.label} style={s.barCol}><View style={[s.bar,{height:item.height}]}/></View>)}</View><View style={s.days}>{weekData.map(item=><Text key={item.label} style={s.day}>{item.label}</Text>)}</View><View style={s.weekHours}>{weekData.map(item=><Text key={item.label} style={s.weekHour}>{item.minutes?formatMinutes(item.minutes):'0min'}</Text>)}</View></View>
</ScrollView><View style={s.nav}><Nav icon="home" label="Início" active/><Nav icon="book-outline" label="Disciplinas" onPress={()=>navigation.navigate('Subjects')}/><Nav icon="calendar-outline" label="Calendário" onPress={()=>navigation.navigate('Calendar')}/><Nav icon="person-outline" label="Perfil" onPress={()=>navigation.navigate('Profile')}/></View></SafeAreaView></SwipeTabs>}
function CircleDashboard({percent,time,C,s}){
 const size=176;
 const stroke=10;
 const radius=(size-stroke)/2;
 const circumference=2*Math.PI*radius;
 const progress=useRef(new Animated.Value(0)).current;
 const scale=useRef(new Animated.Value(.94)).current;
 const opacity=useRef(new Animated.Value(.55)).current;
 const AnimatedCircle=useRef(Animated.createAnimatedComponent(Circle)).current;

 useEffect(()=>{
   progress.stopAnimation();
   scale.stopAnimation();
   opacity.stopAnimation();
   progress.setValue(0);
   scale.setValue(.94);
   opacity.setValue(.55);
   Animated.parallel([
     Animated.timing(progress,{toValue:percent,duration:950,easing:Easing.out(Easing.cubic),useNativeDriver:false}),
     Animated.spring(scale,{toValue:1,duration:650,useNativeDriver:true}),
     Animated.timing(opacity,{toValue:1,duration:450,easing:Easing.out(Easing.quad),useNativeDriver:true})
   ]).start();
 },[percent]);

 const dashOffset=progress.interpolate({inputRange:[0,100],outputRange:[circumference,circumference*0.0001]});
 return <View style={s.circleArea}>
   <Animated.View style={[s.circleOuter,{transform:[{scale}],opacity}]}>
     <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
       <Circle cx={size/2} cy={size/2} r={radius} stroke={C.soft} strokeWidth={stroke} fill="none" opacity={0.42}/>
       <Circle cx={size/2} cy={size/2} r={radius} stroke="#FFFFFF" strokeWidth={stroke+7} fill="none" opacity={0.08}/>
       <AnimatedCircle cx={size/2} cy={size/2} r={radius} stroke="#FFFFFF" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={dashOffset} transform={`rotate(-90 ${size/2} ${size/2})`}/>
     </Svg>
     <View style={s.circleCenter}>
       <Text style={s.circlePercent}>{percent}%</Text>
       <Text style={s.circleTime}>{time}</Text>
       <Text style={s.circleGoal}>de 4h</Text>
     </View>
   </Animated.View>
 </View>;
}

function getWeekData(sessions){
 const now=new Date(); const day=now.getDay(); const monday=new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate()-(day===0?6:day-1));
 const labels=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
 return labels.map((label,i)=>{const d=new Date(monday); d.setDate(monday.getDate()+i); const key=d.toLocaleDateString('pt-BR'); const minutes=sessions.filter(x=>x.date===key).reduce((sum,x)=>sum+Number(x.durationMinutes||0),0); return {label,minutes,height:Math.max(6,Math.round(minutes/Math.max(60,...labels.map((_,j)=>{const dd=new Date(monday);dd.setDate(monday.getDate()+j);return sessions.filter(x=>x.date===dd.toLocaleDateString('pt-BR')).reduce((a,b)=>a+Number(b.durationMinutes||0),0)}))*65))};});
}
function formatMinutes(minutes){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m}min`;if(!m)return `${h}h`;return `${h}h ${m}min`;}
function Nav({icon,label,active,onPress}){const {C}=useTheme();const s=makeStyles(C);return <Pressable style={s.navItem} onPress={onPress}><Ionicons name={icon} size={22} color={active?C.p:C.muted}/><Text style={[s.navLabel,active&&{color:C.p}]}>{label}</Text></Pressable>}
function makeStyles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{padding:24,paddingBottom:105},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:26},brandRow:{flexDirection:'row',alignItems:'center'},logo:{width:34,height:34,borderRadius:10,backgroundColor:C.p,alignItems:'center',justifyContent:'center',marginRight:9},logoText:{color:'#fff',fontWeight:'800',fontSize:17},brand:{color:C.text,fontSize:18,fontWeight:'800'},notification:{width:40,height:40,borderRadius:20,backgroundColor:C.card,alignItems:'center',justifyContent:'center'},greeting:{fontSize:25,fontWeight:'800',color:C.text},subtitle:{fontSize:14,color:C.sec,marginTop:4,marginBottom:20},registerButton:{height:46,borderRadius:12,backgroundColor:C.purple,flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:14},registerButtonText:{color:'#fff',fontWeight:'800',fontSize:13,marginLeft:7},dashboardCard:{backgroundColor:C.p,borderRadius:22,padding:20,height:295,marginBottom:16,overflow:'hidden'},dashboardHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},cardLabel:{color:'#fff',fontSize:14,fontWeight:'600'},arrow:{width:40,height:40,borderRadius:20,backgroundColor:'rgba(124,58,237,0.92)',alignItems:'center',justifyContent:'center'},circleArea:{height:205,alignItems:'center',justifyContent:'center'},circleOuter:{width:176,height:176,position:'relative',alignItems:'center',justifyContent:'center'},circleCenter:{position:'absolute',width:122,height:122,borderRadius:61,backgroundColor:C.purple,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:0.16,shadowRadius:12,shadowOffset:{width:0,height:5},elevation:5},circlePercent:{color:'#fff',fontSize:29,fontWeight:'900',letterSpacing:-0.5},circleTime:{color:'#E0E7FF',fontSize:13,fontWeight:'700',marginTop:2},circleGoal:{color:'#C7D2FE',fontSize:10,fontWeight:'600',marginTop:2},todayCount:{color:'#C7D2FE',fontSize:10,textAlign:'center',marginTop:-2},statsRow:{flexDirection:'row',marginBottom:25},stat:{flex:1,height:91,backgroundColor:C.card,borderRadius:15,borderWidth:1,borderColor:C.border,padding:12},statLabel:{color:C.sec,fontSize:12,marginTop:4},statNumber:{color:C.text,fontSize:22,fontWeight:'800',marginTop:2},statSmall:{color:C.text,fontSize:17,fontWeight:'800',marginTop:5},section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:11},sectionTitle:{color:C.text,fontSize:17,fontWeight:'800'},link:{color:C.p,fontSize:12,fontWeight:'700'},next:{backgroundColor:C.card,borderRadius:15,borderWidth:1,borderColor:C.border,padding:13,flexDirection:'row',alignItems:'center',marginBottom:25},subjectIcon:{width:44,height:44,borderRadius:13,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:12},subjectIconText:{color:C.p,fontWeight:'800'},nextInfo:{flex:1},nextTitle:{color:C.text,fontSize:14,fontWeight:'800'},meta:{color:C.sec,fontSize:11,marginTop:3},week:{backgroundColor:C.card,borderRadius:15,borderWidth:1,borderColor:C.border,padding:14},weekTotal:{color:C.sec,fontSize:11,marginTop:3},weekHours:{flexDirection:'row',justifyContent:'space-around',marginTop:5},weekHour:{color:C.sec,fontSize:8},chart:{height:80,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-around'},barCol:{height:80,width:24,justifyContent:'flex-end',alignItems:'center'},bar:{width:14,borderRadius:8,backgroundColor:C.p},days:{flexDirection:'row',justifyContent:'space-around',marginTop:7},day:{color:C.sec,fontSize:9},nav:{position:'absolute',bottom:0,left:0,right:0,height:76,backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.border,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItem:{alignItems:'center',justifyContent:'center',minWidth:65},navLabel:{color:C.muted,fontSize:10,marginTop:3,fontWeight:'600'}});}
