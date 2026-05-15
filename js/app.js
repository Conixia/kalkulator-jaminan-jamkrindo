/* ════════════════════════════════════════════════════════
   Kalkulator Jaminan — Danantara × Jamkrindo
   js/app.js
════════════════════════════════════════════════════════ */

/* ── DATA ── */
const CONTACT = {
  pic_name: "Nama Contact Person",
  pic_telp: "0812-XXXX-XXXX",
  bank:     "BRI",
  rekening: "XXXX-XXXX-XXXX",
  an:       "PT Jaminan Kredit Indonesia Cabang Purwokerto",
};

const PRODUCTS = [
  {
    id: "surety_bond",
    name: "Surety Bond",
    subtitle: "Jaminan Pengadaan Barang & Jasa",
    icon: "🛡️",
    color: "#0067C0",
    colorBg: "#EBF3FB",
    tarif: {
      "Penawaran":    [0.00132, "0,132%"],
      "Pelaksanaan":  [0.00212, "0,212%"],
      "Uang Muka":    [0.00266, "0,266%"],
      "Pemeliharaan": [0.00212, "0,212%"],
    },
    minimum: 75_000,
    formula: "surety",
  },
  {
    id: "bank_garansi_kontrak",
    name: "Bank Garansi Kontrak",
    subtitle: "Jaminan Kontrak Perbankan",
    icon: "🏛️",
    color: "#C05A00",
    colorBg: "#FDF3E8",
    tarif: {
      "Penawaran":    [0.00150, "0,150%"],
      "Pelaksanaan":  [0.00250, "0,250%"],
      "Uang Muka":    [0.00300, "0,300%"],
      "Pemeliharaan": [0.00250, "0,250%"],
    },
    minimum: 100_000,
    formula: "surety",
  },
  {
    id: "kontra_bank_garansi",
    name: "Kontra Bank Garansi",
    subtitle: "Penjaminan atas Bank Garansi",
    icon: "🔐",
    color: "#0D7A6F",
    colorBg: "#E8F7F5",
    tarif: {
      "Penawaran":    [0.00165, "0,165%"],
      "Pelaksanaan":  [0.00275, "0,275%"],
      "Uang Muka":    [0.00330, "0,330%"],
      "Pemeliharaan": [0.00275, "0,275%"],
    },
    minimum: 100_000,
    formula: "surety",
  },
  {
    id: "penjaminan_kredit",
    name: "Penjaminan Kredit",
    subtitle: "KMK, Kredit Investasi & KUR",
    icon: "💼",
    color: "#6B21A8",
    colorBg: "#F3EEF9",
    tarif: {
      "KMK <= 1 Tahun": [0.00300, "0,300%"],
      "KMK > 1 Tahun":  [0.00375, "0,375%"],
      "KI <= 3 Tahun":  [0.00350, "0,350%"],
      "KI > 3 Tahun":   [0.00425, "0,425%"],
    },
    minimum: 150_000,
    formula: "annual",
  },
];

/* ── STATE ── */
let curProd   = null;
let hist      = [];
let infoOpen  = false;

/* ── UTILS ── */
const fmtRp = n =>
  "Rp\u00a0" + Math.round(n).toLocaleString("id-ID");

const fmtShort = n =>
  n >= 1e9 ? "Rp\u00a0" + (n / 1e9).toFixed(2).replace(".", ",") + "\u00a0M"
  : n >= 1e6 ? "Rp\u00a0" + (n / 1e6).toFixed(2).replace(".", ",") + "\u00a0Jt"
  : fmtRp(n);

const parseNum = s =>
  parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;

const getNow = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const el = id => document.getElementById(id);

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
  [["fc1","fc2","fc3"], ["fc4","fc5","fc6"]].forEach(([i1,i2,i3]) => {
    el(i1).textContent = c;
    el(i2).textContent = r;
    el(i3).textContent = a;
  });
}

function fillInfoPanel() {
  el("ip1").textContent = CONTACT.pic_name;
  el("ip2").textContent = CONTACT.pic_telp;
  el("ip3").textContent = CONTACT.bank;
  el("ip4").textContent = CONTACT.rekening;
  el("ip5").textContent = CONTACT.an;
}

/* ── HERO LOADING ──
   kantor: CSS background → cek via Image()
   orang:  <img> tag     → listen ke event load/error pada elemen
*/
function initHero() {
  // Kantor: set background-image via JS agar path selalu relatif ke index.html
  const hoEl = el("ho");
  const kantor = new Image();
  kantor.onload = () => {
    hoEl.style.backgroundImage = `url('assets/kantor.png')`;
    hoEl.classList.add("vis");
  };
  kantor.onerror = () => {};
  kantor.src = "assets/kantor.png";

  // Orang: <img> tag, sudah punya src dari HTML
  const hp = el("hp");
  if (!hp) return;
  const show = () => hp.classList.add("vis");
  if (hp.complete && hp.naturalWidth > 0) {
    show();
  } else {
    hp.addEventListener("load",  show);
    hp.addEventListener("error", () => { hp.style.display = "none"; });
  }
}

