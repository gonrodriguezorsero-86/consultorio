// RN Consultorio · Registro de Trabajos del laboratorio (el mismo que G3 Lab de la PC)
// Los datos viven en la tabla config, clave lab_registro, y se combinan con la PC por fecha de cambio.
/* Registro de Trabajos - nucleo compartido (G3 Lab PC y RN Consultorio)
   RegistroApp({ store, toast, carpetaDe, abrirCarpeta, onLink, pacienteFijo }) */
function mergeReg(a,b){
  a=a||{}; b=b||{}; const ia=a.items||{}, ib=b.items||{}, items={}; let aMenos=false, bMenos=false;
  new Set(Object.keys(ia).concat(Object.keys(ib))).forEach(id=>{
    const x=ia[id], y=ib[id];
    if(x&&(!y||(x._m||0)>(y._m||0))){ items[id]=x; if(!y||(x._m||0)>(y._m||0)) bMenos=true; }
    else { items[id]=y; if(!x||(y._m||0)>(x._m||0)) aMenos=true; }
  });
  let cfg=a.cfg||null, cfgM=a.cfgM||0;
  if((b.cfgM||0)>cfgM){ cfg=b.cfg; cfgM=b.cfgM; aMenos=true; } else if(cfgM>(b.cfgM||0)) bMenos=true;
  return {state:{items,cfg,cfgM}, aCambia:aMenos, bCambia:bMenos};
}
function crearStoreRegistro({cargarLocal, guardarLocal, leerNube, subirNube, avisar}){
  let S={items:{},cfg:null,cfgM:0}, nuevo=false, t=null, enCurso=false, otra=false; const subs=[];
  const emit=()=>subs.forEach(f=>{ try{f();}catch(e){} });
  async function sync(){
    if(!leerNube) return;
    if(enCurso){ otra=true; return; } enCurso=true;
    try{
      const r=await leerNube();
      if(r!==undefined){
        const m=mergeReg(S,r||{});
        if(m.aCambia){ S=m.state; if(guardarLocal) await guardarLocal(S); emit(); }
        else S=m.state;
        if((m.bCambia||!r) && Object.keys(S.items).length) await subirNube(S);
      }
    }catch(e){ if(avisar) avisar(e); }
    enCurso=false; if(otra){ otra=false; sync(); }
  }
  function cambio(){ emit(); clearTimeout(t); t=setTimeout(async()=>{ try{ if(guardarLocal) await guardarLocal(S); }catch(e){ if(avisar) avisar(e); } sync(); },400); }
  const st={
    async load(){ try{ const j=cargarLocal?await cargarLocal():null; if(j&&j.items) S=j; else nuevo=true; }catch(e){ nuevo=true; } emit(); await sync(); if(S.items&&Object.keys(S.items).length) nuevo=false; emit(); },
    sync, esNuevo:()=>nuevo,
    all:()=>Object.values(S.items).filter(x=>!x._del),
    get:id=>{ const x=S.items[id]; return x&&!x._del?x:null; },
    put(id,data){ S.items[id]=Object.assign({},data,{id,_m:Date.now()}); cambio(); },
    patch(id,data){ const x=st.get(id); if(!x) throw new Error("not_found"); S.items[id]=Object.assign({},x,data,{id,_m:Date.now()}); cambio(); },
    del(id){ S.items[id]={id,_del:true,_m:Date.now()}; cambio(); },
    cfg:()=>S.cfg, setCfg(c){ S.cfg=c; S.cfgM=Date.now(); cambio(); },
    onChange(f){ subs.push(f); },
    importar(o){ Object.assign(S.items,o.items||{}); if(o.cfg){ S.cfg=o.cfg; S.cfgM=o.cfgM||Date.now(); } nuevo=false; cambio(); },
    exportar:()=>JSON.parse(JSON.stringify(S))
  };
  return st;
}
function RegistroApp(OPT){
const SEED = {"config":{"g3":70000,"lista":[{"id":"corona","n":"Corona (prestación clínica)","p":350000,"pieza":true},{"id":"g3","n":"Diseño y fabricación G3 (corona)","p":70000,"pieza":true},{"id":"munon","n":"Muñón / reconstrucción con fibra","p":300000,"pieza":true},{"id":"cor_impl","n":"Instalación de corona sobre implante","p":300000,"pieza":true},{"id":"inc_prep","n":"Preparación y escaneo para incrustación","p":70000,"pieza":true},{"id":"inc_cem","n":"Cementado de incrustación","p":300000,"pieza":true},{"id":"comp_s","n":"Restauración de composite simple","p":150000,"pieza":true},{"id":"comp_c","n":"Restauración de composite compleja","p":350000,"pieza":true},{"id":"prov","n":"Provisorio y prueba","p":150000,"pieza":true},{"id":"consulta","n":"Consulta y diagnóstico","p":150000,"pieza":false},{"id":"control","n":"Control y ajuste","p":150000,"pieza":false},{"id":"jornada","n":"Jornada completa (9 a 20 hs)","p":3320000,"pieza":false},{"id":"t_72ce5114","n":"diseño mock up","p":19000,"pieza":true},{"id":"t_e51701c5","n":"prueba mock up","p":150000,"pieza":false},{"id":"t_35631c5d","n":"escaneo solo","p":100000,"pieza":false},{"id":"t_7a1f3915","n":"diseño y fab corona","p":69986,"pieza":true},{"id":"t_7d1711c4","n":"diseño y fab incrustacion","p":70000,"pieza":true},{"id":"t_515b1031","n":"instalacion de incrustacion","p":300000,"pieza":true},{"id":"otro","n":"Otro","p":0,"pieza":false}],"tc":1530},"items":[{"id":"1b251fef-4c23-4199-8a62-e04383edcbfe","cantidad":5,"clinica":"Pergamino","cobrado":350000,"creado":1793108158587,"detalle":["14","15","24","25","26"],"dictado":"viviana branca, se le realizo tallado y escaneo para incrustaciones en piezas 24 25 26 y 14 y 15 . ese diseño y fabricacion tambien lo realizo g3","estado":"cobrado","fecha":"2026-10-27","fechaCobro":"2026-11-16","g3":0,"grupo":"022f47e8-ca2a-4ea9-a768-61976ea6aee2","nota":"Tallado y escaneo para incrustaciones en 24, 25, 26, 14 y 15 (inc_prep). El diseño y fabricación realizado por G3 corresponde a las mismas piezas; se asignó t_7d1711c4 (diseño y fab incrustación) porque la pieza es una incrustación. No se dictó instalación ni cementado, por lo que no se agregó ese ítem. No se mencionaron caras. Revisar si el diseño G3 corresponde a corona (g3) en lugar de incrustación.","paciente":"Viviana Branca","piezas":[14,15,24,25,26],"precioUnit":70000,"prestacion":350000,"tid":"inc_prep","total":350000,"tratamiento":"Preparación y escaneo para incrustación"},{"id":"224c8fa1-1cbb-49b9-9c89-bc93dc28865f","cantidad":8,"clinica":"Pergamino","cobrado":1200000,"creado":1793109163217,"detalle":["13 L","23 L","33 I","43 I","44 OV","45 OV","46 O","47 O"],"dictado":"moro joaquin, resinas directas en 47 y 46,  en 45 y 44 tienen resinas directas en oclusal y vestibular , en 44 y 45 vestibular,  diseño tallado fabricacion e instalacion de incrustacion en 37","estado":"cobrado","fecha":"2026-10-27","fechaCobro":"2026-10-16","g3":0,"grupo":"b95a7c73-64bc-4e7e-8b68-fcf4da9711ca","nota":"","paciente":"Moro Joaquin","piezas":[13,23,33,43,44,45,46,47],"precioUnit":150000,"prestacion":1200000,"tid":"comp_s","total":1200000,"tratamiento":"Restauración de composite simple"},{"id":"30057d0f-d294-4647-ab5f-3bfb987166ef","cantidad":1,"clinica":"Pergamino","cobrado":70000,"creado":1793109163218,"detalle":["37 MODL"],"dictado":"moro joaquin, resinas directas en 47 y 46,  en 45 y 44 tienen resinas directas en oclusal y vestibular , en 44 y 45 vestibular,  diseño tallado fabricacion e instalacion de incrustacion en 37","estado":"cobrado","fecha":"2026-10-27","fechaCobro":"2026-10-16","g3":0,"grupo":"b95a7c73-64bc-4e7e-8b68-fcf4da9711ca","nota":"","paciente":"Moro Joaquin","piezas":[37],"precioUnit":70000,"prestacion":70000,"tid":"t_7d1711c4","total":70000,"tratamiento":"diseño y fab incrustacion"},{"id":"4399ea7c-c6f6-4dbe-9174-93d00f637cad","cantidad":1,"clinica":"Pergamino","cobrado":0,"creado":1793109237406,"detalle":[],"dictado":"prueba de mock up a señora que no recuerdo el nombre","estado":"pendiente","fecha":"2026-10-27","fechaCobro":"","g3":0,"grupo":"90409335-129a-4dc3-acba-ae9bb160b2f1","nota":"","paciente":"(no recuerdo)","piezas":[],"precioUnit":150000,"prestacion":150000,"tid":"t_e51701c5","total":150000,"tratamiento":"prueba mock up"},{"id":"63ba760b-bedc-425a-a5cc-705d355160be","cantidad":1,"clinica":"Pergamino","cobrado":300000,"creado":1793109163220,"detalle":["37"],"dictado":"moro joaquin, resinas directas en 47 y 46,  en 45 y 44 tienen resinas directas en oclusal y vestibular , en 44 y 45 vestibular,  diseño tallado fabricacion e instalacion de incrustacion en 37","estado":"cobrado","fecha":"2026-10-27","fechaCobro":"2026-10-16","g3":0,"grupo":"b95a7c73-64bc-4e7e-8b68-fcf4da9711ca","nota":"","paciente":"Moro Joaquin","piezas":[37],"precioUnit":300000,"prestacion":300000,"tid":"t_515b1031","total":300000,"tratamiento":"instalacion de incrustacion"},{"id":"c4d69022-a906-44a6-a549-4f8060940945","cantidad":11,"clinica":"Pergamino","cobrado":0,"creado":1794859591752,"detalle":["11","12","13","14","15","16","17","21","22","23","25"],"dictado":"encerado de maxilar superior 10 piezas","estado":"pendiente","fecha":"2026-11-16","fechaCobro":"","g3":0,"grupo":"f6c5e367-9415-4837-ba62-9d0ff57abc2b","nota":"","paciente":"pellegrino","piezas":[11,12,13,14,15,16,17,21,22,23,25],"precioUnit":10000,"prestacion":110000,"tid":"t_72ce5114","total":110000,"tratamiento":"diseño mock up"},{"id":"d6c4a384-32c2-481e-82dc-03325deae32c","cantidad":5,"clinica":"Pergamino","cobrado":350000,"creado":1793108158588,"detalle":["14","15","24","25","26"],"dictado":"viviana branca, se le realizo tallado y escaneo para incrustaciones en piezas 24 25 26 y 14 y 15 . ese diseño y fabricacion tambien lo realizo g3","estado":"cobrado","fecha":"2026-10-27","fechaCobro":"2026-11-16","g3":0,"grupo":"022f47e8-ca2a-4ea9-a768-61976ea6aee2","nota":"Tallado y escaneo para incrustaciones en 24, 25, 26, 14 y 15 (inc_prep). El diseño y fabricación realizado por G3 corresponde a las mismas piezas; se asignó t_7d1711c4 (diseño y fab incrustación) porque la pieza es una incrustación. No se dictó instalación ni cementado, por lo que no se agregó ese ítem. No se mencionaron caras. Revisar si el diseño G3 corresponde a corona (g3) en lugar de incrustación.","paciente":"Viviana Branca","piezas":[14,15,24,25,26],"precioUnit":70000,"prestacion":350000,"tid":"t_7d1711c4","total":350000,"tratamiento":"diseño y fab incrustacion"},{"id":"d8384ec8-61d7-4673-bed8-f05248f288de","cantidad":6,"clinica":"Pergamino","cobrado":0,"creado":1794859627733,"detalle":["11","12","13","21","22","23"],"dictado":"encerado de 6 piezas ozcoidy","estado":"pendiente","fecha":"2026-11-16","fechaCobro":"","g3":0,"grupo":"88593577-318d-4a28-957a-ac41150d2882","nota":"","paciente":"ozcoidy","piezas":[11,12,13,21,22,23],"precioUnit":10000,"prestacion":60000,"tid":"t_72ce5114","total":60000,"tratamiento":"diseño mock up"},{"id":"f09b2ab2-aad1-46f1-a494-c35af37dc602","cantidad":6,"clinica":"Pergamino","cobrado":0,"creado":1795530471890,"detalle":["11","12","13","21","22","23"],"dictado":"morales claudia encerado de piezas 13 hasta 23","estado":"pendiente","fecha":"2026-11-24","fechaCobro":"","g3":0,"grupo":"a05f95dc-640c-4e85-8e4a-ae3edc21ffb2","nota":"","paciente":"Claudia Morales","piezas":[11,12,13,21,22,23],"precioUnit":19000,"prestacion":114000,"tid":"t_72ce5114","total":114000,"tratamiento":"diseño mock up"}]};
const RS = OPT.store;
const toastExt = OPT.toast||function(){};
const DEFAULT = JSON.parse(JSON.stringify(SEED.config));
function ensureG3(c){
  if(!c.lista.some(t=>t.id==="g3")){
    const i=Math.max(0,c.lista.findIndex(t=>t.id==="corona")+1);
    c.lista.splice(i,0,{id:"g3",n:"Diseño y fabricación G3 (corona)",p:c.g3||70000,pieza:true});
  }
  if(!c.lista.some(t=>t.id==="otro")) c.lista.push({id:"otro",n:"Otro",p:0,pieza:false});
  return c;
}
let cfg = ensureG3(JSON.parse(JSON.stringify(RS.cfg()||DEFAULT)));
let trabajos = [];
const $ = id => document.getElementById("r-"+id);
const money = n => "$" + Math.round(n||0).toLocaleString("es-AR");
const today = () => { const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const fmtFecha = f => (f||"").split("-").reverse().join("/");
function status(t,warn){ const s=$("status"); if(!t){s.hidden=true;return;} s.textContent=t; s.className="rmsg"+(warn?" warn":""); s.hidden=false; }
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));

