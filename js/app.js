/* ════════════════════════════════════════════════════════
   Kalkulator Jaminan — Danantara × Jamkrindo
   js/app.js  v2.1 — KBG BNI added
════════════════════════════════════════════════════════ */

const CONTACT = {
  persons: [
    { name: "Wahyu Nurtikasari", telp: "0812-XXXX-XXXX" },
    { name: "M Bustomi Rida", telp: "0813-XXXX-XXXX" },
    { name: "Ghaniy A H Kurniawan", telp: "0814-XXXX-XXXX" },
    { name: "Agnirahesa", telp: "0815-XXXX-XXXX" },
  ],
  bank:     "BRI",
  rekening: "XXXX-XXXX-XXXX",
  an:       "PT Jaminan Kredit Indonesia Cabang Purwokerto",
};

/* ── TENOR HELPER ── */
const TENOR_RANGES = ["0-3", ">3-6", ">6-9", ">9-12"];
const TENOR_LABELS = { "0-3":"0–3 Bln", ">3-6":">3–6 Bln", ">6-9":">6–9 Bln", ">9-12":">9–12 Bln" };

function getTenorRange(b) {
  if (b<=0)  return null;
  if (b<=3)  return "0-3";
  if (b<=6)  return ">3-6";
  if (b<=9)  return ">6-9";
  if (b<=12) return ">9-12";
  return null;
}

/* ── PRODUCTS ── */
const PRODUCTS = [

  /* 1 — Surety Bond */
  {
    id:"surety_bond", name:"Surety Bond",
    subtitle:"Jaminan Pengadaan Barang & Jasa",
    icon:"🛡️", color:"#0067C0", colorBg:"#EBF3FB",
    type:"surety", minimum:75000, formula:"surety",
    biaya_admin:20000, biaya_materai:10000,
    tarif:{
      "Penawaran":    [0.00132,"0,132%"],
      "Pelaksanaan":  [0.00212,"0,212%"],
      "Uang Muka":    [0.00266,"0,266%"],
      "Pemeliharaan": [0.00212,"0,212%"],
    },
  },

  /* 2 — KBG Mandiri (2 program, tenor bulan) */
  {
    id:"kbg_mandiri", name:"Kontra Bank Garansi Mandiri",
    subtitle:"Penjaminan atas Bank Garansi Bank Mandiri",
    icon:"🏦", color:"#C9930A", colorBg:"#FEF9E8",
    type:"kbg_tenor",
    programs:{
      "KBG":{
        label:"Tarif KBG", minimum:150000, biaya_admin:0, biaya_materai:10000,
        jenis:{
          "Penawaran":    {"0-3":0.0030,">3-6":0.0060,">6-9":0.0090,">9-12":0.0120},
          "Uang Muka":    {"0-3":0.0060,">3-6":0.0088,">6-9":0.0120,">9-12":0.0150},
          "Pelaksanaan":  {"0-3":0.0050,">3-6":0.0080,">6-9":0.0100,">9-12":0.0140},
          "Pemeliharaan": {"0-3":0.0050,">3-6":0.0080,">6-9":0.0100,">9-12":0.0140},
          "SP2D":         {"0-3":0.0075,">3-6":0.0150,">6-9":0.0225,">9-12":0.0300},
        },
      },
      "KBG Alutsista":{
        label:"Tarif KBG Alutsista", minimum:150000, biaya_admin:100000, biaya_materai:10000,
        jenis:{
          "Penawaran":    {"0-3":0.0030,">3-6":0.0030,">6-9":0.0030,">9-12":0.0040},
          "Uang Muka":    {"0-3":0.0060,">3-6":0.0088,">6-9":0.0120,">9-12":0.0150},
          "Pelaksanaan":  {"0-3":0.0050,">3-6":0.0080,">6-9":0.0100,">9-12":0.0140},
          "Pemeliharaan": {"0-3":0.0050,">3-6":0.0080,">6-9":0.0100,">9-12":0.0140},
        },
      },
    },
  },

  /* 3 — KBG BNI (1 set tarif, SP2D rumus khusus 0,6%/3bln) */
  {
    id:"kbg_bni", name:"Kontra Bank Garansi BNI",
    subtitle:"Penjaminan atas Bank Garansi BNI",
    icon:"🏛️", color:"#E06010", colorBg:"#FEF0E6",
    type:"kbg_tenor",
    programs:{
      "BNI":{
        label:"Tarif KBG BNI",
        minimum:100000,       /* IJP Minimal Rp 100.000/Terjamin */
        biaya_admin:150000,   /* Rp 150.000/SP Terbit */
        biaya_materai:10000,  /* Rp 10.000 */
        /* SP2D: rumus khusus 0,6% × ceil(tenor/3), bukan tabel */
        sp2d_rate_per_3m: 0.006,
        jenis:{
          "Penawaran":    {"0-3":0.0030,">3-6":0.0035,">6-9":0.0040,">9-12":0.0045},
          "Uang Muka":    {"0-3":0.0060,">3-6":0.0100,">6-9":0.0125,">9-12":0.0150},
          "Pelaksanaan":  {"0-3":0.0056,">3-6":0.00875,">6-9":0.0100,">9-12":0.0140},
          "Pemeliharaan": {"0-3":0.0056,">3-6":0.00875,">6-9":0.0100,">9-12":0.0140},
          /* SP2D ditangani terpisah dengan sp2d_rate_per_3m */
        },
      },
    },
  },

  /* 4 — KBG BRI (1 set tarif, SP2D 0,5%/3bln) */
  {
    id:"kbg_bri", name:"Kontra Bank Garansi BRI",
    subtitle:"Penjaminan atas Bank Garansi BRI",
    icon:"💳", color:"#1A4FA0", colorBg:"#EBF0FB",
    type:"kbg_tenor",
    programs:{
      "BRI":{
        label:"Tarif KBG BRI",
        minimum:100000,      /* IJP Minimal Rp 100.000 */
        biaya_admin:50000,   /* Rp 50.000/BG */
        biaya_materai:10000, /* Rp 10.000 */
        /* SP2D: rumus khusus 0,5% × ceil(tenor/3) */
        sp2d_rate_per_3m: 0.005,
        jenis:{
          "Penawaran":    {"0-3":0.0030,">3-6":0.0030,">6-9":0.0030,">9-12":0.0040},
          "Pelaksanaan":  {"0-3":0.0050,">3-6":0.0080,">6-9":0.0100,">9-12":0.0140},
          "Pemeliharaan": {"0-3":0.0050,">3-6":0.0080,">6-9":0.0100,">9-12":0.0140},
          "Uang Muka":    {"0-3":0.0060,">3-6":0.00875,">6-9":0.0120,">9-12":0.0150},
        },
      },
    },
  },
];

