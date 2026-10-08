import React,{useCallback,useMemo,useState} from 'react';
import {View,Text,StyleSheet,Pressable,ScrollView,SafeAreaView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import SwipeTabs from '../components/SwipeTabs';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';
const STORAGE_KEY='studytracker_study_sessions';
const WEEK=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function CalendarScreen({navigation}){
 const {C}=useTheme();
 const s=makeStyles(C);
 const [sessions,setSessions]=useState([]);
 const [current,setCurrent]=useState(new Date());
 const [selected,setSelected]=useState(new Date());
 const load=useCallback(async()=>{try{const user=await getCurrentUser(); if(!user){setSessions([]);return;} const raw=await AsyncStorage.getItem(accountKey(STORAGE_KEY,user));setSessions(raw?JSON.parse(raw):[]);}catch(e){setSessions([]);}},[]);
 useFocusEffect(useCallback(()=>{load();},[load]));

 const days=useMemo(()=>buildCalendarDays(current.getFullYear(),current.getMonth()),[current]);
 const selectedKey=toKey(selected);
 const today=new Date();
 today.setHours(0,0,0,0);
 const todayKey=toKey(today);
 const selectedIsFuture=selected.getTime()>today.getTime();
 const selectedSessions=sessions.filter(x=>x.date===selectedKey);
 const selectedMinutes=selectedSessions.reduce((sum,x)=>sum+Number(x.durationMinutes||0),0);
 const selectedSubjects=[...new Set(selectedSessions.map(x=>x.discipline))];
 const percent=Math.min(100,Math.round(selectedMinutes/180*100));
 const isCurrentMonth=new Date().getFullYear()===current.getFullYear() && new Date().getMonth()===current.getMonth();

 function changeMonth(delta){
   const next=new Date(current.getFullYear(),current.getMonth()+delta,1);
   setCurrent(next);
   if(delta!==0){
     const d=new Date(next.getFullYear(),next.getMonth(),1);
     setSelected(d);
   }
 }
 function selectDay(day){setSelected(day);}
 function goToday(){const now=new Date();setCurrent(now);setSelected(now);}
 function registerForSelected(){if(selectedIsFuture)return;navigation.navigate('StudyRegistration',{initialDate:formatDate(selected)});}

 return <SwipeTabs navigation={navigation} current="Calendar"><SafeAreaView style={s.safe}>
  <View style={s.container}>
   <View style={s.header}>
    <View><Text style={s.title}>Calendário</Text><Text style={s.subtitle}>Acompanhe seus estudos por dia</Text></View>
    {!isCurrentMonth&&<Pressable style={s.todayButton} onPress={goToday}><Text style={s.todayText}>Hoje</Text></Pressable>}
   </View>

   <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:105}}>
    <View style={s.calendarCard}>
      <View style={s.monthRow}>
       <Pressable style={s.monthButton} onPress={()=>changeMonth(-1)}><Ionicons name="chevron-back" size={20} color={C.text}/></Pressable>
       <Text style={s.monthTitle}>{MONTHS[current.getMonth()]} {current.getFullYear()}</Text>
       <Pressable style={s.monthButton} onPress={()=>changeMonth(1)}><Ionicons name="chevron-forward" size={20} color={C.text}/></Pressable>
      </View>
      <View style={s.weekRow}>{WEEK.map(day=><Text key={day} style={s.weekDay}>{day}</Text>)}</View>
      <View style={s.grid}>
       {days.map((day,i)=>{
         if(!day)return <View key={'empty'+i} style={s.dayCell}/>;
         const key=toKey(day);
         const hasStudy=sessions.some(x=>x.date===key);
         const isSelected=key===selectedKey;
         const isToday=key===toKey(new Date());
         return <Pressable key={key} style={s.dayCell} onPress={()=>selectDay(day)}>
           <View style={[s.dayCircle,isSelected&&s.selectedCircle,isToday&&!isSelected&&s.todayCircle]}>
             <Text style={[s.dayNumber,isSelected&&s.selectedNumber,isToday&&!isSelected&&s.todayNumber]}>{day.getDate()}</Text>
           </View>
           {hasStudy&&<View style={[s.dot,isSelected&&{backgroundColor:C.card}]}/>} 
         </Pressable>
       })}
      </View>
      <View style={s.legend}><View style={s.legendItem}><View style={s.legendDot}/><Text style={s.legendText}>Dia com estudo</Text></View><Text style={s.legendHint}>Toque em um dia para ver o resumo</Text></View>
    </View>

    <View style={s.summaryHeader}><View><Text style={s.summaryTitle}>{selectedKey===todayKey?'Hoje':formatLongDate(selected)}</Text><Text style={s.summarySubtitle}>{selectedIsFuture?'Data futura':`${selectedSessions.length} ${selectedSessions.length===1?'sessão registrada':'sessões registradas'}`}</Text></View><Pressable disabled={selectedIsFuture} style={[s.addDay,selectedIsFuture&&s.addDayDisabled]} onPress={registerForSelected}><Ionicons name="add" size={18} color="#fff"/><Text style={s.addDayText}>Registrar</Text></Pressable></View>

    <View style={s.summaryCard}>
      <View style={s.progressRow}>
       <ProgressRing percent={percent} C={C}/>
       <View style={s.mainSummary}><Text style={s.mainTime}>{formatMinutes(selectedMinutes)}</Text><Text style={s.mainLabel}>estudadas de 3h</Text><View style={s.progressTrack}><View style={[s.progressFill,{width:`${percent}%`}]}/></View></View>
       <View style={s.sessionBox}><Ionicons name="book-outline" size={19} color={C.p}/><Text style={s.sessionNumber}>{selectedSessions.length}</Text><Text style={s.sessionLabel}>sessões</Text></View>
      </View>
      <View style={s.divider}/>
      <Text style={s.sectionTitle}>Estudos do dia</Text>
      {selectedSessions.length===0?<View style={s.empty}><Ionicons name={selectedIsFuture?"lock-closed-outline":"calendar-outline"} size={28} color="#A5B4FC"/><Text style={s.emptyTitle}>{selectedIsFuture?'Não é possível registrar esta data':'Nenhum estudo registrado'}</Text><Text style={s.emptyText}>{selectedIsFuture?'Escolha hoje ou uma data anterior para cadastrar um estudo.':'Se você estudou nesse dia, pode cadastrar agora.'}</Text>{!selectedIsFuture&&<Pressable style={s.emptyButton} onPress={registerForSelected}><Ionicons name="add" size={18} color="#fff"/><Text style={s.emptyButtonText}>Cadastrar estudo</Text></Pressable>}</View>:
       selectedSessions.map(item=><Pressable key={item.id} style={s.session} onPress={()=>navigation.navigate('Studies',{filterDate:item.date})}><View style={s.subjectIcon}><Ionicons name="book-outline" size={19} color={C.p}/></View><View style={s.sessionInfo}><Text style={s.sessionTitle}>{item.discipline}</Text><Text style={s.sessionMeta}>{item.duration} • {item.content}</Text></View><Ionicons name="chevron-forward" size={19} color={C.sec}/></Pressable>)}
    </View>

    {selectedSubjects.length>0&&<View style={s.subjectCard}><Text style={s.sectionTitle}>Disciplinas estudadas</Text>{selectedSubjects.map(subject=><View key={subject} style={s.subjectRow}><View style={s.smallIcon}><Ionicons name="book" size={15} color={C.p}/></View><Text style={s.subjectName}>{subject}</Text><Text style={s.subjectTime}>{formatMinutes(selectedSessions.filter(x=>x.discipline===subject).reduce((a,b)=>a+Number(b.durationMinutes||0),0))}</Text></View>)}</View>}
   </ScrollView>
  </View>
  <View style={s.nav}><Nav icon="home-outline" label="Início" onPress={()=>navigation.navigate('Home')}/><Nav icon="book-outline" label="Disciplinas" onPress={()=>navigation.navigate('Subjects')}/><Nav icon="calendar" label="Calendário" active/><Nav icon="person-outline" label="Perfil" onPress={()=>navigation.navigate('Profile')}/></View>
 </SafeAreaView></SwipeTabs>
}

