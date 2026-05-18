/* ════════════════════════════════════════════════════════
   Kalkulator Jaminan — Danantara × Jamkrindo
   js/app.js  v2.0 — KBG Mandiri update
════════════════════════════════════════════════════════ */

const CONTACT = {
  pic_name: "Nama Contact Person",
  pic_telp: "0812-XXXX-XXXX",
  bank:     "BRI",
  rekening: "XXXX-XXXX-XXXX",
  an:       "PT Jaminan Kredit Indonesia Cabang Purwokerto",
};

/* ── TENOR HELPER ── */
const TENOR_RANGES = ["0-3", ">3-6", ">6-9", ">9-12"];
const TENOR_LABELS = {
  "0-3":   "0–3 Bulan",
  ">3-6":  ">3–6 Bulan",
  ">6-9":  ">6–9 Bulan",
  ">9-12": ">9–12 Bulan",
};

function getTenorRange(bulan) {
  if (bulan <= 0)  return null;
  if (bulan <= 3)  return "0-3";
  if (bulan <= 6)  return ">3-6";
  if (bulan <= 9)  return ">6-9";
  if (bulan <= 12) return ">9-12";
  return null;
}

/* ── PRODUCTS ── */
const PRODUCTS = [
  {
    id: "surety_bond",
    name: "Surety Bond",
    subtitle: "Jaminan Pengadaan Barang & Jasa",
    icon: "🛡️",
    color: "#0067C0", colorBg: "#EBF3FB",
    type: "surety",
    minimum: 75000,
    formula: "surety",
    tarif: {
      "Penawaran":    [0.00132, "0,132%"],
      "Pelaksanaan":  [0.00212, "0,212%"],
      "Uang Muka":    [0.00266, "0,266%"],
      "Pemeliharaan": [0.00212, "0,212%"],
    },
  },
  {
    id: "kbg_mandiri",
    name: "Kontra Bank Garansi Mandiri",
    subtitle: "Penjaminan atas Bank Garansi Bank Mandiri",
    icon: "🏦",
    color: "#D97706", colorBg: "#FFFBEB",
    type: "kbg_tenor",
    programs: {
      "KBG": {
        label: "Tarif KBG",
        minimum: 150000,
        biaya_admin: 0,
        biaya_materai: 10000,
        jenis: {
          "Penawaran":    { "0-3": 0.0030, ">3-6": 0.0060, ">6-9": 0.0090, ">9-12": 0.0120 },
          "Uang Muka":    { "0-3": 0.0060, ">3-6": 0.0088, ">6-9": 0.0120, ">9-12": 0.0150 },
          "Pelaksanaan":  { "0-3": 0.0050, ">3-6": 0.0080, ">6-9": 0.0100, ">9-12": 0.0140 },
          "Pemeliharaan": { "0-3": 0.0050, ">3-6": 0.0080, ">6-9": 0.0100, ">9-12": 0.0140 },
          "SP2D":         { "0-3": 0.0075, ">3-6": 0.0150, ">6-9": 0.0225, ">9-12": 0.0300 },
        },
      },
      "KBG Alutsista": {
        label: "Tarif KBG Alutsista",
        minimum: 150000,
        biaya_admin: 100000,
        biaya_materai: 10000,
        jenis: {
          "Penawaran":    { "0-3": 0.0030, ">3-6": 0.0030, ">6-9": 0.0030, ">9-12": 0.0040 },
          "Uang Muka":    { "0-3": 0.0060, ">3-6": 0.0088, ">6-9": 0.0120, ">9-12": 0.0150 },
          "Pelaksanaan":  { "0-3": 0.0050, ">3-6": 0.0080, ">6-9": 0.0100, ">9-12": 0.0140 },
          "Pemeliharaan": { "0-3": 0.0050, ">3-6": 0.0080, ">6-9": 0.0100, ">9-12": 0.0140 },
        },
      },
    },
  },
  {
    id: "kbg_bni",
    name: "Kontra Bank Garansi BNI",
    subtitle: "Penjaminan atas Bank Garansi BNI",
    icon: "🏛️",
    color: "#2563EB", colorBg: "#EFF6FF",
    type: "coming_soon",
  },
  {
    id: "kbg_bri",
    name: "Kontra Bank Garansi BRI",
    subtitle: "Penjaminan atas Bank Garansi BRI",
    icon: "💳",
    color: "#15803D", colorBg: "#F0FDF4",
    type: "coming_soon",
  },
];

