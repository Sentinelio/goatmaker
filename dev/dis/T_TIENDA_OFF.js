var ok=0,ko=0; function t(c,m){ if(c) ok++; else { ko++; console.log("✘ "+m); } }
S=nuevoEstado("SEV","DC","Manu",9,"D",ROLES.DC[0].id,24);
TIENDA_ON=false; PANT_OFF={P14:{sub:{tienda:true}}};
t(!subVisible("cuentas","tienda"),"con la tienda apagada, ni el panel publicado la muestra");
t(subVisible("cuentas","staff") && subVisible("cuentas","dinero"),"el resto de pestañas de Cuentas siguen");
SUB.cuentas="tienda"; var tabs=subTabs("cuentas"); t(!/Tienda/.test(tabs),"las pestañas de Cuentas no traen «Tienda»"); t(SUB.cuentas!=="tienda","y si estabas en ella, te saca");
TIENDA_ON=true; t(subVisible("cuentas","tienda"),"encendida, vuelve");
console.log("TIENDA_OFF: "+ok+" ok · "+ko+" fallos");
