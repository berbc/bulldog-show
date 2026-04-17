"use client";
import { useState, useEffect } from "react";
import { EPISODES, TIER_LISTS, CONVIDADOS, GAMES } from "../lib/data";

const STATUS_CONFIG = {
  planejado: { label: "Planejado", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  confirmado: { label: "Confirmado", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  gravado:    { label: "Gravado",    color: "#2487BE", bg: "rgba(36,135,190,0.15)"  },
  editado:    { label: "Editado",    color: "#8B5CF6", bg: "rgba(139,92,246,0.15)"  },
  publicado:  { label: "Publicado",  color: "#7EC8F0", bg: "rgba(27,104,150,0.2)"   }
};

const TABS = ["📋 Episódios", "🏆 Tier Lists", "👥 Convidados", "🎮 Games", "📅 Calendário"];

export default function Home() {
  const [data, setData] = useState({ episodes: EPISODES, tierListBank: TIER_LISTS, convidadosBank: CONVIDADOS, gamesBank: GAMES });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEp, setSelectedEp] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newTierList, setNewTierList] = useState("");
  const [newConvidado, setNewConvidado] = useState("");
  const [newGame, setNewGame] = useState({ nome:"", descricao:"", jogadores:"", duracao:"", dificuldade:"Fácil", ideias:"" });
  const [addingGame, setAddingGame] = useState(false);
  const [expandedGame, setExpandedGame] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    try { const s = localStorage.getItem("bulldog-data"); if (s) setData(JSON.parse(s)); } catch(e) {}
  }, []);

  const save = (nd) => {
    setData(nd);
    try { localStorage.setItem("bulldog-data", JSON.stringify(nd)); } catch(e) {}
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const openEp = (ep) => { setSelectedEp(ep); setEditData({...ep, convidados:[...ep.convidados], gravacao:{...ep.gravacao}}); setEditMode(false); };
  const closeModal = () => { setSelectedEp(null); setEditData(null); setEditMode(false); };
  const saveEp = () => { save({...data, episodes: data.episodes.map(e => e.id===editData.id?editData:e)}); setSelectedEp(editData); setEditMode(false); };
  const addEpisode = () => save({...data, episodes:[...data.episodes,{id:Date.now(),title:`Episódio ${data.episodes.length+1}`,status:"planejado",convidados:[],tierList:"",debate:"",game:"",gravacao:{data:"",horario:"10:00",duracao:"2h"},local:"Estúdio Bulldog",endereco:"A confirmar",notas:"",mensagemConvidado:"Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶"}]});
  const deleteEp = (id) => { save({...data, episodes: data.episodes.filter(e=>e.id!==id)}); closeModal(); };
  const addTierList = () => { if(!newTierList.trim())return; save({...data,tierListBank:[...data.tierListBank,newTierList.trim()]}); setNewTierList(""); };
  const removeTierList = (i) => save({...data, tierListBank: data.tierListBank.filter((_,j)=>j!==i)});
  const addConvidado = () => { if(!newConvidado.trim())return; save({...data,convidadosBank:[...data.convidadosBank,newConvidado.trim()]}); setNewConvidado(""); };
  const removeConvidado = (i) => save({...data, convidadosBank: data.convidadosBank.filter((_,j)=>j!==i)});
  const addGame = () => { if(!newGame.nome.trim())return; save({...data,gamesBank:[...data.gamesBank,{...newGame,id:"g"+Date.now()}]}); setNewGame({nome:"",descricao:"",jogadores:"",duracao:"",dificuldade:"Fácil",ideias:""}); setAddingGame(false); };
  const removeGame = (id) => save({...data, gamesBank: data.gamesBank.filter(g=>g.id!==id)});
  const copyLink = (id) => { navigator.clipboard.writeText(`${window.location.origin}/ep/${id}`); setCopied(id); setTimeout(()=>setCopied(null),2000); };

  const getNextWednesdays = () => {
    const weeks=[]; let d=new Date();
    d.setDate(d.getDate()+((3-d.getDay()+7)%7||7));
    for(let i=0;i<12;i++){weeks.push(new Date(d));d.setDate(d.getDate()+7);}
    return weeks;
  };
  const fmt = (d) => d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
  const epsByDate = (ds) => data.episodes.filter(e=>e.gravacao.data===ds);

  const B = "#1B6896", BL = "#2487BE", BG = "#081C2B", CARD = "#0D2840";
  const BORDER = "rgba(27,104,150,0.3)", BORDER2 = "rgba(27,104,150,0.6)";
  const TEXT = "#E8F4FF", MUTED = "#5A8BA8", ACCENT = "#7EC8F0";

  const card = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:18, marginBottom:10 };
  const lbl = { color:MUTED, fontSize:11, letterSpacing:1, textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Sans'" };
  const val = { color:TEXT, fontSize:14, lineHeight:1.5, fontFamily:"'DM Sans'" };
  const inp = { background:"#0A2236", border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, padding:"8px 12px", fontFamily:"'DM Sans'", fontSize:13, outline:"none" };
  const btnBlue = { background:B, color:"#fff", border:"none", borderRadius:6, padding:"8px 18px", cursor:"pointer", fontFamily:"'Bebas Neue'", fontSize:14, letterSpacing:1 };
  const btnGhost = { background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, borderRadius:6, padding:"8px 18px", cursor:"pointer", fontFamily:"'DM Sans'", fontSize:13 };

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Bebas Neue','Impact',sans-serif",color:TEXT,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#040E18}::-webkit-scrollbar-thumb{background:#1B6896;border-radius:2px}
        .epc:hover{transform:translateY(-2px);border-color:#2487BE !important;}
        .tag{display:inline-block;background:rgba(27,104,150,0.2);border:1px solid rgba(27,104,150,0.6);color:#7EC8F0;border-radius:4px;padding:2px 8px;font-size:11px;margin:2px;font-family:'DM Sans'}
        .bi:hover .xb{opacity:1}.xb{opacity:0;transition:opacity .2s}
        .cpb{background:rgba(27,104,150,0.15);border:1px solid rgba(27,104,150,0.5);color:#7EC8F0;border-radius:5px;padding:4px 10px;cursor:pointer;font-size:11px;font-family:'DM Sans'}
        .cpb:hover{background:rgba(27,104,150,0.3)}
      `}</style>

      {/* HEADER */}
      <div style={{background:`linear-gradient(180deg,#0D2E45 0%,${BG} 100%)`,padding:"20px 20px 0",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{maxWidth:920,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Bulldog Show" style={{width:46,height:46,objectFit:"contain"}} />
            <div>
              <div style={{fontSize:26,letterSpacing:3,color:TEXT}}>BULLDOG SHOW</div>
              <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1}}>PRODUCTION MANAGER · INTERNO</div>
            </div>
            {saved && <div style={{marginLeft:"auto",fontFamily:"'DM Sans'",fontSize:12,color:"#10B981",background:"rgba(16,185,129,0.1)",padding:"4px 12px",borderRadius:20}}>✓ Salvo</div>}
          </div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {TABS.map((t,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)} style={{background:activeTab===i?B:"transparent",color:activeTab===i?"#fff":MUTED,border:"none",borderRadius:"7px 7px 0 0",padding:"9px 15px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:500,transition:"all .15s"}}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"22px 20px"}}>

        {/* EPISÓDIOS */}
        {activeTab===0 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontSize:20,letterSpacing:2}}>EPISÓDIOS <span style={{color:BL}}>({data.episodes.length})</span></div>
              <button style={btnBlue} onClick={addEpisode}>+ NOVO EPISÓDIO</button>
            </div>
            {data.episodes.map(ep=>{
              const sc=STATUS_CONFIG[ep.status];
              return (
                <div key={ep.id} className="epc" onClick={()=>openEp(ep)} style={{...card,cursor:"pointer",transition:"all .2s",display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                      <span style={{fontSize:17,letterSpacing:1}}>{ep.title}</span>
                      <span style={{background:sc.bg,color:sc.color,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600}}>{sc.label}</span>
                    </div>
                    <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,display:"flex",flexWrap:"wrap",gap:6}}>
                      {ep.convidados.length>0&&<span>👥 {ep.convidados.join(", ")}</span>}
                      {ep.tierList&&<span>🏆 {ep.tierList.slice(0,45)}{ep.tierList.length>45?"…":""}</span>}
                      {ep.debate&&<span>💬 {ep.debate.slice(0,40)}{ep.debate.length>40?"…":""}</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",fontFamily:"'DM Sans'",fontSize:12,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7}}>
                    {ep.gravacao.data
                      ? <div><div style={{color:ACCENT,fontWeight:600}}>{new Date(ep.gravacao.data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</div><div style={{color:MUTED}}>{ep.gravacao.horario}</div></div>
                      : <span style={{color:"#1A3A50"}}>Sem data</span>}
                    <button className="cpb" onClick={e=>{e.stopPropagation();copyLink(ep.id);}}>
                      {copied===ep.id?"✓ Copiado!":"🔗 Link convidado"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TIER LISTS */}
        {activeTab===1 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:18}}>BANCO DE TIER LISTS <span style={{color:BL}}>({data.tierListBank.length})</span></div>
            <div style={{display:"flex",gap:8,marginBottom:18}}>
              <input value={newTierList} onChange={e=>setNewTierList(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTierList()} placeholder="Nova tier list..." style={{...inp,flex:1}} />
              <button style={btnBlue} onClick={addTierList}>+ ADD</button>
            </div>
            {data.tierListBank.map((tl,i)=>(
              <div key={i} className="bi" style={{...card,padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontFamily:"'DM Sans'",fontSize:13}}>🏆 {tl}</span>
                <button className="xb" onClick={()=>removeTierList(i)} style={{...btnGhost,padding:"3px 9px",fontSize:11,color:BL}}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* CONVIDADOS */}
        {activeTab===2 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:18}}>BANCO DE CONVIDADOS <span style={{color:BL}}>({data.convidadosBank.length})</span></div>
            <div style={{display:"flex",gap:8,marginBottom:18}}>
              <input value={newConvidado} onChange={e=>setNewConvidado(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addConvidado()} placeholder="Novo convidado..." style={{...inp,flex:1}} />
              <button style={btnBlue} onClick={addConvidado}>+ ADD</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
              {data.convidadosBank.map((c,i)=>(
                <div key={i} className="bi" style={{...card,padding:"9px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'DM Sans'",fontSize:12}}>👤 {c}</span>
                  <button className="xb" onClick={()=>removeConvidado(i)} style={{...btnGhost,padding:"2px 7px",fontSize:11,color:BL,marginLeft:4}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAMES */}
        {activeTab===3 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontSize:20,letterSpacing:2}}>BANCO DE GAMES <span style={{color:BL}}>({data.gamesBank.length})</span></div>
              <button style={btnBlue} onClick={()=>setAddingGame(!addingGame)}>+ NOVO GAME</button>
            </div>
            {addingGame && (
              <div style={{...card,border:`1px solid ${BL}`,marginBottom:18}}>
                <div style={{fontSize:15,letterSpacing:1,marginBottom:14,color:ACCENT}}>NOVO GAME</div>
                <div style={{display:"grid",gap:10}}>
                  <input value={newGame.nome} onChange={e=>setNewGame({...newGame,nome:e.target.value})} placeholder="Nome do game *" style={{...inp,width:"100%"}} />
                  <textarea value={newGame.descricao} onChange={e=>setNewGame({...newGame,descricao:e.target.value})} placeholder="Como funciona..." style={{...inp,width:"100%",minHeight:70,resize:"vertical"}} />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <input value={newGame.jogadores} onChange={e=>setNewGame({...newGame,jogadores:e.target.value})} placeholder="Jogadores" style={inp} />
                    <input value={newGame.duracao} onChange={e=>setNewGame({...newGame,duracao:e.target.value})} placeholder="Duração" style={inp} />
                    <select value={newGame.dificuldade} onChange={e=>setNewGame({...newGame,dificuldade:e.target.value})} style={inp}>
                      <option>Fácil</option><option>Médio</option><option>Difícil</option>
                    </select>
                  </div>
                  <textarea value={newGame.ideias} onChange={e=>setNewGame({...newGame,ideias:e.target.value})} placeholder="Ideias de variações..." style={{...inp,width:"100%",minHeight:60,resize:"vertical"}} />
                  <div style={{display:"flex",gap:8}}>
                    <button style={btnBlue} onClick={addGame}>💾 SALVAR</button>
                    <button style={btnGhost} onClick={()=>setAddingGame(false)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
            {data.gamesBank.map(g=>{
              const dc={Fácil:"#10B981",Médio:"#F59E0B",Difícil:"#EF4444"};
              const isOpen=expandedGame===g.id;
              return (
                <div key={g.id} style={{...card,border:`1px solid ${isOpen?BL:BORDER}`,overflow:"hidden",padding:0,transition:"border-color .2s"}}>
                  <div onClick={()=>setExpandedGame(isOpen?null:g.id)} style={{padding:"13px 17px",cursor:"pointer",display:"flex",alignItems:"center",gap:11}}>
                    <span style={{fontSize:20}}>🎮</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,letterSpacing:1}}>{g.nome}</div>
                      {!isOpen&&<div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginTop:2}}>{g.descricao.slice(0,65)}…</div>}
                    </div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      {g.jogadores&&<span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>👥 {g.jogadores}</span>}
                      {g.duracao&&<span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>⏱ {g.duracao}</span>}
                      <span style={{background:`${dc[g.dificuldade]}22`,color:dc[g.dificuldade],borderRadius:4,padding:"2px 7px",fontFamily:"'DM Sans'",fontSize:10,fontWeight:600}}>{g.dificuldade}</span>
                      <span style={{color:MUTED,fontSize:11}}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 17px 17px",borderTop:`1px solid ${BORDER}`}}>
                      <div style={{paddingTop:12,display:"grid",gap:11}}>
                        <div><div style={lbl}>Como funciona</div><div style={{...val,fontSize:13,lineHeight:1.6}}>{g.descricao}</div></div>
                        {g.ideias&&<div><div style={lbl}>💡 Ideias de variações</div><div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,lineHeight:1.6}}>{g.ideias}</div></div>}
                        <button onClick={()=>removeGame(g.id)} style={{...btnGhost,fontSize:11,width:"fit-content"}}>🗑 Remover</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CALENDÁRIO */}
        {activeTab===4 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:6}}>CALENDÁRIO DE GRAVAÇÕES</div>
            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,marginBottom:18}}>📅 Quartas-feiras · 10h–12h e 14h–16h · 2 eps por dia</div>
            {getNextWednesdays().map((wed,i)=>{
              const ds=wed.toISOString().split("T")[0];
              const eps=epsByDate(ds);
              return (
                <div key={i} style={{background:eps.length>0?"rgba(27,104,150,0.1)":CARD,border:`1px solid ${eps.length>0?"rgba(27,104,150,0.4)":BORDER}`,borderRadius:10,padding:"13px 17px",display:"grid",gridTemplateColumns:"115px 1fr",gap:14,alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:18,letterSpacing:1,color:eps.length>0?ACCENT:"#1A3A50"}}>{fmt(wed)}</div>
                    <div style={{fontFamily:"'DM Sans'",fontSize:10,color:"#1A3A50"}}>Quarta-feira</div>
                  </div>
                  <div>
                    {eps.length===0
                      ? <span style={{fontFamily:"'DM Sans'",fontSize:12,color:"#1A3A50"}}>Sem gravações agendadas</span>
                      : <div style={{display:"flex",flexDirection:"column",gap:5}}>{eps.map(ep=>(
                          <div key={ep.id} onClick={()=>openEp(ep)} style={{cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,display:"flex",gap:9,alignItems:"center"}}>
                            <span style={{color:ACCENT,fontWeight:600}}>{ep.gravacao.horario}</span>
                            <span style={{color:TEXT}}>{ep.title}</span>
                            {ep.convidados.length>0&&<span style={{color:MUTED}}>· {ep.convidados.join(", ")}</span>}
                          </div>
                        ))}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedEp&&editData&&(
        <div onClick={e=>e.target===e.currentTarget&&closeModal()} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:640,maxHeight:"88vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              {editMode
                ? <input value={editData.title} onChange={e=>setEditData({...editData,title:e.target.value})} style={{...inp,fontSize:19,letterSpacing:2,background:"transparent",border:"none",borderBottom:`1px solid ${BL}`,borderRadius:0,padding:"3px 0",fontFamily:"'Bebas Neue'",width:"60%"}} />
                : <div style={{fontSize:21,letterSpacing:2}}>{selectedEp.title}</div>}
              <div style={{display:"flex",gap:8}}>
                {!editMode&&<button style={btnBlue} onClick={()=>setEditMode(true)}>✏️ EDITAR</button>}
                {editMode&&<><button style={btnBlue} onClick={saveEp}>💾 SALVAR</button><button style={btnGhost} onClick={()=>{setEditData({...selectedEp,convidados:[...selectedEp.convidados],gravacao:{...selectedEp.gravacao}});setEditMode(false);}}>Cancelar</button></>}
                <button style={btnGhost} onClick={closeModal}>✕</button>
              </div>
            </div>

            <div style={{background:"rgba(27,104,150,0.08)",border:`1px solid rgba(27,104,150,0.25)`,borderRadius:8,padding:"11px 15px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'DM Sans'",fontSize:10,color:ACCENT,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>🔗 Link para o convidado</div>
                <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>/ep/{selectedEp.id} · só mostra pauta, data e horário</div>
              </div>
              <button className="cpb" onClick={()=>copyLink(selectedEp.id)}>{copied===selectedEp.id?"✓ Copiado!":"Copiar link"}</button>
            </div>

            {[
              {label:"Status",render:()=>editMode?<select value={editData.status} onChange={e=>setEditData({...editData,status:e.target.value})} style={{...inp,width:"100%"}}>{Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>:<span style={{background:STATUS_CONFIG[selectedEp.status].bg,color:STATUS_CONFIG[selectedEp.status].color,borderRadius:4,padding:"3px 10px",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600}}>{STATUS_CONFIG[selectedEp.status].label}</span>},
              {label:"Convidados",render:()=>editMode?<div><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7}}>{editData.convidados.map((c,i)=><span key={i} className="tag" style={{cursor:"pointer"}} onClick={()=>setEditData({...editData,convidados:editData.convidados.filter((_,j)=>j!==i)})}>{c} ✕</span>)}</div><select onChange={e=>{if(e.target.value&&!editData.convidados.includes(e.target.value))setEditData({...editData,convidados:[...editData.convidados,e.target.value]});e.target.value="";}} style={{...inp,width:"100%"}}><option value="">+ Adicionar do banco...</option>{data.convidadosBank.filter(c=>!editData.convidados.includes(c)).map((c,i)=><option key={i} value={c}>{c}</option>)}</select></div>:<div style={val}>{selectedEp.convidados.length>0?selectedEp.convidados.map((c,i)=><span key={i} className="tag">{c}</span>):<span style={{color:"#1A3A50"}}>Nenhum</span>}</div>},
              {label:"Tier List",render:()=>editMode?<select value={editData.tierList} onChange={e=>setEditData({...editData,tierList:e.target.value})} style={{...inp,width:"100%"}}><option value="">Selecionar do banco...</option>{data.tierListBank.map((tl,i)=><option key={i} value={tl}>{tl}</option>)}</select>:<div style={val}>{selectedEp.tierList||<span style={{color:"#1A3A50"}}>Não definida</span>}</div>},
              {label:"Debate / Tema",render:()=>editMode?<input value={editData.debate} onChange={e=>setEditData({...editData,debate:e.target.value})} style={{...inp,width:"100%"}} placeholder="Tema do debate..." />:<div style={val}>{selectedEp.debate||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>},
              {label:"Game / Dinâmica",render:()=>editMode?<select value={editData.game} onChange={e=>setEditData({...editData,game:e.target.value})} style={{...inp,width:"100%"}}><option value="">Selecionar do banco...</option>{data.gamesBank.map(g=><option key={g.id} value={g.nome}>{g.nome}</option>)}</select>:<div style={val}>{selectedEp.game||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>},
              {label:"Local",render:()=>editMode?<input value={editData.local||""} onChange={e=>setEditData({...editData,local:e.target.value})} style={{...inp,width:"100%"}} placeholder="Local de gravação..." />:<div style={val}>{selectedEp.local||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>},
              {label:"Endereço",render:()=>editMode?<input value={editData.endereco||""} onChange={e=>setEditData({...editData,endereco:e.target.value})} style={{...inp,width:"100%"}} placeholder="Endereço completo..." />:<div style={val}>{selectedEp.endereco||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>},
            ].map(({label,render})=>(
              <div key={label} style={{marginBottom:16}}>
                <div style={lbl}>{label}</div>
                {render()}
              </div>
            ))}

            <div style={{marginBottom:16}}>
              <div style={lbl}>Data & Horário de Gravação</div>
              {editMode
                ? <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <input type="date" value={editData.gravacao.data} onChange={e=>setEditData({...editData,gravacao:{...editData.gravacao,data:e.target.value}})} style={inp} />
                    <select value={editData.gravacao.horario} onChange={e=>setEditData({...editData,gravacao:{...editData.gravacao,horario:e.target.value}})} style={inp}>
                      <option value="10:00">10:00 (manhã)</option>
                      <option value="14:00">14:00 (tarde)</option>
                    </select>
                    <input value={editData.gravacao.duracao} onChange={e=>setEditData({...editData,gravacao:{...editData.gravacao,duracao:e.target.value}})} style={inp} placeholder="Duração" />
                  </div>
                : <div style={val}>{selectedEp.gravacao.data?`${new Date(selectedEp.gravacao.data+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})} · ${selectedEp.gravacao.horario} · ${selectedEp.gravacao.duracao}`:<span style={{color:"#1A3A50"}}>A definir</span>}</div>}
            </div>

            <div style={{marginBottom:16}}>
              <div style={lbl}>Mensagem para o Convidado</div>
              {editMode
                ? <textarea value={editData.mensagemConvidado||""} onChange={e=>setEditData({...editData,mensagemConvidado:e.target.value})} style={{...inp,width:"100%",minHeight:70,resize:"vertical"}} placeholder="Mensagem de boas-vindas..." />
                : <div style={val}>{selectedEp.mensagemConvidado||<span style={{color:"#1A3A50"}}>Nenhuma</span>}</div>}
            </div>

            <div style={{marginBottom:20}}>
              <div style={lbl}>Notas Internas 🔒</div>
              {editMode
                ? <textarea value={editData.notas} onChange={e=>setEditData({...editData,notas:e.target.value})} style={{...inp,width:"100%",minHeight:70,resize:"vertical"}} placeholder="Notas internas (não aparecem pro convidado)..." />
                : <div style={val}>{selectedEp.notas||<span style={{color:"#1A3A50"}}>Sem notas</span>}</div>}
            </div>

            {!editMode&&<button onClick={()=>deleteEp(selectedEp.id)} style={{...btnGhost,fontSize:11}}>🗑 Deletar episódio</button>}
          </div>
        </div>
      )}
    </div>
  );
}