function merge(){
  trabajos=RS.all();
  if(!$("v-cuenta").hidden) renderCuenta();
  if(OPT.onChange) OPT.onChange();
}
function queue(o){
  if(o.op==="set") RS.put(o.id,o.data);
  else if(o.op==="update"){ try{ RS.patch(o.id,o.data); }catch(e){} }
  else if(o.op==="delete") RS.del(o.id);
}
RS.onChange(()=>{ const c=RS.cfg(); if(c){ cfg=ensureG3(JSON.parse(JSON.stringify(c))); items.forEach(it=>{ if(it.tid && !cfg.lista.some(t=>t.id===it.tid)) it.tid=""; }); if(!$("v-precios").hidden) renderPrecios(); } merge(); });

/* sub-pestañas */
const views=["cargar","cuenta","precios"];
function show(v){ views.forEach(x=>{ $("v-"+x).hidden = x!==v; $("tab-"+x).setAttribute("aria-selected", x===v); }); if(v==="cuenta") renderCuenta(); if(v==="precios") renderPrecios(); if(v==="cargar") renderItems(); }
views.forEach(v=>$("tab-"+v).addEventListener("click",()=>show(v)));

/* tratamientos: cada uno con piezas y caras */
const UP=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LO=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
const VALID=new Set(UP.concat(LO));
const anterior = n => (n%10)<=3;
const facesFor = n => anterior(n) ? ["M","I","D","V","L"] : ["M","O","D","V","L"];
let items=[];
const newItem = (tid) => ({tid: tid || "", sel:new Map()});
const VACIO = {id:"",n:"",p:0,pieza:false};
const tratById = id => cfg.lista.find(t=>t.id===id) || cfg.lista.find(t=>t.id==="otro") || cfg.lista[0];
function normCaras(n,str){
  const ok=facesFor(n); const s=new Set();
  String(str||"").toUpperCase().replace(/P/g,"L").split("").forEach(ch=>{
    let c=ch; if(c==="O"&&anterior(n)) c="I"; if(c==="I"&&!anterior(n)) c="O";
    if(ok.includes(c)) s.add(c);
  });
  return ok.filter(c=>s.has(c)).join("");
}
let editId=null, linkJob=null;
function itemCalc(it){
  const base=it.tid ? tratById(it.tid) : VACIO;
  const t = Object.assign({},base,{p:(it.precio!==undefined && it.precio!==null)?it.precio:base.p, n: it.nombre||base.n});
  const piezas=[...it.sel.keys()].sort((a,b)=>a-b);
  const cant=t.pieza?Math.max(piezas.length,1):1;
  const detalle=piezas.map(n=>{ const c=facesFor(n).filter(x=>it.sel.get(n).has(x)).join(""); return c?`${n} ${c}`:String(n); });
  return {t,piezas,detalle,cant,total:t.p*cant};
}
const cobradoDe = t => (typeof t.cobrado==="number") ? t.cobrado : (t.estado==="cobrado" ? (t.total||0) : 0);
const saldoDe = t => Math.max((t.total||0)-cobradoDe(t),0);
const estadoPor = (total,cob) => cob>=total && total>0 ? "cobrado" : (cob>0 ? "parcial" : "pendiente");
function renderItems(){
  const box=$("items"); box.innerHTML="";
  items.forEach((it,idx)=>{
    const c=itemCalc(it);
    const card=document.createElement("div"); card.className="tx";
    const head=document.createElement("div"); head.className="tx-head";
    const hb=document.createElement("b"); hb.textContent="Tratamiento "+(idx+1); head.appendChild(hb);
    if(items.length>1){ const rm=document.createElement("button"); rm.className="rlink"; rm.textContent="Quitar"; rm.onclick=()=>{ items.splice(idx,1); renderItems(); }; head.appendChild(rm); }
    const sel=document.createElement("select"); sel.setAttribute("aria-label","Tratamiento");
    const ph=document.createElement("option"); ph.value=""; ph.textContent="Elegí el tratamiento"; ph.disabled=true; sel.appendChild(ph);
    cfg.lista.forEach(t=>{ const o=document.createElement("option"); o.value=t.id; o.textContent=t.n+" · "+money(t.p)+(t.pieza?" c/pieza":""); sel.appendChild(o); });
    sel.value=it.tid; sel.onchange=()=>{ it.tid=sel.value; it.precio=null; it.nombre=null; renderItems(); };
    let nameLab=null;
    if(it.tid==="otro"){
      nameLab=document.createElement("label"); nameLab.textContent="Nombre del trabajo";
      const ni=document.createElement("input"); ni.value=it.nombre||""; ni.placeholder="Ej: Diseño y fabricación de corona";
      ni.onchange=()=>{ it.nombre=ni.value.trim()||null; calc(); };
      nameLab.appendChild(ni);
    }
    let priceLab=null;
    if(editId){
      priceLab=document.createElement("label"); priceLab.textContent=c.t.pieza?"Precio por pieza":"Precio";
      const pi=document.createElement("input"); pi.type="number"; pi.inputMode="numeric"; pi.value=c.t.p;
      pi.onchange=()=>{ it.precio=+pi.value||0; renderItems(); };
      priceLab.appendChild(pi);
    }
    const odo=document.createElement("div");
    const a1=document.createElement("div"); a1.className="arch"; a1.innerHTML="<span>Superior · derecha</span><span>izquierda</span>";
    const a2=document.createElement("div"); a2.className="arch"; a2.innerHTML="<span>Inferior · derecha</span><span>izquierda</span>";
    const grids=[UP,LO].map((arr,k)=>{ const g=document.createElement("div"); g.className="teeth"; if(k) g.style.marginTop="3px";
      arr.forEach((n,i)=>{ const b=document.createElement("button"); b.type="button"; b.textContent=n; if(i===7) b.className="mid";
        b.setAttribute("aria-pressed",it.sel.has(n)); b.onclick=()=>{ it.sel.has(n)?it.sel.delete(n):it.sel.set(n,new Set()); renderItems(); }; g.appendChild(b); });
      return g; });
    odo.append(a1,grids[0],grids[1],a2);
    const faces=document.createElement("div"); faces.className="faces";
    c.piezas.forEach(n=>{ const r=document.createElement("div"); r.className="face-row";
      const lab=document.createElement("span"); lab.className="n"; lab.textContent=n; r.appendChild(lab);
      facesFor(n).forEach(f=>{ const b=document.createElement("button"); b.type="button"; b.textContent=f; b.title={M:"Mesial",O:"Oclusal",I:"Incisal",D:"Distal",V:"Vestibular",L:"Lingual / palatino"}[f];
        b.setAttribute("aria-pressed",it.sel.get(n).has(f)); b.onclick=()=>{ const s=it.sel.get(n); s.has(f)?s.delete(f):s.add(f); renderItems(); }; r.appendChild(b); });
      faces.appendChild(r); });
    const sub=document.createElement("div"); sub.className="sub";
    const sl=document.createElement("span"); sl.textContent=!it.tid?"":(c.t.pieza?`${c.cant} × ${money(c.t.p)}`:"Precio fijo");
    const sr=document.createElement("span"); sr.textContent=money(c.total); sub.append(sl,sr);
    card.append(head,sel); if(nameLab) card.append(nameLab); if(priceLab) card.append(priceLab); card.append(odo); if(c.piezas.length){ card.append(faces); }
    card.append(sub); box.appendChild(card);
  });
  calc();
}
function calc(){
  const cs=items.map(itemCalc); const tot=cs.reduce((s,c)=>s+c.total,0);
  $("f-detalle").textContent = cs.length>1 ? `${cs.length} tratamientos` : (cs[0]&&items[0].tid? (cs[0].t.pieza?`${cs[0].cant} × ${money(cs[0].t.p)}`:money(cs[0].t.p)) : "—");
  $("f-total").textContent=money(tot);
  if(editId){ const cob=+$("f-cobrado").value||0; const sal=Math.max(tot-cob,0);
    $("f-saldo").textContent = sal>0 ? `Saldo pendiente: ${money(sal)}` : (cob>0 ? "Trabajo pagado completo." : ""); }
}
$("f-cobrado").addEventListener("input",()=>{ if(+$("f-cobrado").value>0 && !$("f-fcobro").value) $("f-fcobro").value=today(); calc(); });
$("btn-pago-total").addEventListener("click",()=>{ const tot=items.map(itemCalc).reduce((s,c)=>s+c.total,0); $("f-cobrado").value=tot; if(!$("f-fcobro").value) $("f-fcobro").value=today(); calc(); });
$("btn-add-item").addEventListener("click",()=>{ items.push(newItem()); renderItems(); });

