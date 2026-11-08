const NOMOR_WA_PENJUAL = "6285794594558"; // Nomor WhatsApp Warjang

let keranjang = [];
const el = id => document.getElementById(id);
const rupiah = angka => "Rp" + angka.toLocaleString("id-ID");

function notifikasi(pesan) {
  const toast = el("toast");
  toast.textContent = pesan;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".add-cart").forEach(tombol => {
  tombol.addEventListener("click", () => {
    const nama = tombol.dataset.name;
    const harga = Number(tombol.dataset.price);
    const item = keranjang.find(x => x.nama === nama);
    if (item) item.jumlah++;
    else keranjang.push({ nama, harga, jumlah: 1 });
    tampilkanKeranjang();
    notifikasi(nama + " ditambahkan ke keranjang.");
  });
});

function totalHarga() {
  return keranjang.reduce((total, item) => total + item.harga * item.jumlah, 0);
}

function ubahJumlah(index, perubahan) {
  if (!keranjang[index]) return;
  keranjang[index].jumlah += perubahan;
  if (keranjang[index].jumlah <= 0) keranjang.splice(index, 1);
  tampilkanKeranjang();
}

function hapusItem(index) {
  keranjang.splice(index, 1);
  tampilkanKeranjang();
}

function tampilkanKeranjang() {
  const jumlahBarang = keranjang.reduce((total, item) => total + item.jumlah, 0);
  el("cartCount").textContent = jumlahBarang;
  el("cartTotal").textContent = rupiah(totalHarga());
  el("checkoutButton").disabled = keranjang.length === 0;
  el("checkoutTotal").textContent = rupiah(totalHarga());

  if (keranjang.length === 0) {
    el("cartItems").innerHTML = '<p class="empty-cart">Keranjang masih kosong. Silakan pilih menu.</p>';
    return;
  }

  el("cartItems").innerHTML = keranjang.map((item, index) => `
    <div class="cart-row">
      <div><strong>${item.nama}</strong><small>${rupiah(item.harga)} per item</small>
        <div class="qty-controls">
          <button type="button" onclick="ubahJumlah(${index},-1)">−</button>
          <span>${item.jumlah}</span>
          <button type="button" onclick="ubahJumlah(${index},1)">+</button>
        </div>
      </div>
      <div><strong>${rupiah(item.harga * item.jumlah)}</strong><br>
        <button class="remove-item" type="button" onclick="hapusItem(${index})">Hapus</button>
      </div>
    </div>`).join("");
}

function bukaKeranjang() {
  el("cartPanel").classList.add("show");
  el("overlay").classList.add("show");
}
function tutupKeranjang() {
  el("cartPanel").classList.remove("show");
  el("overlay").classList.remove("show");
}
el("openCart").addEventListener("click", bukaKeranjang);
el("closeCart").addEventListener("click", tutupKeranjang);
el("overlay").addEventListener("click", tutupKeranjang);

el("checkoutButton").addEventListener("click", () => {
  if (!keranjang.length) return;
  tutupKeranjang();
  el("checkoutTotal").textContent = rupiah(totalHarga());
  el("checkoutModal").classList.add("show");
});
el("closeCheckout").addEventListener("click", () => el("checkoutModal").classList.remove("show"));
el("checkoutModal").addEventListener("click", event => {
  if (event.target === el("checkoutModal")) el("checkoutModal").classList.remove("show");
});

el("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!keranjang.length) return;

  const data = new FormData(event.currentTarget);
  const namaPemesan = String(data.get("customerName")).trim();
  const catatan = String(data.get("customerNote")).trim();

  let pesan = "*PESANAN BARU - WARJANG HIHU*\n";
  pesan += "Nama: " + namaPemesan + "\n\n*Daftar pesanan:*\n";
  keranjang.forEach(item => {
    pesan += "- " + item.nama + " (" + item.jumlah + " x " + rupiah(item.harga) + ") = " + rupiah(item.harga * item.jumlah) + "\n";
  });
  pesan += "\n*TOTAL: " + rupiah(totalHarga()) + "*\n";
  if (catatan) pesan += "Catatan/alamat: " + catatan + "\n";
  pesan += "\nHalo Warjang, saya ingin memesan produk di atas. Mohon konfirmasi pesanan saya.";

  const link = "https://wa.me/" + NOMOR_WA_PENJUAL + "?text=" + encodeURIComponent(pesan);
  window.open(link, "_blank");

  // Keranjang dibiarkan tetap ada sampai penjual mengonfirmasi pesanan.
});

el("menuToggle").addEventListener("click", () => {
  el("navMenu").classList.toggle("open");
});
document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => el("navMenu").classList.remove("open"));
});

tampilkanKeranjang();