/* ── STATE ── */
let curProd=null, curProgram=null, hist=[], infoOpen=false;

/* ── UTILS ── */
const fmtRp    = n => "Rp\u00a0"+Math.round(n).toLocaleString("id-ID");
const fmtShort = n =>
  n>=1e9 ? "Rp\u00a0"+(n/1e9).toFixed(2).replace(".",",")+"\u00a0M"
  : n>=1e6 ? "Rp\u00a0"+(n/1e6).toFixed(2).replace(".",",")+"\u00a0Jt"
  : fmtRp(n);
const parseNum = s => parseFloat(s.replace(/\./g,"").replace(",",".")) || 0;
const pctFmt   = r => (r*100).toFixed(3)+"%";
const getNow   = () => new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const el       = id => document.getElementById(id);

/* ── INIT ── */
document.addEventListener("DOMContentLoaded",()=>{
  fillFooters(); fillInfoPanel(); buildProductGrid(); initHero();
});

function fillFooters(){
  /* Footer hanya tampilkan alamat — contact/rekening dipindah ke info panel */
}

function fillInfoPanel(){
  const c=el("info-content");
  if(!c) return;

  /* 4 Contact Persons dalam grid 2 kolom */
  let html=`<div class="cp-grid">`;
  CONTACT.persons.forEach((p,i)=>{
    html+=`
      <div class="cp-card">
        <div class="cp-num">CP ${i+1}</div>
        <div class="cp-name">${p.name}</div>
        <div class="cp-telp">📞 ${p.telp}</div>
      </div>`;
  });
  html+=`</div>`;

  /* Separator */
  html+=`<div class="info-sep"></div>`;

  /* Rekening */
  html+=`
    <div class="info-row"><span class="il">🏦 Bank</span><span class="iv">${CONTACT.bank}</span></div>
    <div class="info-row"><span class="il">💳 No. Rekening</span><span class="iv accent">${CONTACT.rekening}</span></div>
    <div class="info-row"><span class="il">&nbsp;&nbsp;a.n.</span><span class="iv muted">${CONTACT.an}</span></div>`;

  c.innerHTML=html;
}
function initHero(){
  /* Kantor: set background LANGSUNG — browser tampilkan saat siap,
     CSS animation handle fade-in otomatis */
  const ho = el("ho");
  if (ho) ho.style.backgroundImage = "url('assets/kantor.png')";

  /* Hero orang: CSS animation sudah handle, hanya perlu error handler */
  const hp = el("hp");
  if (hp) hp.addEventListener("error", () => { hp.style.display = "none"; });
}