/* interpretación del dictado */
const FACE_WORDS=[["mesial","M"],["mesio","M"],["oclusal","O"],["ocluso","O"],["incisal","I"],["distal","D"],["vestibular","V"],["bucal","V"],["lingual","L"],["palatin","L"]];
const KW="clase|corona|incrust|muñ|munon|compos|resina|provis|control|consulta|dise|g3|instal|cement|perno|implante|carilla|endo|extrac|blanq|restaur|reconst|encer|mock|escane";
function tratamientosEn(cl){
  const low=cl.toLowerCase();
  const propio=cfg.lista.filter(t=>t.id!=="otro").sort((a,b)=>b.n.length-a.n.length).find(t=>low.includes(t.n.toLowerCase()));
  if(propio) return [propio.id];
  const has=id=>cfg.lista.some(t=>t.id===id);
  const byName=re=>{ const t=cfg.lista.find(x=>re.test(x.n.toLowerCase())); return t?t.id:null; };
  const out=[];
  if(/encer|mock/.test(low)){ const id=/prueba/.test(low)?byName(/prueba mock/):byName(/dise.o mock|encer/); if(id) return [id]; }
  if(/g3|dise[ñn]|fabric/.test(low)){
    const id = /incrust/.test(low) ? byName(/dise.*incrust/) : null;
    out.push(id || (has("g3")?"g3":null));
    if(/instal|cement/.test(low)) out.push(/incrust/.test(low)?(byName(/instal.*incrust/)||"inc_cem"):(/implante/.test(low)&&has("cor_impl")?"cor_impl":"corona"));
    return out.filter(x=>x&&has(x));
  }
  const map=[["sobre implante","cor_impl"],["implante","cor_impl"],["muñ","munon"],["munon","munon"],["perno","munon"],["fibra","munon"],["cementad","inc_cem"],["incrust","inc_prep"],["corona","corona"],["instal","corona"],["compleja","comp_c"],["clase","comp_s"],["composite","comp_s"],["resina","comp_s"],["restaur","comp_s"],["provisori","prov"],["consulta","consulta"],["control","control"],["ajuste","control"],["jornada","jornada"]];
  const m=map.find(([k,id])=>low.includes(k)&&has(id));
  return m?[m[1]]:[];
}
function piezasEn(cl){
  const res=new Map();
  let m; const reN=/\b([1-4][1-8])\b/g;
  while((m=reN.exec(cl))){ const n=+m[1]; if(VALID.has(n)&&!res.has(n)) res.set(n,""); }
  const reDesp=/\b([1-4][1-8])\s*([MODVLIP]{1,5})\b/g; while((m=reDesp.exec(cl))){ const n=+m[1]; if(res.has(n)) res.set(n,m[2]); }
  const reAntes=/\b([MODVLIP]{1,5})\s+(?:en\s+)?(?:la\s+)?(?:pieza\s+)?([1-4][1-8])\b/g; while((m=reAntes.exec(cl))){ const n=+m[2]; if(res.has(n)&&!res.get(n)) res.set(n,m[1]); }
  const low=cl.toLowerCase();
  const fw=FACE_WORDS.filter(([w])=>new RegExp("\\b"+w).test(low)).map(([,c])=>c).join("");
  if(fw) res.forEach((v,k)=>{ if(!v) res.set(k,fw); });
  return [...res.entries()].map(([n,caras])=>({n,caras}));
}
function localParse(txt){
  const reKW=new RegExp("(?:la|el|una|un|las|los)?\\s*(?:"+KW+")","i");
  const primera=(txt.split(/[,.;:\n]/)[0]||"").trim();
  const paciente = reKW.test(primera) ? (txt.split(new RegExp("\\s(?="+KW+")|\\s(?:en la|pieza)\\b","i"))[0]||"").trim() : primera;
  const corte=new RegExp("[.;\\n]|,(?=\\s*(?:y\\s+)?(?:la|el|una|un|las|los)?\\s*(?:"+KW+"))|\\s+y\\s+(?=(?:la|el|una|un|las|los)?\\s*(?:"+KW+"))","i");
  const resto = reKW.test(primera) ? txt : txt.slice(txt.indexOf(primera)+primera.length);
  const out=[]; let ultimas=[];
  resto.split(corte).forEach(cl=>{
    if(!cl||!cl.trim()) return;
    const tids=tratamientosEn(cl), pz=piezasEn(cl);
    if(pz.length) ultimas=pz;
    if(tids.length) tids.forEach(id=>out.push({tratamiento:id,piezas:pz.length?pz:ultimas}));
    else if(pz.length && out.length && !out[out.length-1].piezas.length) out[out.length-1].piezas=pz;
  });
  return {paciente,items:out.length?out:[{tratamiento:"otro",piezas:ultimas}],nota:""};
}
function interpretar(pacienteFijo){
  const txt=$("dictado").value.trim(); if(!txt){ status("Dictá o escribí el trabajo primero.",true); return; }
  const r=localParse(txt);
  $("f-paciente").value=pacienteFijo||r.paciente||"";
  items=(r.items||[]).map(x=>{
    const it=newItem(cfg.lista.some(t=>t.id===x.tratamiento)?x.tratamiento:"otro");
    (x.piezas||[]).forEach(p=>{ const n=+(p&&p.n!==undefined?p.n:p); if(VALID.has(n)) it.sel.set(n,new Set(normCaras(n,p&&p.caras).split(""))); });
    return it;
  });
  if(!items.length) items=[newItem()];
  renderItems();
  status("Revisá tratamientos, piezas y caras, y tocá Guardar.");
}
$("btn-interpretar").addEventListener("click",()=>interpretar());

