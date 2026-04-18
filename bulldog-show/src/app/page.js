"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const STATUS_CONFIG = {
  planejado: { label: "Planejado", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  confirmado: { label: "Confirmado", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  gravado:    { label: "Gravado",    color: "#2487BE", bg: "rgba(36,135,190,0.15)" },
  editado:    { label: "Editado",    color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  publicado:  { label: "Publicado",  color: "#7EC8F0", bg: "rgba(27,104,150,0.2)"  }
};

const TABS = ["📋 Episódios", "📅 Calendário", "📆 Cronograma", "📊 Estatísticas", "👥 Convidados", "🏆 Tier Lists", "🎮 Games"];
const B="#1B6896",BL="#2487BE",BG="#081C2B",CARD="#0D2840";
const BORDER="rgba(27,104,150,0.3)",BORDER2="rgba(27,104,150,0.6)";
const TEXT="#E8F4FF",MUTED="#5A8BA8",ACCENT="#7EC8F0";
const card={background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18,marginBottom:10};
const lbl={color:MUTED,fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Sans'"};
const val={color:TEXT,fontSize:14,lineHeight:1.5,fontFamily:"'DM Sans'"};
const inp={background:"#0A2236",border:`1px solid ${BORDER}`,borderRadius:6,color:TEXT,padding:"8px 12px",fontFamily:"'DM Sans'",fontSize:13,outline:"none",width:"100%"};
const btnBlue={background:B,color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer",fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:1};
const btnGhost={background:"transparent",color:MUTED,border:`1px solid ${BORDER}`,borderRadius:6,padding:"8px 18px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13};

const Stars = ({ value, onChange, readonly }) => (
  <div style={{display:"flex",gap:3}}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={()=>!readonly&&onChange(s)} style={{cursor:readonly?"default":"pointer",fontSize:16,color:s<=value?"#F59E0B":"#1E4060"}}>★</span>
    ))}
  </div>
);

const StatCard = ({ label, value, sub, color }) => (
  <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"16px 18px"}}>
    <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{label}</div>
    <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color:color||ACCENT}}>{value}</div>
    {sub && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,marginTop:4}}>{sub}</div>}
  </div>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [episodes, setEpisodes] = useState([]);
  const [tierLists, setTierLists] = useState([]);
  const [convidados, setConvidados] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedEp, setSelectedEp] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(null);

  const [newTierList, setNewTierList] = useState("");
  const [newConvidado, setNewConvidado] = useState("");
  const [newGame, setNewGame] = useState({nome:"",descricao:"",jogadores:"",duracao:"",dificuldade:"Fácil",ideias:"",estrelas:0});
  const [addingGame, setAddingGame] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [expandedGame, setExpandedGame] = useState(null);
  const [newEpConvidado, setNewEpConvidado] = useState("");
  const [newEpTier, setNewEpTier] = useState("");

  const [epSort, setEpSort] = useState("numero");
  const [epStatusFilter, setEpStatusFilter] = useState("todos");
  const [tierSearch, setTierSearch] = useState("");
  const [tierSort, setTierSort] = useState("az");
  const [convSearch, setConvSearch] = useState("");
  const [gameSearch, setGameSearch] = useState("");
  const [gameSort, setGameSort] = useState("az");

  // Stats modal
  const [statsEp, setStatsEp] = useState(null);
  const [showAllConvidados, setShowAllConvidados] = useState(false);
  const [showAllViews, setShowAllViews] = useState(false);
  const [statsEdit, setStatsEdit] = useState(null);
  const [statsEditMode, setStatsEditMode] = useState(false);

  // Postagem calendar
  const [postagemWeekOffset, setPostagemWeekOffset] = useState(0);
  const [postagemModal, setPostagemModal] = useState(null);
  const [postagemEdit, setPostagemEdit] = useState(null);
  const [postagens, setPostagens] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [eps, tls, convs, gms] = await Promise.all([
      supabase.from("episodes").select("*").order("id"),
      supabase.from("tier_lists").select("*").order("nome"),
      supabase.from("convidados").select("*").order("nome"),
      supabase.from("games").select("*").order("nome"),
    ]);
    if (eps.data) setEpisodes(eps.data);
    if (tls.data) setTierLists(tls.data);
    if (convs.data) setConvidados(convs.data);
    if (gms.data) setGames(gms.data);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/);
    return match ? match[1] : null;
  };

  const fetchYouTubeViews = async (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`);
      const data = await res.json();
      return parseInt(data?.items?.[0]?.statistics?.viewCount || 0);
    } catch(e) { return null; }
  };

  const fetchAndUpdateViews = async (ep) => {
    if (!ep.links?.length) return;
    let updated = false;
    const newLinks = await Promise.all(ep.links.map(async (link) => {
      if (link.plataforma === 'YouTube' && link.url) {
        const views = await fetchYouTubeViews(link.url);
        if (views !== null && views !== link.views) { updated = true; return {...link, views}; }
      }
      return link;
    }));
    if (updated) {
      const { data } = await supabase.from('episodes').update({links: newLinks}).eq('id', ep.id).select().single();
      if (data) { setEpisodes(prev => prev.map(e => e.id === data.id ? data : e)); if (statsEp?.id === ep.id) { setStatsEp(data); setStatsEdit({...data, links: data.links||[]}); } }
    }
  };

  // Load postagens
  const loadPostagens = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("postagens").select("*").order("data");
      if (!error && data) setPostagens(data);
    } catch(e) {}
  }, []);

  useEffect(() => { if (user) loadPostagens(); }, [user, loadPostagens]);

  const WEEK_SCHEDULE = [
    { dow: 1, label: "Segunda", tipo: "Corte" },
    { dow: 2, label: "Terça",   tipo: "Tier List" },
    { dow: 3, label: "Quarta",  tipo: "Corte" },
    { dow: 4, label: "Quinta",  tipo: "Full" },
    { dow: 5, label: "Sexta",   tipo: "Corte" },
    { dow: 6, label: "Sábado",  tipo: "Corte" },
    { dow: 0, label: "Domingo", tipo: "Corte" },
  ];

  const getWeekDates = (offset) => {
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
    return WEEK_SCHEDULE.map(s => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + (s.dow === 0 ? 6 : s.dow - 1));
      return { ...s, date: d.toISOString().split("T")[0], dateObj: d };
    });
  };

  const getPostagem = (date) => postagens.find(p => p.data === date);
  const getPostagens = (date) => postagens.filter(p => p.data === date);

  const savePostagem = async () => {
    if (!postagemEdit) return;
    let data;
    if (postagemEdit.id) {
      const res = await supabase.from("postagens").update({
        episodio_id: postagemEdit.episodio_id || null,
        episodio_title: postagemEdit.episodio_title || "",
        tipo: postagemEdit.tipo,
        status: postagemEdit.status,
        link: postagemEdit.link || "",
        notas: postagemEdit.notas || ""
      }).eq("id", postagemEdit.id).select().single();
      data = res.data;
    } else {
      const res = await supabase.from("postagens").insert({
        data: postagemEdit.data,
        tipo: postagemEdit.tipo,
        episodio_id: postagemEdit.episodio_id || null,
        episodio_title: postagemEdit.episodio_title || "",
        status: postagemEdit.status || "pendente",
        link: postagemEdit.link || "",
        notas: postagemEdit.notas || ""
      }).select().single();
      data = res.data;
    }
    if (data) {
      setPostagens(prev => {
        const filtered = prev.filter(p => p.id !== data.id);
        return [...filtered, data].sort((a,b) => a.data.localeCompare(b.data) || a.id - b.id);
      });
      setPostagemModal(null); setPostagemEdit(null); flash();
    }
  };

  const deletePostagem = async (id) => {
    await supabase.from("postagens").delete().eq("id", id);
    setPostagens(prev => prev.filter(p => p.id !== id));
    flash();
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const login = async () => {
    setLoginLoading(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError("Email ou senha incorretos.");
    setLoginLoading(false);
  };
  const logout = () => supabase.auth.signOut();

  const addEpisode = async () => {
    const { data } = await supabase.from("episodes").insert({
      title: `Episódio ${episodes.length + 1}`, status: "planejado",
      local: "Rádio FM O Dia", endereco: "R. Carlos Machado, 131 — Barra da Tijuca, Rio de Janeiro",
      mensagem_convidado: "Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!"
    }).select().single();
    if (data) { setEpisodes(prev => [...prev, data]); flash(); }
  };

  const saveEp = async () => {
    const { data } = await supabase.from("episodes").update({
      title: editData.title, status: editData.status,
      convidados: editData.convidados, tier_list: editData.tier_list,
      debate: editData.debate, game: editData.game,
      gravacao_data: editData.gravacao_data, gravacao_horario: editData.gravacao_horario,
      gravacao_duracao: editData.gravacao_duracao, local: editData.local,
      endereco: editData.endereco, notas: editData.notas,
      mensagem_convidado: editData.mensagem_convidado,
      retroativo: editData.retroativo || false,
      drive_link: editData.drive_link || "",
    }).eq("id", editData.id).select().single();
    if (data) { setEpisodes(prev => prev.map(e => e.id === data.id ? data : e)); setSelectedEp(data); setEditMode(false); flash(); }
  };

  const saveStats = async () => {
    const { data } = await supabase.from("episodes").update({
      investimento: statsEdit.investimento || 0,
      roi: statsEdit.roi || 0,
      links: statsEdit.links || []
    }).eq("id", statsEdit.id).select().single();
    if (data) { setEpisodes(prev => prev.map(e => e.id === data.id ? data : e)); setStatsEp(data); setStatsEditMode(false); flash(); }
  };

  const deleteEp = async (id) => {
    await supabase.from("episodes").delete().eq("id", id);
    setEpisodes(prev => prev.filter(e => e.id !== id));
    setSelectedEp(null); setEditMode(false);
  };

  const openEp = (ep) => {
    setSelectedEp(ep);
    setEditData({...ep, convidados: ep.convidados || []});
    setEditMode(false);
  };

  const openStats = (ep) => {
    setStatsEp(ep);
    setStatsEdit({...ep, links: ep.links || []});
    setStatsEditMode(false);
  };

  const addTierList = async () => {
    if (!newTierList.trim()) return;
    const { data } = await supabase.from("tier_lists").insert({nome: newTierList.trim(), estrelas: 0}).select().single();
    if (data) { setTierLists(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome))); setNewTierList(""); flash(); }
  };
  const removeTierList = async (id) => { await supabase.from("tier_lists").delete().eq("id", id); setTierLists(prev => prev.filter(t => t.id !== id)); };
  const updateTierStars = async (id, estrelas) => { await supabase.from("tier_lists").update({estrelas}).eq("id", id); setTierLists(prev => prev.map(t => t.id === id ? {...t, estrelas} : t)); };

  const addConvidado = async () => {
    if (!newConvidado.trim()) return;
    const { data } = await supabase.from("convidados").insert({nome: newConvidado.trim()}).select().single();
    if (data) { setConvidados(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome))); setNewConvidado(""); flash(); }
  };
  const removeConvidado = async (id) => { await supabase.from("convidados").delete().eq("id", id); setConvidados(prev => prev.filter(c => c.id !== id)); };

  const addGame = async () => {
    if (!newGame.nome.trim()) return;
    const { data } = await supabase.from("games").insert(newGame).select().single();
    if (data) { setGames(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome))); setNewGame({nome:"",descricao:"",jogadores:"",duracao:"",dificuldade:"Fácil",ideias:"",estrelas:0}); setAddingGame(false); flash(); }
  };
  const saveGame = async () => {
    const { data } = await supabase.from("games").update(editingGame).eq("id", editingGame.id).select().single();
    if (data) { setGames(prev => prev.map(g => g.id === data.id ? data : g).sort((a,b)=>a.nome.localeCompare(b.nome))); setEditingGame(null); flash(); }
  };
  const removeGame = async (id) => { await supabase.from("games").delete().eq("id", id); setGames(prev => prev.filter(g => g.id !== id)); };
  const updateGameStars = async (id, estrelas) => { await supabase.from("games").update({estrelas}).eq("id", id); setGames(prev => prev.map(g => g.id === id ? {...g, estrelas} : g)); };

  const addConvidadoInEp = async () => {
    if (!newEpConvidado.trim() || !editData) return;
    const nome = newEpConvidado.trim();
    if (!convidados.find(c => c.nome === nome)) {
      const { data } = await supabase.from("convidados").insert({nome}).select().single();
      if (data) setConvidados(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome)));
    }
    if (!editData.convidados.includes(nome)) setEditData({...editData, convidados: [...editData.convidados, nome]});
    setNewEpConvidado("");
  };

  const addTierInEp = async () => {
    if (!newEpTier.trim() || !editData) return;
    const nome = newEpTier.trim();
    if (!tierLists.find(t => t.nome === nome)) {
      const { data } = await supabase.from("tier_lists").insert({nome, estrelas:0}).select().single();
      if (data) setTierLists(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome)));
    }
    setEditData({...editData, tier_list: nome}); setNewEpTier("");
  };

  const copyLink = (id) => { navigator.clipboard.writeText(`${window.location.origin}/ep/${id}`); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  const toLocalDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };
  const getNextWednesdays = () => {
    const weeks=[]; let d=new Date();
    const dow = d.getDay();
    const diff = (3 - dow + 7) % 7;
    d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
    for(let i=0;i<12;i++){weeks.push(new Date(d));d.setDate(d.getDate()+7);}
    return weeks;
  };
  const fmt = (d) => d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
  const epsByDate = (ds) => episodes.filter(e => {
    if (!e.gravacao_data) return false;
    return e.gravacao_data.split("T")[0] === ds;
  });

  const sortedEpisodes = [...episodes]
    .filter(e => epStatusFilter === "todos" || e.status === epStatusFilter)
    .sort((a, b) => {
      if (epSort === "numero") { const na = parseInt((a.title.match(/\d+/) || [0])[0]); const nb = parseInt((b.title.match(/\d+/) || [0])[0]); return na - nb; }
      if (epSort === "data_asc") { if (!a.gravacao_data) return 1; if (!b.gravacao_data) return -1; return a.gravacao_data.localeCompare(b.gravacao_data); }
      if (epSort === "data_desc") { if (!a.gravacao_data) return 1; if (!b.gravacao_data) return -1; return b.gravacao_data.localeCompare(a.gravacao_data); }
      return 0;
    });
  const sortedTierLists = [...tierLists].filter(t=>t.nome.toLowerCase().includes(tierSearch.toLowerCase())).sort((a,b)=>tierSort==="az"?a.nome.localeCompare(b.nome):tierSort==="za"?b.nome.localeCompare(a.nome):tierSort==="stars_desc"?b.estrelas-a.estrelas:a.estrelas-b.estrelas);
  const sortedConvidados = [...convidados].filter(c=>c.nome.toLowerCase().includes(convSearch.toLowerCase())).sort((a,b)=>a.nome.localeCompare(b.nome));
  const sortedGames = [...games].filter(g=>g.nome.toLowerCase().includes(gameSearch.toLowerCase())).sort((a,b)=>gameSort==="az"?a.nome.localeCompare(b.nome):gameSort==="za"?b.nome.localeCompare(a.nome):gameSort==="stars_desc"?b.estrelas-a.estrelas:a.estrelas-b.estrelas);

  // Statistics calculations
  const publishedEps = episodes.filter(e => e.status === "publicado" || e.retroativo);
  const allConvidadosInEps = episodes.flatMap(e => e.convidados || []);
  const convidadoCount = allConvidadosInEps.reduce((acc, c) => { acc[c] = (acc[c]||0)+1; return acc; }, {});
  const convidadoRanking = Object.entries(convidadoCount).sort((a,b)=>b[1]-a[1]);
  const convidadosSemEp = convidados.filter(c => !allConvidadosInEps.includes(c.nome));
  const gamesUsados = episodes.filter(e=>e.game).map(e=>e.game);
  const gameCount = gamesUsados.reduce((acc,g)=>{ acc[g]=(acc[g]||0)+1; return acc; },{});
  const totalInvestido = episodes.reduce((sum,e)=>sum+(e.investimento||0),0);
  const totalLinks = episodes.flatMap(e=>e.links||[]).length;

  if (checkingAuth) return <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:MUTED,fontFamily:"'DM Sans'",fontSize:14}}>Carregando...</div></div>;

  if (!user) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans'",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:40,width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src="/logo.png" alt="Bulldog Show" style={{width:64,height:64,objectFit:"contain",marginBottom:12}} />
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,color:TEXT}}>BULLDOG SHOW</div>
          <div style={{fontSize:12,color:MUTED,letterSpacing:1,marginTop:4}}>PRODUCTION MANAGER</div>
        </div>
        <div style={{marginBottom:16}}><div style={{...lbl,marginBottom:6}}>Email</div><input value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="seu@email.com" type="email" style={inp} /></div>
        <div style={{marginBottom:24}}><div style={{...lbl,marginBottom:6}}>Senha</div><input value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" type="password" style={inp} /></div>
        {loginError && <div style={{color:"#EF4444",fontSize:12,fontFamily:"'DM Sans'",marginBottom:16,textAlign:"center"}}>{loginError}</div>}
        <button onClick={login} disabled={loginLoading} style={{...btnBlue,width:"100%",padding:"12px",fontSize:16,opacity:loginLoading?0.7:1}}>{loginLoading?"Entrando...":"ENTRAR"}</button>
      </div>
    </div>
  );

  if (loading) return <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:MUTED,fontFamily:"'DM Sans'",fontSize:14}}>Carregando dados...</div></div>;

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
        select option{background:#0D2840;color:#E8F4FF;}
        .stat-ep:hover{border-color:#2487BE !important;cursor:pointer;}
      `}</style>

      {/* HEADER */}
      <div style={{background:`linear-gradient(180deg,#0D2E45 0%,${BG} 100%)`,padding:"20px 20px 0",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
            <img src="/logo.png" alt="Bulldog Show" style={{width:46,height:46,objectFit:"contain"}} />
            <div>
              <div style={{fontSize:26,letterSpacing:3,color:TEXT}}>BULLDOG SHOW</div>
              <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1}}>PRODUCTION MANAGER · INTERNO</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
              {saved && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:"#10B981",background:"rgba(16,185,129,0.1)",padding:"4px 12px",borderRadius:20}}>✓ Salvo</div>}
              <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>{user.email}</div>
              <button onClick={logout} style={{...btnGhost,fontSize:11,padding:"5px 12px"}}>Sair</button>
            </div>
          </div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {TABS.map((t,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)} style={{background:activeTab===i?B:"transparent",color:activeTab===i?"#fff":MUTED,border:"none",borderRadius:"7px 7px 0 0",padding:"9px 15px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:500,transition:"all .15s"}}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"22px 20px"}}>

        {/* EPISÓDIOS */}
        {activeTab===0 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:20,letterSpacing:2}}>EPISÓDIOS <span style={{color:BL}}>({sortedEpisodes.length})</span></div>
              <button style={btnBlue} onClick={addEpisode}>+ NOVO EPISÓDIO</button>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <select value={epStatusFilter} onChange={e=>setEpStatusFilter(e.target.value)} style={{...inp,width:"auto"}}>
                <option value="todos">Todos os status</option>
                <option value="planejado">Planejado</option>
                <option value="confirmado">Confirmado</option>
                <option value="gravado">Gravado</option>
                <option value="editado">Editado</option>
                <option value="publicado">Publicado</option>
              </select>
              <select value={epSort} onChange={e=>setEpSort(e.target.value)} style={{...inp,width:"auto"}}>
                <option value="numero">Ordenar por número</option>
                <option value="data_asc">Data ↑ (mais antiga)</option>
                <option value="data_desc">Data ↓ (mais recente)</option>
              </select>
            </div>
            {sortedEpisodes.map(ep => {
              const sc=STATUS_CONFIG[ep.status]||STATUS_CONFIG.planejado;
              return (
                <div key={ep.id} className="epc" onClick={()=>openEp(ep)} style={{...card,cursor:"pointer",transition:"all .2s",display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                      <span style={{fontSize:17,letterSpacing:1}}>{ep.title}</span>
                      <span style={{background:sc.bg,color:sc.color,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600}}>{sc.label}</span>
                      {ep.retroativo && <span style={{background:"rgba(139,92,246,0.15)",color:"#8B5CF6",borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:10}}>Retroativo</span>}
                    </div>
                    <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,display:"flex",flexWrap:"wrap",gap:6}}>
                      {ep.convidados?.length>0&&<span>👥 {ep.convidados.join(", ")}</span>}
                      {ep.tier_list&&<span>🏆 {ep.tier_list.slice(0,45)}{ep.tier_list.length>45?"…":""}</span>}
                      {ep.debate&&<span>💬 {ep.debate.slice(0,40)}{ep.debate.length>40?"…":""}</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",fontFamily:"'DM Sans'",fontSize:12,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7}}>
                    {ep.gravacao_data ? <div><div style={{color:ACCENT,fontWeight:600}}>{new Date(ep.gravacao_data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</div><div style={{color:MUTED}}>{ep.gravacao_horario}</div></div> : <span style={{color:"#1A3A50"}}>Sem data</span>}
                    <button className="cpb" onClick={e=>{e.stopPropagation();copyLink(ep.id);}}>{copied===ep.id?"✓ Copiado!":"🔗 Link convidado"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TIER LISTS */}
        {activeTab===5 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:16}}>BANCO DE TIER LISTS <span style={{color:BL}}>({tierLists.length})</span></div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={newTierList} onChange={e=>setNewTierList(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTierList()} placeholder="Nova tier list..." style={{...inp,flex:1}} />
              <button style={btnBlue} onClick={addTierList}>+ ADD</button>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <input value={tierSearch} onChange={e=>setTierSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:200}} />
              <select value={tierSort} onChange={e=>setTierSort(e.target.value)} style={{...inp,width:"auto"}}>
                <option value="az">A → Z</option><option value="za">Z → A</option>
                <option value="stars_desc">★ Mais estrelas</option><option value="stars_asc">★ Menos estrelas</option>
              </select>
            </div>
            {sortedTierLists.map(tl => (
              <div key={tl.id} className="bi" style={{...card,padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <span style={{fontFamily:"'DM Sans'",fontSize:13,flex:1}}>🏆 {tl.nome}</span>
                <Stars value={tl.estrelas||0} onChange={v=>updateTierStars(tl.id,v)} />
                <button className="xb" onClick={()=>removeTierList(tl.id)} style={{...btnGhost,padding:"3px 9px",fontSize:11,color:BL}}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* CONVIDADOS */}
        {activeTab===4 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:16}}>BANCO DE CONVIDADOS <span style={{color:BL}}>({convidados.length})</span></div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={newConvidado} onChange={e=>setNewConvidado(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addConvidado()} placeholder="Novo convidado..." style={{...inp,flex:1}} />
              <button style={btnBlue} onClick={addConvidado}>+ ADD</button>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <input value={convSearch} onChange={e=>setConvSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:200}} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
              {sortedConvidados.map(c => (
                <div key={c.id} className="bi" style={{...card,padding:"9px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'DM Sans'",fontSize:12}}>👤 {c.nome}</span>
                  <button className="xb" onClick={()=>removeConvidado(c.id)} style={{...btnGhost,padding:"2px 7px",fontSize:11,color:BL,marginLeft:4}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAMES */}
        {activeTab===6 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:20,letterSpacing:2}}>BANCO DE GAMES <span style={{color:BL}}>({games.length})</span></div>
              <button style={btnBlue} onClick={()=>setAddingGame(!addingGame)}>+ NOVO GAME</button>
            </div>
            {addingGame && (
              <div style={{...card,border:`1px solid ${BL}`,marginBottom:16}}>
                <div style={{fontSize:15,letterSpacing:1,marginBottom:14,color:ACCENT}}>NOVO GAME</div>
                <div style={{display:"grid",gap:10}}>
                  <input value={newGame.nome} onChange={e=>setNewGame({...newGame,nome:e.target.value})} placeholder="Nome *" style={inp} />
                  <textarea value={newGame.descricao} onChange={e=>setNewGame({...newGame,descricao:e.target.value})} placeholder="Como funciona..." style={{...inp,minHeight:70,resize:"vertical"}} />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <input value={newGame.jogadores} onChange={e=>setNewGame({...newGame,jogadores:e.target.value})} placeholder="Jogadores" style={inp} />
                    <input value={newGame.duracao} onChange={e=>setNewGame({...newGame,duracao:e.target.value})} placeholder="Duração" style={inp} />
                    <select value={newGame.dificuldade} onChange={e=>setNewGame({...newGame,dificuldade:e.target.value})} style={inp}><option>Fácil</option><option>Médio</option><option>Difícil</option></select>
                  </div>
                  <textarea value={newGame.ideias} onChange={e=>setNewGame({...newGame,ideias:e.target.value})} placeholder="Ideias..." style={{...inp,minHeight:60,resize:"vertical"}} />
                  <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{...lbl,margin:0}}>Estrelas</span><Stars value={newGame.estrelas} onChange={v=>setNewGame({...newGame,estrelas:v})} /></div>
                  <div style={{display:"flex",gap:8}}><button style={btnBlue} onClick={addGame}>💾 SALVAR</button><button style={btnGhost} onClick={()=>setAddingGame(false)}>Cancelar</button></div>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <input value={gameSearch} onChange={e=>setGameSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:200}} />
              <select value={gameSort} onChange={e=>setGameSort(e.target.value)} style={{...inp,width:"auto"}}>
                <option value="az">A → Z</option><option value="za">Z → A</option>
                <option value="stars_desc">★ Mais estrelas</option><option value="stars_asc">★ Menos estrelas</option>
              </select>
            </div>
            {sortedGames.map(g => {
              const dc={Fácil:"#10B981",Médio:"#F59E0B",Difícil:"#EF4444"};
              const isOpen=expandedGame===g.id, isEditing=editingGame?.id===g.id;
              return (
                <div key={g.id} style={{...card,border:`1px solid ${isOpen?BL:BORDER}`,overflow:"hidden",padding:0,transition:"border-color .2s"}}>
                  <div onClick={()=>!isEditing&&setExpandedGame(isOpen?null:g.id)} style={{padding:"13px 17px",cursor:"pointer",display:"flex",alignItems:"center",gap:11}}>
                    <span style={{fontSize:20}}>🎮</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,letterSpacing:1}}>{g.nome}</div>
                      {!isOpen&&<div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginTop:2}}>{g.descricao?.slice(0,65)}…</div>}
                    </div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      <Stars value={g.estrelas||0} onChange={v=>updateGameStars(g.id,v)} readonly={!isOpen} />
                      {g.jogadores&&<span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>👥 {g.jogadores}</span>}
                      {g.duracao&&<span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>⏱ {g.duracao}</span>}
                      <span style={{background:`${dc[g.dificuldade]||"#888"}22`,color:dc[g.dificuldade]||"#888",borderRadius:4,padding:"2px 7px",fontFamily:"'DM Sans'",fontSize:10,fontWeight:600}}>{g.dificuldade}</span>
                      <span style={{color:MUTED,fontSize:11}}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 17px 17px",borderTop:`1px solid ${BORDER}`}}>
                      {isEditing ? (
                        <div style={{paddingTop:12,display:"grid",gap:10}}>
                          <input value={editingGame.nome} onChange={e=>setEditingGame({...editingGame,nome:e.target.value})} style={inp} />
                          <textarea value={editingGame.descricao} onChange={e=>setEditingGame({...editingGame,descricao:e.target.value})} style={{...inp,minHeight:70,resize:"vertical"}} />
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                            <input value={editingGame.jogadores} onChange={e=>setEditingGame({...editingGame,jogadores:e.target.value})} placeholder="Jogadores" style={inp} />
                            <input value={editingGame.duracao} onChange={e=>setEditingGame({...editingGame,duracao:e.target.value})} placeholder="Duração" style={inp} />
                            <select value={editingGame.dificuldade} onChange={e=>setEditingGame({...editingGame,dificuldade:e.target.value})} style={inp}><option>Fácil</option><option>Médio</option><option>Difícil</option></select>
                          </div>
                          <textarea value={editingGame.ideias} onChange={e=>setEditingGame({...editingGame,ideias:e.target.value})} style={{...inp,minHeight:60,resize:"vertical"}} />
                          <div style={{display:"flex",gap:8}}><button style={btnBlue} onClick={saveGame}>💾 SALVAR</button><button style={btnGhost} onClick={()=>setEditingGame(null)}>Cancelar</button></div>
                        </div>
                      ) : (
                        <div style={{paddingTop:12,display:"grid",gap:12}}>
                          <div><div style={lbl}>Como funciona</div><div style={{...val,fontSize:13,lineHeight:1.6}}>{g.descricao}</div></div>
                          {g.ideias&&<div><div style={lbl}>💡 Ideias</div><div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,lineHeight:1.6}}>{g.ideias}</div></div>}
                          <div style={{display:"flex",gap:8}}>
                            <button style={{...btnBlue,fontSize:11}} onClick={()=>setEditingGame({...g})}>✏️ EDITAR</button>
                            <button onClick={()=>removeGame(g.id)} style={{...btnGhost,fontSize:11}}>🗑 Remover</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CALENDÁRIO */}
        {activeTab===1 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:6}}>CALENDÁRIO DE GRAVAÇÕES</div>
            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,marginBottom:18}}>📅 Quartas-feiras · 10h–12h e 14h–16h · 2 eps por dia</div>

            {/* Retroativos */}
            {episodes.filter(e=>e.retroativo&&e.gravacao_data).length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>📼 Episódios Retroativos</div>
                {[...episodes].filter(e=>e.retroativo&&e.gravacao_data).sort((a,b)=>a.gravacao_data.localeCompare(b.gravacao_data)).map(ep=>{
                  const sc=STATUS_CONFIG[ep.status]||STATUS_CONFIG.planejado;
                  return (
                    <div key={ep.id} onClick={()=>openEp(ep)} style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.25)",borderRadius:10,padding:"12px 17px",display:"grid",gridTemplateColumns:"115px 1fr auto",gap:14,alignItems:"center",cursor:"pointer",marginBottom:6}}>
                      <div><div style={{fontSize:17,letterSpacing:1,color:"#8B5CF6"}}>{new Date(ep.gravacao_data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})}</div><div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED}}>Retroativo</div></div>
                      <div style={{fontFamily:"'DM Sans'",fontSize:13,display:"flex",gap:9,alignItems:"center"}}>
                        <span style={{color:"#8B5CF6",fontWeight:600}}>{ep.gravacao_horario}</span>
                        <span style={{color:TEXT}}>{ep.title}</span>
                        {ep.convidados?.length>0&&<span style={{color:MUTED}}>· {ep.convidados.join(", ")}</span>}
                      </div>
                      <span style={{background:sc.bg,color:sc.color,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Próximas gravações */}
            <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>📅 Próximas Gravações</div>
            {getNextWednesdays().map((wed,i) => {
              const ds=toLocalDate(wed), eps=epsByDate(ds);
              return (
                <div key={i} style={{marginBottom:8}}>
                  {eps.length===0 ? (
                    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"13px 17px",display:"grid",gridTemplateColumns:"115px 1fr",gap:14,alignItems:"center"}}>
                      <div><div style={{fontSize:18,letterSpacing:1,color:"#1A3A50"}}>{fmt(wed)}</div><div style={{fontFamily:"'DM Sans'",fontSize:10,color:"#1A3A50"}}>Quarta-feira</div></div>
                      <span style={{fontFamily:"'DM Sans'",fontSize:12,color:"#1A3A50"}}>Sem gravações agendadas</span>
                    </div>
                  ) : eps.map(ep=>{
                    const sc=STATUS_CONFIG[ep.status]||STATUS_CONFIG.planejado;
                    return (
                      <div key={ep.id} onClick={()=>openEp(ep)} style={{background:"rgba(27,104,150,0.1)",border:`1px solid rgba(27,104,150,0.4)`,borderRadius:10,padding:"13px 17px",display:"grid",gridTemplateColumns:"115px 1fr auto",gap:14,alignItems:"center",cursor:"pointer",marginBottom:6}}>
                        <div><div style={{fontSize:18,letterSpacing:1,color:ACCENT}}>{fmt(wed)}</div><div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED}}>Quarta-feira</div></div>
                        <div style={{fontFamily:"'DM Sans'",fontSize:13,display:"flex",gap:9,alignItems:"center"}}>
                          <span style={{color:ACCENT,fontWeight:600}}>{ep.gravacao_horario}</span>
                          <span style={{color:TEXT}}>{ep.title}</span>
                          {ep.convidados?.length>0&&<span style={{color:MUTED}}>· {ep.convidados.join(", ")}</span>}
                        </div>
                        <span style={{background:sc.bg,color:sc.color,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ESTATÍSTICAS */}
        {activeTab===3 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:20}}>ESTATÍSTICAS <span style={{color:BL}}>DO PROGRAMA</span></div>

            {/* Cards resumo */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:28}}>
              <StatCard label="Total de Episódios" value={episodes.length} />
              <StatCard label="Episódios Publicados" value={publishedEps.length} color="#10B981" />
              <StatCard label="Convidados Únicos" value={Object.keys(convidadoCount).length} />
              <StatCard label="Investimento Total" value={totalInvestido>0?`R$ ${totalInvestido.toLocaleString("pt-BR",{minimumFractionDigits:0})}`:"R$ 0"} color="#F59E0B" />
              <StatCard label="Total de Views (YT)" value={(() => { const t = episodes.flatMap(e=>e.links||[]).filter(l=>l.plataforma==="YouTube").reduce((s,l)=>s+(l.views||0),0); return t>0?t.toLocaleString("pt-BR"):"0"; })()} color={ACCENT} />
              <StatCard label="Cortes Publicados" value={totalLinks} />
              <StatCard label="Games Usados" value={Object.keys(gameCount).length} color="#8B5CF6" />
            </div>

            {/* Gráfico: Views por episódio */}
            {(() => {
              const epsComViews = episodes.filter(e=>e.links?.some(l=>l.views>0));
              if (epsComViews.length === 0) return null;
              const maxViews = Math.max(...epsComViews.map(e=>e.links.reduce((s,l)=>s+(l.views||0),0)));
              return (
                <div style={{...card,padding:20,marginBottom:20}}>
                  <div style={{fontSize:16,letterSpacing:2,marginBottom:4}}>📊 VIEWS POR EPISÓDIO</div>
                  <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginBottom:16}}>YouTube · clique para atualizar</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[...episodes].filter(e=>e.links?.length>0).sort((a,b)=>{ const na=parseInt((a.title.match(/\d+/)||[0])[0]); const nb=parseInt((b.title.match(/\d+/)||[0])[0]); return na-nb; }).map(ep=>{
                      const ytViews = (ep.links||[]).filter(l=>l.plataforma==="YouTube").reduce((s,l)=>s+(l.views||0),0);
                      const totalEpViews = (ep.links||[]).reduce((s,l)=>s+(l.views||0),0);
                      const pct = maxViews>0 ? Math.round((ytViews/maxViews)*100) : 0;
                      return (
                        <div key={ep.id}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:TEXT}}>{ep.title}</div>
                            <div style={{display:"flex",gap:12,alignItems:"center"}}>
                              {ytViews>0&&<span style={{fontFamily:"'DM Sans'",fontSize:12,color:ACCENT}}>▶ {ytViews.toLocaleString("pt-BR")} views</span>}
                              <button onClick={()=>fetchAndUpdateViews(ep)} style={{background:"rgba(27,104,150,0.15)",border:`1px solid ${BORDER}`,color:MUTED,borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:10}}>↻ atualizar</button>
                            </div>
                          </div>
                          <div style={{background:"#0A1F30",borderRadius:4,height:8,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${B},${ACCENT})`,borderRadius:4,transition:"width .5s ease"}} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Gráfico: Investimento vs ROI */}
            {(() => {
              const epsComInv = episodes.filter(e=>(e.investimento||0)>0);
              if (epsComInv.length === 0) return null;
              const maxInv = Math.max(...epsComInv.map(e=>e.investimento||0));
              return (
                <div style={{...card,padding:20,marginBottom:20}}>
                  <div style={{fontSize:16,letterSpacing:2,marginBottom:16}}>💰 INVESTIMENTO & ROI POR EPISÓDIO</div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {epsComInv.sort((a,b)=>{ const na=parseInt((a.title.match(/\d+/)||[0])[0]); const nb=parseInt((b.title.match(/\d+/)||[0])[0]); return na-nb; }).map(ep=>{
                      const pct = maxInv>0?Math.round(((ep.investimento||0)/maxInv)*100):0;
                      return (
                        <div key={ep.id}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:TEXT}}>{ep.title}</div>
                            <div style={{display:"flex",gap:16}}>
                              <span style={{fontFamily:"'DM Sans'",fontSize:12,color:"#F59E0B"}}>R$ {(ep.investimento||0).toLocaleString("pt-BR",{minimumFractionDigits:0})}</span>
                              {(ep.roi||0)>0&&<span style={{fontFamily:"'DM Sans'",fontSize:12,color:"#10B981"}}>ROI {ep.roi}%</span>}
                            </div>
                          </div>
                          <div style={{background:"#0A1F30",borderRadius:4,height:8,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#92400E,#F59E0B)",borderRadius:4,transition:"width .5s ease"}} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Rankings side by side */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

              {/* Ranking convidados */}
              <div style={{...card,padding:20,marginBottom:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:15,letterSpacing:2}}>👥 CONVIDADOS</div>
                  {convidadoRanking.length>5&&<button onClick={()=>setShowAllConvidados(v=>!v)} style={{...btnGhost,fontSize:10,padding:"2px 8px"}}>{showAllConvidados?"▲ menos":"▼ todos"}</button>}
                </div>
                {convidadoRanking.length===0
                  ? <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum convidado ainda</div>
                  : (showAllConvidados?convidadoRanking:convidadoRanking.slice(0,5)).map(([nome,count],i)=>(
                    <div key={nome} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontFamily:"'DM Sans'",fontSize:12}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:MUTED,fontSize:10,width:16}}>{i+1}.</span>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{nome}</span>
                      </div>
                      <span style={{background:"rgba(27,104,150,0.2)",color:ACCENT,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:600,flexShrink:0}}>{count}x</span>
                    </div>
                  ))}
              </div>

              {/* Ranking de views */}
              {(() => {
                const viewsRanking = episodes
                  .flatMap(ep => (ep.links||[]).map(l => ({
                    titulo: l.url ? (l.url.includes("youtu") ? `▶ ${ep.title}` : l.url.includes("instagram") ? `📸 ${ep.title}` : `🎵 ${ep.title}`) : ep.title,
                    views: l.views||0,
                    plataforma: l.plataforma,
                    ep: ep.title
                  })))
                  .filter(l => l.views > 0)
                  .sort((a,b) => b.views - a.views);
                return (
                  <div style={{...card,padding:20,marginBottom:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{fontSize:15,letterSpacing:2}}>📊 VIEWS</div>
                      {viewsRanking.length>5&&<button onClick={()=>setShowAllViews(v=>!v)} style={{...btnGhost,fontSize:10,padding:"2px 8px"}}>{showAllViews?"▲ menos":"▼ todos"}</button>}
                    </div>
                    {viewsRanking.length===0
                      ? <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum view registrado ainda</div>
                      : (showAllViews?viewsRanking:viewsRanking.slice(0,5)).map((item,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontFamily:"'DM Sans'",fontSize:12}}>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{color:MUTED,fontSize:10,width:16}}>{i+1}.</span>
                            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{item.titulo}</span>
                          </div>
                          <span style={{background:"rgba(27,104,150,0.2)",color:ACCENT,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:600,flexShrink:0}}>{item.views.toLocaleString("pt-BR")}</span>
                        </div>
                      ))}
                  </div>
                );
              })()}
            </div>

            {/* Games usados */}
            <div style={{...card,padding:16,marginBottom:20}}>
              <div style={{fontSize:14,letterSpacing:2,marginBottom:12}}>🎮 GAMES USADOS</div>
              {Object.entries(gameCount).length===0
                ? <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum game usado ainda</div>
                : <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{Object.entries(gameCount).sort((a,b)=>b[1]-a[1]).map(([nome,count])=>(
                  <span key={nome} style={{background:"rgba(27,104,150,0.15)",border:`1px solid ${BORDER}`,borderRadius:6,padding:"4px 10px",fontFamily:"'DM Sans'",fontSize:12,color:TEXT}}>
                    {nome} <span style={{color:ACCENT,fontWeight:600}}>{count}x</span>
                  </span>
                ))}</div>}
            </div>

            {/* Performance por episódio */}
            <div style={{fontSize:16,letterSpacing:2,marginBottom:16}}>📈 PERFORMANCE POR EPISÓDIO</div>
            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,marginBottom:14}}>Clica em um episódio para adicionar investimento, ROI e links de cortes</div>
            {episodes.map(ep => (
              <div key={ep.id} className="stat-ep" onClick={()=>openStats(ep)} style={{...card,transition:"border-color .2s",display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:16,alignItems:"center"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <div style={{fontSize:15,letterSpacing:1}}>{ep.title}</div>
                    {ep.drive_link&&<a href={ep.drive_link} target="_blank" rel="noreferrer" style={{fontFamily:"'DM Sans'",fontSize:11,color:"#10B981",textDecoration:"none"}}>📁 Drive</a>}
                  </div>
                  <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{ep.convidados?.join(", ")||"Sem convidados"}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={lbl}>Investimento</div>
                  <div style={{fontFamily:"'DM Sans'",fontSize:14,color:ep.investimento>0?"#F59E0B":MUTED}}>{ep.investimento>0?`R$ ${ep.investimento.toLocaleString("pt-BR",{minimumFractionDigits:0})}`:"—"}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={lbl}>ROI</div>
                  <div style={{fontFamily:"'DM Sans'",fontSize:14,color:ep.roi>0?"#10B981":MUTED}}>{ep.roi>0?`${ep.roi}%`:"—"}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={lbl}>Cortes</div>
                  <div style={{fontFamily:"'DM Sans'",fontSize:14,color:ep.links?.length>0?ACCENT:MUTED}}>{ep.links?.length||0}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POSTAGEM */}
        {activeTab===2 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,letterSpacing:2}}>CALENDÁRIO DE POSTAGEM <span style={{color:BL}}>YOUTUBE</span></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setPostagemWeekOffset(o=>o-1)} style={{...btnGhost,padding:"6px 12px",fontSize:13}}>← Anterior</button>
                <button onClick={()=>setPostagemWeekOffset(0)} style={{...btnGhost,padding:"6px 12px",fontSize:12}}>Hoje</button>
                <button onClick={()=>setPostagemWeekOffset(o=>o+1)} style={{...btnGhost,padding:"6px 12px",fontSize:13}}>Próxima →</button>
              </div>
            </div>
            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,marginBottom:20}}>🕕 18h · Postagem diária no YouTube</div>
            <div style={{display:"grid",gap:10}}>
              {getWeekDates(postagemWeekOffset).map(slot => {
                const slotPostagens = getPostagens(slot.date);
                const isToday = slot.date === toLocalDate(new Date());
                const getTipoStyle = (tipo) => {
                  if (tipo==="Full") return {color:"#8B5CF6",bg:"rgba(139,92,246,0.15)",border:"rgba(139,92,246,0.4)"};
                  if (tipo==="Tier List") return {color:"#F59E0B",bg:"rgba(245,158,11,0.15)",border:"rgba(245,158,11,0.4)"};
                  return {color:ACCENT,bg:"rgba(27,104,150,0.15)",border:"rgba(27,104,150,0.4)"};
                };
                return (
                  <div key={slot.date} style={{...card,padding:"14px 18px",marginBottom:8,border:`1px solid ${isToday?"rgba(27,104,150,0.8)":BORDER}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:slotPostagens.length>0?12:0}}>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:1,color:isToday?ACCENT:TEXT}}>{slot.label}{isToday&&<span style={{fontFamily:"'DM Sans'",fontSize:10,color:ACCENT,marginLeft:6}}>HOJE</span>}</div>
                        <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{new Date(slot.date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} · 18h</div>
                      </div>
                      <button onClick={()=>{setPostagemModal(slot);setPostagemEdit({data:slot.date,tipo:slot.tipo,status:"pendente",episodio_id:null,episodio_title:"",link:"",notas:""});}} style={{...btnGhost,fontSize:11,padding:"5px 12px"}}>+ Adicionar</button>
                    </div>
                    {slotPostagens.length===0 && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:"#1A3A50"}}>Nenhum post agendado</div>}
                    {slotPostagens.map(p => {
                      const ts = getTipoStyle(p.tipo);
                      const statusColor = p.status==="postado"?"#10B981":p.status==="agendado"?"#F59E0B":MUTED;
                      const ep = episodes.find(e=>e.id===p.episodio_id);
                      return (
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"rgba(27,104,150,0.07)",borderRadius:7,marginBottom:6,border:`1px solid ${ts.border}`}}>
                          <span style={{background:ts.bg,color:ts.color,borderRadius:4,padding:"2px 10px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,flexShrink:0}}>{p.tipo}</span>
                          <div style={{flex:1,minWidth:0,fontFamily:"'DM Sans'",fontSize:13}}>
                            {p.episodio_title ? <span style={{color:TEXT}}>{p.episodio_title}</span> : <span style={{color:"#1A3A50"}}>Sem episódio</span>}
                            {ep?.drive_link && <a href={ep.drive_link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{marginLeft:10,fontSize:11,color:"#10B981"}}>📁 Drive</a>}
                          </div>
                          <span style={{color:statusColor,fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,textTransform:"uppercase",flexShrink:0}}>{p.status}</span>
                          <button onClick={()=>{setPostagemModal(slot);setPostagemEdit({...p});}} style={{background:"rgba(27,104,150,0.2)",border:`1px solid ${BORDER}`,color:ACCENT,borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:10,flexShrink:0}}>✏️</button>
                          <button onClick={()=>deletePostagem(p.id)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#EF4444",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:10,flexShrink:0}}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Resumo da semana */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:24}}>
              {["postado","agendado","pendente"].map(s => {
                const count = getWeekDates(postagemWeekOffset).flatMap(slot => getPostagens(slot.date)).filter(p => p.status === s).length;
                const color = s==="postado"?"#10B981":s==="agendado"?"#F59E0B":MUTED;
                return (
                  <div key={s} style={{...card,padding:"14px 16px",textAlign:"center"}}>
                    <div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{s}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color}}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* MODAL EPISÓDIO */}
      {selectedEp&&editData&&(
        <div onClick={e=>e.target===e.currentTarget&&(setSelectedEp(null),setEditMode(false))} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:660,maxHeight:"90vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              {editMode ? <input value={editData.title} onChange={e=>setEditData({...editData,title:e.target.value})} style={{...inp,fontSize:19,letterSpacing:2,background:"transparent",border:"none",borderBottom:`1px solid ${BL}`,borderRadius:0,padding:"3px 0",fontFamily:"'Bebas Neue'",width:"60%"}} /> : <div style={{fontSize:21,letterSpacing:2}}>{selectedEp.title}</div>}
              <div style={{display:"flex",gap:8}}>
                {!editMode&&<button style={btnBlue} onClick={()=>setEditMode(true)}>✏️ EDITAR</button>}
                {editMode&&<><button style={btnBlue} onClick={saveEp}>💾 SALVAR</button><button style={btnGhost} onClick={()=>{setEditData({...selectedEp,convidados:selectedEp.convidados||[]});setEditMode(false);}}>Cancelar</button></>}
                <button style={btnGhost} onClick={()=>{setSelectedEp(null);setEditMode(false);}}>✕</button>
              </div>
            </div>

            <div style={{background:"rgba(27,104,150,0.08)",border:`1px solid rgba(27,104,150,0.25)`,borderRadius:8,padding:"11px 15px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'DM Sans'",fontSize:10,color:ACCENT,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>🔗 Link para o convidado</div>
                <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>/ep/{selectedEp.id}</div>
              </div>
              <button className="cpb" onClick={()=>copyLink(selectedEp.id)}>{copied===selectedEp.id?"✓ Copiado!":"Copiar link"}</button>
            </div>

            {/* Status */}
            <div style={{marginBottom:16}}><div style={lbl}>Status</div>
              {editMode ? <select value={editData.status} onChange={e=>setEditData({...editData,status:e.target.value})} style={inp}>{Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
              : <span style={{background:STATUS_CONFIG[selectedEp.status]?.bg,color:STATUS_CONFIG[selectedEp.status]?.color,borderRadius:4,padding:"3px 10px",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600}}>{STATUS_CONFIG[selectedEp.status]?.label}</span>}
            </div>

            {editMode && (
              <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={editData.retroativo||false} onChange={e=>setEditData({...editData,retroativo:e.target.checked})} id="retro" style={{width:16,height:16}} />
                <label htmlFor="retro" style={{fontFamily:"'DM Sans'",fontSize:13,color:MUTED,cursor:"pointer"}}>Episódio retroativo (já gravado/publicado)</label>
              </div>
            )}

            {/* Convidados */}
            <div style={{marginBottom:16}}><div style={lbl}>Convidados</div>
              {editMode ? (
                <div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7}}>{editData.convidados.map((c,i)=><span key={i} className="tag" style={{cursor:"pointer"}} onClick={()=>setEditData({...editData,convidados:editData.convidados.filter((_,j)=>j!==i)})}>{c} ✕</span>)}</div>
                  <select onChange={e=>{if(e.target.value&&!editData.convidados.includes(e.target.value))setEditData({...editData,convidados:[...editData.convidados,e.target.value]});e.target.value="";}} style={{...inp,marginBottom:8}}>
                    <option value="">+ Selecionar do banco (A-Z)...</option>
                    {[...convidados].sort((a,b)=>a.nome.localeCompare(b.nome)).filter(c=>!editData.convidados.includes(c.nome)).map(c=><option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                  <div style={{display:"flex",gap:8}}>
                    <input value={newEpConvidado} onChange={e=>setNewEpConvidado(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addConvidadoInEp()} placeholder="Ou digita novo convidado..." style={{...inp,flex:1}} />
                    <button style={{...btnBlue,fontSize:12,padding:"6px 12px"}} onClick={addConvidadoInEp}>+ ADD</button>
                  </div>
                </div>
              ) : <div style={val}>{selectedEp.convidados?.length>0?selectedEp.convidados.map((c,i)=><span key={i} className="tag">{c}</span>):<span style={{color:"#1A3A50"}}>Nenhum</span>}</div>}
            </div>

            {/* Tier List */}
            <div style={{marginBottom:16}}><div style={lbl}>Tier List</div>
              {editMode ? (
                <div>
                  <select value={editData.tier_list||""} onChange={e=>setEditData({...editData,tier_list:e.target.value})} style={{...inp,marginBottom:8}}>
                    <option value="">Selecionar do banco (A-Z)...</option>
                    {[...tierLists].sort((a,b)=>a.nome.localeCompare(b.nome)).map(t=><option key={t.id} value={t.nome}>{t.nome}</option>)}
                  </select>
                  <div style={{display:"flex",gap:8}}>
                    <input value={newEpTier} onChange={e=>setNewEpTier(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTierInEp()} placeholder="Ou digita nova tier list..." style={{...inp,flex:1}} />
                    <button style={{...btnBlue,fontSize:12,padding:"6px 12px"}} onClick={addTierInEp}>+ ADD</button>
                  </div>
                </div>
              ) : <div style={val}>{selectedEp.tier_list||<span style={{color:"#1A3A50"}}>Não definida</span>}</div>}
            </div>

            {/* Debate */}
            <div style={{marginBottom:16}}><div style={lbl}>Debate / Tema</div>
              {editMode ? <input value={editData.debate||""} onChange={e=>setEditData({...editData,debate:e.target.value})} style={inp} placeholder="Tema do debate..." /> : <div style={val}>{selectedEp.debate||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>}
            </div>

            {/* Game */}
            <div style={{marginBottom:16}}><div style={lbl}>Game / Dinâmica</div>
              {editMode ? <select value={editData.game||""} onChange={e=>setEditData({...editData,game:e.target.value})} style={inp}><option value="">Selecionar (A-Z)...</option>{[...games].sort((a,b)=>a.nome.localeCompare(b.nome)).map(g=><option key={g.id} value={g.nome}>{g.nome}</option>)}</select>
              : <div style={val}>{selectedEp.game||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>}
            </div>

            {/* Local e Endereço */}
            {["local","endereco"].map(field=>(
              <div key={field} style={{marginBottom:16}}><div style={lbl}>{field==="local"?"Local":"Endereço"}</div>
                {editMode ? <input value={editData[field]||""} onChange={e=>setEditData({...editData,[field]:e.target.value})} style={inp} /> : <div style={val}>{selectedEp[field]||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>}
              </div>
            ))}

            {/* Data & Horário */}
            <div style={{marginBottom:16}}><div style={lbl}>Data & Horário</div>
              {editMode ? <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <input type="date" value={editData.gravacao_data||""} onChange={e=>setEditData({...editData,gravacao_data:e.target.value})} style={inp} />
                <select value={editData.gravacao_horario||"10:00"} onChange={e=>setEditData({...editData,gravacao_horario:e.target.value})} style={inp}><option value="10:00">10:00 (manhã)</option><option value="14:00">14:00 (tarde)</option></select>
                <input value={editData.gravacao_duracao||""} onChange={e=>setEditData({...editData,gravacao_duracao:e.target.value})} style={inp} placeholder="Duração" />
              </div> : <div style={val}>{selectedEp.gravacao_data?`${new Date(selectedEp.gravacao_data+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})} · ${selectedEp.gravacao_horario}`:<span style={{color:"#1A3A50"}}>A definir</span>}</div>}
            </div>

            {/* Mensagem */}
            <div style={{marginBottom:16}}><div style={lbl}>Mensagem para o Convidado</div>
              {editMode ? <textarea value={editData.mensagem_convidado||""} onChange={e=>setEditData({...editData,mensagem_convidado:e.target.value})} style={{...inp,minHeight:70,resize:"vertical"}} /> : <div style={val}>{selectedEp.mensagem_convidado||<span style={{color:"#1A3A50"}}>Nenhuma</span>}</div>}
            </div>

            {/* Notas */}
            <div style={{marginBottom:16}}><div style={lbl}>Notas Internas 🔒</div>
              {editMode ? <textarea value={editData.notas||""} onChange={e=>setEditData({...editData,notas:e.target.value})} style={{...inp,minHeight:70,resize:"vertical"}} /> : <div style={val}>{selectedEp.notas||<span style={{color:"#1A3A50"}}>Sem notas</span>}</div>}
            </div>

            {/* Drive */}
            <div style={{marginBottom:20}}><div style={lbl}>📁 Link do Google Drive</div>
              {editMode ? <input value={editData.drive_link||""} onChange={e=>setEditData({...editData,drive_link:e.target.value})} style={inp} placeholder="https://drive.google.com/..." /> : <div style={val}>{selectedEp.drive_link ? <a href={selectedEp.drive_link} target="_blank" rel="noreferrer" style={{color:"#10B981"}}>📁 Abrir pasta no Drive</a> : <span style={{color:"#1A3A50"}}>Sem link</span>}</div>}
            </div>

            {!editMode&&<button onClick={()=>deleteEp(selectedEp.id)} style={{...btnGhost,fontSize:11}}>🗑 Deletar episódio</button>}
          </div>
        </div>
      )}

      {/* MODAL ESTATÍSTICAS DO EPISÓDIO */}
      {statsEp&&statsEdit&&(
        <div onClick={e=>e.target===e.currentTarget&&(setStatsEp(null),setStatsEditMode(false))} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:580,maxHeight:"90vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div>
                <div style={{fontSize:21,letterSpacing:2}}>{statsEp.title}</div>
                <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginTop:2}}>Performance & Financeiro</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {!statsEditMode&&<button style={btnBlue} onClick={()=>setStatsEditMode(true)}>✏️ EDITAR</button>}
                {statsEditMode&&<><button style={btnBlue} onClick={saveStats}>💾 SALVAR</button><button style={btnGhost} onClick={()=>{setStatsEdit({...statsEp,links:statsEp.links||[]});setStatsEditMode(false);}}>Cancelar</button></>}
                <button style={btnGhost} onClick={()=>{setStatsEp(null);setStatsEditMode(false);}}>✕</button>
              </div>
            </div>

            {/* Investimento e ROI */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              <div><div style={lbl}>💰 Investimento (R$)</div>
                {statsEditMode ? <input type="number" value={statsEdit.investimento||0} onChange={e=>setStatsEdit({...statsEdit,investimento:parseFloat(e.target.value)||0})} style={inp} /> : <div style={{...val,fontSize:20,fontFamily:"'Bebas Neue'",letterSpacing:1,color:"#F59E0B"}}>{statsEp.investimento>0?`R$ ${statsEp.investimento.toLocaleString("pt-BR",{minimumFractionDigits:2})}`:"—"}</div>}
              </div>
              <div><div style={lbl}>📈 ROI (%)</div>
                {statsEditMode ? <input type="number" value={statsEdit.roi||0} onChange={e=>setStatsEdit({...statsEdit,roi:parseFloat(e.target.value)||0})} style={inp} /> : <div style={{...val,fontSize:20,fontFamily:"'Bebas Neue'",letterSpacing:1,color:"#10B981"}}>{statsEp.roi>0?`${statsEp.roi}%`:"—"}</div>}
              </div>
            </div>

            {/* Links de cortes */}
            <div style={{marginBottom:20}}><div style={lbl}>🎬 Links de Cortes</div>
              {statsEditMode ? (
                <div>
                  {(statsEdit.links||[]).map((link,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                      <select value={link.plataforma} onChange={e=>{const l=[...statsEdit.links];l[i]={...l[i],plataforma:e.target.value};setStatsEdit({...statsEdit,links:l});}} style={{...inp,width:"auto",flex:"0 0 120px"}}>
                        <option>YouTube</option><option>Instagram</option><option>TikTok</option>
                      </select>
                      <input value={link.url} onChange={e=>{const l=[...statsEdit.links];l[i]={...l[i],url:e.target.value};setStatsEdit({...statsEdit,links:l});}} placeholder="URL do corte..." style={{...inp,flex:1}} />
                      <input type="number" value={link.views||0} onChange={e=>{const l=[...statsEdit.links];l[i]={...l[i],views:parseInt(e.target.value)||0};setStatsEdit({...statsEdit,links:l});}} placeholder="Views" style={{...inp,width:100,flex:"0 0 100px"}} />
                      <button onClick={()=>setStatsEdit({...statsEdit,links:statsEdit.links.filter((_,j)=>j!==i)})} style={{...btnGhost,padding:"4px 8px",fontSize:11}}>✕</button>
                    </div>
                  ))}
                  <button onClick={()=>setStatsEdit({...statsEdit,links:[...(statsEdit.links||[]),{plataforma:"YouTube",url:"",views:0}]})} style={{...btnGhost,fontSize:11,padding:"6px 14px"}}>+ Adicionar link</button>
                </div>
              ) : (
                <div>
                  {statsEp.links?.length>0 ? statsEp.links.map((l,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${BORDER}`,fontFamily:"'DM Sans'",fontSize:13}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{background:"rgba(27,104,150,0.2)",color:ACCENT,borderRadius:4,padding:"2px 8px",fontSize:11}}>{l.plataforma}</span>
                        <a href={l.url} target="_blank" rel="noreferrer" style={{color:ACCENT,fontSize:12}}>{l.url.slice(0,45)}{l.url.length>45?"…":""}</a>
                      </div>
                      {l.views>0&&<span style={{color:"#F59E0B",fontWeight:600}}>{l.views.toLocaleString("pt-BR")} views</span>}
                    </div>
                  )) : <div style={{fontFamily:"'DM Sans'",fontSize:13,color:MUTED}}>Nenhum link adicionado ainda</div>}
                </div>
              )}
            </div>

            {/* Total de views */}
            {statsEp.links?.some(l=>l.views>0) && (
              <div style={{background:"rgba(27,104,150,0.1)",border:`1px solid ${BORDER}`,borderRadius:8,padding:"12px 16px"}}>
                <div style={lbl}>Total de Views</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,letterSpacing:2,color:ACCENT}}>
                  {statsEp.links.reduce((sum,l)=>sum+(l.views||0),0).toLocaleString("pt-BR")}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* MODAL POSTAGEM */}
      {postagemModal&&postagemEdit&&(
        <div onClick={e=>e.target===e.currentTarget&&(setPostagemModal(null),setPostagemEdit(null))} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:520,padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:20,letterSpacing:2}}>{postagemModal.label.toUpperCase()}</div>
                <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{new Date(postagemModal.date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})} · 18h</div>
              </div>
              <button style={btnGhost} onClick={()=>{setPostagemModal(null);setPostagemEdit(null);}}>✕</button>
            </div>

            <div style={{marginBottom:14}}>
              <div style={lbl}>Tipo</div>
              <select value={postagemEdit.tipo} onChange={e=>setPostagemEdit({...postagemEdit,tipo:e.target.value})} style={inp}>
                <option>Corte</option><option>Tier List</option><option>Full</option>
              </select>
            </div>

            <div style={{marginBottom:14}}>
              <div style={lbl}>Status</div>
              <select value={postagemEdit.status||"pendente"} onChange={e=>setPostagemEdit({...postagemEdit,status:e.target.value})} style={inp}>
                <option value="pendente">Pendente</option>
                <option value="agendado">Agendado</option>
                <option value="postado">Postado</option>
              </select>
            </div>

            <div style={{marginBottom:14}}>
              <div style={lbl}>Episódio vinculado</div>
              <select value={postagemEdit.episodio_id||""} onChange={e=>{const ep=episodes.find(ep=>String(ep.id)===e.target.value);setPostagemEdit({...postagemEdit,episodio_id:ep?.id||null,episodio_title:ep?.title||""}); }} style={inp}>
                <option value="">Selecionar episódio...</option>
                {[...episodes].sort((a,b)=>{const na=parseInt((a.title.match(/\d+/)||[0])[0]);const nb=parseInt((b.title.match(/\d+/)||[0])[0]);return na-nb;}).map(ep=><option key={ep.id} value={ep.id}>{ep.title}{ep.convidados?.length>0?` · ${ep.convidados.join(", ")}`:""}</option>)}
              </select>
            </div>

            <div style={{marginBottom:14}}>
              <div style={lbl}>Link do post (YouTube)</div>
              <input value={postagemEdit.link||""} onChange={e=>setPostagemEdit({...postagemEdit,link:e.target.value})} placeholder="https://youtube.com/..." style={inp} />
            </div>

            <div style={{marginBottom:20}}>
              <div style={lbl}>Notas</div>
              <textarea value={postagemEdit.notas||""} onChange={e=>setPostagemEdit({...postagemEdit,notas:e.target.value})} style={{...inp,minHeight:60,resize:"vertical"}} placeholder="Observações sobre essa postagem..." />
            </div>

            <div style={{display:"flex",gap:8}}>
              <button style={btnBlue} onClick={savePostagem}>💾 SALVAR</button>
              <button style={btnGhost} onClick={()=>{setPostagemModal(null);setPostagemEdit(null);}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
