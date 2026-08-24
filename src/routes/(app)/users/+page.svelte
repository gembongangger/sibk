<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import { ROLE_STYLE } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let importOpen = $state(false);

	function openImport() {
		importOpen = true;
	}

	function emptyForm(u: PageData['editUser']) {
		return {
			id: u ? String(u.id) : '',
			nama: u?.nama ?? '',
			username: u?.username ?? '',
			role: u?.role ?? 'siswa',
			nis: u?.nis ?? '',
			kelas: u?.kelas ?? '',
			angkatan: u?.angkatan != null ? String(u.angkatan) : '',
			email: u?.email ?? '',
			telepon: u?.telepon ?? ''
		};
	}

	function isAktif(u: PageData['users'][number]): boolean {
		if (!data.angkatanDikonfigurasi) return true;
		return u.angkatan !== null && data.angkatanAktif.includes(u.angkatan);
	}

	// svelte-ignore state_referenced_locally -- initial value only; $effect below resyncs on data change
	let form = $state(emptyForm(data.editUser));
	let password = $state('');
	let formOpen = $state(false);
	let dlg: HTMLDialogElement | undefined = $state();
	let dlgImport: HTMLDialogElement | undefined = $state();

	$effect(() => {
		form = emptyForm(data.editUser);
		password = '';
	});

	// Form terbuka otomatis saat membuka ?edit={id}
	$effect(() => {
		if (data.editUser) {
			formOpen = true;
		}
	});

	// Form tertutup kembali setelah aksi berhasil (simpan/hapus/import)
	$effect(() => {
		if ($page.form?.success) {
			formOpen = false;
			importOpen = false;
		}
	});

	// Sinkronisasi state dengan elemen <dialog>
	$effect(() => {
		if (!dlg) return;
		if (formOpen && !dlg.open) {
			dlg.showModal();
			dlg.querySelector<HTMLInputElement>('#nama')?.focus();
		} else if (!formOpen && dlg.open) {
			dlg.close();
		}
	});

	// Sinkronisasi dialog import
	$effect(() => {
		if (!dlgImport) return;
		if (importOpen && !dlgImport.open) {
			dlgImport.showModal();
		} else if (!importOpen && dlgImport.open) {
			dlgImport.close();
		}
	});

	function onDialogClick(e: MouseEvent) {
		if (e.target === dlg) closeForm();
	}

	function onDialogClose() {
		formOpen = false;
		if (data.editUser) {
			void goto('/users', { replaceState: true });
		}
	}

	function onImportClick(e: MouseEvent) {
		if (e.target === dlgImport) importOpen = false;
	}

	function onImportClose() {
		importOpen = false;
	}

	async function openAddForm() {
		await goto('/users', { replaceState: true });
		form = emptyForm(null);
		password = '';
		formOpen = true;
	}

	function closeForm() {
		formOpen = false;
	}

	// svelte-ignore state_referenced_locally -- initial value only; re-initialized from URL on navigation
	let search = $state(data.q);

	function goPage(p: number) {
		const qp = new URLSearchParams();
		if (search.trim()) qp.set('q', search.trim());
		if (data.angkatan) qp.set('angkatan', String(data.angkatan));
		if (data.status) qp.set('status', data.status);
		if (p > 1) qp.set('page', String(p));
		const qs = qp.toString();
		goto('/users' + (qs ? '?' + qs : ''), { keepFocus: true, replaceState: true });
	}

	function pageList(): (number | '…')[] {
		const t = data.totalPages;
		if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
		const c = data.page;
		const set = new Set<number>([1, t, c - 1, c, c + 1]);
		const out: (number | '…')[] = [];
		let prev = 0;
		for (const n of [...set].filter((n) => n >= 1 && n <= t).sort((a, b) => a - b)) {
			if (prev && n - prev > 1) out.push('…');
			out.push(n);
			prev = n;
		}
		return out;
	}
</script>

<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
	<div>
		<h1 class="text-lg font-semibold text-slate-900">Manajemen Pengguna</h1>
		<p class="text-xs text-slate-600 mt-1">Kelola akun admin, guru BK, dan siswa.</p>
	</div>
	<div class="flex items-center gap-2">
		<button
			onclick={openImport}
			class="btn btn-outline-green"
		>
			Import Massal
		</button>
		<button onclick={openAddForm} class="btn btn-primary">
			Tambah Pengguna
		</button>
	</div>
</div>