function buildCalendarDays(year,month){
 const first=new Date(year,month,1); const last=new Date(year,month+1,0); const offset=(first.getDay()+6)%7; const result=[];
 for(let i=0;i<offset;i++)result.push(null);
 for(let d=1;d<=last.getDate();d++)result.push(new Date(year,month,d));
 while(result.length%7!==0)result.push(null);
 return result;
}
function toKey(d){return formatDate(d);}
function formatDate(d){return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;}
function formatLongDate(d){return `${String(d.getDate()).padStart(2,'0')} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;}
function formatMinutes(minutes){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m}min`;if(!m)return `${h}h`;return `${h}h ${m}min`;}
function ProgressRing({percent,C}){
 const s=makeStyles(C);
 const total=48;
 const active=Math.round((percent/100)*total);
 return <View style={s.progressRing}>
   {Array.from({length:total}).map((_,i)=>{
     const angle=(i/total)*360-90;
     const radius=29;
     const x=36+Math.cos(angle*Math.PI/180)*radius;
     const y=36+Math.sin(angle*Math.PI/180)*radius;
     return <View key={i} style={[s.ringDot,{left:x-2.5,top:y-2.5,backgroundColor:i<active?C.p:C.border}]}/>;
   })}
   <View style={s.ringInner}><Text style={s.ringPercent}>{percent}%</Text><Text style={s.ringLabel}>da meta</Text></View>
 </View>
}
function Nav({icon,label,active,onPress}){const {C}=useTheme();const s=makeStyles(C);return <Pressable style={s.navItem} onPress={onPress}><Ionicons name={icon} size={21} color={active?C.p:C.muted}/><Text style={[s.navLabel,active&&{color:C.p}]}>{label}</Text></Pressable>}