/* ── PRODUCT GRID ── */
function buildProductGrid(){
  const grid=el("pgrid");
  PRODUCTS.forEach(p=>{
    const card=document.createElement("div");
    card.className="prod-card"; card.onclick=()=>openCalc(p);
    const minLine=p.type==="kbg_tenor"
      ? `Min. IJP: ${fmtRp(Object.values(p.programs)[0].minimum)}`
      : p.type==="surety" ? `Minimum: ${fmtRp(p.minimum)}` : `Tarif segera hadir`;
    card.innerHTML=`
      <div class="prod-strip" style="background:${p.color}"></div>
      <div class="prod-body">
        <div class="prod-icon" style="background:${p.colorBg}">${p.icon}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-sub">${p.subtitle}</div>
        <div class="prod-min">${minLine}</div>
      </div>
      <div class="prod-cta" style="background:${p.color}">Buka Kalkulator &nbsp;›</div>`;
    grid.appendChild(card);
  });
}

/* ── ROUTING ── */
function goWelcome(){
  el("sw").classList.add("active"); el("sc").classList.remove("active");
  curProd=null; curProgram=null; hist=[]; infoOpen=false;
  el("ipanel").classList.remove("open"); window.scrollTo(0,0);
}

function openCalc(p){
  curProd=p; curProgram=null; hist=[]; infoOpen=false;
  el("sw").classList.remove("active"); el("sc").classList.add("active");
  document.documentElement.style.setProperty("--fc",p.color);

  const badge=el("cbadge");
  badge.style.background=p.colorBg; badge.style.color=p.color;
  badge.textContent=`${p.icon}  ${p.name.toUpperCase()}`;
  el("ctitle").textContent=`Kalkulator ${p.name}`;
  el("csub").textContent=p.subtitle;
  el("btnhitung").style.background=p.color;
  el("btnhitung").style.display="";

  el("rzone").innerHTML=""; el("hzone").innerHTML="";
  el("inilai").value=""; el("ijw").value="";
  el("hnilai").textContent=""; el("hjw").textContent="";
  el("iprogram").innerHTML=""; el("ijenis").innerHTML="";
  el("trow").innerHTML=""; el("trow").style.flexDirection="";
  el("ipanel").classList.remove("open");
  window.scrollTo(0,0);

  if(p.type==="coming_soon") { setupComingSoon(p); return; }
  if(p.type==="surety")      { setupSurety(p);     return; }
  if(p.type==="kbg_tenor")   { setupKBG(p); }
}

/* ── SETUP SURETY ── */
function setupSurety(p){
  el("row-program").style.display="none";
  el("lbl-jw").textContent="JANGKA WAKTU (HARI)";
  el("ijw").placeholder="Contoh: 90";
  const sel=el("ijenis");
  sel.innerHTML=`<option value="">-- Pilih Jenis Jaminan --</option>`;
  Object.keys(p.tarif).forEach(k=>sel.insertAdjacentHTML("beforeend",`<option value="${k}">${k}</option>`));
  const tr=el("trow"); tr.innerHTML="";
  Object.entries(p.tarif).forEach(([jenis,[,pct]])=>{
    tr.insertAdjacentHTML("beforeend",`
      <div class="tarif-card" style="background:${p.colorBg};border-color:${p.color}">
        <div class="tarif-j">${jenis}</div>
        <div class="tarif-p" style="color:${p.color}">${pct}</div>
      </div>`);
  });
}

