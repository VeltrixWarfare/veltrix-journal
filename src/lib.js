import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const money = (n, currency="USD") => new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format(Number(n||0));
export const pct = n => `${Number(n||0).toFixed(1)}%`;
export const dateLabel = d => d ? new Date(d).toLocaleDateString() : "—";
export const calcStats = trades => {
  const closed = trades.filter(t => t.status === "closed");
  const wins = closed.filter(t => Number(t.net_pnl) > 0);
  const losses = closed.filter(t => Number(t.net_pnl) < 0);
  const grossWin = wins.reduce((s,t)=>s+Number(t.net_pnl||0),0);
  const grossLoss = Math.abs(losses.reduce((s,t)=>s+Number(t.net_pnl||0),0));
  const net = closed.reduce((s,t)=>s+Number(t.net_pnl||0),0);
  let peak=0, equity=0, maxDD=0;
  [...closed].sort((a,b)=>new Date(a.exit_at||a.entry_at)-new Date(b.exit_at||b.entry_at)).forEach(t=>{
    equity += Number(t.net_pnl||0); peak=Math.max(peak,equity); maxDD=Math.max(maxDD,peak-equity);
  });
  return {closed:closed.length, wins:wins.length, losses:losses.length, net, winRate:closed.length?wins.length/closed.length*100:0, pf:grossLoss?grossWin/grossLoss:(grossWin?Infinity:0), avgRR:closed.length?closed.reduce((s,t)=>s+Number(t.actual_rr||0),0)/closed.length:0, maxDD};
};
export const csvDownload = (rows, name="veltrix-trades.csv") => {
  const cols=["entry_at","market","symbol","direction","entry_price","exit_price","stop_loss","take_profit","position_size","risk_percent","actual_rr","net_pnl","fees","strategy","session","emotion","rule_followed","notes","status"];
  const esc=v=>`"${String(v??"").replaceAll('"','""')}"`;
  const csv=[cols.join(","),...rows.map(r=>cols.map(c=>esc(r[c])).join(","))].join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=name; a.click(); URL.revokeObjectURL(a.href);
};
