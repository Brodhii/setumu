# Wisata Setumu Dompak — Ekowisata Kepulauan Riau

Website profil ekowisata modern dengan desain bertema senja pesisir pantai (*Sunset Coastal Theme*), menampilkan tata letak responsif, pembagian stylesheet modular, serta pemisahan (*decoupling*) antara frontend HTML statik dan backend API rating bertenaga PHP & SQLite.

---

## 📂 Struktur Proyek

```text
setumu-php/
├── index.html            # Halaman Beranda (Landing Page)
├── menu.html             # Halaman Daftar Menu Kuliner
├── galeri.html           # Halaman Galeri Foto & Lightbox
├── faq.html              # Halaman Pertanyaan yang Sering Diajukan (FAQ)
├── navbar.html           # Template Header Navigasi (Modular)
├── footer.html           # Template Footer Halaman (Modular)
├── css/
│   ├── style.css         # Gaya dasar global, variabel, resets, navbar & footer
│   ├── home.css          # Gaya khusus halaman Beranda (Hero, Layanan, Rating, Kontak)
│   ├── menu.css          # Gaya khusus halaman Menu Kuliner
│   ├── galeri.css        # Gaya khusus halaman Galeri & Lightbox
│   ├── faq.css           # Gaya khusus halaman FAQ & Accordion
│   └── responsive.css    # Layout responsif global / media queries
├── js/
│   ├── main.js           # Pemuat komponen modular, animasi scroll & highlight link aktif
│   └── validation.js     # Logika validasi form ulasan & interaksi AJAX ke API backend
├── api/
│   └── rating.php        # API Backend PHP untuk memproses rating & ulasan (GET & POST)
└── db/
    └── rating.db         # Database SQLite untuk menyimpan data ulasan pengunjung
```

---

## 🌟 Fitur Utama

1. **Desain Harmonis Tema Senja (Sunset Coastal)**:
   * Menggunakan skema warna HSL yang terkurasi dengan nuansa navy senja (`#0F1123`), magenta lembayung (`#692361`), dan oranye sunset (`#F95738`).
   * Menghilangkan visual yang kaku dengan memberikan bayangan (*shadow*) dan bingkai (*border*) bernuansa kemerahan/keunguan halus (`rgba(105, 35, 97, 0.06)`).

2. **Pemisahan Frontend & Backend (Decoupled API-First)**:
   * Seluruh tampilan utama berupa file `.html` statik murni tanpa campuran kode PHP.
   * Komunikasi data (menyimpan dan memuat ulasan) berjalan asinkron di latar belakang menggunakan `fetch()` AJAX ke server PHP.

3. **Pemuatan Komponen Modular**:
   * Komponen berulang seperti navigasi (`navbar.html`) dan footer (`footer.html`) dipisahkan ke root directory dan dimuat secara otomatis menggunakan Javascript. Memudahkan pemeliharaan kode tampilan.

4. **Carousel Ulasan Ringkas & Swipeable**:
   * Slider ulasan terbaru berukuran ringkas untuk menghemat ruang vertikal layar HP.
   * Mendukung navigasi sentuh (*finger-swipe*) responsif pada perangkat mobile dengan indikator scrollbar khusus yang elegan.

---

## 🛠️ Panduan Menjalankan Proyek

### Prasyarat
* Komputer telah terinstal **PHP** (versi 8.0 atau lebih tinggi recommended).
* Server lokal seperti Laragon, XAMPP, atau PHP CLI bawaan.

### Menjalankan secara Lokal dengan PHP CLI
1. Buka terminal/command prompt pada direktori proyek `setumu-php`.
2. Jalankan built-in PHP development server dengan perintah berikut:
   ```bash
   php -S localhost:8000
   ```
3. Buka browser Anda dan akses tautan berikut:
   ```text
   http://localhost:8000/
   ```

### Database SQLite
Data ulasan pengunjung akan otomatis tersimpan ke dalam file database SQLite lokal di folder `db/rating.db`. Tabel database akan dibuat secara otomatis pada pemanggilan API pertama kali.