/* ── SETUP KBG ── */
function setupKBG(p){
  el("lbl-jw").textContent="TENOR (BULAN)";
  el("ijw").placeholder="Contoh: 6";

  const progKeys=Object.keys(p.programs);
  if(progKeys.length===1){
    /* Single program → auto-select, sembunyikan dropdown program */
    el("row-program").style.display="none";
    const sel=el("iprogram");
    sel.innerHTML=`<option value="${progKeys[0]}" selected>${p.programs[progKeys[0]].label}</option>`;
    onProgramChange();
  } else {
    el("row-program").style.display="";
    const iprogram=el("iprogram");
    iprogram.innerHTML=`<option value="">-- Pilih Program --</option>`;
    Object.entries(p.programs).forEach(([key,prog])=>{
      iprogram.insertAdjacentHTML("beforeend",`<option value="${key}">${prog.label}</option>`);
    });
    el("ijenis").innerHTML=`<option value="">-- Pilih Program dulu --</option>`;
  }
}

/* ── ON PROGRAM CHANGE ── */
function onProgramChange(){
  if(!curProd||curProd.type!=="kbg_tenor") return;
  const p=curProd;
  const prog_key=el("iprogram").value.trim();
  curProgram=prog_key||null;
  if(!prog_key||!p.programs[prog_key]){
    el("ijenis").innerHTML=`<option value="">-- Pilih Program dulu --</option>`;
    el("trow").innerHTML=""; return;
  }
  const prog=p.programs[prog_key];

  /* Jenis dropdown */
  const sel=el("ijenis");
  sel.innerHTML=`<option value="">-- Pilih Jenis Jaminan --</option>`;
  Object.keys(prog.jenis).forEach(k=>sel.insertAdjacentHTML("beforeend",`<option value="${k}">${k}</option>`));
  /* SP2D sebagai opsi terpisah jika ada sp2d_rate_per_3m */
  if(prog.sp2d_rate_per_3m!==undefined){
    sel.insertAdjacentHTML("beforeend",`<option value="SP2D">SP2D (0,6% per 3 bulan)</option>`);
  }

  /* Tabel tarif */
  renderTarifKBG(p,prog);
  onLive();
}

/* ── RENDER TABEL KBG ── */
function renderTarifKBG(p,prog){
  const tr=el("trow");
  tr.style.flexDirection="column";
  let html=`<div style="width:100%;overflow-x:auto;margin-bottom:6px">
    <table class="kbg-table"><thead><tr>
      <th>Jenis Jaminan</th>
      ${TENOR_RANGES.map(r=>`<th>${TENOR_LABELS[r]}</th>`).join("")}
    </tr></thead><tbody>`;

  Object.entries(prog.jenis).forEach(([jenis,rates])=>{
    html+=`<tr><td>${jenis}</td>`;
    TENOR_RANGES.forEach(r=>{ html+=`<td style="color:${p.color};font-weight:700">${pctFmt(rates[r])}</td>`; });
    html+=`</tr>`;
  });

  /* Baris SP2D khusus */
  if(prog.sp2d_rate_per_3m!==undefined){
    html+=`<tr><td>SP2D</td>
      <td colspan="4" style="color:${p.color};font-weight:700;text-align:center">
        0,600% × jumlah periode 3 bulan
      </td></tr>`;
  }

  html+=`</tbody></table></div>`;

  /* Info biaya */
  const infos=[`Min. IJP: <b>${fmtRp(prog.minimum)}</b>`];
  if(prog.biaya_admin)   infos.push(`Biaya Admin: <b>${fmtRp(prog.biaya_admin)}/SP</b>`);
  if(prog.biaya_materai) infos.push(`Materai: <b>${fmtRp(prog.biaya_materai)}</b>`);
  html+=`<div class="kbg-info">${infos.join("&nbsp;&nbsp;|&nbsp;&nbsp;")}</div>`;
  tr.innerHTML=html;
}

/* ── COMING SOON ── */
function setupComingSoon(p){
  el("row-program").style.display="none";
  el("trow").innerHTML="";
  el("btnhitung").style.display="none";
  el("rzone").innerHTML=`
    <div style="background:${p.colorBg};border:1px solid ${p.color};border-radius:6px;
                padding:32px 20px;text-align:center;margin-top:8px">
      <div style="font-size:36px;margin-bottom:14px">${p.icon}</div>
      <div style="font-size:14px;font-weight:700;color:${p.color};margin-bottom:8px">${p.name}</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.7">
        Tarif untuk produk ini sedang dalam proses konfigurasi.<br>Akan segera tersedia.
      </div>
    </div>`;
}