function makeStyles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{flex:1,padding:24},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},title:{fontSize:24,fontWeight:'800',color:C.text},subtitle:{fontSize:13,color:C.sec,marginTop:3},todayButton:{backgroundColor:C.soft,paddingHorizontal:13,paddingVertical:8,borderRadius:10},todayText:{color:C.p,fontSize:12,fontWeight:'800'},calendarCard:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:18,padding:15,marginBottom:18},monthRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},monthButton:{width:38,height:38,borderRadius:19,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'},monthTitle:{fontSize:17,fontWeight:'800',color:C.text},weekRow:{flexDirection:'row',marginTop:13,marginBottom:5},weekDay:{flex:1,textAlign:'center',fontSize:10,fontWeight:'700',color:C.sec},grid:{flexDirection:'row',flexWrap:'wrap'},dayCell:{width:'14.2857%',height:48,alignItems:'center',justifyContent:'center'},dayCircle:{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center'},selectedCircle:{backgroundColor:C.p},todayCircle:{borderWidth:1.5,borderColor:C.p},dayNumber:{fontSize:12,color:C.text,fontWeight:'600'},selectedNumber:{color:'#fff',fontWeight:'800'},todayNumber:{color:C.p,fontWeight:'800'},dot:{width:5,height:5,borderRadius:3,backgroundColor:C.p,marginTop:1},legend:{borderTopWidth:1,borderTopColor:C.border,marginTop:8,paddingTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},legendItem:{flexDirection:'row',alignItems:'center'},legendDot:{width:6,height:6,borderRadius:3,backgroundColor:C.p,marginRight:6},legendText:{fontSize:9,color:C.sec},legendHint:{fontSize:9,color:C.muted},summaryHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},summaryTitle:{fontSize:17,fontWeight:'800',color:C.text},summarySubtitle:{fontSize:11,color:C.sec,marginTop:3},addDay:{backgroundColor:C.p,borderRadius:11,paddingHorizontal:12,paddingVertical:9,flexDirection:'row',alignItems:'center'},addDayDisabled:{opacity:.45},addDayText:{color:'#fff',fontSize:11,fontWeight:'800',marginLeft:4},summaryCard:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:18,padding:15,marginBottom:14},progressRow:{flexDirection:'row',alignItems:'center'},progressRing:{width:72,height:72,borderRadius:36,alignItems:'center',justifyContent:'center',marginRight:13,position:'relative'},ringDot:{position:'absolute',width:5,height:5,borderRadius:2.5},ringInner:{width:50,height:50,borderRadius:25,backgroundColor:C.card,alignItems:'center',justifyContent:'center'},ringPercent:{fontSize:15,fontWeight:'800',color:C.text},ringLabel:{fontSize:7,color:C.sec,marginTop:-1},mainSummary:{flex:1},mainTime:{fontSize:22,fontWeight:'800',color:C.text},mainLabel:{fontSize:10,color:C.sec,marginTop:2},progressTrack:{height:6,borderRadius:6,backgroundColor:C.border,overflow:'hidden',marginTop:10},progressFill:{height:6,borderRadius:6,backgroundColor:C.p},sessionBox:{width:62,alignItems:'center',borderLeftWidth:1,borderLeftColor:C.border,marginLeft:10},sessionNumber:{fontSize:17,fontWeight:'800',color:C.text,marginTop:3},sessionLabel:{fontSize:9,color:C.sec},divider:{height:1,backgroundColor:C.border,marginVertical:15},sectionTitle:{fontSize:14,fontWeight:'800',color:C.text},session:{flexDirection:'row',alignItems:'center',paddingVertical:11,borderBottomWidth:1,borderBottomColor:C.border},subjectIcon:{width:38,height:38,borderRadius:11,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:10},sessionInfo:{flex:1},sessionTitle:{fontSize:12,fontWeight:'800',color:C.text},sessionMeta:{fontSize:9,color:C.sec,marginTop:3,lineHeight:14},empty:{alignItems:'center',paddingVertical:20},emptyTitle:{fontSize:14,fontWeight:'800',color:C.text,marginTop:7},emptyText:{fontSize:10,color:C.sec,textAlign:'center',marginTop:4},emptyButton:{backgroundColor:C.p,borderRadius:11,paddingHorizontal:15,paddingVertical:10,flexDirection:'row',alignItems:'center',marginTop:12},emptyButtonText:{color:'#fff',fontSize:11,fontWeight:'800',marginLeft:5},subjectCard:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:18,padding:15,marginBottom:15},subjectRow:{flexDirection:'row',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.border},smallIcon:{width:28,height:28,borderRadius:9,backgroundColor:C.soft,alignItems:'center',justifyContent:'center',marginRight:9},subjectName:{flex:1,fontSize:11,color:C.text,fontWeight:'700'},subjectTime:{fontSize:11,color:C.sec,fontWeight:'700'},nav:{position:'absolute',bottom:0,left:0,right:0,height:76,backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.border,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItem:{alignItems:'center',justifyContent:'center',minWidth:65},navLabel:{color:C.muted,fontSize:9,marginTop:3,fontWeight:'600'}});}
