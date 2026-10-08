import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../theme/ThemeContext';
import {getCurrentUser, accountKey} from '../utils/accountStorage';

const STORAGE_KEY='studytracker_study_sessions';
const SUBJECTS_KEY='studytracker_subjects';
const DEFAULT_SUBJECTS=['Programação Mobile','Banco de Dados','Engenharia de Software','Projeto Integrador'];

export default function StudyRegistrationScreen({navigation,route}){
  const {C}=useTheme();
  const s=makeStyles(C);
  const editing=route?.params?.study;
  const [discipline,setDiscipline]=useState(editing?.discipline||'');
  const [date,setDate]=useState(editing?.date||route?.params?.initialDate||formatDate(new Date()));
  const [duration,setDuration]=useState(editing?.duration||'');
  const [durationPicker,setDurationPicker]=useState(false);
  const initialDuration=parseDurationParts(editing?.duration||'');
  const [pickerHours,setPickerHours]=useState(initialDuration.hours);
  const [pickerMinutes,setPickerMinutes]=useState(initialDuration.minutes);
  const [content,setContent]=useState(editing?.content||'');
  const [saving,setSaving]=useState(false);
  const [subjects,setSubjects]=useState(DEFAULT_SUBJECTS);

  useEffect(()=>{navigation.setOptions?.({headerShown:false});loadSubjects();},[navigation]);

  async function loadSubjects(){
    try{
      const user=await getCurrentUser();
      const raw=await AsyncStorage.getItem(user?accountKey(SUBJECTS_KEY,user):SUBJECTS_KEY);
      const saved=raw?JSON.parse(raw):[];
      const custom=saved.map(x=>typeof x==='string'?x:x.name).filter(Boolean);
      setSubjects([...DEFAULT_SUBJECTS,...custom.filter(x=>!DEFAULT_SUBJECTS.includes(x))]);
    }catch(e){setSubjects(DEFAULT_SUBJECTS);}
  }

  async function saveStudy(){
    if(!discipline || !date || !duration || !content.trim()){
      Alert.alert('Campos obrigatórios','Preencha disciplina, data, duração e conteúdo estudado.');
      return;
    }
    const minutes=parseDuration(duration);
    if(!minutes){
      Alert.alert('Duração inválida','Informe a duração como 1h 30min, 90min ou 1h30.');
      return;
    }
    if(!/^\d{2}\/\d{2}\/\d{4}$/.test(date)){
      Alert.alert('Data inválida','Use o formato DD/MM/AAAA.');
      return;
    }
    const studyDate=parseDateBR(date);
    if(!studyDate){
      Alert.alert('Data inválida','Informe uma data que realmente exista.');
      return;
    }
    if(isFutureDate(studyDate)){
      Alert.alert('Data futura não permitida','Você só pode registrar estudos de hoje ou de datas anteriores.');
      return;
    }
    try{
      setSaving(true);
      const user=await getCurrentUser();
      if(!user){Alert.alert('Conta não encontrada','Entre novamente para registrar um estudo.');return;}
      const userKey=accountKey(STORAGE_KEY,user);
      const raw=await AsyncStorage.getItem(userKey);
      const sessions=raw?JSON.parse(raw):[];
      const session={id:editing?.id||Date.now().toString(),discipline,date,duration:duration.trim(),durationMinutes:minutes,content:content.trim(),createdAt:editing?.createdAt||new Date().toISOString()};
      const next=editing? sessions.map(x=>x.id===editing.id?session:x):[session,...sessions];
      await AsyncStorage.setItem(userKey,JSON.stringify(next));
      Alert.alert(editing?'Estudo atualizado!':'Estudo cadastrado!',editing?'As alterações foram salvas.':'A sessão foi salva no seu histórico.',[
        {text:'OK',onPress:()=>navigation.navigate('Studies')}
      ]);
    }catch(e){
      Alert.alert('Erro','Não foi possível salvar o estudo.');
    }finally{setSaving(false);}
  }

  return <SafeAreaView style={s.safe}>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Pressable style={s.back} onPress={()=>navigation.goBack()}><Ionicons name="arrow-back" size={22} color={C.text}/></Pressable>
          <View style={{flex:1}}><Text style={s.title}>{editing?'Editar estudo':'Cadastrar estudo'}</Text><Text style={s.subtitle}>{editing?'Altere os dados desta sessão':'Registre o que você estudou'}</Text></View>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Disciplina *</Text>
          <View style={s.options}>
            {subjects.map(item=><Pressable key={item} onPress={()=>setDiscipline(item)} style={[s.option,discipline===item&&s.optionActive]}><Ionicons name={discipline===item?'checkmark-circle':'book-outline'} size={18} color={discipline===item?'#fff':C.p}/><Text style={[s.optionText,discipline===item&&s.optionTextActive]}>{item}</Text></Pressable>)}
          </View>

          <Text style={s.label}>Data *</Text>
          <View style={s.inputWrap}><Ionicons name="calendar-outline" size={19} color={C.sec}/><TextInput value={date} onChangeText={value=>setDate(formatDateInput(value))} placeholder="DD/MM/AAAA" placeholderTextColor="#94A3B8" keyboardType="number-pad" maxLength={10} style={s.input}/></View>

          <Text style={s.label}>Duração *</Text>
          <Pressable style={s.inputWrap} onPress={()=>{const parts=parseDurationParts(duration);setPickerHours(parts.hours);setPickerMinutes(parts.minutes);setDurationPicker(true);}}>
            <Ionicons name="time-outline" size={19} color={C.sec}/><Text style={[s.input,{paddingTop:14}]}>{duration||'Selecione a duração'}</Text><Ionicons name="chevron-down" size={18} color={C.sec}/>
          </Pressable>

          <Text style={s.label}>Conteúdo estudado *</Text>
          <TextInput value={content} onChangeText={setContent} placeholder="Ex.: Componentes, navegação e criação de telas..." placeholderTextColor="#94A3B8" style={s.textArea} multiline numberOfLines={5} textAlignVertical="top"/>

          <Pressable disabled={saving} style={[s.save,saving&&{opacity:.7}]} onPress={saveStudy}>{saving?<ActivityIndicator color="#fff"/>:<><Ionicons name="checkmark" size={20} color="#fff"/><Text style={s.saveText}>{editing?'Salvar alterações':'Salvar estudo'}</Text></>}</Pressable>
        </View>
        <Text style={s.required}>* Campos obrigatórios</Text>
      </ScrollView>
      <Modal visible={durationPicker} transparent animationType="slide" onRequestClose={()=>setDurationPicker(false)}>
        <View style={s.pickerOverlay}>
          <View style={s.pickerCard}>
            <View style={s.pickerHeader}>
              <View><Text style={s.pickerTitle}>Escolha a duração</Text><Text style={s.pickerSubtitle}>Arraste como no seletor do iPhone</Text></View>
              <Pressable onPress={()=>setDurationPicker(false)}><Ionicons name="close" size={23} color={C.text}/></Pressable>
            </View>
            <View style={s.wheels}>
              <Wheel value={pickerHours} max={12} onChange={setPickerHours} suffix="h" C={C} s={s}/>
              <Text style={s.colon}>:</Text>
              <Wheel value={pickerMinutes} max={59} onChange={setPickerMinutes} suffix="min" C={C} s={s}/>
            </View>
            <Text style={s.selectedDuration}>Duração: {formatPickerDuration(pickerHours,pickerMinutes)}</Text>
            <Pressable style={s.pickerSave} onPress={()=>{if(pickerHours===0 && pickerMinutes===0){Alert.alert('Duração inválida','Escolha pelo menos 1 minuto de estudo.');return;}setDuration(formatPickerDuration(pickerHours,pickerMinutes));setDurationPicker(false);}}>
              <Ionicons name="checkmark" size={20} color="#fff"/><Text style={s.saveText}>Confirmar duração</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

function formatDate(d){return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;}
function formatDateInput(value){
  const digits=value.replace(/\D/g,'').slice(0,8);
  if(digits.length<=2) return digits;
  if(digits.length<=4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
}
function parseDateBR(value){
  const match=value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!match) return null;
  const day=Number(match[1]),month=Number(match[2]),year=Number(match[3]);
  const date=new Date(year,month-1,day);
  if(date.getFullYear()!==year || date.getMonth()!==month-1 || date.getDate()!==day) return null;
  date.setHours(0,0,0,0);
  return date;
}
function isFutureDate(date){
  const today=new Date();
  today.setHours(0,0,0,0);
  return date.getTime()>today.getTime();
}
function parseDurationParts(value){
  const v=(value||'').toLowerCase().replace(/\s+/g,'');
  let minutes=0,m;
  m=v.match(/^(\d+)h(?:(\d+)min?)?$/); if(m) minutes=Number(m[1])*60+Number(m[2]||0);
  else {m=v.match(/^(\d+)h(\d+)$/); if(m) minutes=Number(m[1])*60+Number(m[2]); else {m=v.match(/^(\d+)min?$/); if(m) minutes=Number(m[1]);}}
  return {hours:Math.floor(minutes/60),minutes:minutes%60};
}
function formatPickerDuration(hours,minutes){
  if(hours===0) return `${minutes}min`;
  if(minutes===0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}
function parseDuration(value){
  const v=value.toLowerCase().replace(/\s+/g,'');
  let minutes=0,m;
  m=v.match(/^(\d+)h(?:(\d+)min?)?$/); if(m) minutes=Number(m[1])*60+Number(m[2]||0);
  else {m=v.match(/^(\d+)h(\d+)$/); if(m) minutes=Number(m[1])*60+Number(m[2]); else {m=v.match(/^(\d+)min?$/); if(m) minutes=Number(m[1]);}}
  return minutes>0?minutes:0;
}

function Wheel({value,max,onChange,suffix,C,s}){
  const rowH=44;
  const ref=useRef(null);
  const items=[null,null,...Array.from({length:max+1},(_,i)=>i),null,null];

  useEffect(()=>{
    const id=setTimeout(()=>{
      ref.current?.scrollTo({y:value*rowH,animated:false});
    },40);
    return ()=>clearTimeout(id);
  },[value]);

  function updateFromOffset(y){
    const index=Math.max(0,Math.min(max,Math.round(y/rowH)));
    if(index!==value) onChange(index);
  }

  return <View style={s.wheelWrap}>
    <ScrollView
      ref={ref}
      style={s.wheel}
      showsVerticalScrollIndicator={false}
      snapToInterval={rowH}
      decelerationRate="fast"
      bounces={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={e=>updateFromOffset(e.nativeEvent.contentOffset.y)}
      onScrollEndDrag={e=>updateFromOffset(e.nativeEvent.contentOffset.y)}
    >
      {items.map((item,index)=>{
        const selected=item===value;
        return <View key={`${item===null?'empty':item}-${index}`} style={[s.wheelRow,{height:rowH}]}>
          {item!==null && <>
            <Text style={[s.wheelText,selected&&s.wheelTextActive]}>{String(item).padStart(2,'0')}</Text>
            <Text style={[s.wheelSuffix,selected&&s.wheelTextActive]}>{suffix}</Text>
          </>}
        </View>;
      })}
    </ScrollView>
    <View pointerEvents="none" style={s.wheelFadeTop}/>
    <View pointerEvents="none" style={s.wheelSelected}/>
    <View pointerEvents="none" style={s.wheelFadeBottom}/>
  </View>;
}
function makeStyles(C){return StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},container:{padding:24,paddingBottom:40},header:{flexDirection:'row',alignItems:'center',marginBottom:22},back:{width:42,height:42,borderRadius:21,backgroundColor:C.card,alignItems:'center',justifyContent:'center',marginRight:12},title:{fontSize:23,fontWeight:'800',color:C.text},subtitle:{fontSize:13,color:C.sec,marginTop:3},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.border,borderRadius:18,padding:18},label:{fontSize:13,fontWeight:'800',color:C.text,marginBottom:8,marginTop:6},options:{marginBottom:10},option:{minHeight:46,borderWidth:1,borderColor:C.border,borderRadius:12,paddingHorizontal:12,flexDirection:'row',alignItems:'center',marginBottom:8},optionActive:{backgroundColor:C.p,borderColor:C.p},optionText:{flex:1,color:C.text,fontSize:12,fontWeight:'600',marginLeft:8},optionTextActive:{color:'#fff'},inputWrap:{height:48,borderWidth:1,borderColor:C.border,borderRadius:12,flexDirection:'row',alignItems:'center',paddingHorizontal:12,marginBottom:12},input:{flex:1,color:C.text,fontSize:13,marginLeft:8},textArea:{minHeight:120,borderWidth:1,borderColor:C.border,borderRadius:12,padding:12,color:C.text,fontSize:13,marginBottom:18},save:{height:52,borderRadius:13,backgroundColor:C.p,flexDirection:'row',alignItems:'center',justifyContent:'center'},saveText:{color:'#fff',fontWeight:'800',fontSize:14,marginLeft:7},required:{fontSize:11,color:C.sec,marginTop:10},pickerOverlay:{flex:1,backgroundColor:'rgba(15,23,42,0.5)',justifyContent:'flex-end'},pickerCard:{backgroundColor:C.card,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,paddingBottom:30},pickerHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},pickerTitle:{fontSize:20,fontWeight:'800',color:C.text},pickerSubtitle:{fontSize:12,color:C.sec,marginTop:4},wheels:{height:220,flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:14},wheelWrap:{height:220,width:115,position:'relative',overflow:'hidden'},wheel:{height:220},wheelRow:{flexDirection:'row',alignItems:'center',justifyContent:'center'},wheelText:{fontSize:21,color:C.sec,fontWeight:'600',minWidth:34,textAlign:'right'},wheelTextActive:{fontSize:28,color:C.text,fontWeight:'900'},wheelSuffix:{fontSize:11,color:C.sec,marginLeft:5},wheelSelected:{position:'absolute',top:88,left:4,right:4,height:44,borderTopWidth:1,borderBottomWidth:1,borderColor:C.border,zIndex:2},wheelFadeTop:{position:'absolute',top:0,left:0,right:0,height:70,backgroundColor:C.card,opacity:.78,zIndex:3},wheelFadeBottom:{position:'absolute',bottom:0,left:0,right:0,height:70,backgroundColor:C.card,opacity:.78,zIndex:3},colon:{fontSize:26,fontWeight:'900',color:C.text,marginHorizontal:4},selectedDuration:{textAlign:'center',fontSize:14,fontWeight:'800',color:C.p,marginTop:2},pickerSave:{height:52,borderRadius:13,backgroundColor:C.p,flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:18}});}
