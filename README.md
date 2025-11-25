
````markdown
# TokoKU: Next.js + Google Sheets Product Management

Aplikasi web Next.js modern yang berfungsi sebagai dashboard manajemen produk (Admin Dashboard) dan katalog produk (Public Catalog). Data produk disimpan dan dikelola secara *headless* menggunakan **Google Sheets** sebagai database, dengan **Google Apps Script (GAS)** sebagai API backend untuk operasi CRUD (Create, Read, Update, Delete).

## Fitur Utama

* **Manajemen Produk (Admin Dashboard) (`/adminpages`):**
    * CRUD (Create, Read, Update, Delete) produk menggunakan **Google Apps Script (GAS)** API.
    * Sistem pencarian dan filter kategori produk.
    * Menampilkan daftar produk dengan status stok.
* **Katalog Publik (Landing Page) (`/`):**
    * Menampilkan semua produk untuk publik.
    * Mengambil data secara efisien menggunakan **Export CSV** dari Google Sheets.
* **Integrasi Google Workspace:** Menggunakan Google Sheets untuk penyimpanan data dan Google Drive untuk hosting gambar produk.
* **Teknologi Modern:** Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, dan state management dengan TanStack Query.
* **Image Upload:** Mengonversi gambar menjadi Base64 untuk dikirim ke GAS, yang kemudian mengunggahnya ke Google Drive dan menyimpan `fileId`.

## Struktur Data (Google Sheets)

Pastikan Google Sheet Anda memiliki dua tab dengan header sebagai berikut:

1.  **Sheet1 (Products):** `id`, `name`, `category`, `price`, `stock`, `description`, `fileId`
2.  **Categories:** `id`, `name`

## Perbaikan dan Catatan Kritis

Beberapa kode klien perlu penyesuaian untuk bekerja dengan benar, terutama terkait URL gambar dan konfigurasi Next.js:

### 1. URL Gambar Google Drive CDN (Kritis)

Pada file `src/components/admin/EditProduct.tsx` dan `src/app/adminpages/page.tsx`, format URL untuk menampilkan gambar yang di-upload ke Google Drive perlu disesuaikan dengan pola yang direkomendasikan Next.js dalam `next.config.mjs` (yaitu `lh3.googleusercontent.com`) dan pola Google Drive CDN.

| File | Baris (Perkiraan) | Masalah | Perbaikan yang Direkomendasikan |
| :--- | :--- | :--- | :--- |
| `src/components/admin/EditProduct.tsx` | 38 | Menggunakan `https://lh3.googleusercontent.com/u/0/d/${product.fileId}` | Ganti `1` dengan `0` dan ganti domain menjadi `https://lh3.googleusercontent.com/d/{product.fileId}` (sesuai best practice Next.js untuk Drive File). |
| `src/app/adminpages/page.tsx` | 76 | Menggunakan `https://lh3.googleusercontent.com/d/${p.fileId}=w128-h128` | Ganti domain menjadi `https://lh3.googleusercontent.com/d/{p.fileId}`. |
| `src/lib/google-sheets.js` | 31 | Menggunakan `https://lh3.googleusercontent.com/d/${row.img_drive_id}` | Ganti domain menjadi `https://lh3.googleusercontent.com/d/{row.img_drive_id}`. |

**Catatan:** Next.js merekomendasikan penggunaan `<Image />` dengan konfigurasi `remotePatterns` di `next.config.mjs`. Domain `lh3.googleusercontent.com` sudah diizinkan, sehingga mengganti domain di kode di atas dengan `https://lh3.googleusercontent.com/d/{fileId}` akan memastikan URL gambar bekerja dan diizinkan oleh Next.js.

### 2. URL Gambar di Komponen Publik

Pada file `src/components/ProductCard.js` (L3-9), komponen ini mengabaikan tag `<Image />` dari Next.js dan menggunakan tag `<img>` biasa. Hal ini dilakukan untuk menghindari pembatasan Next.js Image Component, namun mengorbankan optimasi gambar.

```javascript
// src/components/ProductCard.js - Current implementation
            {/* Gambar tanpa <Image /> supaya tidak diblock Next.js */}
            <div className="w-full overflow-hidden rounded-t-lg">
                <img
                    src={product.img_url} // Menggunakan URL yang di-generate di google-sheets.js
                    alt={product.name}
                    className="w-full h-60 object-cover"
                />
            </div>
````

Untuk mengaktifkan Next.js Image Optimization, Anda harus menggunakan `<Image />` dan memastikan semua URL gambarnya diizinkan di `next.config.mjs`. Implementasi saat ini (menggunakan `<img>`) sudah menghindari *block* Next.js, tetapi URL di `src/lib/google-sheets.js` perlu disesuaikan (lihat poin 1).

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

2.  Di Sheet ini, buat dua tab: **Sheet1** dan **Categories**. Tambahkan header sesuai bagian "Struktur Data" di atas.

3.  Salin `SHEET_ID` dari URL Google Sheet Anda.

4.  Buka menu **Extensions \> Apps Script** di Google Sheet Anda.

5.  Salin seluruh kode dari file **`BE.gs`** dan tempelkan ke editor Apps Script.

6.  **Konfigurasi Kritis:** Di baris pertama file Apps Script (`BE.gs`), ganti ID Spreadsheet dan ID Folder Drive:

    ```javascript
    const SPREADSHEET_ID = "<GANTI_DENGAN_SHEET_ID_ANDA>"; 
    const FOLDER_DRIVE_ID = "<GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA>"; //
    ```

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

Buka `next.config.mjs` dan ganti URL `destination` di bagian `rewrites` dengan URL Deployment Apps Script (API) Anda dari langkah 3:

```javascript
// File: next.config.mjs

const nextConfig = {
    images: { /* ... */ },
    async rewrites() {
        return [
            {
                source: "/api/gas/:path*",
                // GANTI URL INI dengan Deployment URL Apps Script Anda
                destination: "[https://script.google.com/macros/s/](https://script.google.com/macros/s/)<GANTI_INI>/exec",
            },
        ];
    },
};

export default nextConfig;
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

*Catatan: Pastikan Apps Script Anda di-deploy dengan pengaturan **"Who has access: Anyone"** agar dapat diakses oleh aplikasi Next.js. Jangan lupa melakukan penyesuaian URL gambar seperti yang direkomendasikan di bagian "Perbaikan dan Catatan Kritis" untuk memastikan semua gambar tampil dengan benar.*

```
```
