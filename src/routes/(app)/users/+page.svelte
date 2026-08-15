<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import { ROLE_STYLE } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let importOpen = $state(false);

	async function openImport() {
		importOpen = true;
		await tick();
		document.getElementById('import-panel')?.scrollIntoView({ behavior: 'smooth' });
	}

	function emptyForm(u: PageData['editUser']) {
		return {
			id: u ? String(u.id) : '',
			nama: u?.nama ?? '',
			username: u?.username ?? '',
			role: u?.role ?? 'siswa',
			nis: u?.nis ?? '',
			kelas: u?.kelas ?? '',
			email: u?.email ?? '',
			telepon: u?.telepon ?? ''
		};
	}

	// svelte-ignore state_referenced_locally -- initial value only; $effect below resyncs on data change
	let form = $state(emptyForm(data.editUser));
	let password = $state('');

	$effect(() => {
		form = emptyForm(data.editUser);
		password = '';
	});

	async function resetForm() {
		await goto('/users', { replaceState: true });
		document.getElementById('form-pengguna')?.scrollIntoView({ behavior: 'smooth' });
	}

	// svelte-ignore state_referenced_locally -- initial value only; re-initialized from URL on navigation
	let search = $state(data.q);

	function goPage(p: number) {
		const qp = new URLSearchParams();
		if (search.trim()) qp.set('q', search.trim());
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
			class="inline-flex items-center rounded-full border border-primary-600 px-4 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50"
		>
			Import Massal
		</button>
		<button onclick={resetForm} class="inline-flex items-center rounded-full bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
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

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<div class="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 p-4">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
			<h2 class="text-sm font-semibold text-slate-900">Daftar Pengguna</h2>
			<form method="GET" action="/users" class="flex items-center gap-2">
				<input
					type="search"
					name="q"
					value={data.q}
					placeholder="Cari nama, username, NIS, kelas…"
					class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs w-full md:w-64"
				/>
				<button type="submit" class="inline-flex items-center rounded-full bg-primary-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-700">
					Cari
				</button>
				{#if data.q}
					<a href="/users" class="text-[11px] text-primary-700 hover:underline">Reset</a>
				{/if}
			</form>
		</div>
		<p class="text-[11px] text-slate-500 mb-3">
			Menampilkan {data.total === 0 ? 0 : (data.page - 1) * 10 + 1}–{Math.min(data.page * 10, data.total)} dari {data.total} pengguna
			{#if data.q} (hasil pencarian "{data.q}"){/if}
		</p>
			<details id="import-panel" bind:open={importOpen} class="text-xs text-slate-600">
				<summary class="cursor-pointer text-primary-700">Import Data Massal (CSV / Excel)</summary>
				<div class="mt-2 p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-3">
					<div class="flex flex-col md:flex-row md:items-center gap-2">
						<a
							href="/users/template.xlsx"
							download
							class="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-primary-700"
						>
							Unduh Template Excel
						</a>
						<span class="text-[11px] text-slate-500">Template berisi judul kolom + 1 baris contoh dan sheet petunjuk.</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<form method="POST" action="?/import" enctype="multipart/form-data" class="space-y-2">
							<p class="text-[11px] font-semibold text-slate-700">Import dari Excel (.xlsx)</p>
							<input type="file" name="file" accept=".xlsx,.xls" class="text-xs" />
							<button type="submit" class="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-primary-700">
								Import Excel
							</button>
						</form>
						<form method="POST" action="?/import" enctype="multipart/form-data" class="space-y-2">
							<p class="text-[11px] font-semibold text-slate-700">Import dari CSV (titik koma)</p>
							<input type="file" name="file" accept=".csv" class="text-xs" />
							<button type="submit" class="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-primary-700">
								Import CSV
							</button>
						</form>
					</div>
					<div class="text-[11px] text-slate-600">
						Format header CSV:
						<span class="font-mono bg-white border border-slate-200 rounded px-1">nama;username;role;nis;kelas;email;telepon;password</span>
						Kolom wajib: nama, username, role. Jika password kosong, diisi 123456. Username yang sudah terdaftar dilewati.
					</div>
				</div>
			</details>
		<div class="overflow-x-auto">
			<table class="min-w-full text-xs">
				<thead>
					<tr class="border-b border-slate-100 text-slate-500">
						<th class="py-2 text-left">Nama</th>
						<th class="py-2 text-left">Username</th>
						<th class="py-2 text-left">Peran</th>
						<th class="py-2 text-left">Kelas/NIP</th>
						<th class="py-2 text-left">Kontak</th>
						<th class="py-2 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#if data.users.length === 0}
						<tr>
							<td colspan="6" class="py-6 text-center text-slate-500">
								Tidak ada pengguna ditemukan.
							</td>
						</tr>
					{/if}
					{#each data.users as u (u.id)}
						<tr class="border-b border-slate-50 hover:bg-slate-50">
							<td class="py-1.5">{u.nama}</td>
							<td class="py-1.5">{u.username}</td>
							<td class="py-1.5">
								<span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium {ROLE_STYLE[u.role] ?? 'bg-slate-50 text-slate-600'}">
									{u.role}
								</span>
							</td>
							<td class="py-1.5 text-slate-600">{u.kelas || u.nis || '-'}</td>
							<td class="py-1.5 text-slate-600">{u.email || u.telepon || '-'}</td>
							<td class="py-1.5 text-right whitespace-nowrap">
								<a href="/users?edit={u.id}" class="text-xs text-primary-700 hover:underline mr-2">Ubah</a>
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
					class="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
								class="min-w-7 rounded-full px-2 py-1 text-[11px] font-medium {p === data.page
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
					class="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Berikutnya →
				</button>
			</div>
		{/if}
	</div>

	<div class="rounded-2xl bg-white shadow-sm border border-slate-100 p-4">
		<h2 class="text-sm font-semibold text-slate-900 mb-3">
			{data.editUser ? 'Ubah Pengguna' : 'Tambah Pengguna'}
		</h2>
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
			<button type="submit" class="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
				Simpan
			</button>
		</form>
	</div>
</div>