function setEditMode(on){
  $("edit-banner").hidden=!on; $("cobro").hidden=!on;
  ["h-dictado","dictado","hint-dictado","btn-add-item"].forEach(id=>{ $(id).hidden=on; });
  $("btn-interpretar").parentElement.hidden=on;
  $("btn-guardar").textContent=on?"Guardar cambios":"Guardar trabajo";
  $("btn-limpiar").textContent=on?"Cancelar":"Limpiar";
  const bb=$("btn-borrar"); bb.hidden=!on; bb.dataset.c=""; bb.textContent="Borrar este trabajo";
}
$("btn-borrar").addEventListener("click",()=>{
  const bb=$("btn-borrar"); if(!editId) return;
  if(!bb.dataset.c){ bb.dataset.c="1"; bb.textContent="Tocá otra vez para borrarlo"; return; }
  queue({op:"delete",id:editId}); status("Trabajo borrado."); limpiar(); show("cuenta");
});
function limpiar(){ editId=null; linkJob=null; $("link-banner").hidden=true; setEditMode(false); $("dictado").value=""; $("f-paciente").value=""; $("f-nota").value=""; $("f-fecha").value=today(); $("f-cobrado").value=""; $("f-fcobro").value=""; items=[newItem()]; renderItems(); }
$("btn-limpiar").addEventListener("click",()=>{ const volver=!!editId; limpiar(); status(""); if(volver) show("cuenta"); });

