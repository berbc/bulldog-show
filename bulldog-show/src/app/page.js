"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const STATUS_EDICAO_CONFIG = {
  pendente:  { label: "Pendente",   color: "#5A8BA8", bg: "rgba(90,139,168,0.15)" },
  editando:  { label: "Editando",   color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  revisao:   { label: "Em Revisão", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  aprovado:  { label: "Aprovado",   color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  publicado: { label: "Publicado",  color: "#7EC8F0", bg: "rgba(27,104,150,0.2)"  }
};
const STATUS_CONFIG = {
  planejado:  { label: "Planejado",  color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  confirmado: { label: "Confirmado", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  gravado:    { label: "Gravado",    color: "#2487BE", bg: "rgba(36,135,190,0.15)" },
  editado:    { label: "Editado",    color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  publicado:  { label: "Publicado",  color: "#7EC8F0", bg: "rgba(27,104,150,0.2)"  }
};
const epNum = (t) => { const m = (t || "").match("[0-9]+"); return m ? parseInt(m[0]) : 0; };
const TABS = ["🏠 Dashboard","📋 Episódios","📅 Agenda","🎬 Produção","📊 Estatísticas","💡 Banco de Ideias"];
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
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [statsEp, setStatsEp] = useState(null);
  const [showAllConvidados, setShowAllConvidados] = useState(false);
  const [showAllViews, setShowAllViews] = useState(false);
  const [viewsModal, setViewsModal] = useState(null); // 'yt' | 'social' | null
  const [statsModal, setStatsModal] = useState(null); // 'gravados' | 'publicados' | 'cortes' | 'tierlists'
  const [statsEdit, setStatsEdit] = useState(null);
  const [statsEditMode, setStatsEditMode] = useState(false);
  const [equipe, setEquipe] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [newPauta, setNewPauta] = useState({titulo:"",descricao:"",estrelas:0});
  const [editingPauta, setEditingPauta] = useState(null);
  const [cronoEpId, setCronoEpId] = useState(null);
  const [cronoRunning, setCronoRunning] = useState(false);
  const [cronoTime, setCronoTime] = useState(0);
  const [cronoNotaAtiva, setCronoNotaAtiva] = useState(null);
  const [newComentario, setNewComentario] = useState("");
  const [newMembro, setNewMembro] = useState({nome:"",funcao:""});
  const [addingMembro, setAddingMembro] = useState(false);
  const [comentarioAutor, setComentarioAutor] = useState("");
  const [postagemWeekOffset, setPostagemWeekOffset] = useState(0);
  const [postagemModal, setPostagemModal] = useState(null);
  const [postagemEdit, setPostagemEdit] = useState(null);
  const [postagens, setPostagens] = useState([]);
  const cronoRef = useRef(null);
  const [corteChecklists, setCorteChecklists] = useState({});

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const flashError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 4000); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ep, tl, cv, gm] = await Promise.all([
        supabase.from("episodes").select("*").order("id"),
        supabase.from("tier_lists").select("*").order("nome"),
        supabase.from("convidados").select("*").order("nome"),
        supabase.from("games").select("*").order("nome"),
      ]);
      if (ep.data) setEpisodes(ep.data);
      if (tl.data) setTierLists(tl.data);
      if (cv.data) setConvidados(cv.data);
      if (gm.data) setGames(gm.data);
    } catch(e) { flashError("Erro ao carregar dados"); }
    setLoading(false);
  }, []);
  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const loadPostagens = useCallback(async () => {
    try {
      const { data } = await supabase.from("postagens").select("*").order("data,id");
      if (data) setPostagens(data);
    } catch(e) {}
  }, []);
  useEffect(() => { if (user) loadPostagens(); }, [user, loadPostagens]);

  const loadEquipe = useCallback(async () => {
    const { data } = await supabase.from("equipe").select("*").order("nome");
    if (data) setEquipe(data);
  }, []);
  useEffect(() => { if (user) loadEquipe(); }, [user, loadEquipe]);

  const loadPautas = useCallback(async () => {
    const { data } = await supabase.from("pautas").select("*").order("estrelas", {ascending:false});
    if (data) setPautas(data);
  }, []);
  useEffect(() => { if (user) loadPautas(); }, [user, loadPautas]);

  const loadComentarios = useCallback(async (epId) => {
    const { data } = await supabase.from("comentarios").select("*").eq("episodio_id", epId).order("created_at");
    if (data) setComentarios(data);
  }, []);

  const login = async () => {
    setLoginLoading(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError(error.message);
    setLoginLoading(false);
  };
  const logout = async () => { await supabase.auth.signOut(); };

  const getYouTubeVideoId = (url) => {
    const u = url || "";
    if (u.includes("v=")) return u.split("v=")[1]?.split("&")[0];
    if (u.includes("youtu.be/")) return u.split("youtu.be/")[1]?.split("?")[0];
    if (u.includes("/shorts/")) return u.split("/shorts/")[1]?.split("?")[0];
    return null;
  };

  const fetchYouTubeViews = async (url) => {
    const vid = getYouTubeVideoId(url);
    if (!vid) return null;
    try {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!apiKey) return null;
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${vid}&part=statistics&key=${apiKey}`);
      if (!res.ok) return null;
      const data = await res.json();
      const count = parseInt(data?.items?.[0]?.statistics?.viewCount || 0);
      return count > 0 ? count : null;
    } catch(e) { return null; }
  };

  const refreshPostagemViews = async (p) => {
    if (!p.link || (!p.link.includes("youtu.be") && !p.link.includes("youtube.com"))) return;
    const fetched = await fetchYouTubeViews(p.link);
    if (fetched !== null && fetched > 0 && fetched !== p.views) {
      await supabase.from("postagens").update({views: fetched}).eq("id", p.id);
      setPostagens(prev => prev.map(x => x.id === p.id ? {...x, views: fetched} : x));
    }
  };

  const fetchAndUpdateViews = async (ep) => {
    const links = ep.links || [];
    const updated = await Promise.all(links.map(async (l) => {
      if (!l.url || !l.url.includes("youtu")) return l;
      const v = await fetchYouTubeViews(l.url);
      return v !== null ? {...l, views: v} : l;
    }));
    const { data } = await supabase.from("episodes").update({links: updated}).eq("id", ep.id).select().single();
    if (data) setEpisodes(prev => prev.map(e => e.id === data.id ? data : e));
  };

  const toLocalDate = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  };
  const fmt = (d) => new Date(d).toLocaleDateString("pt-BR", {weekday:"short",day:"2-digit",month:"short"});
  const epsByDate = (ds) => episodes.filter(e => !e.retroativo && e.gravacao_data === ds);
  const getNextWednesdays = () => {
    const result = [], now = new Date();
    now.setHours(0,0,0,0);
    let d = new Date(now);
    while (d.getDay() !== 3) d.setDate(d.getDate()+1);
    for (let i = 0; i < 8; i++) {
      result.push(new Date(d));
      d.setDate(d.getDate()+7);
    }
    return result;
  };

  const getWeekDates = (offset=0) => {
    const days = ["SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO","DOMINGO"];
    const tipos = ["Corte","Corte","Full","Corte","Tier List","Corte","Corte"];
    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow===0?6:dow-1) + offset*7);
    monday.setHours(0,0,0,0);
    return Array.from({length:7},(_,i)=>{
      const d = new Date(monday);
      d.setDate(monday.getDate()+i);
      return { date: toLocalDate(d), label: days[i], tipo: tipos[i] };
    });
  };
  const getPostagens = (date) => postagens.filter(p => p.data === date);

  const openEp = (ep) => {
    setSelectedEp(ep);
    setEditData({...ep, convidados: ep.convidados || []});
    setEditMode(false);
    setComentarios([]);
    loadComentarios(ep.id);
  };

  const saveEp = async () => {
    if (!editData) return;
    try {
      const payload = {
        title: editData.title,
        status: editData.status || "planejado",
        convidados: editData.convidados || [],
        tier_list: editData.tier_list || "",
        debate: editData.debate || "",
        game: editData.game || "",
        gravacao_data: editData.gravacao_data || null,
        gravacao_horario: editData.gravacao_horario || "",
        gravacao_duracao: editData.gravacao_duracao || "",
        local: editData.local || "",
        endereco: editData.endereco || "",
        pauta: editData.pauta || "",
        notas: editData.notas || "",
        mensagem_convidado: editData.mensagem_convidado || "",
        retroativo: editData.retroativo || false,
        drive_link: editData.drive_link || "",
        status_edicao: editData.status_edicao || "pendente",
        investimento: editData.investimento || 0,
        roi: editData.roi || 0,
      };
      const { data, error } = await supabase.from("episodes").update(payload).eq("id", editData.id).select().single();
      if (error) { flashError("Erro ao salvar"); return; }
      if (data) {
        setEpisodes(prev => prev.map(e => e.id === data.id ? data : e));
        setSelectedEp(data);
        setEditData({...data, convidados: data.convidados || []});
        setEditMode(false);
        flash();
      }
    } catch(e) { flashError("Erro ao salvar"); }
  };

  const deleteEp = async (id) => {
    if (!confirm("Deletar episódio?")) return;
    await supabase.from("episodes").delete().eq("id", id);
    setEpisodes(prev => prev.filter(e => e.id !== id));
    setSelectedEp(null);
  };

  const createEp = async () => {
    const num = episodes.length + 1;
    const { data } = await supabase.from("episodes").insert({
      title: `Episódio ${num}`, status: "planejado", convidados: [],
      local: "Rádio FM O Dia", endereco: "R. Carlos Machado 131, Barra da Tijuca, RJ",
      gravacao_horario: "10:00", checklist: [], cortes_gravacao: []
    }).select().single();
    if (data) { setEpisodes(prev => [...prev, data]); openEp(data); }
  };

  const addConvidadoInEp = async () => {
    if (!newEpConvidado.trim()) return;
    const list = [...(editData.convidados||[]), newEpConvidado.trim()];
    setEditData({...editData, convidados: list});
    setNewEpConvidado("");
    if (!editData.id) return;
    const { data } = await supabase.from("convidados").insert({nome: newEpConvidado.trim()}).select().single();
    if (data) setConvidados(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome)));
  };

  const addTierInEp = async () => {
    if (!newEpTier.trim()) return;
    setEditData({...editData, tier_list: newEpTier.trim()});
    setNewEpTier("");
    const existing = tierLists.find(t => t.nome.toLowerCase() === newEpTier.toLowerCase());
    if (!existing) {
      const { data } = await supabase.from("tier_lists").insert({nome: newEpTier.trim()}).select().single();
      if (data) setTierLists(prev => [...prev, data].sort((a,b)=>a.nome.localeCompare(b.nome)));
    }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/ep/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Global search results
  const searchResults = searchQuery.trim().length > 1 ? [
    ...episodes.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.convidados?.some(c=>c.toLowerCase().includes(searchQuery.toLowerCase()))).map(e=>({type:"Episódio",label:e.title,sub:e.convidados?.join(", ")||"",action:()=>{openEp(e);setActiveTab(1);setSearchOpen(false);}})),
    ...convidados.filter(c=>c.nome.toLowerCase().includes(searchQuery.toLowerCase())).map(c=>({type:"Convidado",label:c.nome,sub:"",action:()=>{setActiveTab(5);setSearchOpen(false);}})),
    ...pautas.filter(p=>p.titulo.toLowerCase().includes(searchQuery.toLowerCase())).map(p=>({type:"Pauta",label:p.titulo,sub:p.descricao||"",action:()=>{setActiveTab(5);setSearchOpen(false);}})),
    ...postagens.filter(p=>p.episodio_title?.toLowerCase().includes(searchQuery.toLowerCase())||p.notas?.toLowerCase().includes(searchQuery.toLowerCase())).map(p=>({type:"Post",label:`${p.tipo} · ${p.episodio_title||"Sem ep"}`,sub:p.data,action:()=>{setActiveTab(2);setSearchOpen(false);}})),
  ].slice(0,8) : [];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); setSearchOpen(s=>!s); setSearchQuery(""); }
      if (e.key==="Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT") return;
      if (e.code==="Space"&&cronoEpId) { e.preventDefault(); cronoRunning?cronoPause():cronoStart(cronoEpId); }
      if (e.code==="KeyC"&&cronoEpId&&cronoTime>0&&!cronoNotaAtiva) {
        const ep = episodes.find(ep=>ep.id===cronoEpId);
        if (ep) marcarCorte(ep);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cronoEpId, cronoRunning, cronoTime, cronoNotaAtiva, episodes]);

  useEffect(() => () => { if (cronoRef.current) clearInterval(cronoRef.current); }, []);

  const cronoStart = (epId) => {
    if (cronoEpId !== epId) { setCronoTime(0); setCronoEpId(epId); }
    setCronoRunning(true);
    if (cronoRef.current) clearInterval(cronoRef.current);
    cronoRef.current = setInterval(() => setCronoTime(t => t+1), 1000);
  };
  const cronoPause = () => {
    setCronoRunning(false);
    if (cronoRef.current) { clearInterval(cronoRef.current); cronoRef.current = null; }
  };
  const cronoReset = (epId) => { cronoPause(); setCronoTime(0); setCronoEpId(epId); };
  const cronoFmt = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    if (h>0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };
  const marcarCorte = (ep) => { setCronoNotaAtiva({time:cronoTime,timeStr:cronoFmt(cronoTime),nota:""}); };
  const salvarCorte = async (ep) => {
    if (!cronoNotaAtiva) return;
    const cortes = ep.cortes_gravacao || [];
    const novo = {id:Date.now(),time:cronoNotaAtiva.time,timeStr:cronoNotaAtiva.timeStr,nota:cronoNotaAtiva.nota,criadoEm:new Date().toISOString()};
    const novos = [...cortes, novo].sort((a,b)=>a.time-b.time);
    await supabase.from("episodes").update({cortes_gravacao:novos}).eq("id",ep.id);
    setEpisodes(prev=>prev.map(e=>e.id===ep.id?{...e,cortes_gravacao:novos}:e));
    setCronoNotaAtiva(null); flash();
  };
  const deletarCorte = async (ep, corteId) => {
    const novos = (ep.cortes_gravacao||[]).filter(c=>c.id!==corteId);
    await supabase.from("episodes").update({cortes_gravacao:novos}).eq("id",ep.id);
    setEpisodes(prev=>prev.map(e=>e.id===ep.id?{...e,cortes_gravacao:novos}:e));
  };
  const saveChecklist = async (epId, checklist) => {
    await supabase.from("episodes").update({checklist}).eq("id",epId);
    setEpisodes(prev=>prev.map(e=>e.id===epId?{...e,checklist}:e));
    if (selectedEp?.id===epId) setSelectedEp(prev=>({...prev,checklist}));
  };

  const savePostagem = async () => {
    if (!postagemEdit) return;
    let views = postagemEdit.views || 0;
    const linkTrimmed = (postagemEdit.link || "").trim();
    if (linkTrimmed && (linkTrimmed.includes("youtu.be") || linkTrimmed.includes("youtube.com") || linkTrimmed.includes("youtube"))) {
      // Link YouTube: sempre busca views atualizadas ao salvar
      const fetched = await fetchYouTubeViews(linkTrimmed);
      if (fetched !== null && fetched > 0) views = fetched;
    } else if (!linkTrimmed) {
      views = 0;
    }
    const payload = {
      episodio_id: postagemEdit.episodio_id || null,
      episodio_title: postagemEdit.episodio_title || "",
      tipo: postagemEdit.tipo,
      status: postagemEdit.status,
      plataforma: Array.isArray(postagemEdit.plataforma) ? postagemEdit.plataforma.join(",") : (postagemEdit.plataforma || "YouTube"),
      horario: postagemEdit.horario || "18:00",
      link: postagemEdit.link || "",
      notas: postagemEdit.notas || "",
      views: views,
      drive_link: postagemEdit.drive_link || "",
      responsavel: postagemEdit.responsavel || "",
      titulo_yt: postagemEdit.titulo_yt || "",
      thumbnail_url: postagemEdit.thumbnail_url || "",
      notas_checklist: postagemEdit.notas_checklist || "[]"
    };
    let data;
    if (postagemEdit.id) {
      const res = await supabase.from("postagens").update(payload).eq("id",postagemEdit.id).select().single();
      data = res.data;
    } else {
      const res = await supabase.from("postagens").insert({...payload,data:postagemEdit.data}).select().single();
      data = res.data;
    }
    if (data) {
      setPostagens(prev=>{
        const filtered = prev.filter(p=>p.id!==data.id);
        return [...filtered,data].sort((a,b)=>a.data.localeCompare(b.data)||a.id-b.id);
      });
      setPostagemModal(null); setPostagemEdit(null); flash();
      // Force reload to ensure stats are up to date
      loadPostagens();
    }
  };
  const deletePostagem = async (id) => {
    await supabase.from("postagens").delete().eq("id",id);
    setPostagens(prev=>prev.filter(p=>p.id!==id));
  };

  const openStats = (ep) => { setStatsEp(ep); setStatsEdit(null); setStatsEditMode(false); };
  const saveStats = async () => {
    if (!statsEdit) return;
    const { data } = await supabase.from("episodes").update({
      investimento: statsEdit.investimento||0, roi: statsEdit.roi||0, links: statsEdit.links||[]
    }).eq("id",statsEdit.id).select().single();
    if (data) { setEpisodes(prev=>prev.map(e=>e.id===data.id?data:e)); setStatsEp(data); setStatsEditMode(false); flash(); }
  };

  const addComentario = async (epId) => {
    if (!newComentario.trim()||!comentarioAutor.trim()) return;
    const { data } = await supabase.from("comentarios").insert({episodio_id:epId,autor:comentarioAutor,texto:newComentario.trim()}).select().single();
    if (data) { setComentarios(prev=>[...prev,data]); setNewComentario(""); flash(); }
  };
  const deleteComentario = async (id) => {
    await supabase.from("comentarios").delete().eq("id",id);
    setComentarios(prev=>prev.filter(c=>c.id!==id));
  };
  const addMembro = async () => {
    if (!newMembro.nome.trim()) return;
    const { data } = await supabase.from("equipe").insert(newMembro).select().single();
    if (data) { setEquipe(prev=>[...prev,data].sort((a,b)=>a.nome.localeCompare(b.nome))); setNewMembro({nome:"",funcao:""}); setAddingMembro(false); flash(); }
  };
  const removeMembro = async (id) => {
    await supabase.from("equipe").delete().eq("id",id);
    setEquipe(prev=>prev.filter(m=>m.id!==id));
  };
  const addPauta = async () => {
    if (!newPauta.titulo.trim()) return;
    const { data } = await supabase.from("pautas").insert(newPauta).select().single();
    if (data) { setPautas(prev=>[...prev,data]); setNewPauta({titulo:"",descricao:"",estrelas:0}); flash(); }
  };
  const removePauta = async (id) => {
    await supabase.from("pautas").delete().eq("id",id);
    setPautas(prev=>prev.filter(p=>p.id!==id));
  };
  const updatePautaStars = async (id,estrelas) => {
    await supabase.from("pautas").update({estrelas}).eq("id",id);
    setPautas(prev=>prev.map(p=>p.id===id?{...p,estrelas}:p));
  };
  const togglePautaUsado = async (id,usado) => {
    await supabase.from("pautas").update({usado}).eq("id",id);
    setPautas(prev=>prev.map(p=>p.id===id?{...p,usado}:p));
  };
  const savePauta = async () => {
    if (!editingPauta) return;
    const { data } = await supabase.from("pautas").update({titulo:editingPauta.titulo,descricao:editingPauta.descricao}).eq("id",editingPauta.id).select().single();
    if (data) { setPautas(prev=>prev.map(p=>p.id===data.id?data:p)); setEditingPauta(null); flash(); }
  };

  // Tier lists CRUD
  const addTierList = async () => {
    if (!newTierList.trim()) return;
    const { data } = await supabase.from("tier_lists").insert({nome:newTierList.trim(),estrelas:0}).select().single();
    if (data) { setTierLists(prev=>[...prev,data].sort((a,b)=>a.nome.localeCompare(b.nome))); setNewTierList(""); flash(); }
  };
  const removeTierList = async (id) => {
    await supabase.from("tier_lists").delete().eq("id",id);
    setTierLists(prev=>prev.filter(t=>t.id!==id));
  };
  const updateTierStars = async (id,estrelas) => {
    await supabase.from("tier_lists").update({estrelas}).eq("id",id);
    setTierLists(prev=>prev.map(t=>t.id===id?{...t,estrelas}:t));
  };
  const addConvidado = async () => {
    if (!newConvidado.trim()) return;
    const { data } = await supabase.from("convidados").insert({nome:newConvidado.trim()}).select().single();
    if (data) { setConvidados(prev=>[...prev,data].sort((a,b)=>a.nome.localeCompare(b.nome))); setNewConvidado(""); flash(); }
  };
  const removeConvidado = async (id) => {
    await supabase.from("convidados").delete().eq("id",id);
    setConvidados(prev=>prev.filter(c=>c.id!==id));
  };
  const addGame = async () => {
    if (!newGame.nome.trim()) return;
    const { data } = await supabase.from("games").insert(newGame).select().single();
    if (data) { setGames(prev=>[...prev,data]); setNewGame({nome:"",descricao:"",jogadores:"",duracao:"",dificuldade:"Fácil",ideias:"",estrelas:0}); setAddingGame(false); flash(); }
  };
  const removeGame = async (id) => {
    await supabase.from("games").delete().eq("id",id);
    setGames(prev=>prev.filter(g=>g.id!==id));
  };
  const updateGameStars = async (id,estrelas) => {
    await supabase.from("games").update({estrelas}).eq("id",id);
    setGames(prev=>prev.map(g=>g.id===id?{...g,estrelas}:g));
  };
  const saveGame = async () => {
    if (!editingGame) return;
    const { data } = await supabase.from("games").update(editingGame).eq("id",editingGame.id).select().single();
    if (data) { setGames(prev=>prev.map(g=>g.id===data.id?data:g)); setEditingGame(null); flash(); }
  };

  // Computed values
  const publishedEps = episodes.filter(e=>e.status==="publicado");
  const totalInvestido = episodes.reduce((s,e)=>s+(e.investimento||0),0);
  const convidadoCount = {};
  episodes.forEach(ep=>(ep.convidados||[]).forEach(c=>{convidadoCount[c]=(convidadoCount[c]||0)+1;}));
  const convidadoRanking = Object.entries(convidadoCount).sort((a,b)=>b[1]-a[1]);
  const gameCount = {};
  episodes.forEach(ep=>{if(ep.game)gameCount[ep.game]=(gameCount[ep.game]||0)+1;});
  const sortedConvidados = [...convidados].filter(c=>c.nome.toLowerCase().includes(convSearch.toLowerCase())).sort((a,b)=>a.nome.localeCompare(b.nome));
  const sortedTierLists = [...tierLists].filter(t=>t.nome.toLowerCase().includes(tierSearch.toLowerCase())).sort((a,b)=>tierSort==="stars_desc"?(b.estrelas||0)-(a.estrelas||0):tierSort==="za"?b.nome.localeCompare(a.nome):a.nome.localeCompare(b.nome));
  const sortedGames = [...games].filter(g=>g.nome.toLowerCase().includes(gameSearch.toLowerCase())).sort((a,b)=>gameSort==="stars_desc"?(b.estrelas||0)-(a.estrelas||0):gameSort==="za"?b.nome.localeCompare(a.nome):a.nome.localeCompare(b.nome));
  const sortedEpisodes = [...episodes].filter(e=>epStatusFilter==="todos"||e.status===epStatusFilter).sort((a,b)=>epSort==="numero"?epNum(a.title)-epNum(b.title):epSort==="data"?(a.gravacao_data||"").localeCompare(b.gravacao_data||""):a.status.localeCompare(b.status));

  const PLAT_CONFIG = {
    YouTube:   {color:"#FF0000", bg:"rgba(255,0,0,0.12)",      border:"rgba(255,0,0,0.35)",      icon:"▶"},
    Shorts:    {color:"#FF0000", bg:"rgba(255,0,0,0.08)",      border:"rgba(255,0,0,0.25)",      icon:"📱"},
    Instagram: {color:"#C13584", bg:"rgba(193,53,132,0.12)",   border:"rgba(193,53,132,0.35)",   icon:"📸"},
    TikTok:    {color:"#EE1D52", bg:"rgba(238,29,82,0.12)",    border:"rgba(238,29,82,0.35)",    icon:"🎵"},
    Spotify:   {color:"#1DB954", bg:"rgba(29,185,84,0.12)",    border:"rgba(29,185,84,0.35)",    icon:"🎵"},
  };
  const platCfg = (p) => PLAT_CONFIG[p] || {color:"#7EC8F0",bg:"rgba(27,104,150,0.15)",border:"rgba(27,104,150,0.35)",icon:"▶"};

  const CHECKLIST_ITEMS = [
    {key:"convidados",label:"👥 Convidados"},
    {key:"tema_tier",label:"🏆 Tema Tier List"},
    {key:"tema_programa",label:"📺 Tema do Programa"},
    {key:"producao_tier",label:"⚙️ Produção Tier List"},
    {key:"pauta",label:"📋 Pauta"},
    {key:"gravar",label:"🎙 Gravação"},
    {key:"editar",label:"✂️ Edição"},
    {key:"thumbnail",label:"🖼 Thumbnail"},
    {key:"legenda",label:"📝 Legenda / Descrição"},
    {key:"postar",label:"📤 Postagem"}
  ];

  const getCorteChecklist = (tipo, plataforma) => {
    const plats = plataforma ? (Array.isArray(plataforma) ? plataforma : plataforma.split(",")) : ["YouTube"];
    // Só redes sociais (sem YouTube): Edição + Postagem
    const somenteRedes = plats.every(p => p === "Instagram" || p === "TikTok" || p === "Shorts");
    if (somenteRedes) return [
      {key:"edicao", label:"✂️ Edição"},
      {key:"postagem", label:"📤 Postagem"}
    ];
    // YouTube (com ou sem redes): Edição + Thumbnail + Descrição + Postagem
    return [
      {key:"edicao", label:"✂️ Edição"},
      {key:"thumbnail", label:"🖼 Thumbnail"},
      {key:"descricao", label:"📝 Descrição"},
      {key:"postagem", label:"📤 Postagem"}
    ];
  };

  const saveCorteChecklist = async (postId, checklist) => {
    const notasJson = JSON.stringify(checklist);
    await supabase.from("postagens").update({notas_checklist: notasJson}).eq("id", postId);
    setPostagens(prev => prev.map(p => p.id === postId ? {...p, notas_checklist: notasJson} : p));
  };

  if (checkingAuth) return <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:ACCENT,fontFamily:"'Bebas Neue'",fontSize:24,letterSpacing:3}}>CARREGANDO...</div></div>;

  if (!user) return (
    <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:14,padding:40,width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:4,color:TEXT}}>BULLDOG SHOW</div>
          <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,letterSpacing:2}}>PRODUCTION MANAGER · INTERNO</div>
        </div>
        <div style={{marginBottom:16}}><div style={{...lbl,marginBottom:6}}>Email</div><input value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="seu@email.com" type="email" style={inp} /></div>
        <div style={{marginBottom:24}}><div style={{...lbl,marginBottom:6}}>Senha</div><input value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" type="password" style={inp} /></div>
        {loginError && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:"#EF4444",marginBottom:12}}>{loginError}</div>}
        <button onClick={login} disabled={loginLoading} style={{...btnBlue,width:"100%",opacity:loginLoading?0.7:1}}>{loginLoading?"ENTRANDO...":"ENTRAR"}</button>
      </div>
    </div>
  );

  return (
    <div style={{background:BG,minHeight:"100vh",color:TEXT}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#040E18}::-webkit-scrollbar-thumb{background:#1B6896;border-radius:2px}
        .epc:hover{transform:translateY(-2px);border-color:#2487BE !important;}
        .tag{display:inline-block;background:rgba(27,104,150,0.2);border:1px solid rgba(27,104,150,0.6);color:#7EC8F0;border-radius:4px;padding:2px 8px;font-size:11px;margin:2px;font-family:'DM Sans'}
        .bi:hover .xb{opacity:1}.xb{opacity:0;transition:opacity .2s}
        .stat-ep{cursor:pointer;transition:border-color .2s}.stat-ep:hover{border-color:#2487BE !important;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"rgba(13,40,64,0.95)",borderBottom:`1px solid ${BORDER}`,padding:"0 24px",display:"flex",alignItems:"center",gap:16,height:56,position:"sticky",top:0,zIndex:50}}>
        <img src="/logo.png" alt="Bulldog" style={{height:38,width:38,borderRadius:6,objectFit:"cover"}} />
        <div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:3,color:TEXT}}>BULLDOG SHOW</div>
          <div style={{fontFamily:"'DM Sans'",fontSize:9,color:MUTED,letterSpacing:2,marginTop:-2}}>PRODUCTION MANAGER · INTERNO</div>
        </div>
        <div style={{flex:1}}></div>
        {saved && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:"#10B981",background:"rgba(16,185,129,0.1)",padding:"4px 12px",borderRadius:20}}>✓ Salvo</div>}
        {errorMsg && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:"#EF4444",background:"rgba(239,68,68,0.1)",padding:"4px 12px",borderRadius:20}}>⚠️ {errorMsg}</div>}
        <button onClick={()=>setSearchOpen(true)} style={{...btnGhost,fontSize:11,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>🔍 <span style={{opacity:0.6,fontSize:10}}>⌘K</span></button>
        <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>{user.email}</div>
        <button onClick={logout} style={{...btnGhost,fontSize:11,padding:"5px 12px"}}>Sair</button>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:2,padding:"12px 24px 0",borderBottom:`1px solid ${BORDER}`,background:"rgba(13,40,64,0.5)"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{fontFamily:"'DM Sans'",fontSize:13,color:activeTab===i?TEXT:MUTED,background:activeTab===i?"rgba(27,104,150,0.2)":"transparent",border:activeTab===i?`1px solid ${BORDER}`:"1px solid transparent",borderBottom:"none",borderRadius:"6px 6px 0 0",padding:"8px 16px",cursor:"pointer",transition:"all .15s"}}>{t}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 24px"}}>

        {/* TAB 0: DASHBOARD */}
        {activeTab===0 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:20}}>🏠 BOM DIA, <span style={{color:BL}}>BULLDOG SHOW</span></div>
            {(() => {
              const proxima = [...episodes].filter(e=>e.gravacao_data&&!e.retroativo).sort((a,b)=>a.gravacao_data.localeCompare(b.gravacao_data)).find(e=>e.gravacao_data>=toLocalDate(new Date()));
              const hoje = toLocalDate(new Date());
              const postsSemana = postagens.filter(p=>{
                const d = new Date(p.data+"T12:00:00"), now = new Date();
                const diff = (d-now)/(1000*60*60*24);
                return (diff >= -1) && (diff <= 7);
              });
              const epsSemChecklist = episodes.filter(e=>!e.retroativo&&(e.checklist||[]).length<10&&["planejado","confirmado","gravado","editado"].includes(e.status));
              const allEpLinks = episodes.flatMap(e=>(e.links||[]));
              const ytViews = allEpLinks.filter(l=>l.plataforma==="YouTube").reduce((s,l)=>s+(l.views||0),0);
              const socialViews = allEpLinks.filter(l=>l.plataforma==="Instagram"||l.plataforma==="TikTok"||l.plataforma==="Shorts").reduce((s,l)=>s+(l.views||0),0);
              const gravados = episodes.filter(e=>["gravado","editado","publicado"].includes(e.status)||e.retroativo).length;
              return (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:28}}>
                  {[
                    {key:"gravados",    label:"Episódios Gravados",   value:gravados,                                                                                                                color:ACCENT},
                    {key:"publicados",  label:"Episódios Publicados", value:publishedEps.length,                                                                                                    color:"#10B981"},
                    {key:"cortes",      label:"Cortes Publicados",    value:postagens.filter(p=>p.tipo==="Corte"&&p.status==="postado").length,                                                     color:ACCENT},
                    {key:"tierlists",   label:"Tier Lists Publicadas",value:postagens.filter(p=>p.tipo==="Tier List"&&p.status==="postado").length,                                                 color:"#F59E0B"},
                  ].map(item=>(
                    <div key={item.key} onClick={()=>setStatsModal(item.key)} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"16px 18px",cursor:"pointer",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=item.color} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(27,104,150,0.3)"}>
                      <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{item.label}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color:item.color}}>{item.value}</div>
                      <div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED,marginTop:4}}>clique para ver</div>
                    </div>
                  ))}
                  <div onClick={()=>setViewsModal("yt")} style={{background:CARD,border:"1px solid rgba(239,68,68,0.4)",borderRadius:10,padding:"16px 18px",cursor:"pointer",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#EF4444"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"}>
                    <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Views YouTube</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color:"#EF4444"}}>{ytViews>0?ytViews.toLocaleString("pt-BR"):"0"}</div>
                    <div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED,marginTop:4}}>clique para detalhar</div>
                  </div>
                  <div onClick={()=>setViewsModal("social")} style={{background:CARD,border:"1px solid rgba(139,92,246,0.4)",borderRadius:10,padding:"16px 18px",cursor:"pointer",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#8B5CF6"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.4)"}>
                    <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Views Redes Sociais</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color:"#8B5CF6"}}>{socialViews>0?socialViews.toLocaleString("pt-BR"):"0"}</div>
                    <div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED,marginTop:4}}>clique para detalhar</div>
                  </div>
                  <StatCard label="Investimento Total" value={totalInvestido>0?`R$ ${totalInvestido.toLocaleString("pt-BR",{minimumFractionDigits:0})}`:"R$ 0"} color="#F59E0B" />
                </div>
              );
            })()}
            {(() => {
              const PLATS = Object.entries(PLAT_CONFIG).map(([key,v])=>({key,color:v.color,icon:v.icon}));
              const epData = episodes.filter(e=>(e.links||[]).some(l=>l.views>0)).map(ep=>{
                const links = ep.links||[];
                const byPlat = {};
                PLATS.forEach(p=>{ byPlat[p.key]=links.filter(l=>l.plataforma===p.key).reduce((s,l)=>s+(l.views||0),0); });
                const total = Object.values(byPlat).reduce((s,v)=>s+v,0);
                return {id:ep.id, title:ep.title, byPlat, total};
              }).filter(e=>e.total>0).sort((a,b)=>epNum(a.title)-epNum(b.title));
              if (!epData.length) return null;
              const maxPlat = {};
              PLATS.forEach(p=>{ maxPlat[p.key]=Math.max(...epData.map(e=>e.byPlat[p.key]||0),1); });
              return (
                <div style={{...card,padding:20,marginBottom:20}}>
                  <div style={{fontSize:16,letterSpacing:2,marginBottom:12}}>📊 VIEWS POR EPISÓDIO</div>
                  {/* Legenda */}
                  <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
                    {PLATS.map(p=>(
                      <div key={p.key} style={{display:"flex",alignItems:"center",gap:5,fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>
                        <div style={{width:10,height:10,borderRadius:2,background:p.color}} />{p.key}
                      </div>
                    ))}
                  </div>
                  {epData.map(ep=>(
                    <div key={ep.id} style={{marginBottom:18}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontFamily:"'DM Sans'",fontSize:12,fontWeight:600,color:TEXT}}>{ep.title}</div>
                        <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{ep.total.toLocaleString("pt-BR")} total</div>
                      </div>
                      {PLATS.filter(p=>ep.byPlat[p.key]>0).map(p=>{
                        const pct = Math.round((ep.byPlat[p.key]/maxPlat[p.key])*100);
                        return (
                          <div key={p.key} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                            <div style={{fontFamily:"'DM Sans'",fontSize:10,color:p.color,width:65,flexShrink:0}}>{p.icon} {p.key}</div>
                            <div style={{flex:1,background:"#0A1F30",borderRadius:3,height:8,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${pct}%`,background:p.color,borderRadius:3,transition:"width .4s"}} />
                            </div>
                            <div style={{fontFamily:"'DM Sans'",fontSize:10,color:p.color,width:70,textAlign:"right",flexShrink:0,fontWeight:600}}>{ep.byPlat[p.key].toLocaleString("pt-BR")}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div style={{...card,padding:20,marginBottom:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:15,letterSpacing:2}}>👥 CONVIDADOS</div>
                  {convidadoRanking.length>5 && <button onClick={()=>setShowAllConvidados(v=>!v)} style={{...btnGhost,fontSize:10,padding:"2px 8px"}}>{showAllConvidados?"▲":"▼ todos"}</button>}
                </div>
                {convidadoRanking.length===0
                  ? <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum convidado ainda</div>
                  : (showAllConvidados?convidadoRanking:convidadoRanking.slice(0,5)).map(([nome,count],i)=>(
                    <div key={nome} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontFamily:"'DM Sans'",fontSize:12}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:MUTED,fontSize:10,width:16}}>{i+1}.</span>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{nome}</span>
                      </div>
                      <span style={{background:"rgba(27,104,150,0.2)",color:ACCENT,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:600}}>{count}x</span>
                    </div>
                  ))}
              </div>
              <div style={{...card,padding:20,marginBottom:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:15,letterSpacing:2}}>📊 VIEWS</div>
                  {postagens.filter(p=>p.views>0).length>5 && <button onClick={()=>setShowAllViews(v=>!v)} style={{...btnGhost,fontSize:10,padding:"2px 8px"}}>{showAllViews?"▲":"▼ todos"}</button>}
                </div>
                {(() => {
                  // Views only from episodes.links
                  const allViews = episodes.flatMap(ep=>(ep.links||[]).filter(l=>l.views>0).map(l=>({
                    id:"l-"+ep.id+"-"+l.url, views:l.views,
                    label:ep.title, tipo:l.plataforma||"YouTube",
                    link:l.url, plataforma:l.plataforma
                  }))).sort((a,b)=>b.views-a.views);
                  if (allViews.length===0) return <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum view ainda</div>;
                  return (showAllViews?allViews:allViews.slice(0,5)).map((item,i)=>{
                    const tipoColor = item.tipo==="Full"?"#8B5CF6":item.tipo==="Tier List"?"#F59E0B":item.tipo==="Corte"?ACCENT:platCfg(item.tipo).color;
                    const icon = item.link?.includes("youtu")?"▶":item.plataforma?.includes("Shorts")?"📱":item.link?.includes("instagram")?"📸":"🎵";
                    return (
                      <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${BORDER}`,fontFamily:"'DM Sans'",fontSize:12,gap:8}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",flex:1,minWidth:0}}>
                          <span style={{color:MUTED,fontSize:10,width:16,flexShrink:0}}>{i+1}.</span>
                          <span style={{background:`${tipoColor}22`,color:tipoColor,borderRadius:3,padding:"1px 6px",fontSize:10,fontWeight:600,flexShrink:0}}>{item.tipo}</span>
                          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{item.label}</span>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                          <span style={{color:ACCENT,fontWeight:600,fontSize:11}}>{item.views.toLocaleString("pt-BR")}</span>
                          {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{color:MUTED,fontSize:13,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>{icon}</a>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div style={{...card,padding:16,marginBottom:20}}>
              <div style={{fontSize:14,letterSpacing:2,marginBottom:12}}>🎮 GAMES USADOS</div>
              {Object.entries(gameCount).length===0
                ? <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum game usado ainda</div>
                : <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{Object.entries(gameCount).sort((a,b)=>b[1]-a[1]).map(([nome,count])=>(
                  <span key={nome} style={{background:"rgba(27,104,150,0.15)",border:`1px solid ${BORDER}`,borderRadius:6,padding:"4px 10px",fontFamily:"'DM Sans'",fontSize:12}}>{nome} <span style={{color:ACCENT,fontWeight:600}}>{count}x</span></span>
                ))}</div>}
            </div>
            <div style={{fontSize:16,letterSpacing:2,marginBottom:8}}>📈 PERFORMANCE POR EPISÓDIO</div>
            <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,marginBottom:14}}>Clica para adicionar investimento e links</div>
            {[...episodes].sort((a,b)=>epNum(a.title)-epNum(b.title)).map(ep=>(
              <div key={ep.id} className="stat-ep" onClick={()=>openStats(ep)} style={{...card,display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:16,alignItems:"center"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <div style={{fontSize:15,letterSpacing:1}}>{ep.title}</div>
                    {ep.drive_link && <a href={ep.drive_link} target="_blank" rel="noreferrer" style={{fontFamily:"'DM Sans'",fontSize:11,color:"#10B981",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>📁 Drive</a>}
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
                  <div style={lbl}>Posts</div>
                  <div style={{fontFamily:"'DM Sans'",fontSize:14,color:postagens.filter(p=>p.episodio_id===ep.id).length>0?ACCENT:MUTED}}>{postagens.filter(p=>p.episodio_id===ep.id).length}</div>
                </div>
              </div>
            ))}
          </div>

        )}

        {/* TAB 5: BANCO DE IDEIAS */}
        {activeTab===5 && (
          <div>
            <div style={{fontSize:20,letterSpacing:2,marginBottom:20}}>💡 BANCO DE IDEIAS</div>
            {/* EQUIPE */}
            <div style={{...card,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,letterSpacing:2}}>👥 EQUIPE <span style={{color:BL}}>({equipe.length})</span></div>
                <button style={{...btnGhost,fontSize:11,padding:"5px 12px"}} onClick={()=>setAddingMembro(!addingMembro)}>+ Membro</button>
              </div>
              {addingMembro && (
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <input value={newMembro.nome} onChange={e=>setNewMembro({...newMembro,nome:e.target.value})} placeholder="Nome *" style={{...inp,flex:1}} />
                  <input value={newMembro.funcao} onChange={e=>setNewMembro({...newMembro,funcao:e.target.value})} placeholder="Função (ex: Editor)" style={{...inp,flex:1}} />
                  <button style={btnBlue} onClick={addMembro}>+ ADD</button>
                  <button style={btnGhost} onClick={()=>setAddingMembro(false)}>✕</button>
                </div>
              )}
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {equipe.map(m=>(
                  <div key={m.id} className="bi" style={{background:"rgba(27,104,150,0.1)",border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
                    <div>
                      <div style={{fontFamily:"'DM Sans'",fontSize:13,color:TEXT}}>{m.nome}</div>
                      {m.funcao && <div style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED}}>{m.funcao}</div>}
                    </div>
                    <button className="xb" onClick={()=>removeMembro(m.id)} style={{...btnGhost,padding:"2px 6px",fontSize:10,color:BL}}>✕</button>
                  </div>
                ))}
                {equipe.length===0 && <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum membro cadastrado ainda</div>}
              </div>
            </div>
            {/* CONVIDADOS */}
            <div style={{...card,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,letterSpacing:2}}>🎤 CONVIDADOS <span style={{color:BL}}>({convidados.length})</span></div>
                <div style={{display:"flex",gap:8}}>
                  <input value={convSearch} onChange={e=>setConvSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:160}} />
                  <button style={btnBlue} onClick={addConvidado}>+ ADD</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={newConvidado} onChange={e=>setNewConvidado(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addConvidado()} placeholder="Nome do convidado..." style={{...inp,flex:1}} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
                {sortedConvidados.map(c=>(
                  <div key={c.id} className="bi" style={{background:"rgba(27,104,150,0.08)",border:`1px solid ${BORDER}`,borderRadius:7,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontFamily:"'DM Sans'",fontSize:12}}>👤 {c.nome}</span>
                    <button className="xb" onClick={()=>removeConvidado(c.id)} style={{...btnGhost,padding:"2px 7px",fontSize:11,color:BL}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
            {/* TIER LISTS */}
            <div style={{...card,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,letterSpacing:2}}>🏆 TIER LISTS <span style={{color:BL}}>({tierLists.length})</span></div>
                <div style={{display:"flex",gap:8}}>
                  <input value={tierSearch} onChange={e=>setTierSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:160}} />
                  <select value={tierSort} onChange={e=>setTierSort(e.target.value)} style={{...inp,width:"auto"}}>
                    <option value="az">A → Z</option><option value="za">Z → A</option><option value="stars_desc">★ Top</option>
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={newTierList} onChange={e=>setNewTierList(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTierList()} placeholder="Nova tier list..." style={{...inp,flex:1}} />
                <button style={btnBlue} onClick={addTierList}>+ ADD</button>
              </div>
              {sortedTierLists.map(tl=>(
                <div key={tl.id} className="bi" style={{background:"rgba(27,104,150,0.08)",border:`1px solid ${BORDER}`,borderRadius:7,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:6}}>
                  <span style={{fontFamily:"'DM Sans'",fontSize:13,flex:1}}>🏆 {tl.nome}</span>
                  <Stars value={tl.estrelas||0} onChange={v=>updateTierStars(tl.id,v)} />
                  <button className="xb" onClick={()=>removeTierList(tl.id)} style={{...btnGhost,padding:"3px 9px",fontSize:11,color:BL}}>✕</button>
                </div>
              ))}
            </div>
            {/* PAUTAS */}
            <div style={{...card,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,letterSpacing:2}}>💬 PAUTAS & DEBATES <span style={{color:BL}}>({pautas.length})</span></div>
              </div>
              <div style={{display:"grid",gap:8,marginBottom:12}}>
                <input value={newPauta.titulo} onChange={e=>setNewPauta({...newPauta,titulo:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addPauta()} placeholder="Tema do debate..." style={inp} />
                <div style={{display:"flex",gap:8}}>
                  <input value={newPauta.descricao} onChange={e=>setNewPauta({...newPauta,descricao:e.target.value})} placeholder="Descrição (opcional)..." style={{...inp,flex:1}} />
                  <button style={btnBlue} onClick={addPauta}>+ ADD</button>
                </div>
              </div>
              {pautas.map(p=>(
                <div key={p.id} style={{background:p.usado?"rgba(16,185,129,0.06)":"rgba(27,104,150,0.08)",border:`1px solid ${p.usado?"rgba(16,185,129,0.2)":BORDER}`,borderRadius:7,padding:"10px 14px",marginBottom:6}}>
                  {editingPauta?.id===p.id ? (
                    <div style={{display:"grid",gap:8}}>
                      <input value={editingPauta.titulo} onChange={e=>setEditingPauta({...editingPauta,titulo:e.target.value})} style={inp} />
                      <input value={editingPauta.descricao} onChange={e=>setEditingPauta({...editingPauta,descricao:e.target.value})} placeholder="Descrição..." style={inp} />
                      <div style={{display:"flex",gap:8}}>
                        <button style={btnBlue} onClick={savePauta}>💾 SALVAR</button>
                        <button style={btnGhost} onClick={()=>setEditingPauta(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'DM Sans'",fontSize:13,color:p.usado?MUTED:TEXT,textDecoration:p.usado?"line-through":"none"}}>{p.titulo}</div>
                        {p.descricao && <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginTop:2}}>{p.descricao}</div>}
                      </div>
                      <Stars value={p.estrelas||0} onChange={v=>updatePautaStars(p.id,v)} />
                      <button onClick={()=>setEditingPauta({...p})} style={{...btnGhost,padding:"2px 8px",fontSize:10}}>✏️</button>
                      <button onClick={()=>togglePautaUsado(p.id,!p.usado)} style={{...btnGhost,padding:"2px 8px",fontSize:10,color:p.usado?"#10B981":MUTED}}>{p.usado?"✓ usado":"usar"}</button>
                      <button onClick={()=>removePauta(p.id)} style={{...btnGhost,padding:"2px 7px",fontSize:10,color:BL}}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* GAMES */}
            <div style={{...card,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,letterSpacing:2}}>🎮 GAMES <span style={{color:BL}}>({games.length})</span></div>
                <div style={{display:"flex",gap:8}}>
                  <input value={gameSearch} onChange={e=>setGameSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:160}} />
                  <select value={gameSort} onChange={e=>setGameSort(e.target.value)} style={{...inp,width:"auto"}}>
                    <option value="az">A → Z</option><option value="za">Z → A</option><option value="stars_desc">★ Top</option>
                  </select>
                  <button style={btnBlue} onClick={()=>setAddingGame(!addingGame)}>+ ADD</button>
                </div>
              </div>
              {addingGame && (
                <div style={{background:"rgba(27,104,150,0.08)",border:`1px solid ${BL}`,borderRadius:8,padding:16,marginBottom:14}}>
                  <div style={{display:"grid",gap:10}}>
                    <input value={newGame.nome} onChange={e=>setNewGame({...newGame,nome:e.target.value})} placeholder="Nome *" style={inp} />
                    <textarea value={newGame.descricao} onChange={e=>setNewGame({...newGame,descricao:e.target.value})} placeholder="Como funciona..." style={{...inp,minHeight:60,resize:"vertical"}} />
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      <input value={newGame.jogadores} onChange={e=>setNewGame({...newGame,jogadores:e.target.value})} placeholder="Jogadores" style={inp} />
                      <input value={newGame.duracao} onChange={e=>setNewGame({...newGame,duracao:e.target.value})} placeholder="Duração" style={inp} />
                      <select value={newGame.dificuldade} onChange={e=>setNewGame({...newGame,dificuldade:e.target.value})} style={inp}><option>Fácil</option><option>Médio</option><option>Difícil</option></select>
                    </div>
                    <textarea value={newGame.ideias} onChange={e=>setNewGame({...newGame,ideias:e.target.value})} placeholder="Ideias de variações..." style={{...inp,minHeight:50,resize:"vertical"}} />
                    <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{...lbl,margin:0}}>Estrelas</span><Stars value={newGame.estrelas} onChange={v=>setNewGame({...newGame,estrelas:v})} /></div>
                    <div style={{display:"flex",gap:8}}><button style={btnBlue} onClick={addGame}>💾 SALVAR</button><button style={btnGhost} onClick={()=>setAddingGame(false)}>Cancelar</button></div>
                  </div>
                </div>
              )}
              {sortedGames.map(g=>{
                const dc={Fácil:"#10B981",Médio:"#F59E0B",Difícil:"#EF4444"};
                const isOpen=expandedGame===g.id, isEditing=editingGame?.id===g.id;
                return (
                  <div key={g.id} style={{background:"rgba(27,104,150,0.08)",border:`1px solid ${isOpen?BL:BORDER}`,borderRadius:8,overflow:"hidden",marginBottom:6}}>
                    <div onClick={()=>!isEditing&&setExpandedGame(isOpen?null:g.id)} style={{padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>🎮</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,letterSpacing:1}}>{g.nome}</div>
                        {!isOpen && <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginTop:1}}>{g.descricao?.slice(0,60)}…</div>}
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <Stars value={g.estrelas||0} onChange={v=>updateGameStars(g.id,v)} readonly={!isOpen} />
                        {g.jogadores && <span style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED}}>👥{g.jogadores}</span>}
                        <span style={{background:`${dc[g.dificuldade]||"#888"}22`,color:dc[g.dificuldade]||"#888",borderRadius:4,padding:"1px 6px",fontFamily:"'DM Sans'",fontSize:10,fontWeight:600}}>{g.dificuldade}</span>
                        <span style={{color:MUTED,fontSize:10}}>{isOpen?"▲":"▼"}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{padding:"0 14px 14px",borderTop:`1px solid ${BORDER}`}}>
                        {isEditing ? (
                          <div style={{paddingTop:10,display:"grid",gap:8}}>
                            <input value={editingGame.nome} onChange={e=>setEditingGame({...editingGame,nome:e.target.value})} style={inp} />
                            <textarea value={editingGame.descricao} onChange={e=>setEditingGame({...editingGame,descricao:e.target.value})} style={{...inp,minHeight:60,resize:"vertical"}} />
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                              <input value={editingGame.jogadores} onChange={e=>setEditingGame({...editingGame,jogadores:e.target.value})} placeholder="Jogadores" style={inp} />
                              <input value={editingGame.duracao} onChange={e=>setEditingGame({...editingGame,duracao:e.target.value})} placeholder="Duração" style={inp} />
                              <select value={editingGame.dificuldade} onChange={e=>setEditingGame({...editingGame,dificuldade:e.target.value})} style={inp}><option>Fácil</option><option>Médio</option><option>Difícil</option></select>
                            </div>
                            <textarea value={editingGame.ideias} onChange={e=>setEditingGame({...editingGame,ideias:e.target.value})} style={{...inp,minHeight:50,resize:"vertical"}} />
                            <div style={{display:"flex",gap:8}}><button style={btnBlue} onClick={saveGame}>💾 SALVAR</button><button style={btnGhost} onClick={()=>setEditingGame(null)}>Cancelar</button></div>
                          </div>
                        ) : (
                          <div style={{paddingTop:10,display:"grid",gap:10}}>
                            <div><div style={lbl}>Como funciona</div><div style={{...val,fontSize:12,lineHeight:1.6}}>{g.descricao}</div></div>
                            {g.ideias && <div><div style={lbl}>💡 Variações</div><div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,lineHeight:1.6}}>{g.ideias}</div></div>}
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
          </div>
        )}


      {/* MODAL STATS DETALHE */}
      {statsModal && (
        <div onClick={e=>e.target===e.currentTarget&&setStatsModal(null)} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:580,maxHeight:"85vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,letterSpacing:2}}>
                {statsModal==="gravados"&&"🎙 EPISÓDIOS GRAVADOS"}
                {statsModal==="publicados"&&"✅ EPISÓDIOS PUBLICADOS"}
                {statsModal==="cortes"&&"✂️ CORTES PUBLICADOS"}
                {statsModal==="tierlists"&&"🏆 TIER LISTS PUBLICADAS"}
              </div>
              <button onClick={()=>setStatsModal(null)} style={btnGhost}>✕</button>
            </div>
            {statsModal==="gravados" && (
              <div>
                {[...episodes].filter(e=>["gravado","editado","publicado"].includes(e.status)||e.retroativo).sort((a,b)=>epNum(a.title)-epNum(b.title)).map(ep=>{
                  const sc=STATUS_CONFIG[ep.status]||STATUS_CONFIG.planejado;
                  return (
                    <div key={ep.id} onClick={()=>{openEp(ep);setStatsModal(null);setActiveTab(1);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${BORDER}`,cursor:"pointer"}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:TEXT}}>{ep.title}</div>
                        <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{ep.convidados?.join(", ")||"Sem convidados"}</div>
                      </div>
                      <span style={{background:sc.bg,color:sc.color,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600}}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {statsModal==="publicados" && (
              <div>
                {[...publishedEps].sort((a,b)=>epNum(a.title)-epNum(b.title)).map(ep=>(
                  <div key={ep.id} onClick={()=>{openEp(ep);setStatsModal(null);setActiveTab(1);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${BORDER}`,cursor:"pointer"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:TEXT}}>{ep.title}</div>
                      <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{ep.convidados?.join(", ")||"Sem convidados"}</div>
                    </div>
                    <span style={{background:"rgba(16,185,129,0.15)",color:"#10B981",borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600}}>Publicado</span>
                  </div>
                ))}
              </div>
            )}
            {(statsModal==="cortes"||statsModal==="tierlists") && (
              <div>
                {postagens.filter(p=>p.status==="postado"&&p.tipo===(statsModal==="cortes"?"Corte":"Tier List")).sort((a,b)=>a.data.localeCompare(b.data)).map(p=>{
                  const plats = p.plataforma?p.plataforma.split(","):["YouTube"];
                  const platIcons = plats.map(pl=>platCfg(pl).icon).join(" ");
                  return (
                    <div key={p.id} style={{padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                        <span style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:1,color:TEXT,flex:1}}>{p.titulo_yt||p.notas||"Sem título"}</span>
                        <span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{platIcons}</span>
                        <span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{p.data?new Date(p.data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}):""}</span>
                      </div>
                      <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,marginBottom:4}}>{p.episodio_title||""}</div>
                      {p.link&&<a href={p.link} target="_blank" rel="noreferrer" style={{fontFamily:"'DM Sans'",fontSize:11,color:ACCENT,textDecoration:"none",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.link}</a>}
                      {p.views>0&&<div style={{fontFamily:"'DM Sans'",fontSize:11,color:ACCENT,marginTop:2,fontWeight:600}}>{p.views.toLocaleString("pt-BR")} views</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL VIEWS DETALHE */}
      {viewsModal && (
        <div onClick={e=>e.target===e.currentTarget&&setViewsModal(null)} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:540,maxHeight:"85vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,letterSpacing:2}}>{viewsModal==="yt"?"▶ VIEWS YOUTUBE":"📱 VIEWS REDES SOCIAIS"}</div>
              <button onClick={()=>setViewsModal(null)} style={btnGhost}>✕</button>
            </div>
            {(() => {
              const platFilter = viewsModal==="yt"
                ? l => l.plataforma==="YouTube"
                : l => l.plataforma==="Instagram"||l.plataforma==="TikTok"||l.plataforma==="Shorts";
              const platIcon = l => platCfg(l.plataforma).icon;
              const platColor = l => platCfg(l.plataforma).color;
              const epData = episodes.map(ep=>({
                ep, links:(ep.links||[]).filter(platFilter).filter(l=>l.views>0)
              })).filter(d=>d.links.length>0).sort((a,b)=>
                d => d.links.reduce((s,l)=>s+(l.views||0),0)
              ).sort((a,b)=>b.links.reduce((s,l)=>s+(l.views||0),0)-a.links.reduce((s,l)=>s+(l.views||0),0));
              if (!epData.length) return <div style={{fontFamily:"'DM Sans'",fontSize:13,color:MUTED}}>Nenhum view registrado ainda.</div>;
              return epData.map(({ep,links})=>{
                const total = links.reduce((s,l)=>s+(l.views||0),0);
                return (
                  <div key={ep.id} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${BORDER}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:1,color:TEXT}}>{ep.title}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:1,color:viewsModal==="yt"?"#EF4444":"#8B5CF6"}}>{total.toLocaleString("pt-BR")}</div>
                    </div>
                    {links.map((l,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid rgba(27,104,150,0.1)`}}>
                        <span style={{color:platColor(l),fontSize:14,flexShrink:0}}>{platIcon(l)}</span>
                        <span style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,flexShrink:0,minWidth:70}}>{l.plataforma}</span>
                        <a href={l.url} target="_blank" rel="noreferrer" style={{fontFamily:"'DM Sans'",fontSize:11,color:ACCENT,textDecoration:"none",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.url||"Sem link"}</a>
                        <span style={{fontFamily:"'DM Sans'",fontSize:12,color:TEXT,fontWeight:600,flexShrink:0}}>{(l.views||0).toLocaleString("pt-BR")}</span>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* MODAL EPISÓDIO */}
      {selectedEp&&editData&&(
        <div onClick={e=>e.target===e.currentTarget&&(setSelectedEp(null),setEditMode(false))} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:660,maxHeight:"90vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              {editMode?<input value={editData.title} onChange={e=>setEditData({...editData,title:e.target.value})} style={{...inp,fontSize:19,letterSpacing:2,background:"transparent",border:"none",borderBottom:`1px solid ${BL}`,borderRadius:0,padding:"3px 0",fontFamily:"'Bebas Neue'",width:"60%"}}/>:<div style={{fontSize:21,letterSpacing:2}}>{selectedEp.title}</div>}
              <div style={{display:"flex",gap:8}}>
                {!editMode&&<button style={btnBlue} onClick={()=>setEditMode(true)}>✏️ EDITAR</button>}
                {editMode&&<><button style={btnBlue} onClick={saveEp}>💾 SALVAR</button><button style={btnGhost} onClick={()=>{setEditData({...selectedEp,convidados:selectedEp.convidados||[]});setEditMode(false);}}>Cancelar</button></>}
                <button style={btnGhost} onClick={()=>{setSelectedEp(null);setEditMode(false);}}>✕</button>
              </div>
            </div>
            {/* Status gravação */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Status de Gravação</div>
              {editMode?<select value={editData.status||"planejado"} onChange={e=>setEditData({...editData,status:e.target.value})} style={inp}>{Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>:<span style={{background:STATUS_CONFIG[selectedEp.status]?.bg,color:STATUS_CONFIG[selectedEp.status]?.color,borderRadius:4,padding:"3px 10px",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600}}>{STATUS_CONFIG[selectedEp.status||"planejado"]?.label}</span>}
            </div>
            {/* Convidados */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Convidados</div>
              {editMode?(
                <div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                    {(editData.convidados||[]).map((c,i)=><span key={i} className="tag">{c} <span onClick={()=>setEditData({...editData,convidados:editData.convidados.filter((_,j)=>j!==i)})} style={{cursor:"pointer",marginLeft:4}}>✕</span></span>)}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <select onChange={e=>{if(e.target.value){setEditData({...editData,convidados:[...(editData.convidados||[]),e.target.value]});e.target.value="";}}} style={{...inp,flex:1}}>
                      <option value="">Selecionar do banco...</option>
                      {convidados.filter(c=>!(editData.convidados||[]).includes(c.nome)).map(c=><option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <input value={newEpConvidado} onChange={e=>setNewEpConvidado(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addConvidadoInEp()} placeholder="Ou digita novo convidado..." style={{...inp,flex:1}} />
                    <button style={btnBlue} onClick={addConvidadoInEp}>+ ADD</button>
                  </div>
                </div>
              ):<div style={val}>{selectedEp.convidados?.join(", ")||<span style={{color:"#1A3A50"}}>Sem convidados</span>}</div>}
            </div>
            {/* Tier List */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Tema Tier List</div>
              {editMode?(
                <div>
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <select onChange={e=>{if(e.target.value){setEditData({...editData,tier_list:e.target.value});e.target.value="";}}} style={{...inp,flex:1}}>
                      <option value="">Selecionar do banco...</option>
                      {tierLists.map(t=><option key={t.id} value={t.nome}>{t.nome}</option>)}
                    </select>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <input value={editData.tier_list||""} onChange={e=>setEditData({...editData,tier_list:e.target.value})} placeholder="Ou digita manualmente..." style={{...inp,flex:1}} />
                    <button style={btnBlue} onClick={addTierInEp}>+ ADD</button>
                  </div>
                </div>
              ):<div style={val}>{selectedEp.tier_list||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>}
            </div>
            {/* Debate */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Tema do Debate</div>
              {editMode ? (
                <div>
                  {pautas.filter(p=>!p.usado).length>0 && (
                    <select onChange={e=>{if(e.target.value){setEditData({...editData,debate:e.target.value});e.target.value="";}}} style={{...inp,marginBottom:8}}>
                      <option value="">Selecionar do banco de ideias...</option>
                      {pautas.filter(p=>!p.usado).sort((a,b)=>(b.estrelas||0)-(a.estrelas||0)).map(p=><option key={p.id} value={p.titulo}>{p.estrelas?"\u2605".repeat(p.estrelas)+" ":""}{p.titulo}</option>)}
                    </select>
                  )}
                  <input value={editData.debate||""} onChange={e=>setEditData({...editData,debate:e.target.value})} style={inp} placeholder="Ou digita o tema do debate..."/>
                </div>
              ) : <div style={val}>{selectedEp.debate||<span style={{color:"#1A3A50"}}>N\u00e3o definido</span>}</div>}
            </div>
            {/* Game */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Game</div>
              {editMode?<select value={editData.game||""} onChange={e=>setEditData({...editData,game:e.target.value})} style={inp}><option value="">Selecionar game...</option>{games.map(g=><option key={g.id} value={g.nome}>{g.nome}</option>)}</select>:<div style={val}>{selectedEp.game||<span style={{color:"#1A3A50"}}>Não definido</span>}</div>}
            </div>
            {/* Gravação */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Gravação</div>
              {editMode?(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  <input type="date" value={editData.gravacao_data||""} onChange={e=>setEditData({...editData,gravacao_data:e.target.value})} style={inp} />
                  <input type="time" value={editData.gravacao_horario||""} onChange={e=>setEditData({...editData,gravacao_horario:e.target.value})} style={inp} />
                  <input value={editData.gravacao_duracao||""} onChange={e=>setEditData({...editData,gravacao_duracao:e.target.value})} style={inp} placeholder="Duração" />
                </div>
              ):<div style={val}>{selectedEp.gravacao_data?`${new Date(selectedEp.gravacao_data+"T12:00:00").toLocaleDateString("pt-BR")} ${selectedEp.gravacao_horario||""}`:""}{selectedEp.gravacao_duracao?` · ${selectedEp.gravacao_duracao}`:""}</div>}
            </div>
            {/* Retroativo */}
            {editMode && (
              <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" id="retro" checked={editData.retroativo||false} onChange={e=>setEditData({...editData,retroativo:e.target.checked})} />
                <label htmlFor="retro" style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED,cursor:"pointer"}}>Episódio Retroativo</label>
              </div>
            )}
            {/* Pauta */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>📋 Pauta do Episódio</div>
              {editMode
                ? <textarea value={editData.pauta||""} onChange={e=>setEditData({...editData,pauta:e.target.value})} style={{...inp,minHeight:200,resize:"vertical",lineHeight:1.7}} placeholder="Cole a pauta aqui... parágrafos serão preservados."/>
                : selectedEp.pauta
                  ? <div style={{fontFamily:"'DM Sans'",fontSize:13,color:TEXT,lineHeight:1.8,whiteSpace:"pre-wrap",background:"rgba(27,104,150,0.06)",borderRadius:8,padding:"14px 16px",border:`1px solid ${BORDER}`}}>{selectedEp.pauta}</div>
                  : <span style={{color:"#1A3A50",fontFamily:"'DM Sans'",fontSize:13}}>Sem pauta</span>}
            </div>
            {/* Notas */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>Notas</div>
              {editMode?<textarea value={editData.notas||""} onChange={e=>setEditData({...editData,notas:e.target.value})} style={{...inp,minHeight:70,resize:"vertical"}} placeholder="Observações..."/>:<div style={val}>{selectedEp.notas||<span style={{color:"#1A3A50"}}>Sem notas</span>}</div>}
            </div>
            {/* Drive */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>📁 Link Google Drive</div>
              {editMode?<input value={editData.drive_link||""} onChange={e=>setEditData({...editData,drive_link:e.target.value})} style={inp} placeholder="https://drive.google.com/..."/>:<div style={val}>{selectedEp.drive_link?<a href={selectedEp.drive_link} target="_blank" rel="noreferrer" style={{color:"#10B981"}}>📁 Abrir no Drive</a>:<span style={{color:"#1A3A50"}}>Sem link</span>}</div>}
            </div>
            {/* Status Edição */}
            <div style={{marginBottom:16}}>
              <div style={lbl}>🎬 Status de Edição</div>
              {editMode?<select value={editData.status_edicao||"pendente"} onChange={e=>setEditData({...editData,status_edicao:e.target.value})} style={inp}>{Object.entries(STATUS_EDICAO_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>:<span style={{background:STATUS_EDICAO_CONFIG[selectedEp.status_edicao||"pendente"]?.bg,color:STATUS_EDICAO_CONFIG[selectedEp.status_edicao||"pendente"]?.color,borderRadius:4,padding:"3px 10px",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600}}>{STATUS_EDICAO_CONFIG[selectedEp.status_edicao||"pendente"]?.label}</span>}
            </div>
            {/* Checklist */}
            {!editMode && (
              <div style={{marginBottom:16}}>
                <div style={lbl}>✅ Checklist de Produção</div>
                {CHECKLIST_ITEMS.map(item=>{
                  const checklist = selectedEp.checklist||[];
                  const done = checklist.includes(item.key);
                  return (
                    <div key={item.key} onClick={()=>{const nl=done?checklist.filter(c=>c!==item.key):[...checklist,item.key];saveChecklist(selectedEp.id,nl);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13}}>
                      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${done?"#10B981":BORDER}`,background:done?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {done && <span style={{color:"#fff",fontSize:11}}>✓</span>}
                      </div>
                      <span style={{color:done?MUTED:TEXT,textDecoration:done?"line-through":"none"}}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Comentários */}
            {!editMode && (
              <div style={{marginBottom:16}}>
                <div style={lbl}>💬 Comentários Internos</div>
                <div style={{maxHeight:200,overflowY:"auto",marginBottom:10}}>
                  {comentarios.length===0?<div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Nenhum comentário ainda</div>:comentarios.map(c=>(
                    <div key={c.id} style={{background:"rgba(27,104,150,0.08)",borderRadius:7,padding:"8px 12px",marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,color:ACCENT}}>{c.autor}</span>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED}}>{new Date(c.created_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                          <button onClick={()=>deleteComentario(c.id)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:10}}>✕</button>
                        </div>
                      </div>
                      <div style={{fontFamily:"'DM Sans'",fontSize:12,color:TEXT,lineHeight:1.5}}>{c.texto}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <select value={comentarioAutor} onChange={e=>setComentarioAutor(e.target.value)} style={{...inp,width:"auto",flex:"0 0 140px"}}>
                    <option value="">Seu nome...</option>
                    {equipe.map(m=><option key={m.id} value={m.nome}>{m.nome}</option>)}
                  </select>
                  <input value={newComentario} onChange={e=>setNewComentario(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComentario(selectedEp.id)} placeholder="Escrever comentário..." style={{...inp,flex:1}} />
                  <button style={btnBlue} onClick={()=>addComentario(selectedEp.id)}>Enviar</button>
                </div>
              </div>
            )}
            {!editMode && <button onClick={()=>deleteEp(selectedEp.id)} style={{...btnGhost,fontSize:11}}>🗑 Deletar episódio</button>}
          </div>
        </div>
      )}

      {/* MODAL ESTATÍSTICAS */}
      {statsEp&&(
        <div onClick={e=>e.target===e.currentTarget&&setStatsEp(null)} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:19,letterSpacing:2}}>{statsEp.title}</div>
                <div style={{fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Performance & Financeiro</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {!statsEditMode&&<button style={{...btnBlue,fontSize:12}} onClick={()=>{setStatsEdit({...statsEp,links:statsEp.links||[]});setStatsEditMode(true);}}>✏️ EDITAR</button>}
                {statsEditMode&&<><button style={btnBlue} onClick={saveStats}>💾 SALVAR</button><button style={btnGhost} onClick={()=>setStatsEditMode(false)}>Cancelar</button></>}
                <button style={btnGhost} onClick={()=>setStatsEp(null)}>✕</button>
              </div>
            </div>
            {statsEditMode&&statsEdit?(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div><div style={lbl}>💰 Investimento (R$)</div><input type="number" value={statsEdit.investimento||0} onChange={e=>setStatsEdit({...statsEdit,investimento:parseFloat(e.target.value)||0})} style={inp} /></div>
                  <div><div style={lbl}>📈 ROI (%)</div><input type="number" value={statsEdit.roi||0} onChange={e=>setStatsEdit({...statsEdit,roi:parseFloat(e.target.value)||0})} style={inp} /></div>
                </div>
                <div style={lbl}>🎬 Links de Cortes</div>
                {(statsEdit.links||[]).map((link,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                    <select value={link.plataforma||"YouTube"} onChange={e=>{const l=[...statsEdit.links];l[i]={...l[i],plataforma:e.target.value};setStatsEdit({...statsEdit,links:l});}} style={{...inp,width:120,flex:"0 0 120px"}}>
                      <option>YouTube</option><option>Shorts</option><option>Instagram</option><option>TikTok</option><option>Spotify</option>
                    </select>
                    <input value={link.url} onChange={e=>{const l=[...statsEdit.links];l[i]={...l[i],url:e.target.value};setStatsEdit({...statsEdit,links:l});}} placeholder="URL do corte..." style={{...inp,flex:1}} />
                    <input type="number" value={link.views||0} onChange={e=>{const l=[...statsEdit.links];l[i]={...l[i],views:parseInt(e.target.value)||0};setStatsEdit({...statsEdit,links:l});}} placeholder="Views" style={{...inp,width:100,flex:"0 0 100px"}} />
                    <button onClick={()=>{const l=statsEdit.links.filter((_,j)=>j!==i);setStatsEdit({...statsEdit,links:l});}} style={{...btnGhost,padding:"4px 8px",fontSize:11}}>✕</button>
                  </div>
                ))}
                <button onClick={()=>setStatsEdit({...statsEdit,links:[...(statsEdit.links||[]),{url:"",plataforma:"YouTube",views:0}]})} style={{...btnGhost,fontSize:11,marginTop:4}}>+ Adicionar link</button>
              </div>
            ):(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                  <div><div style={lbl}>💰 Investimento (R$)</div><div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:statsEp.investimento>0?"#F59E0B":MUTED}}>{statsEp.investimento>0?`R$ ${statsEp.investimento.toLocaleString("pt-BR",{minimumFractionDigits:0})}`:"—"}</div></div>
                  <div><div style={lbl}>📈 ROI (%)</div><div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:statsEp.roi>0?"#10B981":MUTED}}>{statsEp.roi>0?`${statsEp.roi}%`:"—"}</div></div>
                </div>
                <div style={lbl}>🎬 Links de Cortes</div>
                {(statsEp.links||[]).map((link,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${BORDER}`}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{background:"rgba(27,104,150,0.2)",color:ACCENT,borderRadius:4,padding:"1px 8px",fontFamily:"'DM Sans'",fontSize:10}}>{link.plataforma||"YT"}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" style={{fontFamily:"'DM Sans'",fontSize:12,color:ACCENT,textDecoration:"none"}}>{link.url?.slice(0,40)}...</a>
                    </div>
                    <span style={{fontFamily:"'DM Sans'",fontSize:13,color:ACCENT,fontWeight:600}}>{(link.views||0).toLocaleString("pt-BR")} views</span>
                  </div>
                ))}
                <div style={{marginTop:16,padding:14,background:"rgba(27,104,150,0.1)",borderRadius:8}}>
                  <div style={lbl}>Total de Views</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color:ACCENT}}>{(statsEp.links||[]).reduce((s,l)=>s+(l.views||0),0).toLocaleString("pt-BR")}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div onClick={e=>e.target===e.currentTarget&&setSearchOpen(false)} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.85)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:80}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:560,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:`1px solid ${BORDER}`}}>
              <span style={{fontSize:16}}>🔍</span>
              <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Buscar episódios, convidados, pautas, posts..." style={{...inp,border:"none",background:"transparent",fontSize:15,padding:0}} />
              <kbd style={{fontFamily:"'DM Sans'",fontSize:10,color:MUTED,background:"rgba(27,104,150,0.2)",padding:"2px 6px",borderRadius:3}}>ESC</kbd>
            </div>
            {searchResults.length>0 && (
              <div>
                {searchResults.map((r,i)=>(
                  <div key={i} onClick={r.action} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",cursor:"pointer",borderBottom:`1px solid ${BORDER}`}} onMouseEnter={e=>e.currentTarget.style.background="rgba(27,104,150,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{background:"rgba(27,104,150,0.2)",color:ACCENT,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Sans'",fontSize:10,fontWeight:600,flexShrink:0}}>{r.type}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'DM Sans'",fontSize:13,color:TEXT}}>{r.label}</div>
                      {r.sub && <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sub}</div>}
                    </div>
                    <span style={{color:MUTED,fontSize:12}}>→</span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim().length>1&&searchResults.length===0 && <div style={{padding:"20px 18px",fontFamily:"'DM Sans'",fontSize:13,color:MUTED,textAlign:"center"}}>Nenhum resultado para "{searchQuery}"</div>}
            {searchQuery.trim().length <= 1 && <div style={{padding:"16px 18px",fontFamily:"'DM Sans'",fontSize:12,color:MUTED}}>Digite para buscar...</div>}
          </div>
        </div>
      )}

      {/* MODAL POSTAGEM */}
      {postagemModal&&postagemEdit&&(
        <div onClick={e=>e.target===e.currentTarget&&(setPostagemModal(null),setPostagemEdit(null))} style={{position:"fixed",inset:0,background:"rgba(4,14,24,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,border:`1px solid ${BORDER2}`,borderRadius:12,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:20,letterSpacing:2}}>{postagemModal.label?.toUpperCase()}</div>
                <div style={{fontFamily:"'DM Sans'",fontSize:11,color:MUTED}}>{new Date(postagemModal.date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})} · {postagemEdit.horario||"18h"}</div>
              </div>
              <button style={btnGhost} onClick={()=>{setPostagemModal(null);setPostagemEdit(null);}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <div style={lbl}>Tipo</div>
                <select value={postagemEdit.tipo} onChange={e=>setPostagemEdit({...postagemEdit,tipo:e.target.value})} style={inp}><option>Corte</option><option>Tier List</option><option>Full</option></select>
              </div>
              <div>
                <div style={lbl}>Plataforma(s)</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                  {["YouTube","Shorts","Instagram","TikTok"].map(plat => {
                    const plats = Array.isArray(postagemEdit.plataforma) ? postagemEdit.plataforma : [postagemEdit.plataforma||"YouTube"];
                    const active = plats.includes(plat);
                    const platColor = platCfg(plat).color;
                    return (
                      <button key={plat} onClick={()=>{
                        const cur = Array.isArray(postagemEdit.plataforma)?postagemEdit.plataforma:[postagemEdit.plataforma||"YouTube"];
                        const next = active?(cur.length>1?cur.filter(p=>p!==plat):cur):[...cur,plat];
                        setPostagemEdit({...postagemEdit,plataforma:next});
                      }} style={{background:active?`${platColor}22`:"transparent",color:active?platColor:MUTED,border:`1px solid ${active?platColor:BORDER}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:active?600:400,transition:"all .15s"}}>
                        {plat==="YouTube"?"▶":plat==="Shorts"?"📱":plat==="Instagram"?"📸":"🎵"} {plat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <div style={lbl}>Status</div>
                <select value={postagemEdit.status||"pendente"} onChange={e=>setPostagemEdit({...postagemEdit,status:e.target.value})} style={inp}><option value="pendente">Pendente</option><option value="agendado">Agendado</option><option value="postado">Postado</option></select>
              </div>
              <div>
                <div style={lbl}>Horário</div>
                <input type="time" value={postagemEdit.horario||"18:00"} onChange={e=>setPostagemEdit({...postagemEdit,horario:e.target.value})} style={inp} />
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={lbl}>Episódio vinculado</div>
              <select value={postagemEdit.episodio_id||""} onChange={e=>{const ep=episodes.find(ep=>String(ep.id)===e.target.value);setPostagemEdit({...postagemEdit,episodio_id:ep?.id||null,episodio_title:ep?.title||"",});}} style={inp}>
                <option value="">Selecionar episódio...</option>
                {[...episodes].sort((a,b)=>epNum(a.title)-epNum(b.title)).map(ep=><option key={ep.id} value={ep.id}>{ep.title}{ep.convidados?.length>0?` · ${ep.convidados.join(", ")}`:""}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <div style={lbl}>Link do post</div>
              <input value={postagemEdit.link||""} onChange={e=>setPostagemEdit({...postagemEdit,link:e.target.value})} placeholder="https://youtube.com/..." style={inp} />
            </div>
            <div style={{marginBottom:14}}>
              <div style={lbl}>🎬 Título do conteúdo</div>
              <input value={postagemEdit.titulo_yt||""} onChange={e=>setPostagemEdit({...postagemEdit,titulo_yt:e.target.value})} placeholder="Ex: CABO PEREIRA no Bulldog Show..." style={inp} />
            </div>
            {(postagemEdit.plataforma==="YouTube"||!postagemEdit.plataforma) && (
              <div style={{marginBottom:14}}>
                <div style={lbl}>🖼 Link da Thumbnail</div>
                <input value={postagemEdit.thumbnail_url||""} onChange={e=>setPostagemEdit({...postagemEdit,thumbnail_url:e.target.value})} placeholder="https://drive.google.com/..." style={inp} />
              </div>
            )}
            <div style={{marginBottom:14}}>
              <div style={lbl}>Views (Instagram/TikTok — YouTube busca automaticamente)</div>
              <input type="number" value={postagemEdit.views||0} onChange={e=>setPostagemEdit({...postagemEdit,views:parseInt(e.target.value)||0})} style={inp} />
            </div>
            <div style={{marginBottom:14}}>
              <div style={lbl}>👤 Responsável</div>
              <select value={postagemEdit.responsavel||""} onChange={e=>setPostagemEdit({...postagemEdit,responsavel:e.target.value})} style={inp}>
                <option value="">Selecionar responsável...</option>
                {equipe.map(m=><option key={m.id} value={m.nome}>{m.nome}{m.funcao?` · ${m.funcao}`:""}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <div style={lbl}>📁 Link do Material no Google Drive</div>
              <input value={postagemEdit.drive_link||""} onChange={e=>setPostagemEdit({...postagemEdit,drive_link:e.target.value})} placeholder="https://drive.google.com/..." style={inp} />
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
    </div>
  );
}
