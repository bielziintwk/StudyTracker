import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY='studytracker_dark_mode';
export const LIGHT={p:'#4F46E5',purple:'#7C3AED',bg:'#F8FAFC',text:'#1E293B',sec:'#64748B',card:'#FFFFFF',border:'#E2E8F0',soft:'#EEF2FF',danger:'#EF4444',muted:'#94A3B8'};
export const DARK={p:'#818CF8',purple:'#A78BFA',bg:'#0F172A',text:'#F8FAFC',sec:'#94A3B8',card:'#172033',border:'#26334A',soft:'#252B4A',danger:'#F87171',muted:'#64748B'};

const ThemeContext=createContext({dark:false,C:LIGHT,setDark:()=>{}});

export function ThemeProvider({children}){
 const [dark,setDarkState]=useState(false);
 useEffect(()=>{AsyncStorage.getItem(THEME_KEY).then(v=>setDarkState(v==='true')).catch(()=>{});},[]);
 const setDark=async value=>{
   setDarkState(value);
   try{await AsyncStorage.setItem(THEME_KEY,String(value));}catch(e){}
 };
 const value=useMemo(()=>({dark,C:dark?DARK:LIGHT,setDark}),[dark]);
 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme(){return useContext(ThemeContext);}
