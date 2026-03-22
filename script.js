let dataProduk = [];
let kategoriSekarang = "semua";
let produkTerpilih = {};
let hargaDasar = 0;
let totalFinal = 0;

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function renderKatalog(produkUntukDitampilkan) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    produkUntukDitampilkan.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        const hJual = p.harga_jual || p.harga_asli;
        const hCoret = (p.harga_jual && p.harga_asli > p.harga_jual) ? 
            `<span class="harga-coret">${formatRupiah(p.harga_asli)}</span>` : '';
        
        const cleanSku = p.sku.trim();
        const isSupported = /NRA-|TNZ-|ERG-|DKI-|HMN-|KRN-|CAM-|STU-/.test(cleanSku);
        
        const imgUrl = isSupported 
            ? `https://media.dekoruma.com/catalogue/${cleanSku}.jpg?auto=webp&width=600` 
            : 'https://via.placeholder.com/400';
        
        card.innerHTML = `
            <div class="clickable-area" onclick="bukaDetail('${p.sku}')">
                <img src="${imgUrl}" alt="${p.nama}">
                <div class="product-info">
                    <h3>${p.nama}</h3>
                    <p class="price-tag">${hCoret}${formatRupiah(hJual)}</p>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn-share" onclick="shareProduk('${p.sku}', '${p.nama}')">🔗 Share</button>
                <button class="btn-wa" onclick="bukaForm('${p.nama}', '${p.sku}', ${hJual})">PESAN</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function bukaDetail(sku) {
    const p = dataProduk.find(item => item.sku === sku);
    if (!p) return;
    const modal = document.getElementById('modalDetail');
    const konten = document.getElementById('kontenDetail');
    const hJual = p.harga_jual || p.harga_asli;

    const cleanSku = p.sku.trim();
    const isSupported = /NRA-|TNZ-|ERG-|DKI-|HMN-|KRN-|CAM-|STU-/.test(cleanSku);

    const imgUrl = isSupported 
        ? `https://media.dekoruma.com/catalogue/${cleanSku}.jpg?auto=webp&width=800` 
        : 'https://via.placeholder.com/400';

    konten.innerHTML = `
        <img src="${imgUrl}" class="detail-img">
        <div class="detail-body">
            <h2>${p.nama}</h2>
            <p class="detail-price">${formatRupiah(hJual)}</p>
            <p style="font-size: 0.7rem; color: #bc6c25; margin-bottom: 10px;">* Stok berjalan, admin akan konfirmasi ketersediaan saat pesanan masuk.</p>
            <div class="spec-list">
                <div class="spec-item"><strong>SKU:</strong> <span>${p.sku}</span></div>
                <div class="spec-item"><strong>Dimensi:</strong> <span>${p.dimensi || '-'} cm</span></div>
                <div class="spec-item"><strong>Material:</strong> <span>${p.material || 'Standar Japandi'}</span></div>
            </div>
            <button class="btn-wa-full" onclick="tutupDetail(); bukaForm('${p.nama}', '${p.sku}', ${hJual})">PESAN SEKARANG</button>
        </div>
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function kirimPemesanan() {
    const f = (id) => document.getElementById(id).value;
    if(!f('fNama') || !f('fHp')) return alert("Mohon lengkapi Nama dan WhatsApp!");

    const msg = `*--- INVOICE PESANAN (CEK STOK) ---*
*Produk:* ${produkTerpilih.nama}
*SKU:* ${produkTerpilih.sku}
---------------------------------------
*Nama:* ${f('fNama')}
*Email:* ${f('fEmail')}
*WhatsApp:* ${f('fHp')}
*Alamat:* ${f('fAlamat')}
---------------------------------------
*Pengiriman:* ${f('fPengiriman').toUpperCase()}
*Perakitan:* ${f('fRakit') === 'ya' ? 'YA' : 'TIDAK'}