/* ── STATE ── */
let curProd    = null;
let curProgram = null;
let hist       = [];
let infoOpen   = false;

/* ── UTILS ── */
const fmtRp = n => "Rp\u00a0" + Math.round(n).toLocaleString("id-ID");
const fmtShort = n =>
  n >= 1e9 ? "Rp\u00a0" + (n/1e9).toFixed(2).replace(".",",") + "\u00a0M"
  : n >= 1e6 ? "Rp\u00a0" + (n/1e6).toFixed(2).replace(".",",") + "\u00a0Jt"
  : fmtRp(n);
const parseNum = s => parseFloat(s.replace(/\./g,"").replace(",",".")) || 0;
const pctFmt   = r => (r * 100).toFixed(3) + "%";
const getNow   = () => new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const el       = id => document.getElementById(id);

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", () => {
  fillFooters();
  fillInfoPanel();
  buildProductGrid();
  initHero();
});

function fillFooters() {
  const c = `📞\u00a0 ${CONTACT.pic_name}\u00a0 |\u00a0 ${CONTACT.pic_telp}`;
  const r = `🏦\u00a0 Bank ${CONTACT.bank}\u00a0 No.\u00a0Rek.\u00a0${CONTACT.rekening}`;
  const a = `a.n. ${CONTACT.an}`;
  [["fc1","fc2","fc3"],["fc4","fc5","fc6"]].forEach(([i1,i2,i3])=>{
    el(i1).textContent=c; el(i2).textContent=r; el(i3).textContent=a;
  });
}

function fillInfoPanel() {
  el("ip1").textContent = CONTACT.pic_name;
  el("ip2").textContent = CONTACT.pic_telp;
  el("ip3").textContent = CONTACT.bank;
  el("ip4").textContent = CONTACT.rekening;
  el("ip5").textContent = CONTACT.an;
}

function initHero() {
  const hoEl = el("ho");
  const kantor = new Image();
  kantor.onload = () => { hoEl.style.backgroundImage=`url('assets/kantor.png')`; hoEl.classList.add("vis"); };
  kantor.onerror = () => {};
  kantor.src = "assets/kantor.png";

  const hp = el("hp");
  if (!hp) return;
  const show = () => hp.classList.add("vis");
  if (hp.complete && hp.naturalWidth > 0) show();
  else { hp.addEventListener("load", show); hp.addEventListener("error", ()=>{ hp.style.display="none"; }); }
}

