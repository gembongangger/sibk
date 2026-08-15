# Sistem BK MAN 1 Jember

Aplikasi **Sistem Bimbingan Konseling** berbasis web untuk MAN 1 Jember. Dibangun dengan **SvelteKit 2 + SQLite (better-sqlite3) + Tailwind CSS**, dirancang untuk mengelola permohonan konseling antara siswa, guru BK, dan admin.

## Fitur

- **Autentikasi & role** — login berbasis sesi cookie dengan 3 peran: `admin`, `guru` (guru BK), dan `siswa`.
- **Permohonan konseling** — siswa dapat mengajukan permohonan konseling, guru BK mengelola status (menunggu / dijadwalkan / selesai / ditolak).
- **Jadwal & sesi konseling** — penjadwalan pertemuan dan pencatatan sesi beserta tindak lanjut.
- **Feedback** — siswa memberikan rating (1–5) dan refleksi setelah sesi selesai.
- **Laporan** — rekap laporan konseling per periode beserta statistik feedback.
- **Manajemen pengguna** — kelola akun siswa/guru, pencarian, dan **import massal via CSV/Excel** (template tersedia).
- **Database otomatis** — database SQLite dibuat & dimigrasi otomatis saat pertama kali aplikasi dijalankan.

## Tech Stack

| Teknologi | Keterangan |
|---|---|
| [SvelteKit](https://kit.svelte.dev) | Framework web (SSR) |
| [Svelte](https://svelte.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Bahasa |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Database SQLite |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Hashing password |
| [ExcelJS](https://github.com/exceljs/exceljs) | Template & import Excel |

## Persyaratan

- [Node.js](https://nodejs.org) **20+** (disarankan LTS)
- npm (bundled bersama Node.js)

## Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/gembongangger/sibk.git
cd sibk

# 2. Install dependensi
npm install
```

## Menjalankan Aplikasi

### Mode development

```bash
npm run dev
```

Buka aplikasi di browser: <http://localhost:5173>

Database `data/bk.sqlite` akan dibuat otomatis saat pertama kali dijalankan, beserta akun admin default.

### Mode production

```bash
npm run build       # build produksi ke folder build/
npm run preview     # preview hasil build secara lokal
```

Untuk deployment Node.js, gunakan:

```bash
npm install && npm run build
node build/index.js
```

## Seed Akun Demo

Untuk mengisi data contoh (guru BK & siswa), jalankan:

```bash
npm run seed:demo
```

Kredensial akun demo ditulis ke file `demo-accounts.txt` di root proyek.

## Akun Demo

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Guru BK | `ahmad_yusuf` | `guru123` |
| Guru BK | `siti_nurhaliza` | `guru123` |
| Guru BK | `rahmad_hidayat` | `guru123` |
| Siswa | `ani_putri` | `siswa123` |
| Siswa | `bagas_prakoso` | `siswa123` |
| Siswa | `citra_dewi` | `siswa123` |
| Siswa | `dimas_aryo` | `siswa123` |
| Siswa | `erlina_sari` | `siswa123` |

> Admin dibuat otomatis oleh sistem pada saat pertama kali aplikasi dijalankan. Akun lain dibuat via `npm run seed:demo` atau menu Pengguna > Import di aplikasi.

## Struktur Proyek

```
.
├── scripts/
│   └── seed-demo.ts          # Seeder akun demo
├── src/
│   ├── hooks.server.ts       # Hook (pengambilan user dari sesi)
│   ├── lib/
│   │   ├── components/       # Komponen UI (Header, Alert, Stars, dll)
│   │   ├── server/
│   │   │   ├── auth.ts       # Manajemen sesi & hashing password
│   │   │   └── db.ts         # Koneksi SQLite, migrasi & query
│   │   └── utils.ts          # Fungsi pembantu
│   └── routes/
│       ├── login/            # Halaman login
│       ├── logout/           # Logout
│       └── (app)/
│           ├── +page.svelte  # Dashboard
│           ├── requests/     # Permohonan konseling
│           ├── sessions/     # Sesi konseling
│           ├── feedback/     # Feedback sesi
│           ├── reports/      # Laporan per periode
│           ├── users/        # Manajemen pengguna + import
│           └── profile/      # Profil pengguna
├── data/                     # Database SQLite (di-generate, tidak di-commit)
└── static/                   # Aset statis
```

## Skrip npm

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan server development (Vite) |
| `npm run build` | Build produksi |
| `npm run preview` | Preview hasil build |
| `npm run check` | Type-check (svelte-check) |
| `npm run check:watch` | Type-check berkelanjutan |
| `npm run seed:demo` | Mengisi akun demo ke database |

## Konfigurasi

- **`DATABASE_PATH`** — variabel lingkungan untuk mengganti lokasi file SQLite (default: `data/bk.sqlite`).
- **`.npmrc`** — berisi konfigurasi npm/registry proyek.

## Lisensi

Proyek ini bersifat privat. Hak cipta sesuai pemilik proyek.
