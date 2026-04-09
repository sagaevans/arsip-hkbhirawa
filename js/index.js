/**
 * index.js — Logic homepage daftar dus
 */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadArsip, setMeta } = window.Arsip;
  setMeta();
  const grid     = document.getElementById("cards-grid");
  const sInput   = document.getElementById("s-input");
  const fTahun   = document.getElementById("f-tahun");
  const fC7      = document.getElementById("f-c7"); // [BARU] Inisialisasi elemen C7
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
    grid.innerHTML = list.map(d => `
      <a class="dus-card" href="dus.html?id=${d.id}">
        <div class="card-head">
          <span class="card-label">${hl(d.label, q)}</span>
          <span class="card-badge">${d.tahun}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${hl(d.keterangan, q)}</div>
          <div class="card-meta-r">📄 ${d.dokumen.length} dokumen</div>
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
    const c7Val = fC7.value; // [BARU] Ambil nilai dropdown C7

    const out = data.filter(d => {
      const thnOk = !thn || d.tahun === thn;
      const qOk   = !q   || [d.label, d.keterangan, d.tahun].join(" ").toLowerCase().includes(q);
      
      // [BARU] Logika Pengecekan C7
      let c7Ok = true;
      if (c7Val === "sudah") {
        c7Ok = d.c7 === true; // Tampilkan yang d.c7 bernilai true
      } else if (c7Val === "belum") {
        c7Ok = !d.c7;         // Tampilkan yang d.c7 bernilai false/undefined
      }

      return thnOk && qOk && c7Ok; // Gabungkan syarat C7 ke dalam return
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
    statDus.textContent = data.length;
    statDok.textContent = data.reduce((s, d) => s + d.dokumen.length, 0);
    const years = [...new Set(data.map(d => d.tahun))].sort().reverse();
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
  fC7.addEventListener("change", filter); // [BARU] Memicu filter saat C7 diganti
});