/* ── INFO TOGGLE ── */
function toggleInfo(){ infoOpen=!infoOpen; el("ipanel").classList.toggle("open",infoOpen); }

/* ── LIVE HINTS ── */
function onLive(){
  const nNum=parseNum(el("inilai").value.trim());
  el("hnilai").textContent=nNum>0?"= "+fmtRp(nNum):"";
  const hj=el("hjw");
  if(!curProd){ hj.textContent=""; return; }
  const jNum=parseFloat(el("ijw").value.trim());
  if(isNaN(jNum)||jNum<=0){ hj.textContent=""; return; }
  if(curProd.type==="surety"){
    if(jNum<=90){ hj.style.color="var(--teal)"; hj.textContent="✓ ≤ 90 hari → rumus normal"; }
    else         { hj.style.color="var(--gold)"; hj.textContent=`~ > 90 hari → proporsional × ${(90/jNum).toFixed(4)}`; }
  } else if(curProd.type==="kbg_tenor"){
    const b=parseInt(el("ijw").value.trim());
    const range=getTenorRange(b);
    if(range){
      hj.style.color="var(--teal)";
      const isSpd=el("ijenis").value==="SP2D";
      const periods=Math.ceil(b/3);
      hj.textContent=isSpd
        ? `✓ ${TENOR_LABELS[range]} → ${periods} periode × 0,6%`
        : `✓ ${TENOR_LABELS[range]}`;
    } else { hj.style.color="var(--red)"; hj.textContent="✗ Tenor maksimal 12 bulan"; }
  }
}

/* ── HITUNG ── */
function showErr(msg){ el("rzone").innerHTML=`<div class="err-box">! ${msg}</div>`; }

function hitung(){
  if(!curProd) return;
  if(curProd.type==="surety")    hitungSurety(curProd);
  if(curProd.type==="kbg_tenor") hitungKBG(curProd);
}

/* ── HITUNG SURETY ── */
function hitungSurety(p){
  const jenis=el("ijenis").value.trim();
  if(!jenis||!p.tarif[jenis]) return showErr("Pilih jenis jaminan terlebih dahulu!");
  const nilai=parseNum(el("inilai").value.trim());
  if(!nilai||nilai<=0) return showErr("Masukkan nilai jaminan yang valid!");
  const jw=parseInt(el("ijw").value.trim());
  if(!jw||jw<=0) return showErr("Masukkan jangka waktu yang valid!");

  const [tarif]=p.tarif[jenis];
  const isNormal=jw<=90;
  const raw=isNormal?nilai*tarif:nilai*(90/jw)*tarif;
  const isMin=raw<p.minimum;
  const ijp=isMin?p.minimum:raw;
  const total=ijp+(p.biaya_admin||0)+(p.biaya_materai||0);

  hist.unshift({type:"surety",jenis,nilai,jw,tarif,ijp,raw,isMin,isNormal,
    biaya_admin:p.biaya_admin||0, biaya_materai:p.biaya_materai||0, total, time:getNow()});
  if(hist.length>10) hist.pop();
  renderResultSurety(p,jenis,nilai,jw,tarif,raw,ijp,isMin,isNormal,total);
  renderHistory();
}

/* ── HITUNG KBG ── */
function hitungKBG(p){
  const prog_key=el("iprogram").value.trim();
  if(!prog_key||!p.programs[prog_key]) return showErr("Pilih program terlebih dahulu!");
  const prog=p.programs[prog_key];
  const jenis=el("ijenis").value.trim();
  if(!jenis) return showErr("Pilih jenis jaminan terlebih dahulu!");
  const nilai=parseNum(el("inilai").value.trim());
  if(!nilai||nilai<=0) return showErr("Masukkan nilai jaminan yang valid!");
  const tenor=parseInt(el("ijw").value.trim());
  if(!tenor||tenor<=0) return showErr("Masukkan tenor (bulan) yang valid!");
  const range=getTenorRange(tenor);
  if(!range) return showErr("Tenor maksimal 12 bulan. Hubungi kami untuk tenor lebih panjang.");

  let tarif, ijp_raw, sp2dInfo=null;

  if(jenis==="SP2D" && prog.sp2d_rate_per_3m!==undefined){
    /* Rumus SP2D: 0,6% × ceil(tenor/3) */
    const periods=Math.ceil(tenor/3);
    tarif=prog.sp2d_rate_per_3m*periods;
    ijp_raw=nilai*tarif;
    sp2dInfo={ periods, rate_per_period:prog.sp2d_rate_per_3m };
  } else if(prog.jenis[jenis]){
    tarif=prog.jenis[jenis][range];
    ijp_raw=nilai*tarif;
  } else {
    return showErr("Jenis jaminan tidak dikenali.");
  }

  const isMin=ijp_raw<prog.minimum;
  const ijp=isMin?prog.minimum:ijp_raw;
  const total=ijp+prog.biaya_admin+prog.biaya_materai;

  hist.unshift({type:"kbg",prog_key,prog_label:prog.label,jenis,nilai,tenor,range,
    tarif,ijp_raw,ijp,isMin,biaya_admin:prog.biaya_admin,biaya_materai:prog.biaya_materai,
    total,sp2dInfo,time:getNow()});
  if(hist.length>10) hist.pop();
  renderResultKBG(p,prog,jenis,nilai,tenor,range,tarif,ijp_raw,ijp,isMin,total,sp2dInfo);
  renderHistory();
}

