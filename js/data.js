/**
 * data.js — Shared loader & config
 * GitHub Pages: sagaevans/arsip-hkbhirawa
 */

const CONFIG = {
  NAMA:     "Arsip Akuntansi HK Bhirawa",
  SUB:      "Created By NasZ",
  BASE_URL: "https://sagaevans.github.io/arsip-hkbhirawa",
  DATA:     "data/arsip.json",
  LOGO:     "https://bhirawasteel.com/wp-content/uploads/2023/01/cropped-Logo-HK-Bhirawa-300x85-1.png"
};

let _cache = null;

async function loadArsip() {
  if (_cache) return _cache;
  const r = await fetch(CONFIG.DATA);
  if (!r.ok) throw new Error("Gagal memuat data/arsip.json");
  _cache = await r.json();
  return _cache;
}

function getByID(data, id) {
  return data.find(d => d.id === Number(id)) || null;
}

function urlDus(id) {
  return `${CONFIG.BASE_URL}/dus.html?id=${id}`;
}

function toast(msg, ico = "✓") {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>${ico}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function setMeta() {
  document.querySelectorAll("[data-nama]").forEach(el => el.textContent = CONFIG.NAMA);
  document.querySelectorAll("[data-sub]").forEach(el  => el.textContent = CONFIG.SUB);
  document.querySelectorAll("[data-logo]").forEach(el => {
    el.src = CONFIG.LOGO;
    el.onerror = () => el.style.display = "none";
  });
}

window.Arsip = { loadArsip, getByID, urlDus, toast, setMeta, CONFIG };
