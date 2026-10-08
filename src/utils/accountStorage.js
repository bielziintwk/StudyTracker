import AsyncStorage from '@react-native-async-storage/async-storage';

export const USER_KEY = 'studytracker_user';

export async function getCurrentUser(){
  try{
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

export function accountKey(base,user){
  const id = String(user?.id || user?.email || 'default').toLowerCase().replace(/[^a-z0-9._-]/g,'_');
  return `${base}_${id}`;
}

export async function getAccountItem(base){
  const user = await getCurrentUser();
  if(!user) return {user:null,key:base,value:null};
  const key = accountKey(base,user);
  const value = await AsyncStorage.getItem(key);
  return {user,key,value};
}

export async function setAccountItem(base,user,value){
  const key = accountKey(base,user);
  await AsyncStorage.setItem(key, value);
  return key;
}

export async function migrateLegacyData(user){
  if(!user) return;
  for(const base of ['studytracker_study_sessions','studytracker_subjects']){
    const key=accountKey(base,user);
    const existing=await AsyncStorage.getItem(key);
    const legacy=await AsyncStorage.getItem(base);
    if(!existing && legacy){
      await AsyncStorage.setItem(key,legacy);
      await AsyncStorage.removeItem(base);
    }
  }
}