function abrirEdicion(t){
  editId=t.id;
  $("f-fecha").value=t.fecha||today(); $("f-clinica").value=t.clinica||""; $("f-paciente").value=t.paciente||""; $("f-nota").value=t.nota||"";
  $("f-cobrado").value=cobradoDe(t)||""; $("f-fcobro").value=t.fechaCobro||"";
  let tid=t.tid && cfg.lista.some(x=>x.id===t.tid) ? t.tid : ((cfg.lista.find(x=>x.n===t.tratamiento)||{}).id || "otro");
  const it=newItem(tid);
  it.precio = typeof t.precioUnit==="number" ? t.precioUnit : null;
  if(tid==="otro" || !cfg.lista.some(x=>x.n===t.tratamiento)) it.nombre=t.tratamiento;
  const det=(t.detalle&&t.detalle.length)?t.detalle:(t.piezas||[]).map(String);
  det.forEach(d=>{ const [n,c]=String(d).split(" "); const num=+n; if(VALID.has(num)) it.sel.set(num,new Set(normCaras(num,c).split("").filter(Boolean))); });
  items=[it];
  setEditMode(true); show("cargar"); renderItems(); window.scrollTo(0,0);
  status("");
}

function guardar(){
  const pac=$("f-paciente").value.trim();
  if(!pac){ status("Falta el nombre del paciente.",true); return; }
  const sinTrat=items.findIndex(it=>!it.tid);
  if(sinTrat>=0){ status(items.length>1?`Elegí el tratamiento ${sinTrat+1}.`:"Elegí el tratamiento.",true); return; }
  const cs=items.map(itemCalc);
  const sinPieza=cs.findIndex(c=>c.t.pieza&&!c.piezas.length);
  if(sinPieza>=0){ status(`Marcá al menos una pieza en el tratamiento ${sinPieza+1}.`,true); return; }
  if(editId){
    const c=cs[0], esG3=items[0].tid==="g3", cob=Math.min(+$("f-cobrado").value||0, c.total);
    queue({op:"update",id:editId,data:{fecha:$("f-fecha").value||today(),clinica:$("f-clinica").value.trim()||"Pergamino",paciente:pac,
      tid:items[0].tid,tratamiento:c.t.n,piezas:c.piezas,detalle:c.detalle,precioUnit:c.t.p,cantidad:c.cant,
      prestacion:esG3?0:c.total,g3:esG3?c.total:0,total:c.total,nota:$("f-nota").value.trim(),
      cobrado:cob,fechaCobro:cob>0?($("f-fcobro").value||today()):"",estado:estadoPor(c.total,cob)}});
    status(`Cambios guardados: ${pac}, ${c.t.n}.`);
    limpiar(); show("cuenta"); return;
  }
  const grupo=newId(), fecha=$("f-fecha").value||today(), clinica=$("f-clinica").value.trim()||"Pergamino", nota=$("f-nota").value.trim(), dictado=$("dictado").value.trim();
  const ids=[];
  cs.forEach((c,i)=>{
    const esG3=items[i].tid==="g3", id=newId(); ids.push(id);
    queue({op:"set",id,data:{fecha,clinica,paciente:pac,grupo,tid:items[i].tid,tratamiento:c.t.n,piezas:c.piezas,detalle:c.detalle,
      precioUnit:c.t.p,cantidad:c.cant,prestacion:esG3?0:c.total,g3:esG3?c.total:0,total:c.total,nota,dictado,estado:"pendiente",cobrado:0,fechaCobro:"",creado:Date.now()+i,jobId:linkJob||""}});
  });
  if(linkJob && OPT.onLink) OPT.onLink(linkJob, grupo);
  const tot=cs.reduce((s,c)=>s+c.total,0);
  status(`Guardado: ${pac}, ${cs.length} tratamiento${cs.length>1?"s":""}, ${money(tot)}. Queda pendiente de cobro en Cuenta.`);
  limpiar();
}
$("btn-guardar").addEventListener("click",guardar);