/* ── PRODUCT GRID ── */
function buildProductGrid() {
  const grid = el("pgrid");
  PRODUCTS.forEach(p => {
    const card = document.createElement("div");
    card.className = "prod-card";
    card.onclick = () => openCalc(p);
    const minLine = p.type==="kbg_tenor"
      ? `Minimum IJP: ${fmtRp(Object.values(p.programs)[0].minimum)}`
      : p.type==="surety" ? `Minimum: ${fmtRp(p.minimum)}`
      : `Tarif segera hadir`;
    card.innerHTML = `
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
function goWelcome() {
  el("sw").classList.add("active");
  el("sc").classList.remove("active");
  curProd=null; curProgram=null; hist=[]; infoOpen=false;
  el("ipanel").classList.remove("open");
  window.scrollTo(0,0);
}

function openCalc(p) {
  curProd=p; curProgram=null; hist=[]; infoOpen=false;
  el("sw").classList.remove("active");
  el("sc").classList.add("active");
  document.documentElement.style.setProperty("--fc", p.color);

  const badge = el("cbadge");
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

  if (p.type==="coming_soon")      { setupComingSoon(p); return; }
  if (p.type==="surety")           { setupSurety(p); return; }
  if (p.type==="kbg_tenor")        { setupKBG(p); }
}

/* ── SETUP SURETY ── */
function setupSurety(p) {
  el("row-program").style.display="none";
  el("lbl-jw").textContent="JANGKA WAKTU (HARI)";
  el("ijw").placeholder="Contoh: 90";

  const sel=el("ijenis");
  sel.innerHTML=`<option value="">-- Pilih Jenis Jaminan --</option>`;
  Object.keys(p.tarif).forEach(k=>sel.insertAdjacentHTML("beforeend",`<option value="${k}">${k}</option>`));

  const tr=el("trow");
  tr.innerHTML="";
  Object.entries(p.tarif).forEach(([jenis,[,pct]])=>{
    tr.insertAdjacentHTML("beforeend",`
      <div class="tarif-card" style="background:${p.colorBg};border-color:${p.color}">
        <div class="tarif-j">${jenis}</div>
        <div class="tarif-p" style="color:${p.color}">${pct}</div>
      </div>`);
  });
}

/* ── SETUP KBG ── */
function setupKBG(p) {
  el("row-program").style.display="";
  el("lbl-jw").textContent="TENOR (BULAN)";
  el("ijw").placeholder="Contoh: 6";

  const iprogram=el("iprogram");
  iprogram.innerHTML=`<option value="">-- Pilih Program --</option>`;
  Object.entries(p.programs).forEach(([key,prog])=>{
    iprogram.insertAdjacentHTML("beforeend",`<option value="${key}">${prog.label}</option>`);
  });

  el("ijenis").innerHTML=`<option value="">-- Pilih Program dulu --</option>`;
}

/* ── ON PROGRAM CHANGE ── */
function onProgramChange() {
  if (!curProd || curProd.type!=="kbg_tenor") return;
  const p=curProd;
  const prog_key=el("iprogram").value.trim();
  curProgram=prog_key||null;

  if (!prog_key || !p.programs[prog_key]) {
    el("ijenis").innerHTML=`<option value="">-- Pilih Program dulu --</option>`;
    el("trow").innerHTML="";
    return;
  }
  const prog=p.programs[prog_key];

  const sel=el("ijenis");
  sel.innerHTML=`<option value="">-- Pilih Jenis Jaminan --</option>`;
  Object.keys(prog.jenis).forEach(k=>sel.insertAdjacentHTML("beforeend",`<option value="${k}">${k}</option>`));

  // Tabel tarif KBG
  const tr=el("trow");
  tr.style.flexDirection="column";
  let html=`<div style="width:100%;overflow-x:auto;margin-bottom:6px">
    <table class="kbg-table"><thead><tr>
      <th>Jenis Jaminan</th>
      ${TENOR_RANGES.map(r=>`<th>${TENOR_LABELS[r]}</th>`).join("")}
    </tr></thead><tbody>`;
  Object.entries(prog.jenis).forEach(([jenis,rates])=>{
    html+=`<tr><td>${jenis}</td>`;
    TENOR_RANGES.forEach(r=>{
      html+=`<td style="color:${p.color};font-weight:700">${pctFmt(rates[r])}</td>`;
    });
    html+=`</tr>`;
  });
  html+=`</tbody></table></div>`;
  const infos=[`Min. IJP: <b>${fmtRp(prog.minimum)}</b>`];
  if (prog.biaya_admin)   infos.push(`Biaya Admin: <b>${fmtRp(prog.biaya_admin)}/BG</b>`);
  if (prog.biaya_materai) infos.push(`Materai: <b>${fmtRp(prog.biaya_materai)}</b>`);
  html+=`<div class="kbg-info">${infos.join("&nbsp;&nbsp;|&nbsp;&nbsp;")}</div>`;
  tr.innerHTML=html;

  onLive();
}

/* ── COMING SOON ── */
function setupComingSoon(p) {
  el("row-program").style.display="none";
  el("trow").innerHTML="";
  el("btnhitung").style.display="none";
  el("rzone").innerHTML=`
    <div style="background:${p.colorBg};border:1px solid ${p.color};border-radius:6px;
                padding:32px 20px;text-align:center;margin-top:8px">
      <div style="font-size:36px;margin-bottom:14px">${p.icon}</div>
      <div style="font-size:14px;font-weight:700;color:${p.color};margin-bottom:8px">${p.name}</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.7">
        Tarif untuk produk ini sedang dalam proses konfigurasi.<br>
        Akan segera tersedia.
      </div>
    </div>`;
}

/* ── INFO TOGGLE ── */
function toggleInfo() {
  infoOpen=!infoOpen;
  el("ipanel").classList.toggle("open",infoOpen);
}

/* ── LIVE HINTS ── */
function onLive() {
  const nNum=parseNum(el("inilai").value.trim());
  const hn=el("hnilai");
  hn.textContent=nNum>0?"= "+fmtRp(nNum):"";

  const hj=el("hjw");
  if (!curProd) { hj.textContent=""; return; }
  const jVal=el("ijw").value.trim();
  const jNum=parseFloat(jVal);
  if (isNaN(jNum)||jNum<=0) { hj.textContent=""; return; }

  if (curProd.type==="surety") {
    if (jNum<=90) { hj.style.color="var(--teal)"; hj.textContent="✓ ≤ 90 hari → rumus normal"; }
    else          { hj.style.color="var(--gold)"; hj.textContent=`~ > 90 hari → proporsional × ${(90/jNum).toFixed(4)}`; }
  } else if (curProd.type==="kbg_tenor") {
    const range=getTenorRange(parseInt(jVal));
    if (range) { hj.style.color="var(--teal)"; hj.textContent=`✓ ${TENOR_LABELS[range]}`; }
    else       { hj.style.color="var(--red)";  hj.textContent="✗ Tenor maksimal 12 bulan"; }
  }
}

/* ── HITUNG ── */
function showErr(msg) { el("rzone").innerHTML=`<div class="err-box">! ${msg}</div>`; }

function hitung() {
  if (!curProd) return;
  if (curProd.type==="surety")    hitungSurety(curProd);
  if (curProd.type==="kbg_tenor") hitungKBG(curProd);
}

function hitungSurety(p) {
  const jenis=el("ijenis").value.trim();
  if (!jenis||!p.tarif[jenis]) return showErr("Pilih jenis jaminan terlebih dahulu!");
  const nilai=parseNum(el("inilai").value.trim());
  if (!nilai||nilai<=0) return showErr("Masukkan nilai jaminan yang valid!");
  const jw=parseInt(el("ijw").value.trim());
  if (!jw||jw<=0) return showErr("Masukkan jangka waktu yang valid!");

  const [tarif]=p.tarif[jenis];
  const isNormal=jw<=90;
  const raw=isNormal?nilai*tarif:nilai*(90/jw)*tarif;
  const isMin=raw<p.minimum;
  const result=isMin?p.minimum:raw;

  hist.unshift({type:"surety",jenis,nilai,jw,tarif,result,raw,isMin,isNormal,time:getNow()});
  if (hist.length>10) hist.pop();
  renderResultSurety(p,jenis,nilai,jw,tarif,raw,result,isMin,isNormal);
  renderHistory();
}

function hitungKBG(p) {
  const prog_key=el("iprogram").value.trim();
  if (!prog_key||!p.programs[prog_key]) return showErr("Pilih program terlebih dahulu!");
  const prog=p.programs[prog_key];
  const jenis=el("ijenis").value.trim();
  if (!jenis||!prog.jenis[jenis]) return showErr("Pilih jenis jaminan terlebih dahulu!");
  const nilai=parseNum(el("inilai").value.trim());
  if (!nilai||nilai<=0) return showErr("Masukkan nilai jaminan yang valid!");
  const tenor=parseInt(el("ijw").value.trim());
  if (!tenor||tenor<=0) return showErr("Masukkan tenor (bulan) yang valid!");
  const range=getTenorRange(tenor);
  if (!range) return showErr("Tenor maksimal 12 bulan. Hubungi kami untuk tenor lebih panjang.");

  const tarif=prog.jenis[jenis][range];
  const ijp_raw=nilai*tarif;
  const isMin=ijp_raw<prog.minimum;
  const ijp=isMin?prog.minimum:ijp_raw;
  const total=ijp+prog.biaya_admin+prog.biaya_materai;

  hist.unshift({type:"kbg",prog_key,prog_label:prog.label,jenis,nilai,tenor,range,
    tarif,ijp_raw,ijp,isMin,biaya_admin:prog.biaya_admin,biaya_materai:prog.biaya_materai,
    total,time:getNow()});
  if (hist.length>10) hist.pop();
  renderResultKBG(p,prog,jenis,nilai,tenor,range,tarif,ijp_raw,ijp,isMin,total);
  renderHistory();
}

/* ── RENDER RESULT SURETY ── */
function renderResultSurety(p,jenis,nilai,jw,tarif,raw,result,isMin,isNormal) {
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
      <div class="fl bold" style="color:${amtClr}">= ${fmtRp(raw)}</div>`
    :`<div class="fl">${fmtRp(nilai)} × (90 / ${jw}) × ${pctFmt(tarif)}</div>
      <div class="fl">${fmtRp(nilai)} × ${(90/jw).toFixed(6)} × ${pctFmt(tarif)}</div>
      <div class="fl bold" style="color:${amtClr}">= ${fmtRp(raw)}</div>`;
  if (isMin) formula+=`<div class="fl bold" style="color:var(--gold);margin-top:6px">Minimum berlaku: ${fmtRp(result)}</div>`;
  else       formula+=`<div class="fl bold" style="color:var(--green)">= ${fmtRp(result)}</div>`;
  const warn=isMin?`<div class="warn-box">⚠ Hasil (${fmtRp(raw)}) di bawah minimum → dipakai ${fmtRp(result)}</div>`:"";
  el("rzone").innerHTML=`
    <div class="r-box" style="background:${boxBg};border-color:${boxBr}">
      <div class="r-lbl" style="color:${lblClr}">HASIL PERHITUNGAN</div>
      <div class="r-amount" style="color:${amtClr}">${fmtRp(result)}</div>
      <div class="r-pills">${pills}</div>
      <div class="f-box">${formula}</div>
    </div>${warn}`;
  if (window.innerWidth<=640) setTimeout(()=>el("rzone").scrollIntoView({behavior:"smooth",block:"nearest"}),80);
}

/* ── RENDER RESULT KBG ── */
function renderResultKBG(p,prog,jenis,nilai,tenor,range,tarif,ijp_raw,ijp,isMin,total) {
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

  let formula=`
    <div class="fl">${fmtRp(nilai)} × ${pctFmt(tarif)}</div>
    <div class="fl bold" style="color:${isMin?"var(--gold)":"var(--green)"}">IJP = ${fmtRp(ijp_raw)}</div>`;
  if (isMin) formula+=`<div class="fl" style="color:var(--gold)">IJP < minimum → dipakai ${fmtRp(prog.minimum)}</div>`;
  if (prog.biaya_admin>0||prog.biaya_materai>0) {
    formula+=`<div style="height:6px"></div>`;
    if (prog.biaya_admin>0)   formula+=`<div class="fl">+ Biaya Admin &nbsp;= ${fmtRp(prog.biaya_admin)}/BG</div>`;
    if (prog.biaya_materai>0) formula+=`<div class="fl">+ Biaya Materai = ${fmtRp(prog.biaya_materai)}</div>`;
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
  if (window.innerWidth<=640) setTimeout(()=>el("rzone").scrollIntoView({behavior:"smooth",block:"nearest"}),80);
}

/* ── HISTORY ── */
function renderHistory() {
  if (!hist.length) { el("hzone").innerHTML=""; return; }
  let html=`<div class="hist-hdr">
    <span class="hist-ttl">RIWAYAT PERHITUNGAN</span>
    <button class="btn-hapus" onclick="clearHist()">Hapus Semua</button>
  </div>`;
  hist.forEach(h=>{
    let label,detail,amount,color;
    if (h.type==="surety") {
      label=h.jenis;
      detail=`${fmtRp(h.nilai)} | ${h.jw} hari | ${pctFmt(h.tarif)} [${h.time}]`;
      amount=fmtRp(h.result);
      color=h.isMin?"var(--gold)":"var(--green)";
    } else {
      label=`${h.prog_label} — ${h.jenis}`;
      detail=`${fmtRp(h.nilai)} | ${h.tenor} bln | ${TENOR_LABELS[h.range]} | ${pctFmt(h.tarif)} [${h.time}]`;
      amount=fmtRp(h.total);
      color="var(--green)";
    }
    html+=`<div class="hist-item">
      <div>
        <div class="h-jenis">${label}</div>
        <div class="h-detail">${detail}</div>
      </div>
      <div class="h-amount" style="color:${color}">${amount}</div>
    </div>`;
  });
  el("hzone").innerHTML=html;
}

function clearHist() { hist=[]; el("hzone").innerHTML=""; }