{#if $page.form?.error}
	<Alert type="error">{$page.form.error}</Alert>
{/if}
{#if $page.form?.success}
	<Alert type="success">{$page.form.success}</Alert>
{/if}

<div class="card">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
			<h2 class="text-sm font-semibold text-slate-900">Daftar Pengguna</h2>
			<form method="GET" action="/users" class="flex flex-wrap items-center gap-2">
				<input
					type="search"
					name="q"
					value={data.q}
					placeholder="Cari nama, username, NIS, kelas…"
					class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs w-full md:w-56"
				/>
				<select name="angkatan" class="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white">
					<option value="">Semua angkatan</option>
					{#each data.angkatanOptions as a (a)}
						<option value={a} selected={a === data.angkatan}>{a}</option>
					{/each}
				</select>
				<select name="status" class="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white">
					<option value="">Semua status</option>
					<option value="aktif" selected={data.status === 'aktif'}>Aktif</option>
					<option value="nonaktif" selected={data.status === 'nonaktif'}>Non-aktif</option>
				</select>
				<button type="submit" class="btn btn-primary">
					Cari
				</button>
				{#if data.q || data.angkatan || data.status}
					<a href="/users" class="text-sm text-primary-700 hover:underline">Reset</a>
				{/if}
			</form>
		</div>
		<p class="text-sm text-slate-500 mb-3">
			Menampilkan {data.total === 0 ? 0 : (data.page - 1) * 10 + 1}–{Math.min(data.page * 10, data.total)} dari {data.total} pengguna
			{#if data.q} (hasil pencarian "{data.q}"){/if}
		</p>
			<details class="text-xs text-slate-600">
				<summary class="cursor-pointer text-primary-700">Tahun Angkatan Aktif</summary>
				<div class="mt-2 p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-2">
					<p>
						Siswa dengan angkatan yang tidak dicentang ditandai
						<span class="font-medium">Non-aktif</span> — hanya label dan filter, semua fitur tetap berjalan.
						{#if !data.angkatanDikonfigurasi}
							Belum pernah diatur: saat ini semua siswa dianggap <span class="font-medium">Aktif</span>.
						{/if}
					</p>
					<form method="POST" action="?/angkatan" class="space-y-2">
						{#if data.angkatanOptions.length === 0}
							<p class="text-sm text-slate-500">Belum ada data angkatan pada siswa. Isi kolom Angkatan saat menambah/mengubah siswa, atau lewat import massal.</p>
						{:else}
							<div class="flex flex-wrap gap-x-4 gap-y-1">
								{#each data.angkatanOptions as a (a)}
									<label class="inline-flex items-center gap-1.5">
										<input type="checkbox" name="tahun" value={a} checked={data.angkatanAktif.includes(a)} />
										<span>{a}</span>
									</label>
								{/each}
							</div>
						{/if}
						<div class="flex flex-wrap items-center gap-2">
							<input type="number" name="tahun_baru" min="1990" max="2100" placeholder="Tambah tahun lain…" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs w-44" />
							<button type="submit" class="btn btn-primary">
								Simpan Pengaturan
							</button>
						</div>
					</form>
				</div>
			</details>
		<div class="overflow-x-auto">
			<table class="data-table min-w-full text-xs">
				<thead>
					<tr class="border-b border-slate-100 text-slate-500">
						<th>Nama</th>
						<th>Username</th>
						<th>Peran</th>
						<th>Kelas/NIP</th>
						<th>Angkatan</th>
						<th>Status</th>
						<th>Kontak</th>
						<th class="py-2 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#if data.users.length === 0}
						<tr>
							<td colspan="8" class="py-6 text-center text-slate-500">
								Tidak ada pengguna ditemukan.
							</td>
						</tr>
					{/if}
					{#each data.users as u (u.id)}
						<tr class="border-b border-slate-50 hover:bg-slate-50">
							<td class="py-1.5">{u.nama}</td>
							<td class="py-1.5">{u.username}</td>
							<td class="py-1.5">
								<span class="inline-flex rounded-full px-2 py-0.5 text-sm font-medium {ROLE_STYLE[u.role] ?? 'bg-slate-50 text-slate-600'}">
									{u.role}
								</span>
							</td>
							<td class="text-slate-600">{u.kelas || u.nis || '-'}</td>
							<td class="text-slate-600">{u.role === 'siswa' ? (u.angkatan ?? '-') : '—'}</td>
							<td class="py-1.5">
								{#if u.role === 'siswa'}
									<span class="inline-flex rounded-full px-2 py-0.5 text-sm font-medium {isAktif(u) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
										{isAktif(u) ? 'Aktif' : 'Non-aktif'}
									</span>
								{:else}
									<span class="text-sm text-slate-400">—</span>
								{/if}
							</td>
							<td class="text-slate-600">{u.email || u.telepon || '-'}</td>
							<td class="text-right whitespace-nowrap">
								<a href="/users?edit={u.id}" class="text-xs text-primary-700 hover:underline mr-2">Ubah</a>
								{#if u.role === 'siswa'}
									<a href="/siswa/{u.id}" class="text-xs text-primary-700 hover:underline mr-2">Riwayat</a>
								{/if}
								{#if u.role !== 'admin'}
									<form method="POST" action="?/hapus" class="inline">
										<input type="hidden" name="id" value={u.id} />
										<button type="submit" class="text-xs text-rose-600 hover:underline" onclick={() => confirm('Hapus pengguna ini?')}>
											Hapus
										</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if data.totalPages > 1}
			<div class="flex items-center justify-between gap-3 mt-4">
				<button
					onclick={() => goPage(data.page - 1)}
					disabled={data.page <= 1}
					class="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					← Sebelumnya
				</button>
				<div class="flex items-center gap-1">
					{#each pageList() as p}
						{#if p === '…'}
							<span class="px-1 text-slate-400">…</span>
						{:else}
							<button
								onclick={() => goPage(p)}
								class="min-w-7 rounded-full px-2 py-1 text-sm font-medium {p === data.page
									? 'bg-primary-600 text-white'
									: 'border border-slate-200 text-slate-600 hover:bg-slate-50'}"
							>
								{p}
							</button>
						{/if}
					{/each}
				</div>
				<button
					onclick={() => goPage(data.page + 1)}
					disabled={data.page >= data.totalPages}
					class="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Berikutnya →
				</button>
			</div>
		{/if}
	</div>

	<dialog
		bind:this={dlg}
		class="m-auto w-[min(28rem,calc(100vw-2rem))] max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl [&::backdrop]:bg-slate-900/50 [&::backdrop]:backdrop-blur-sm"
		onclick={onDialogClick}
		onclose={onDialogClose}
	>
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-sm font-semibold text-slate-900">
					{data.editUser ? 'Ubah Pengguna' : 'Tambah Pengguna'}
				</h2>
				<button
					type="button"
					onclick={closeForm}
					class="text-slate-400 hover:text-slate-600 text-lg leading-none"
					aria-label="Tutup form"
				>
					&times;
				</button>
			</div>
		<form method="POST" action="?/simpan" class="space-y-2 text-xs" id="form-pengguna">
			<input type="hidden" name="id" value={form.id} />
			<div>
				<label for="nama" class="block mb-1 text-slate-600">Nama</label>
				<input id="nama" type="text" name="nama" bind:value={form.nama} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="username" class="block mb-1 text-slate-600">Username</label>
				<input id="username" type="text" name="username" bind:value={form.username} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="role" class="block mb-1 text-slate-600">Peran</label>
				<select id="role" name="role" bind:value={form.role} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
					<option value="admin">Admin</option>
					<option value="guru">Guru BK</option>
					<option value="siswa">Siswa</option>
				</select>
			</div>
			<div>
				<label for="nis" class="block mb-1 text-slate-600">NIS / NIP</label>
				<input id="nis" type="text" name="nis" bind:value={form.nis} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="kelas" class="block mb-1 text-slate-600">Kelas</label>
				<input id="kelas" type="text" name="kelas" bind:value={form.kelas} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" placeholder="contoh: X IPA 1" />
			</div>
			<div>
				<label for="angkatan" class="block mb-1 text-slate-600">Tahun Angkatan</label>
				<input id="angkatan" type="number" name="angkatan" bind:value={form.angkatan} min="1990" max="2100" class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" placeholder="contoh: 2024" />
			</div>
			<div>
				<label for="email" class="block mb-1 text-slate-600">Email</label>
				<input id="email" type="email" name="email" bind:value={form.email} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="telepon" class="block mb-1 text-slate-600">Telepon</label>
				<input id="telepon" type="text" name="telepon" bind:value={form.telepon} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="password" class="block mb-1 text-slate-600">Password {data.editUser ? '(kosongkan jika tidak diubah)' : ''}</label>
				<input id="password" type="password" name="password" bind:value={password} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div class="mt-2 flex gap-2">
				<button type="submit" class="flex-1 btn btn-primary">
					Simpan
				</button>
				<button type="button" onclick={closeForm} class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
					Batal
				</button>
			</div>
 			</form>
	</dialog>

	<dialog
		bind:this={dlgImport}
		class="m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl [&::backdrop]:bg-slate-900/50 [&::backdrop]:backdrop-blur-sm"
		onclick={onImportClick}
		onclose={onImportClose}
	>
		<div class="flex items-center justify-between mb-3">
			<h2 class="text-sm font-semibold text-slate-900">Import Data Massal (Excel)</h2>
			<button
				type="button"
				onclick={() => (importOpen = false)}
				class="text-slate-400 hover:text-slate-600 text-lg leading-none"
				aria-label="Tutup import"
			>
				&times;
			</button>
		</div>
		<div class="space-y-3 text-xs">
			<div class="flex flex-col md:flex-row md:items-center gap-2">
				<a
					href="/users/template.xlsx"
					download
					class="btn btn-primary"
				>
					Unduh Template Excel
				</a>
				<span class="text-sm text-slate-500">Template berisi judul kolom + 1 baris contoh dan sheet petunjuk.</span>
			</div>
			<form method="POST" action="?/import" enctype="multipart/form-data" class="space-y-2 p-3 border border-slate-100 rounded-xl bg-slate-50">
				<p class="text-sm font-semibold text-slate-700">Import dari Excel (.xlsx)</p>
				<input type="file" name="file" accept=".xlsx,.xls" class="text-xs" />
				<div>
					<button type="submit" class="btn btn-primary">
						Import Excel
					</button>
				</div>
			</form>
		</div>
	</dialog>