/* cuenta agrupada por paciente */
const keyPac = p => (p||"Sin nombre").trim().toLowerCase();
function filtrados(){
  const mes=$("c-mes").value, cl=$("c-clinica").value;
  return trabajos.filter(t=>(!mes||(t.fecha||"").startsWith(mes))&&(!cl||t.clinica===cl));
}
function porPaciente(L){
  const g=new Map();
  L.forEach(t=>{ const k=keyPac(t.paciente); if(!g.has(k)) g.set(k,{nombre:(t.paciente||"Sin nombre").trim(),items:[]}); g.get(k).items.push(t); });
  const arr=[...g.values()];
  arr.forEach(p=>{ p.items.sort((a,b)=>(a.fecha+a.creado)<(b.fecha+b.creado)?-1:1); p.total=p.items.reduce((s,t)=>s+(t.total||0),0); p.cob=p.items.reduce((s,t)=>s+cobradoDe(t),0); p.pend=p.items.reduce((s,t)=>s+saldoDe(t),0); });
  return arr.sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
}
const piezasTxt = t => (t.detalle&&t.detalle.length?t.detalle:(t.piezas||[]).map(String)).join(", ");
const abiertos=new Set();
const el = (tag,cls,txt) => { const e=document.createElement(tag); if(cls) e.className=cls; if(txt!==undefined) e.textContent=txt; return e; };
function renderCuenta(){
  const cls=[...new Set(trabajos.map(t=>t.clinica))].sort(); const cs=$("c-clinica"), cur=cs.value;
  cs.innerHTML='<option value="">Todas</option>'; cls.forEach(c=>{ const o=document.createElement("option"); o.textContent=c; cs.appendChild(o); }); cs.value=cls.includes(cur)?cur:"";
  const L=filtrados(), box=$("lista"); box.innerHTML="";
  let pr=0,g=0,pend=0;
  L.forEach(t=>{ pr+=t.prestacion||0; g+=t.g3||0; pend+=saldoDe(t); });
  $("s-prest").textContent=money(pr); $("s-g3").textContent=money(g); $("s-pend").textContent=money(pend);
  const q=$("c-buscar").value.trim().toLowerCase(), soloSaldo=$("c-saldo").checked;
  const grupos=porPaciente(L).filter(p=>(!q||p.nombre.toLowerCase().includes(q))&&(!soloSaldo||p.pend>0));
  if(!L.length){ box.appendChild(el("p","rhint","No hay trabajos cargados en este mes. Cargalos desde Cargar.")); return; }
  if(!grupos.length){ box.appendChild(el("p","rhint","Ningún paciente coincide con el filtro.")); return; }
  const wrap=el("div","tw"), table=el("table","ct");
  const thead=el("thead"); const hr=el("tr");
  [["Paciente",""],["Total","r"],["Debe","r"],["",""]].forEach(([t,c])=>hr.appendChild(el("th",c,t)));
  thead.appendChild(hr); table.appendChild(thead);
  grupos.forEach(p=>{
    const k=keyPac(p.nombre), open=abiertos.has(k);
    const tb=el("tbody");
    const pr=el("tr","pr"); pr.tabIndex=0; pr.setAttribute("aria-expanded",open);
    const n=el("td"); n.appendChild(el("span","pn",p.nombre)); n.appendChild(el("span","pc",` ${p.items.length} trab.`));
    const debe=el("td","r mono"+(p.pend>0?" debe":" ok"), p.pend>0?money(p.pend):"pagado");
    pr.append(n, el("td","r mono",money(p.total)), debe, el("td","chev",open?"▾":"▸"));
    const toggle=()=>{ open?abiertos.delete(k):abiertos.add(k); renderCuenta(); };
    pr.onclick=toggle; pr.onkeydown=e=>{ if(e.key==="Enter") toggle(); };
    tb.appendChild(pr);
    if(open){
      p.items.forEach(t=>{
        const est=estadoPor(t.total||0,cobradoDe(t));
        const r=el("tr","it"); r.tabIndex=0; r.title="Tocá para editar";
        const a=el("td"); const pz=piezasTxt(t);
        a.appendChild(el("div","itt",t.tratamiento));
        a.appendChild(el("div","its",`${fmtFecha(t.fecha).slice(0,5)}${pz?" · "+pz:""}`));
        const st=el("td","r"); const chip=el("button","chip"+(est==="cobrado"?" ok":""), est==="cobrado"?"pagado":(est==="parcial"?`pagó ${money(cobradoDe(t))}`:"pendiente"));
        chip.title=est==="cobrado"?"Tocá para marcar pendiente":"Tocá para marcar pagado";
        chip.onclick=e=>{ e.stopPropagation(); queue({op:"update",id:t.id,data: est==="cobrado" ? {cobrado:0,fechaCobro:"",estado:"pendiente"} : {cobrado:t.total||0,fechaCobro:today(),estado:"cobrado"}}); };
        st.appendChild(chip);
        r.append(a, el("td","r mono",money(t.total)), st, el("td","chev","›"));
        r.onclick=()=>abrirEdicion(t); r.onkeydown=e=>{ if(e.key==="Enter") abrirEdicion(t); };
        tb.appendChild(r);
      });
      const fr=el("tr","foot"); const td=el("td"); td.colSpan=4;
      if(OPT.carpetaDe && OPT.carpetaDe(p.nombre)){ const va=el(OPT.carpetaEsLink?"a":"button","rlink",OPT.textoCarpeta||"Abrir carpeta del caso"); va.style.marginRight="16px"; if(OPT.carpetaEsLink){ va.href=OPT.carpetaDe(p.nombre); va.target="_blank"; va.rel="noopener"; } else va.onclick=()=>OPT.abrirCarpeta(p.nombre); td.appendChild(va); }
      if(p.pend>0){
        const all=el("button","rlink",`Pagó todo (${money(p.pend)})`);
        all.onclick=()=>{ if(!all.dataset.c){ all.dataset.c="1"; all.textContent=`Confirmar pago de ${money(p.pend)}`; return; }
          const hoy=today(); p.items.filter(t=>saldoDe(t)>0).forEach(t=>queue({op:"update",id:t.id,data:{cobrado:t.total||0,fechaCobro:hoy,estado:"cobrado"}}));
          status(`Registrado: ${p.nombre} pagó ${money(p.pend)}.`); };
        td.appendChild(all);
      }
      fr.appendChild(td); tb.appendChild(fr);
    }
    table.appendChild(tb);
  });
  wrap.appendChild(table); box.appendChild(wrap);
}
["c-mes","c-clinica","c-saldo"].forEach(id=>$(id).addEventListener("change",renderCuenta));
$("c-buscar").addEventListener("input",renderCuenta);

function resumenTexto(){
  const grupos=porPaciente(filtrados()); const mes=$("c-mes").value;
  let tot=0;
  const bloques=grupos.map(p=>{ tot+=p.total;
    const lines=p.items.map(t=>{ const pz=piezasTxt(t); return `  ${fmtFecha(t.fecha)} – ${t.tratamiento}${pz?" (pieza "+pz+")":""}: ${money(t.total)}`; });
    const est = p.pend<=0 ? "Pagado" : (p.cob>0 ? `Pagó ${money(p.cob)} · Saldo ${money(p.pend)}` : `Saldo ${money(p.pend)}`);
    return `${p.nombre.toUpperCase()} – ${money(p.total)}\n${lines.join("\n")}\n  ${est}`; });
  return `Dr. Gonzalo Rodríguez Orsero – Trabajos ${mes.split("-").reverse().join("/")}${$("c-clinica").value?" – "+$("c-clinica").value:""}\n\n${bloques.join("\n\n")}\n\nTOTAL: ${money(tot)} (USD ${Math.round(tot/(cfg.tc||1)).toLocaleString("es-AR")})`;
}
$("btn-copiar").addEventListener("click",()=>{
  const txt=resumenTexto();
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>status("Resumen copiado. Pegalo en WhatsApp o en un mail."))
  .catch(()=>{ const r=$("resumen"); r.hidden=false; r.value=txt; r.select(); status("Copiá el resumen del cuadro.",true); });
});
$("btn-csv").addEventListener("click",()=>{
  const rows=[["Paciente","Fecha","Clínica","Tratamiento","Piezas y caras","Cantidad","Precio unitario","Total","Cobrado","Saldo","Fecha de cobro","Nota"]];
  porPaciente(filtrados()).forEach(p=>p.items.forEach(t=>rows.push([p.nombre,t.fecha,t.clinica,t.tratamiento,piezasTxt(t),t.cantidad,t.precioUnit,t.total,cobradoDe(t),saldoDe(t),t.fechaCobro||"",t.nota])));
  const csv="﻿"+rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`trabajos-${$("c-mes").value||"todos"}.csv`; a.click();
});
$("btn-liquidar").addEventListener("click",e=>{
  const b=e.currentTarget; const L=filtrados().filter(t=>saldoDe(t)>0);
  if(!L.length){ status("No hay trabajos pendientes en este mes."); return; }
  if(!b.dataset.c){ b.dataset.c="1"; b.textContent=`Confirmar: ${L.length} trabajos como pagados`; return; }
  b.dataset.c=""; b.textContent="Marcar mes como cobrado";
  const hoy=today(); L.forEach(t=>queue({op:"update",id:t.id,data:{cobrado:t.total||0,fechaCobro:hoy,estado:"cobrado"}}));
});

