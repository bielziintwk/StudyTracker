import React, {useRef} from 'react';
import {View, PanResponder} from 'react-native';

const TABS=['Home','Subjects','Calendar','Profile'];

export default function SwipeTabs({navigation,current,children}){
 const pan=useRef(PanResponder.create({
  onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>12 && Math.abs(g.dx)>Math.abs(g.dy)*1.2,
  onPanResponderRelease:(_,g)=>{
   const threshold=70;
   if(Math.abs(g.dx)<threshold || Math.abs(g.dx)<=Math.abs(g.dy)) return;
   const index=TABS.indexOf(current);
   const goingForward=g.dx<0;
   const nextIndex=goingForward?index+1:index-1;
   if(nextIndex<0 || nextIndex>=TABS.length) return;

   // Informa a próxima tela de qual lado ela deve entrar.
   // Esquerda -> direita: a próxima tela entra pela esquerda.
   // Direita -> esquerda: a próxima tela entra pela direita.
   navigation.reset({
    index:0,
    routes:[{
     name:TABS[nextIndex],
     params:{swipeDirection:goingForward?'forward':'backward'}
    }]
   });
  },
  onPanResponderTerminate:()=>{},
 })).current;
 return <View style={{flex:1}} {...pan.panHandlers}>{children}</View>;
}