/* ── RENDER RESULT SURETY ── */
function renderResultSurety(p,jenis,nilai,jw,tarif,raw,ijp,isMin,isNormal,total){
  const boxBg=isMin?"var(--warn-bg)":"var(--ok-bg)";
  const boxBr=isMin?"var(--warn-br)":"var(--ok-br)";
  const amtClr=isMin?"var(--gold)":"var(--green)";
  const lblClr=isMin?"var(--warn-tx)":"var(--ok-tx)";
  let pills=`
    <span class="pill" style="background:${p.colorBg};color:${p.color}">${jenis}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${fmtShort(nilai)}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${jw} hari</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${pctFmt(tarif)}</span>
    ${isMin?`<span class="pill" style="background:#FEF3C7;color:var(--gold)">⚠ Min.</span>`:""}`;

  let formula=isNormal
    ?`<div class="fl">${fmtRp(nilai)} × ${pctFmt(tarif)}</div>
      <div class="fl bold" style="color:${isMin?"var(--gold)":"var(--green)"}">IJP = ${fmtRp(raw)}</div>`
    :`<div class="fl">${fmtRp(nilai)} × (90/${jw}) × ${pctFmt(tarif)}</div>
      <div class="fl">${fmtRp(nilai)} × ${(90/jw).toFixed(6)} × ${pctFmt(tarif)}</div>
      <div class="fl bold" style="color:${isMin?"var(--gold)":"var(--green)"}">IJP = ${fmtRp(raw)}</div>`;

  if(isMin) formula+=`<div class="fl" style="color:var(--gold)">IJP < minimum → dipakai ${fmtRp(p.minimum)}</div>`;

  /* Biaya tambahan */
  const admin   = p.biaya_admin   || 0;
  const materai = p.biaya_materai || 0;
  if(admin>0||materai>0){
    formula+=`<div style="height:6px"></div>`;
    if(admin>0)   formula+=`<div class="fl">+ Biaya Administrasi = ${fmtRp(admin)}</div>`;
    if(materai>0) formula+=`<div class="fl">+ Biaya Materai &nbsp;&nbsp;&nbsp;= ${fmtRp(materai)}</div>`;
    formula+=`<div class="fl bold" style="color:var(--green);border-top:1px solid var(--border);margin-top:8px;padding-top:8px">Total = ${fmtRp(total)}</div>`;
  } else {
    formula+=`<div class="fl bold" style="color:var(--green)">= ${fmtRp(ijp)}</div>`;
  }

  const warn=isMin?`<div class="warn-box">⚠ IJP hitung (${fmtRp(raw)}) di bawah minimum → dipakai ${fmtRp(p.minimum)}</div>`:"";
  el("rzone").innerHTML=`
    <div class="r-box" style="background:${boxBg};border-color:${boxBr}">
      <div class="r-lbl" style="color:${lblClr}">HASIL PERHITUNGAN</div>
      <div class="r-amount" style="color:var(--green)">${fmtRp(total)}</div>
      <div class="r-pills">${pills}</div>
      <div class="f-box">${formula}</div>
    </div>${warn}`;
  if(window.innerWidth<=640) setTimeout(()=>el("rzone").scrollIntoView({behavior:"smooth",block:"nearest"}),80);
}