/* ── PRODUCT GRID ── */
function buildProductGrid() {
  const grid = el("pgrid");
  PRODUCTS.forEach(p => {
    const card = document.createElement("div");
    card.className = "prod-card";
    card.onclick = () => openCalc(p);
    card.innerHTML = `
      <div class="prod-strip" style="background:${p.color}"></div>
      <div class="prod-body">
        <div class="prod-icon" style="background:${p.colorBg}">${p.icon}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-sub">${p.subtitle}</div>
        <div class="prod-min">Minimum: ${fmtRp(p.minimum)}</div>
      </div>
      <div class="prod-cta" style="background:${p.color}">Buka Kalkulator &nbsp;›</div>`;
    grid.appendChild(card);
  });
}

/* ── ROUTING ── */
function goWelcome() {
  el("sw").classList.add("active");
  el("sc").classList.remove("active");
  curProd = null; hist = []; infoOpen = false;
  el("ipanel").classList.remove("open");
  window.scrollTo(0, 0);
}

function openCalc(p) {
  curProd = p; hist = []; infoOpen = false;

  el("sw").classList.remove("active");
  el("sc").classList.add("active");

  // Warna aksen produk pada input focus
  document.documentElement.style.setProperty("--fc", p.color);

  // Badge
  const badge = el("cbadge");
  badge.style.background = p.colorBg;
  badge.style.color = p.color;
  badge.textContent = `${p.icon}  ${p.name.toUpperCase()}`;

  el("ctitle").textContent = `Kalkulator ${p.name}`;
  el("csub").textContent   = p.subtitle;

  // Tombol hitung
  el("btnhitung").style.background = p.color;

  // Tarif cards
  const trow = el("trow");
  trow.innerHTML = "";
  Object.entries(p.tarif).forEach(([jenis, [, pct]]) => {
    trow.insertAdjacentHTML("beforeend", `
      <div class="tarif-card" style="background:${p.colorBg};border-color:${p.color}">
        <div class="tarif-j">${jenis}</div>
        <div class="tarif-p" style="color:${p.color}">${pct}</div>
      </div>`);
  });

  // Dropdown opsi
  const sel = el("ijenis");
  sel.innerHTML = `<option value="">-- Pilih Jenis Jaminan --</option>`;
  Object.keys(p.tarif).forEach(k => {
    sel.insertAdjacentHTML("beforeend", `<option value="${k}">${k}</option>`);
  });

  // Reset form & zona output
  el("inilai").value = "";
  el("ijw").value    = "";
  el("hnilai").textContent = "";
  el("hjw").textContent    = "";
  el("rzone").innerHTML    = "";
  el("hzone").innerHTML    = "";
  el("ipanel").classList.remove("open");

  window.scrollTo(0, 0);
}

/* ── INFO TOGGLE ── */
function toggleInfo() {
  infoOpen = !infoOpen;
  el("ipanel").classList.toggle("open", infoOpen);
}

/* ── LIVE HINTS ── */
function onLive() {
  const nStr = el("inilai").value.trim();
  const jStr = el("ijw").value.trim();
  const hn   = el("hnilai");
  const hj   = el("hjw");

  // Nilai
  const nNum = parseNum(nStr);
  hn.textContent = (nNum > 0) ? "= " + fmtRp(nNum) : "";

  // Jangka waktu
  if (!curProd) { hj.textContent = ""; return; }
  const jNum = parseInt(jStr);
  if (!isNaN(jNum) && jNum > 0) {
    if (curProd.formula === "surety") {
      if (jNum <= 90) {
        hj.style.color = "var(--teal)";
        hj.textContent = "✓ ≤ 90 hari → rumus normal";
      } else {
        hj.style.color = "var(--gold)";
        hj.textContent = `~ > 90 hari → proporsional × ${(90 / jNum).toFixed(4)}`;
      }
    } else {
      hj.style.color = "var(--teal)";
      hj.textContent = `= ${(jNum / 365).toFixed(4)} tahun`;
    }
  } else {
    hj.textContent = "";
  }
}

/* ── HITUNG ── */
function showErr(msg) {
  el("rzone").innerHTML = `<div class="err-box">! ${msg}</div>`;
}

