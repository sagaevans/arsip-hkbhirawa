/**
 * index.js — Logic homepage daftar dus
 */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadArsip, setMeta } = window.Arsip;
  setMeta();
  const grid     = document.getElementById("cards-grid");
  const sInput   = document.getElementById("s-input");
  const fTahun   = document.getElementById("f-tahun");
  const fC7      = document.getElementById("f-c7");
  const statDus  = document.getElementById("stat-dus");
  const statDok  = document.getElementById("stat-dok");
  const resLbl   = document.getElementById("result-lbl");
  let data = [];

  function hl(str, q) {
    if (!q) return String(str);
    return String(str).replace(
      new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi"),
      "<mark>$1</mark>"
    );
  }

  function render(list, q = "") {
    if (!list.length) {
      grid.innerHTML = `<div class="empty">
        <div class="empty-ico">🗂️</div>
        <div class="empty-ttl">Tidak ada hasil</div>
        <p>Coba ubah kata kunci atau filter tahun</p>
      </div>`;
      return;
    }
    
    grid.innerHTML = list.map((d, index) => `
      <a class="dus-card" href="dus.html?id=${d.id}" style="position: relative; overflow: hidden;">
        <div class="card-head">
          <span class="card-label">${hl(d.label, q)}</span>
          <span class="card-badge">${d.tahun}</span>
        </div>
        <div class="card-body" style="padding-right: 50px;">
          <div class="card-title">${hl(d.keterangan, q)}</div>
          <div class="card-meta-r">📄 ${d.dokumen.length} dokumen</div>
          
          <div style="position: absolute; right: 20px; top: 42%; font-size: 3rem; font-weight: 900; color: #000000; pointer-events: none; line-height: 1;">
            ${index + 1}
          </div>
          
        </div>
        <div class="card-foot">
          <div class="dok-count"><strong>${d.dokumen.length}</strong> dok</div>
          ${d.c7 ? `<div class="c7-badge">✓ C7</div>` : `<div></div>`}
          <div class="view-arrow">Lihat Rincian →</div>
        </div>
      </a>`).join("");
  }

  function filter() {
    const q     = sInput.value.trim().toLowerCase();
    const thn   = fTahun.value;
    const c7Val = fC7.value;

    const out = data.filter(d => {
      const thnOk = !thn || d.tahun === thn;
      const qOk   = !q   || [d.label, d.keterangan, d.tahun].join(" ").toLowerCase().includes(q);
      
      let c7Ok = true;
      if (c7Val === "sudah") {
        c7Ok = d.c7 === true;
      } else if (c7Val === "belum") {
        c7Ok = !d.c7;
      }

      return thnOk && qOk && c7Ok;
    });
    
    resLbl.textContent = `${out.length} dari ${data.length} dus`;
    render(out, q);
  }

  // Skeleton
  grid.innerHTML = Array(6).fill(`
    <div style="background:white;border:1px solid var(--border);border-radius:8px;overflow:hidden">
      <div style="background:var(--cream-dark);height:52px"></div>
      <div style="padding:16px 18px;display:flex;flex-direction:column;gap:9px">
        <div style="background:var(--cream-dark);height:14px;width:55%;border-radius:3px"></div>
        <div style="background:var(--cream-dark);height:14px;width:80%;border-radius:3px"></div>
      </div>
    </div>`).join("");

  try {
    data = await loadArsip();
    
    // --- LOGIKA SORTING TAHUN (Terlama -> Terbaru) ---
    function sortTahun(a, b) {
      let strA = String(a || "").trim().toLowerCase();
      let strB = String(b || "").trim().toLowerCase();
      
      // Jika tahun kurang dari 4 digit (misal "1" atau "00"), lempar ke paling bawah
      let isInvalidA = strA.length < 4;
      let isInvalidB = strB.length < 4;
      
      if (isInvalidA && !isInvalidB) return 1;
      if (!isInvalidA && isInvalidB) return -1;
      
      // Sorting Ascending (dari yang terkecil/terlama ke terbesar/terbaru)
      if (strA < strB) return -1;
      if (strA > strB) return 1;
      return 0;
    }

    // Terapkan ke kartu arsip
    data.sort((a, b) => sortTahun(a.tahun, b.tahun));
    // ------------------------------------------------

    statDus.textContent = data.length;
    statDok.textContent = data.reduce((s, d) => s + d.dokumen.length, 0);
    
    // Terapkan ke dropdown menu
    const years = [...new Set(data.map(d => d.tahun))].sort(sortTahun);
    
    fTahun.innerHTML = `<option value="">Semua Tahun</option>`
      + years.map(y => `<option value="${y}">${y}</option>`).join("");
      
    filter();
  } catch {
    grid.innerHTML = `<div class="empty">
      <div class="empty-ico">⚠️</div>
      <div class="empty-ttl">Gagal memuat data</div>
    </div>`;
  }

  sInput.addEventListener("input", filter);
  fTahun.addEventListener("change", filter);
  fC7.addEventListener("change", filter);
});