/* precios */
function renderPrecios(){
  $("p-tc").value=cfg.tc;
  $("p-tabla").innerHTML="";
  cfg.lista.forEach(t=>{ const tr=document.createElement("tr");
    const a=document.createElement("td"); const nm=document.createElement("input"); nm.className="nm"; nm.id="r-pn-"+t.id; nm.value=t.n; a.appendChild(nm);
    const b=document.createElement("td"); b.style.width="30%"; const inp=document.createElement("input"); inp.type="number"; inp.id="r-pp-"+t.id; inp.value=t.p; b.appendChild(inp);
    const c=document.createElement("td"); c.className="c"; const ck=document.createElement("input"); ck.type="checkbox"; ck.id="r-pk-"+t.id; ck.checked=!!t.pieza; ck.setAttribute("aria-label","Se cobra por pieza"); c.appendChild(ck);
    const d=document.createElement("td"); d.className="c";
    if(t.id!=="otro"){ const del=document.createElement("button"); del.className="rlink"; del.textContent="Borrar";
      del.onclick=()=>{ if(del.dataset.c){ leerTabla(); cfg.lista=cfg.lista.filter(x=>x.id!==t.id); guardarPrecios(`Borrado: ${t.n}.`); }
        else{ del.dataset.c="1"; del.textContent="¿Seguro?"; } };
      d.appendChild(del); }
    tr.append(a,b,c,d); $("p-tabla").appendChild(tr); });
}
function leerTabla(){
  cfg.tc=+$("p-tc").value||cfg.tc;
  cfg.lista.forEach(t=>{ const n=$("pn-"+t.id), v=$("pp-"+t.id), k=$("pk-"+t.id);
    if(n&&n.value.trim()) t.n=n.value.trim(); if(v) t.p=+v.value||0; if(k) t.pieza=k.checked; });
}
function guardarPrecios(msg){ RS.setCfg(JSON.parse(JSON.stringify(cfg))); renderItems(); renderPrecios(); status(msg||"Precios guardados."); }
$("btn-precios").addEventListener("click",()=>{ leerTabla(); guardarPrecios(); });
$("btn-agregar").addEventListener("click",()=>{
  const n=$("n-nombre").value.trim(), p=+$("n-precio").value;
  if(!n){ status("Escribí el nombre del trabajo.",true); return; }
  if(!(p>0)){ status("Escribí el precio.",true); return; }
  if(cfg.lista.some(t=>t.n.toLowerCase()===n.toLowerCase())){ status("Ese trabajo ya está en la lista.",true); return; }
  leerTabla();
  const nuevo={id:"t_"+newId().replace(/-/g,"").slice(0,8),n:n,p:p,pieza:$("n-pieza").checked};
  const iOtro=cfg.lista.findIndex(t=>t.id==="otro");
  if(iOtro>=0) cfg.lista.splice(iOtro,0,nuevo); else cfg.lista.push(nuevo);
  $("n-nombre").value=""; $("n-precio").value="";
  guardarPrecios(`Agregado: ${n}, ${money(p)}.`);
});

/* arranque */
$("f-fecha").value=today(); $("c-mes").value=today().slice(0,7);
items=[newItem()]; renderItems();
RS.load().then(()=>{ if(OPT.sembrar && RS.esNuevo()){ const t0=Date.now(); RS.importar({items:Object.fromEntries(SEED.items.map(x=>[x.id,Object.assign({},x,{_m:t0})])),cfg:SEED.config,cfgM:t0}); } merge(); });
setInterval(()=>RS.sync(),60000);

const API={
  store:RS,
  get:id=>RS.all().filter(t=>t.grupo===id||t.id===id),
  saldoDe,
  enter(){ show($("v-cuenta").hidden&&$("v-precios").hidden?"cargar":($("v-cuenta").hidden?"precios":"cuenta")); },
  desdeTrabajo(j){
    limpiar(); linkJob=j.id; if(j.cliente&&j.cliente!=="Sin asignar") $("f-clinica").value=j.cliente;
    $("dictado").value=[j.paciente,j.trabajo,j.notas].filter(Boolean).join(", ");
    interpretar(j.paciente);
    $("link-banner").textContent=`Trabajo de G3 entregado: ${j.paciente} · ${j.trabajo||""}${j.cliente&&j.cliente!=="Sin asignar"?" · "+j.cliente:""}. Revisá el tratamiento y las piezas, y guardalo.`;
    $("link-banner").hidden=false;
    show("cargar");
  }
};
return API;
}