*ESTIMASI TOTAL: ${formatRupiah(totalFinal)}*
---------------------------------------
_Halo Kak Rama, saya ingin memesan produk di atas. Mohon bantu cek ketersediaan stoknya ya._
_Terima kasih!_`;

    window.open(`https://wa.me/6285393620791?text=${encodeURIComponent(msg)}`, '_blank');
}

function hitungOtomatis() {
    const kirim = document.getElementById('fPengiriman').value;
    const rakit = document.getElementById('fRakit').value;
    const ketKirim = document.getElementById('ketPengiriman');
    const optRakit = document.getElementById('optRakit');
    let ongkir = 0, biayaRakit = 0;
    ketKirim.innerText = kirim === 'instan' ? "Sampai dalam 2-4 hari kerja" : "Sampai dalam 7-10 hari kerja";
    if (hargaDasar >= 4000000) {
        optRakit.innerText = "Gratis Rakit";
        ongkir = (kirim === 'instan') ? 50000 : 0;
    } else {
        optRakit.innerText = "Jasa Rakit (Rp 170.000)";
        biayaRakit = (rakit === 'ya') ? 170000 : 0;
        ongkir = (kirim === 'instan') ? 150000 : 0;
    }
    totalFinal = hargaDasar + ongkir + biayaRakit;
    document.getElementById('tampilanTotal').innerText = `Total: ${formatRupiah(totalFinal)}`;
}

function bukaForm(n, s, harga) { 
    produkTerpilih = {nama: n, sku: s}; 
    hargaDasar = harga;
    document.getElementById('namaProdukTerpilih').innerText = `Produk: ${n}`;
    document.getElementById('modalForm').style.display = 'flex'; 
    hitungOtomatis();
}

function tutupModalForm() { document.getElementById('modalForm').style.display = 'none'; }
function tutupDetail() { document.getElementById('modalDetail').style.display = 'none'; document.body.style.overflow = 'auto'; }
function bukaMenuBurger() { document.getElementById('modalMenu').style.display = 'flex'; }
function tutupMenu() { document.getElementById('modalMenu').style.display = 'none'; }

function filterKategori(kat, btn) {
    kategoriSekarang = kat;
    // Menghapus kelas 'active' dari semua tombol kategori (baik yang di menu atau di desktop)
    document.querySelectorAll('.cat-item-large, .menu-item-list button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    tutupMenu();
    jalankanFilter();
}

function jalankanFilter() {
    const k = document.getElementById('searchInput').value.toLowerCase();
    const s = document.getElementById('sortOrder').value;
    
    let hasil = dataProduk.filter(p => {
        const namaProduk = p.nama.toLowerCase();
        const pencarianNama = namaProduk.includes(k);
        
        // UPDATE LOGIKA FILTER: Cek kolom kategori ATAU cek apakah Nama mengandung kata kategori
        let filterKategori = true;
        if (kategoriSekarang !== "semua") {
            const kat = kategoriSekarang.toLowerCase();
            // Akan lolos jika p.kategori cocok ATAU nama produk mengandung kata tsb (misal: "Sofa")
            filterKategori = (p.kategori === kategoriSekarang) || namaProduk.includes(kat);
        }
        
        return pencarianNama && filterKategori;
    });

    if (s === 'low') hasil.sort((a, b) => (a.harga_jual || a.harga_asli) - (b.harga_jual || b.harga_asli));
    else if (s === 'high') hasil.sort((a, b) => (b.harga_jual || b.harga_asli) - (a.harga_jual || a.harga_asli));
    
    renderKatalog(hasil);
}

function shareProduk(sku, nama) {
    const url = `${window.location.origin}${window.location.pathname}#${sku}`;
    navigator.clipboard.writeText(url);
    alert("Link disalin!");
}

async function init() {
    try {
        const res = await fetch('data.json');
        dataProduk = await res.json();
        renderKatalog(dataProduk);
    } catch (e) { console.error(e); }
    document.getElementById('searchInput').oninput = jalankanFilter;
    document.getElementById('sortOrder').onchange = jalankanFilter;
}
init();

