
# TokoKU: Next.js + Google Sheets Product Management

Aplikasi web Next.js modern yang berfungsi sebagai dashboard manajemen produk (Admin Dashboard) dan katalog produk (Public Catalog). Data produk disimpan dan dikelola secara *headless* menggunakan **Google Sheets** sebagai database, dengan **Google Apps Script (GAS)** sebagai API backend untuk operasi CRUD.

## Fitur Utama

  * **Manajemen Produk (Admin Dashboard):**
      * CRUD (Create, Read, Update, Delete) produk.
      * Sistem pencarian dan filter kategori produk.
      * Preview gambar produk yang ada.
  * **Katalog Publik:** Menampilkan semua produk di halaman utama (`/`).
  * **Integrasi Google Workspace:** Menggunakan Google Sheets untuk penyimpanan data dan Google Drive untuk hosting gambar produk.
  * **Teknologi Modern:** Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, dan state management dengan TanStack Query.
  * **Image Upload:** Mengonversi gambar menjadi Base64 untuk dikirim ke GAS, yang kemudian mengunggahnya ke Google Drive dan menyimpan `fileId`.

## Tech Stack

  * **Frontend Framework:** Next.js 16.0.3 (App Router)
  * **Bahasa Pemrograman:** TypeScript, JavaScript
  * **Styling:** Tailwind CSS, PostCSS
  * **Data Fetching/State:** `@tanstack/react-query`
  * **Backend (API):** Google Apps Script (GAS)
  * **Database & File Storage:** Google Sheets & Google Drive

## Instalasi dan Setup

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal.

### 1\. Prasyarat

Pastikan Anda telah menginstal:

  * Node.js (Lihat `package.json` untuk versi yang didukung)
  * Manajer paket pilihan Anda (npm, yarn, pnpm, atau bun)

### 2\. Setup Proyek Lokal

```bash
# Clone repository
git clone <URL-REPO-ANDA>
cd toko

# Install dependencies
npm install # atau yarn, pnpm, bun
```

### 3\. Setup Google Apps Script (Backend)

Ini adalah langkah **KRITIS** untuk membuat backend API Anda.

1.  **Buat Google Sheet baru.** Beri nama misalnya `Data TokoKU`.
2.  Di Sheet ini, buat dua tab:
      * **Sheet1** (untuk data produk, dengan header: `id`, `name`, `category`, `price`, `stock`, `description`, `fileId`).
      * **Categories** (untuk data kategori, dengan header: `id`, `name`).
3.  Salin `SHEET_ID` dari URL Google Sheet Anda. (Contoh URL: `.../d/<SHEET_ID>/edit...`)
4.  Buka menu **Extensions \> Apps Script** di Google Sheet Anda.
5.  Salin seluruh kode dari file `BE` dan tempelkan ke editor Apps Script, ganti semua yang ada.
6.  **Konfigurasi Drive Folder:** Di baris pertama file Apps Script:
    ```javascript
    const FOLDER_DRIVE_ID = ""; // 💡 Ganti dengan ID folder Drive Anda
    ```
    Ganti `""` dengan ID folder Google Drive tempat Anda ingin menyimpan gambar produk.
7.  **Deploy sebagai Web App:**
      * Klik **Deploy** di kanan atas, lalu pilih **New Deployment**.
      * Pilih **Type** sebagai **Web App**.
      * **Execute as:** `Me` (Akun Anda).
      * **Who has access:** `Anyone`.
      * Klik **Deploy**.
      * Salin **Deployment ID** yang muncul (ini adalah URL API Anda).

### 4\. Konfigurasi Frontend

#### A. Konfigurasi Environment (`.env.local`)

Buat file baru bernama `.env.local` di root proyek dan tambahkan `SHEET_ID` dari langkah 3:

```env
# SHEET_ID digunakan oleh Katalog Publik (Server Component) untuk fetch data CSV.
SHEET_ID="<GANTI_DENGAN_SHEET_ID_ANDA>"
```

#### B. Konfigurasi API Gateway (`next.config.mjs`)

Buka `next.config.mjs` dan ganti URL `destination` di bagian `rewrites` dengan URL Deployment Apps Script (API) Anda dari langkah 3.

```javascript
// File: next.config.mjs

const nextConfig = {
    // ... konfigurasi lainnya
    async rewrites() {
        return [
            {
                source: "/api/gas/:path*",
                // GANTI URL INI dengan Deployment URL Apps Script Anda
                destination: "https://script.google.com/macros/s/<GANTI_INI>/exec",
            },
        ];
    },
};
// ...
```

## Menjalankan Aplikasi

Jalankan server development:

```bash
npm run dev
# atau
bun dev
```

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda.

### Halaman Penting

  * **Katalog Publik:** `http://localhost:3000` (Menggunakan data CSV langsung dari Sheet)
  * **Admin Dashboard:** `http://localhost:3000/adminpages` (Menggunakan API GAS untuk CRUD)

-----

*Catatan: Pastikan Apps Script Anda di-deploy dengan pengaturan **"Who has access: Anyone"** agar dapat diakses oleh aplikasi Next.js.*