const CSS = `
#v-registro{display:flex;flex-direction:column;gap:12px;max-width:760px}
.rtabs{display:flex;border:1px solid var(--line);border-radius:9px;overflow:hidden;align-self:flex-start;background:#fff}
.rtabs button{border:0;background:#fff;padding:8px 14px;cursor:pointer;font:inherit}
.rtabs button[aria-selected=true]{background:var(--ink);color:#fff;font-weight:600}
.rcard{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px;min-width:0}
.rrow{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rrow>*{min-width:0}
.rbtn{border:1px solid var(--ink);background:var(--ink);color:#fff;border-radius:9px;padding:10px 14px;font-weight:600;cursor:pointer}
.rbtn.ghost{background:#fff;color:var(--ink);border-color:var(--line);font-weight:500}
.ractions{display:flex;gap:8px;flex-wrap:wrap}.ractions .rbtn{flex:1 1 auto}
.rhint{font-size:13px;color:var(--mut);margin:0}
.rmsg{font-size:14px;padding:9px 11px;border-radius:8px;background:var(--soft);color:#5c4900}.rmsg.warn{background:#fbe9e7;color:var(--bad)}
.rlink{background:none;border:0;color:var(--ink);text-decoration:underline;font-size:13px;padding:0;cursor:pointer}
.rck{flex-direction:row!important;align-items:center;gap:8px;color:var(--ink)!important;align-self:end;padding-bottom:10px;font-size:14px!important}.rck input{width:auto}
.rtotal{display:flex;justify-content:space-between;align-items:baseline;font-variant-numeric:tabular-nums;gap:12px}.rtotal strong{font:600 22px var(--head)}
#v-registro h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin:0}
#v-registro textarea{min-height:84px}
#v-registro .tx{border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--bg)}
#v-registro .tx-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
#v-registro .tx-head b{font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em}
#v-registro .teeth{display:grid;grid-template-columns:repeat(16,minmax(0,1fr));gap:3px;font:11px ui-monospace,Menlo,monospace}
#v-registro .teeth button{border:1px solid var(--line);background:#fff;border-radius:5px;padding:7px 0;cursor:pointer;font:inherit}
#v-registro .teeth button[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:600}
#v-registro .teeth .mid{border-right:2px solid var(--mut)}
#v-registro .arch{font-size:11px;color:var(--mut);display:flex;justify-content:space-between}
#v-registro .faces{display:flex;flex-direction:column;gap:6px}
#v-registro .face-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
#v-registro .face-row .n{font-family:ui-monospace,Menlo,monospace;width:28px}
#v-registro .face-row button{border:1px solid var(--line);background:#fff;border-radius:6px;min-width:36px;padding:6px;cursor:pointer}
#v-registro .face-row button[aria-pressed="true"]{background:var(--soft);border-color:var(--acc);font-weight:600}
#v-registro .sub{display:flex;justify-content:space-between;font-variant-numeric:tabular-nums;font-size:13px;color:var(--mut)}
#v-registro .sum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#v-registro .sum div{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px}
#v-registro .sum span{display:block;font-size:11px;color:var(--mut)}
#v-registro .sum b{font-variant-numeric:tabular-nums;font-size:15px}
#v-registro table{width:100%;border-collapse:collapse;font-size:14px}
#v-registro td{padding:6px 4px;border-top:1px solid var(--line)}
#v-registro th{font-size:12px;color:var(--mut);font-weight:500;text-align:left;padding:4px}
#v-registro td.c{text-align:center;width:56px}#v-registro td.c input{width:auto}
#v-registro .tw{overflow-x:auto}
#v-registro .ct th{border-bottom:1px solid var(--ink);padding:6px}
#v-registro .ct td{padding:8px 6px;vertical-align:middle}
#v-registro .ct .r{text-align:right}
#v-registro .ct .mono{font-variant-numeric:tabular-nums;white-space:nowrap}
#v-registro .ct tr.pr{cursor:pointer}
#v-registro .ct tr.pr[aria-expanded="true"] td{background:var(--soft)}
#v-registro .ct .pn{font-weight:600;font-size:15px}
#v-registro .ct .pc{font-size:12px;color:var(--mut);white-space:nowrap}
#v-registro .ct .debe{color:var(--bad);font-weight:600}
#v-registro .ct .ok{color:var(--ok)}
#v-registro .ct .chev{width:18px;color:var(--mut);text-align:center}
#v-registro .ct tr.it{cursor:pointer}
#v-registro .ct tr.it td{border-top:1px dashed var(--line)}
#v-registro .ct tr.it td:first-child{padding-left:14px}
#v-registro .ct .its{font-size:12px;color:var(--mut)}
#v-registro .chip{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--bad);color:var(--bad);background:#fff;cursor:pointer;white-space:nowrap}
#v-registro .chip.ok{border-color:var(--ok);color:var(--ok)}
#v-registro .ct tr.foot td{border-top:0;padding:4px 6px 10px 14px}
@media(max-width:600px){.rrow{grid-template-columns:1fr}#v-registro .sum b{font-size:13px}#v-registro .teeth{font-size:9px}}
`;
const HTML = `  <section id="v-registro">
    <div class="rtabs" role="tablist">
      <button id="r-tab-cargar" role="tab" aria-selected="true">Cargar</button>
      <button id="r-tab-cuenta" role="tab" aria-selected="false">Cuenta</button>
      <button id="r-tab-precios" role="tab" aria-selected="false">Precios</button>
    </div>
    <div id="r-status" class="rmsg" hidden></div>

    <div id="r-v-cargar" class="rcard">
      <div id="r-edit-banner" class="rmsg" hidden>Editando un trabajo guardado. Corregí lo que necesites y tocá Guardar cambios.</div>
      <div id="r-link-banner" class="rmsg" hidden></div>
      <h2 id="r-h-dictado">Dictado</h2>
      <textarea id="r-dictado" placeholder="Ej: Juan Pérez, diseño y fabricación G3 de corona en la 36 y la instalación. Clase 2 mesio oclusal en la 37."></textarea>
      <p class="rhint" id="r-hint-dictado">Tocá el campo y usá el micrófono del teclado. Podés dictar varios tratamientos juntos, con sus piezas y caras.</p>
      <div class="ractions"><button class="rbtn" id="r-btn-interpretar">Interpretar dictado</button></div>
      <h2>Trabajo</h2>
      <div class="rrow">
        <label>Fecha<input type="date" id="r-f-fecha"></label>
        <label>Clínica<input id="r-f-clinica" value="Pergamino"></label>
      </div>
      <label>Paciente<input id="r-f-paciente" autocomplete="off"></label>
      <div id="r-items" style="display:flex;flex-direction:column;gap:10px"></div>
      <button class="rbtn ghost" id="r-btn-add-item">+ Agregar otro tratamiento</button>
      <label>Nota<input id="r-f-nota" autocomplete="off"></label>
      <div id="r-cobro" class="tx" hidden>
        <div class="tx-head"><b>Pago</b><button class="rlink" id="r-btn-pago-total">Pagó todo</button></div>
        <div class="rrow">
          <label>Monto cobrado<input type="number" id="r-f-cobrado" inputmode="numeric"></label>
          <label>Fecha de cobro<input type="date" id="r-f-fcobro"></label>
        </div>
        <p class="rhint" id="r-f-saldo"></p>
      </div>
      <div class="rtotal"><span id="r-f-detalle">—</span><strong id="r-f-total">$0</strong></div>
      <div class="ractions">
        <button class="rbtn" id="r-btn-guardar">Guardar trabajo</button>
        <button class="rbtn ghost" id="r-btn-limpiar">Limpiar</button>
      </div>
      <button class="rlink" id="r-btn-borrar" hidden style="align-self:flex-start;color:var(--warn)">Borrar este trabajo</button>
    </div>

    <div id="r-v-cuenta" class="rcard" hidden>
      <div class="rrow">
        <label>Mes<input type="month" id="r-c-mes"></label>
        <label>Clínica<select id="r-c-clinica"></select></label>
      </div>
      <div class="sum">
        <div><span>Prestaciones</span><b id="r-s-prest">$0</b></div>
        <div><span>Laboratorio G3</span><b id="r-s-g3">$0</b></div>
        <div><span>Pendiente</span><b id="r-s-pend">$0</b></div>
      </div>
      <div class="rrow">
        <label>Buscar paciente<input id="r-c-buscar" type="search" autocomplete="off" placeholder="Nombre"></label>
        <label class="rck"><input type="checkbox" id="r-c-saldo"> Solo con saldo</label>
      </div>
      <div id="r-lista"></div>
      <div class="ractions">
        <button class="rbtn" id="r-btn-copiar">Copiar resumen</button>
        <button class="rbtn ghost" id="r-btn-csv">Descargar CSV</button>
        <button class="rbtn ghost" id="r-btn-liquidar">Marcar mes como cobrado</button>
      </div>
      <textarea id="r-resumen" hidden readonly></textarea>
    </div>

    <div id="r-v-precios" class="rcard" hidden>
      <h2>Lista de precios</h2>
      <label>Tipo de cambio (ARS por USD)<input type="number" id="r-p-tc"></label>
      <div class="tw"><table>
        <thead><tr><th>Trabajo</th><th>Precio</th><th>Por pieza</th><th></th></tr></thead>
        <tbody id="r-p-tabla"></tbody></table></div>
      <div class="ractions"><button class="rbtn" id="r-btn-precios">Guardar cambios</button></div>
      <h2>Agregar trabajo</h2>
      <label>Nombre<input id="r-n-nombre" placeholder="Ej: Clase 2 mediana" autocomplete="off"></label>
      <div class="rrow">
        <label>Precio<input type="number" id="r-n-precio" placeholder="271400"></label>
        <label class="rck"><input type="checkbox" id="r-n-pieza" checked> Se cobra por pieza</label>
      </div>
      <div class="ractions"><button class="rbtn ghost" id="r-btn-agregar">Agregar a la lista</button></div>
    </div>
  </section>
`;
export function montarRegistro({ sb, contenedor, toast, errMsg, onLink, linkArchivos }) {
  if (!document.getElementById('reg-css')) { const st = document.createElement('style'); st.id = 'reg-css'; st.textContent = CSS; document.head.appendChild(st); }
  contenedor.innerHTML = HTML;
  let ultimoAviso = 0;
  const store = crearStoreRegistro({
    cargarLocal: null, guardarLocal: null,
    leerNube: async () => { const { data, error } = await sb.from('config').select('valor').eq('clave', 'lab_registro').maybeSingle(); if (error) throw error; return data ? data.valor : null; },
    subirNube: async S => { const { error } = await sb.from('config').upsert({ clave: 'lab_registro', valor: S }); if (error) throw error; },
    avisar: e => { if (Date.now() - ultimoAviso > 120000) { ultimoAviso = Date.now(); toast('Registro: ' + errMsg(e), true); } }
  });
  return RegistroApp({ store, toast, sembrar: false, onLink,
    carpetaDe: linkArchivos, carpetaEsLink: true, textoCarpeta: 'Ver STL y fotos en Drive' });
}