/* ── RENDER RESULT KBG ── */
function renderResultKBG(p,prog,jenis,nilai,tenor,range,tarif,ijp_raw,ijp,isMin,total,sp2dInfo){
  const boxBg=isMin?"var(--warn-bg)":"var(--ok-bg)";
  const boxBr=isMin?"var(--warn-br)":"var(--ok-br)";
  const lblClr=isMin?"var(--warn-tx)":"var(--ok-tx)";
  const pills=`
    <span class="pill" style="background:${p.colorBg};color:${p.color}">${prog.label}</span>
    <span class="pill" style="background:${p.colorBg};color:${p.color}">${jenis}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${fmtShort(nilai)}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${tenor} bln · ${TENOR_LABELS[range]}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${pctFmt(tarif)}</span>
    ${isMin?`<span class="pill" style="background:#FEF3C7;color:var(--gold)">⚠ Min. IJP</span>`:""}`;

  let formula="";
  if(sp2dInfo){
    formula=`
      <div class="fl">${fmtRp(nilai)} × (${sp2dInfo.periods} periode × ${pctFmt(sp2dInfo.rate_per_period)})</div>
      <div class="fl">${fmtRp(nilai)} × ${pctFmt(tarif)}</div>`;
  } else {
    formula=`<div class="fl">${fmtRp(nilai)} × ${pctFmt(tarif)}</div>`;
  }
  formula+=`<div class="fl bold" style="color:${isMin?"var(--gold)":"var(--green)"}">IJP = ${fmtRp(ijp_raw)}</div>`;
  if(isMin) formula+=`<div class="fl" style="color:var(--gold)">IJP < minimum → dipakai ${fmtRp(prog.minimum)}</div>`;
  if(prog.biaya_admin>0||prog.biaya_materai>0){
    formula+=`<div style="height:6px"></div>`;
    if(prog.biaya_admin>0)   formula+=`<div class="fl">+ Biaya Admin &nbsp;= ${fmtRp(prog.biaya_admin)}/SP</div>`;
    if(prog.biaya_materai>0) formula+=`<div class="fl">+ Biaya Materai = ${fmtRp(prog.biaya_materai)}</div>`;
    formula+=`<div class="fl bold" style="color:var(--green);border-top:1px solid var(--border);margin-top:8px;padding-top:8px">Total = ${fmtRp(total)}</div>`;
  } else {
    formula+=`<div class="fl bold" style="color:var(--green)">= ${fmtRp(total)}</div>`;
  }

  el("rzone").innerHTML=`
    <div class="r-box" style="background:${boxBg};border-color:${boxBr}">
      <div class="r-lbl" style="color:${lblClr}">HASIL PERHITUNGAN</div>
      <div class="r-amount" style="color:var(--green)">${fmtRp(total)}</div>
      <div class="r-pills">${pills}</div>
      <div class="f-box">${formula}</div>
    </div>`;
  if(window.innerWidth<=640) setTimeout(()=>el("rzone").scrollIntoView({behavior:"smooth",block:"nearest"}),80);
}

/* ── HISTORY ── */
function renderHistory(){
  if(!hist.length){ el("hzone").innerHTML=""; return; }
  let html=`<div class="hist-hdr">
    <span class="hist-ttl">RIWAYAT PERHITUNGAN</span>
    <button class="btn-hapus" onclick="clearHist()">Hapus Semua</button>
  </div>`;
  hist.forEach(h=>{
    let label,detail,amount,color;
    if(h.type==="surety"){
      label=h.jenis;
      detail=`${fmtRp(h.nilai)} | ${h.jw} hari | ${pctFmt(h.tarif)} [${h.time}]`;
      amount=fmtRp(h.total); color="var(--green)";
    } else {
      label=`${h.prog_label} — ${h.jenis}`;
      detail=`${fmtRp(h.nilai)} | ${h.tenor} bln | ${TENOR_LABELS[h.range]} | ${pctFmt(h.tarif)} [${h.time}]`;
      amount=fmtRp(h.total); color="var(--green)";
    }
    html+=`<div class="hist-item">
      <div><div class="h-jenis">${label}</div><div class="h-detail">${detail}</div></div>
      <div class="h-amount" style="color:${color}">${amount}</div>
    </div>`;
  });
  el("hzone").innerHTML=html;
}
function clearHist(){ hist=[]; el("hzone").innerHTML=""; }
