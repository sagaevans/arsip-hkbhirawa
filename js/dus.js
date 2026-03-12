/**
 * dus.js — Logic halaman detail dus + QR code
 */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadArsip, getByID, urlDus, setMeta, CONFIG } = window.Arsip;
  setMeta();

  const params = new URLSearchParams(window.location.search);
  const id     = params.get("id");

  const elNum    = document.getElementById("d-num");
  const elTitle  = document.getElementById("d-title");
  const elTahun  = document.getElementById("d-tahun");
  const elTotal  = document.getElementById("d-total");
  const elBody   = document.getElementById("doc-body");
  const elCount  = document.getElementById("doc-count");
  const elSearch = document.getElementById("doc-search");
  const elPrev   = document.getElementById("nav-prev");
  const elNext   = document.getElementById("nav-next");
  const elQR     = document.getElementById("qr-render");

  let dus = null;
  let all = [];

  function hl(str, q) {
    if (!q) return String(str);
    return String(str).replace(
      new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi"),
      "<mark>$1</mark>"
    );
  }

  function renderTable(list, q = "") {
    if (!list.length) {
      elBody.innerHTML = `<tr><td colspan="2" style="text-align:center;padding:36px;color:var(--muted)">Tidak ada dokumen yang cocok</td></tr>`;
      return;
    }
    elBody.innerHTML = list.map(d => `
      <tr>
        <td class="td-no">${d.no}</td>
        <td class="td-nama">${hl(d.nama, q)}</td>
      </tr>`).join("");
  }

  function filterDocs() {
    if (!dus) return;
    const q = elSearch.value.trim().toLowerCase();
    const r = q ? dus.dokumen.filter(d => d.nama.toLowerCase().includes(q)) : dus.dokumen;
    elCount.textContent = `${r.length} dokumen`;
    renderTable(r, q);
  }

  function generateQR(url) {
    if (!elQR) return;
    elQR.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      new QRCode(elQR, {
        text: url,
        width: 200, height: 200,
        colorDark: "#0f1f3d",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  function setupNav(idx) {
    const prev = all[idx - 1];
    const next = all[idx + 1];
    if (elPrev) {
      if (prev) { elPrev.href = `dus.html?id=${prev.id}`; elPrev.textContent = `← ${prev.label}`; }
      else elPrev.style.visibility = "hidden";
    }
    if (elNext) {
      if (next) { elNext.href = `dus.html?id=${next.id}`; elNext.textContent = `${next.label} →`; }
      else elNext.style.visibility = "hidden";
    }
  }

  if (!id) {
    document.body.innerHTML = `<div style="padding:80px;text-align:center"><h2>ID tidak ditemukan</h2><br><a href="index.html">← Beranda</a></div>`;
    return;
  }

  try {
    all = await loadArsip();
    dus = getByID(all, id);

    if (!dus) {
      document.body.innerHTML = `<div style="padding:80px;text-align:center"><h2>Dus #${id} tidak ditemukan</h2><br><a href="index.html">← Beranda</a></div>`;
      return;
    }

    document.title = `${dus.label} – ${CONFIG.NAMA}`;
    if (elNum)   elNum.textContent   = dus.label;
    if (elTitle) elTitle.textContent = dus.keterangan;
    if (elTahun) elTahun.textContent = dus.tahun;
    if (elTotal) elTotal.textContent = `${dus.dokumen.length} Dokumen`;
    if (elCount) elCount.textContent = `${dus.dokumen.length} dokumen`;

    // Badge No Dus + Tahun
    const badgeLabel  = document.getElementById("badge-label");
    const badgeNumBig = document.getElementById("badge-num-big");
    const badgeTahun  = document.getElementById("badge-tahun");
    if (badgeLabel)  badgeLabel.textContent  = dus.no_dus;
    if (badgeNumBig) badgeNumBig.textContent = dus.no_dus;
    if (badgeTahun)  badgeTahun.textContent  = dus.tahun;

    renderTable(dus.dokumen);
    setupNav(all.findIndex(d => d.id === dus.id));

    const url = urlDus(id);
    if (typeof QRCode !== "undefined") {
      generateQR(url);
    } else {
      setTimeout(() => generateQR(url), 800);
    }

  } catch(e) {
    console.error(e);
  }

  elSearch?.addEventListener("input", filterDocs);
});
