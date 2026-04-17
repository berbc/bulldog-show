import { createClient } from '@supabase/supabase-js'
import { notFound } from "next/navigation"

export const revalidate = 60

async function getEpisode(id) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase.from("episodes").select("*").eq("id", id).single()
  return data
}

export default async function GuestPage({ params }) {
  const ep = await getEpisode(params.id)
  if (!ep) notFound()

  const dataFormatada = ep.gravacao_data
    ? new Date(ep.gravacao_data + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric"
      })
    : null

  const horarioLabel = ep.gravacao_horario === "10:00" ? "10h às 12h (manhã)" : "14h às 16h (tarde)"

  return (
    <div style={{minHeight:"100vh",background:"#081C2B",fontFamily:"'DM Sans',sans-serif",color:"#E8F4FF",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:#0D2840;border:1px solid rgba(27,104,150,0.3);border-radius:12px;padding:16px 18px;margin-bottom:12px;}
        .card.hi{border-color:rgba(27,104,150,0.6);background:rgba(27,104,150,0.1);}
        .sl{font-size:10px;color:#5A8BA8;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;margin-top:10px;}
        .tag{display:inline-block;background:rgba(27,104,150,0.2);border:1px solid rgba(27,104,150,0.5);color:#7EC8F0;border-radius:4px;padding:3px 10px;font-size:12px;margin:2px;}
      `}</style>

      <div style={{width:"100%",maxWidth:500}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src="/logo.png" alt="Bulldog Show" style={{width:80,height:80,objectFit:"contain",marginBottom:12,borderRadius:"50%"}} />
          <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:4,color:"#E8F4FF",marginBottom:2}}>BULLDOG SHOW</div>
          <div style={{fontSize:11,color:"#5A8BA8",letterSpacing:2}}>BRIEFING DO CONVIDADO</div>
        </div>

        {ep.mensagem_convidado && (
          <div className="card hi">
            <div style={{fontSize:14,lineHeight:1.7,color:"#E8F4FF"}}>{ep.mensagem_convidado}</div>
          </div>
        )}

        <div className="card">
          <div style={{fontSize:10,color:"#7EC8F0",letterSpacing:2,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>Episódio</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2}}>{ep.title}</div>
        </div>

        <div className="card">
          <div style={{fontSize:10,color:"#7EC8F0",letterSpacing:2,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>📅 Data & Horário</div>
          {dataFormatada
            ? <><div style={{fontSize:14,marginBottom:5}}>{dataFormatada}</div><div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1,color:"#7EC8F0"}}>{horarioLabel}</div></>
            : <div style={{fontSize:14,color:"#1E4060"}}>A confirmar em breve</div>}
        </div>

        {ep.local && (
          <div className="card">
            <div style={{fontSize:10,color:"#7EC8F0",letterSpacing:2,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>📍 Local</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{ep.local}</div>
            {ep.endereco && <div style={{fontSize:13,color:"#5A8BA8"}}>{ep.endereco}</div>}
          </div>
        )}

        {ep.convidados?.length > 0 && (
          <div className="card">
            <div style={{fontSize:10,color:"#7EC8F0",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>👥 Quem vai estar</div>
            <div>{ep.convidados.map((c,i) => <span key={i} className="tag">{c}</span>)}</div>
          </div>
        )}

        <div className="card">
          <div style={{fontSize:10,color:"#7EC8F0",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>🎬 O que vai rolar</div>
          {ep.tier_list && <><div className="sl">🏆 Tier List</div><div style={{fontSize:14,lineHeight:1.5}}>{ep.tier_list}</div></>}
          {ep.debate && ep.debate !== "A definir — aguardar tema em alta" && <><div className="sl">💬 Debate</div><div style={{fontSize:14,lineHeight:1.5}}>{ep.debate}</div></>}
          {ep.game && <><div className="sl">🎮 Game</div><div style={{fontSize:14,lineHeight:1.5}}>{ep.game}</div></>}
          {!ep.tier_list && !ep.game && (!ep.debate || ep.debate === "A definir — aguardar tema em alta") && (
            <div style={{fontSize:13,color:"#1E4060"}}>Pauta sendo finalizada — em breve!</div>
          )}
        </div>

        <div style={{textAlign:"center",marginTop:20,color:"#1E4060",fontSize:12}}>Dúvidas? Fala com a produção 🐶</div>
      </div>
    </div>
  )
}