function hitung() {
  if (!curProd) return;
  const p = curProd;

  const jenis = el("ijenis").value.trim();
  if (!jenis || !p.tarif[jenis]) return showErr("Pilih jenis jaminan terlebih dahulu!");

  const nilai = parseNum(el("inilai").value.trim());
  if (!nilai || nilai <= 0) return showErr("Masukkan nilai jaminan yang valid!");

  const jw = parseInt(el("ijw").value.trim());
  if (!jw || jw <= 0) return showErr("Masukkan jangka waktu yang valid!");

  const [tarif] = p.tarif[jenis];
  let raw, isNormal;

  if (p.formula === "surety") {
    isNormal = jw <= 90;
    raw = isNormal ? nilai * tarif : nilai * (90 / jw) * tarif;
  } else {
    isNormal = true;
    raw = nilai * tarif * (jw / 365);
  }

  const isMin  = raw < p.minimum;
  const result = isMin ? p.minimum : raw;

  hist.unshift({ jenis, nilai, jw, tarif, result, raw, isMin, time: getNow() });
  if (hist.length > 10) hist.pop();

  renderResult(p, jenis, nilai, jw, tarif, raw, result, isMin, isNormal);
  renderHistory(p);
}

function renderResult(p, jenis, nilai, jw, tarif, raw, result, isMin, isNormal) {
  const boxBg  = isMin ? "var(--warn-bg)" : "var(--ok-bg)";
  const boxBr  = isMin ? "var(--warn-br)" : "var(--ok-br)";
  const amtClr = isMin ? "var(--gold)"    : "var(--green)";
  const lblClr = isMin ? "var(--warn-tx)" : "var(--ok-tx)";
  const resClr = amtClr;

  let pills = `
    <span class="pill" style="background:${p.colorBg};color:${p.color}">${jenis}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${fmtShort(nilai)}</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${jw} hari</span>
    <span class="pill" style="background:var(--pill);color:var(--text2)">${(tarif * 100).toFixed(3)}%</span>`;
  if (isMin) pills += `<span class="pill" style="background:#FEF3C7;color:var(--gold)">⚠ Nilai minimum</span>`;

  let formula = "";
  const pct = (tarif * 100).toFixed(3) + "%";

  if (p.formula === "surety") {
    if (isNormal) {
      formula = `
        <div class="fl">${fmtRp(nilai)} × ${pct}</div>
        <div class="fl bold" style="color:${resClr}">= ${fmtRp(raw)}</div>`;
    } else {
      formula = `
        <div class="fl">${fmtRp(nilai)} × (90 / ${jw}) × ${pct}</div>
        <div class="fl">${fmtRp(nilai)} × ${(90 / jw).toFixed(6)} × ${pct}</div>
        <div class="fl bold" style="color:${resClr}">= ${fmtRp(raw)}</div>`;
    }
  } else {
    formula = `
      <div class="fl">${fmtRp(nilai)} × ${pct} × (${jw} / 365)</div>
      <div class="fl">${fmtRp(nilai)} × ${pct} × ${(jw / 365).toFixed(6)}</div>
      <div class="fl bold" style="color:${resClr}">= ${fmtRp(raw)}</div>`;
  }

  if (isMin) {
    formula += `<div class="fl bold" style="color:var(--gold);margin-top:6px">
      Hasil hitung: ${fmtRp(raw)} → Minimum berlaku: ${fmtRp(p.minimum)}
    </div>`;
  } else {
    formula += `<div class="fl bold" style="color:var(--green)">= ${fmtRp(result)}</div>`;
  }

  const warn = isMin
    ? `<div class="warn-box">⚠ Hasil hitung (${fmtRp(raw)}) di bawah minimum — ditampilkan sebagai ${fmtRp(p.minimum)}</div>`
    : "";

  el("rzone").innerHTML = `
    <div class="r-box" style="background:${boxBg};border-color:${boxBr}">
      <div class="r-lbl" style="color:${lblClr}">HASIL PERHITUNGAN</div>
      <div class="r-amount" style="color:${amtClr}">${fmtRp(result)}</div>
      <div class="r-pills">${pills}</div>
      <div class="f-box">${formula}</div>
    </div>${warn}`;

  if (window.innerWidth <= 640) {
    setTimeout(() => el("rzone").scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }
}

/* ── HISTORY ── */
function renderHistory(p) {
  if (!hist.length) { el("hzone").innerHTML = ""; return; }
  let html = `
    <div class="hist-hdr">
      <span class="hist-ttl">RIWAYAT PERHITUNGAN</span>
      <button class="btn-hapus" onclick="clearHist()">Hapus Semua</button>
    </div>`;
  hist.forEach(h => {
    const c = h.isMin ? "var(--gold)" : "var(--green)";
    html += `
      <div class="hist-item">
        <div>
          <div class="h-jenis">${h.jenis}</div>
          <div class="h-detail">${fmtRp(h.nilai)} | ${h.jw} hari | ${(h.tarif * 100).toFixed(3)}% [${h.time}]</div>
        </div>
        <div class="h-amount" style="color:${c}">${fmtRp(h.result)}</div>
      </div>`;
  });
  el("hzone").innerHTML = html;
}

function clearHist() {
  hist = [];
  el("hzone").innerHTML = "";
}
