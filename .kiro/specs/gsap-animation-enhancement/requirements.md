# Requirements Document: GSAP Animation Enhancement (Full Migration)

## Introduction

Portfolio app saat ini memakai library `motion` (Motion One v12) untuk seluruh animasi public site (home, portfolio, blog, gallery, navbar, page transitions). Animasi yang dihasilkan terbatas pada tween dasar (opacity, transform, easing array bezier) dan beberapa custom RAF loop di counter/chart. Tampilan masih kurang ekspresif, tidak ada per-character text reveal di hero, hover transition tidak smooth karena re-create tween setiap event, dan ada bug di `src/routes/(public)/+page.svelte` berupa tiga blok `onMount` duplikat yang saling override.

Fitur ini melakukan **migrasi penuh** dari `motion` ke **GSAP 3.13+** (yang sejak versi 3.13 membebaskan seluruh plugin termasuk SplitText, ScrollSmoother, Flip, MorphSVG di bawah lisensi standar). Tujuannya:

1. **Visual upgrade** — animasi lebih halus, ekspresif, dan terkontrol dengan timeline-based orchestration, per-character SplitText pada hero, dan stagger yang lebih ekspresif.
2. **API stability** — public API Svelte actions (`reveal`, `revealStagger`, `hoverLift`, `hoverBorder`, `counter`, `animateBars`, `animateProgress`) tetap stabil sehingga seluruh call site di komponen tidak perlu diubah selain re-import.
3. **Bug fix** — konsolidasi 3 `onMount` duplikat di home page menjadi satu `gsap.timeline()` yang dikelola via `gsap.context()`.
4. **Performance** — singleton lazy loader (idempotent terhadap HMR), `quickTo` untuk hover (zero-allocation), `gsap.context()` untuk cleanup massal, mempertahankan View Transitions API native untuk page transitions.
5. **Accessibility** — tetap honor `prefers-reduced-motion` di seluruh permukaan animasi.

Marquee tech logo tetap CSS keyframe (out of scope untuk migrasi). Page transitions tetap menggunakan View Transitions API native dengan GSAP fallback untuk browser yang tidak support.

## Glossary

- **GSAP**: GreenSock Animation Platform, library animasi JavaScript yang sejak v3.13 sepenuhnya gratis termasuk plugin premium-nya.
- **ScrollTrigger**: plugin GSAP untuk reveal-on-scroll, scrub, sticky behavior.
- **SplitText**: plugin GSAP untuk split text element menjadi karakter/kata/baris yang dapat dianimasikan individual.
- **`gsap.context()`**: mekanisme GSAP untuk mengelompokkan tween/ScrollTrigger sehingga dapat di-cleanup massal via `ctx.revert()`.
- **`quickTo`**: high-performance setter GSAP yang menghindari pembuatan tween baru per event (zero-allocation hover path).
- **`shouldAnimate()`**: helper yang mengembalikan `false` jika user mengaktifkan `prefers-reduced-motion: reduce` atau di SSR.
- **View Transitions API**: API native browser (`document.startViewTransition`) untuk transisi DOM antar route.
- **Svelte Action**: function `(node, params) => { destroy }` yang attach ke element via `use:actionName`.
- **HMR**: Hot Module Replacement (Vite dev server hot reload).
- **SSR**: Server-Side Rendering (SvelteKit pre-render di server).
- **Reduced-motion**: setting OS yang meminta minimisasi animasi.
- **Plugin registration**: `gsap.registerPlugin(...)` yang harus dipanggil tepat sekali per process lifecycle.
- **Idempotent**: operasi yang menghasilkan hasil sama meskipun dipanggil berulang.

## Requirements

### Requirement 1: GSAP Singleton Loader

**Objective:** As an engineer, I want satu lazy loader idempotent untuk GSAP core + plugin, so that import GSAP tidak duplikat di SSR/HMR dan plugin teregister tepat sekali.

#### Acceptance Criteria

1. WHEN file `src/lib/utils/gsap-client.ts` diimpor secara statis dari modul lain THEN sistem SHALL tidak mengeksekusi side effect berat (tidak meng-import gsap di module scope).
2. WHEN `loadGsap()` dipanggil di environment server (`typeof window === 'undefined'`) THEN sistem SHALL mengembalikan `Promise<null>` tanpa men-trigger dynamic import.
3. WHEN `loadGsap()` dipanggil pertama kali di browser THEN sistem SHALL melakukan `Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')])` dan memanggil `gsap.registerPlugin(ScrollTrigger, SplitText)` tepat satu kali.
4. WHEN `loadGsap()` dipanggil ke-N kali (N > 1) di browser THEN sistem SHALL mengembalikan referensi promise yang **identik** (`===`) dengan panggilan pertama, tanpa pemanggilan `gsap.registerPlugin` tambahan.
5. WHEN `loadGsap()` resolve sukses THEN sistem SHALL mengembalikan object `{ gsap, ScrollTrigger, SplitText }` yang ketiganya `!== undefined`.
6. WHEN `isGsapLoaded()` dipanggil sebelum `loadGsap()` resolve sukses THEN sistem SHALL mengembalikan `false`.
7. WHEN `isGsapLoaded()` dipanggil setelah `loadGsap()` resolve sukses THEN sistem SHALL mengembalikan `true`.
8. WHEN Vite HMR menjalankan ulang module `gsap-client.ts` THEN sistem SHALL tidak menyebabkan `gsap.registerPlugin` dipanggil lebih dari satu kali per browser tab session (gunakan `import.meta.hot` guard atau persisten module-scope state via `globalThis`).
9. WHEN `import('gsap')` reject (network error, chunk load failure) THEN `loadGsap()` SHALL re-throw error ke caller (tidak swallow), dan `isGsapLoaded()` tetap `false`.

### Requirement 2: Animation Tokens & Helpers

**Objective:** As an engineer, I want konstanta animasi (DURATION, EASE, STAGGER) dan helper (`shouldAnimate`, `supportsViewTransitions`) yang GSAP-flavored dan SSR-safe, so that semua action/komponen punya satu sumber tokens yang konsisten.

#### Acceptance Criteria

1. WHEN modul `src/lib/utils/animation.ts` diimpor THEN sistem SHALL mengekspor konstanta `DURATION` dengan field `fast`, `normal`, `slow`, `verySlow` bertipe number (detik, bukan ms).
2. WHEN `EASE` diekspor THEN sistem SHALL mengekspor object dengan field minimum `out`, `inOut`, `spring`, `expo`, `smooth` di mana setiap value adalah string GSAP ease name (mis. `'power3.out'`, `'back.out(1.6)'`).
3. WHEN `STAGGER` diekspor THEN sistem SHALL mengekspor object dengan field `fast`, `normal`, `slow` bertipe number (detik).
4. WHEN `shouldAnimate()` dipanggil di environment server THEN sistem SHALL mengembalikan `false`.
5. WHEN `shouldAnimate()` dipanggil di browser dan `matchMedia('(prefers-reduced-motion: reduce)').matches === true` THEN sistem SHALL mengembalikan `false`.
6. WHEN `shouldAnimate()` dipanggil di browser dan reduced-motion tidak aktif THEN sistem SHALL mengembalikan `true`.
7. WHEN `shouldAnimate()` dipanggil ke-N kali tanpa caching THEN sistem SHALL membaca `matchMedia` setiap pemanggilan agar perubahan setting OS terdeteksi tanpa reload.
8. WHEN `supportsViewTransitions()` dipanggil di browser yang men-support View Transitions API THEN sistem SHALL mengembalikan `true`; di environment server atau browser tanpa support, mengembalikan `false`.
9. WHEN modul `animation.ts` diimpor secara statis dari komponen yang di-SSR THEN sistem SHALL tidak melempar error "window is not defined" atau "document is not defined" saat `npm run build`.
10. WHEN konstanta dari modul ini digunakan THEN nilai SHALL bersifat read-only (object di-freeze atau di-deklarasi `as const`).

### Requirement 3: Reveal Actions (`reveal`, `revealStagger`)

**Objective:** As an engineer, I want Svelte action `reveal` dan `revealStagger` yang reveal-on-scroll memakai ScrollTrigger, sehingga element fade/slide masuk saat memasuki viewport dengan API yang stabil.

#### Acceptance Criteria

1. WHEN action `reveal` di-mount tanpa options THEN sistem SHALL set initial state `opacity: 0` dan `transform: translateY(24px)` pada node, lalu animate ke `opacity: 1, translateY(0)` saat ScrollTrigger fired.
2. WHEN action `reveal` di-mount dengan options `{ delay, duration, y, x, scale, once, amount, scrub }` THEN sistem SHALL menghormati setiap field dengan default: `delay=0` (detik), `duration=DURATION.slow` (0.6 detik), `y=24`, `x=0`, `scale=1`, `once=true`, `amount=0.15`, `scrub=false`.
3. WHEN options `delay` di-pass THEN sistem SHALL menginterpretasikannya sebagai detik (BUKAN ms), mengikuti konvensi GSAP.
4. WHEN action `reveal` mount dan `shouldAnimate() === false` THEN sistem SHALL TIDAK mengubah style apapun dari node (element tetap di state visible default browser).
5. WHEN action `reveal` mount dan environment server THEN sistem SHALL mengembalikan `{}` tanpa side effect.
6. WHEN action `reveal` aktif dan `options.once === true` THEN sistem SHALL membuat ScrollTrigger dengan `once: true` sehingga animasi hanya dijalankan sekali meskipun element keluar-masuk viewport.
7. WHEN action `reveal` aktif dan `options.scrub` adalah number atau `true` THEN sistem SHALL membuat ScrollTrigger dengan `scrub` sesuai nilai dan TIDAK menggunakan `once`.
8. WHEN tween `reveal` selesai THEN sistem SHALL clear `will-change` via `clearProps: 'willChange'` agar tidak menyisakan optimization hint berlebih.
9. WHEN action `reveal` `destroy()` dipanggil THEN sistem SHALL memanggil `trigger.kill()` dan `tween.kill()` untuk node tersebut, sehingga `ScrollTrigger.getAll().some(t => t.trigger === node) === false` setelahnya.
10. WHEN action `revealStagger` di-mount THEN sistem SHALL menerima options `{ delay, duration, y, x, stagger, once, amount }` dengan default tambahan `stagger=STAGGER.normal` (0.07 detik).
11. WHEN action `revealStagger` aktif dan node memiliki N child element THEN sistem SHALL mengaplikasikan animasi ke setiap child dengan offset `i * stagger` detik.
12. WHEN action `revealStagger` `destroy()` dipanggil THEN sistem SHALL mengkill seluruh tween dan trigger yang terkait container maupun child-nya.
13. WHEN node masuk viewport pertama kali THEN element MUST sampai ke state final `opacity=1, transform=identity` dalam waktu `delay + duration` detik dari trigger.
14. WHEN action mount dijalankan di browser THEN initial style SHALL di-set synchronous (sebelum GSAP load) untuk menghindari FOUC (flash of unstyled content).

### Requirement 4: Hover Actions (`hoverLift`, `hoverBorder`)

**Objective:** As an engineer, I want hover effect (lift + glow + border highlight) yang menggunakan `quickTo` untuk performa tinggi tanpa allocation per event.

#### Acceptance Criteria

1. WHEN action `hoverLift` di-mount tanpa options THEN sistem SHALL set default `y=-4`, `scale=1`, `duration=0.2` (detik), `glowColor='var(--color-primary)'`, `glowIntensity=0.2`.
2. WHEN action `hoverLift` di-mount dan `shouldAnimate() === false` THEN sistem SHALL tidak attach event listener apapun (no-op destroy).
3. WHEN action `hoverLift` aktif dan event `mouseenter` terjadi THEN sistem SHALL men-tween node ke `y={options.y}, scale={options.scale}, boxShadow={glow}`.
4. WHEN event `mouseleave` terjadi setelah enter THEN sistem SHALL men-tween node kembali ke `y=0, scale=1, boxShadow='0 0 0 0 transparent'` dalam durasi `duration * 1.4` detik.
5. WHEN sequence `mouseenter → mouseleave` selesai THEN node MUST kembali ke state visual awal dengan toleransi pengukuran `getComputedStyle(node).transform ≈ identity` setelah `duration * 1.4 + 50ms`.
6. WHEN action `hoverLift` mount sukses THEN sistem SHALL membuat `gsap.quickTo(node, 'y', ...)` dan `gsap.quickTo(node, 'scale', ...)` tepat satu kali, lalu reuse setter di setiap event handler (tidak re-create tween).
7. WHEN action `hoverLift` `destroy()` dipanggil THEN sistem SHALL menghapus listener `mouseenter`/`mouseleave` dari node DAN memanggil `gsap.killTweensOf(node)`.
8. WHEN action `hoverBorder` di-mount tanpa options THEN sistem SHALL set default `color='var(--color-primary)'`, `duration=0.2`.
9. WHEN action `hoverBorder` aktif dan `mouseenter` terjadi THEN sistem SHALL men-tween `borderColor` ke `options.color`; pada `mouseleave`, kembali ke `'var(--color-border)'` dalam durasi `duration * 1.4` detik.
10. WHEN action `hoverBorder` `destroy()` dipanggil THEN sistem SHALL menghapus listener dan membersihkan tween.

### Requirement 5: Counter Action

**Objective:** As an engineer, I want action `counter` yang menganimasikan angka 0 → target dengan formatting (locale, decimals, prefix/suffix), so that statistik (mis. jumlah project, jumlah klien) memiliki count-up effect saat masuk viewport.

#### Acceptance Criteria

1. WHEN action `counter` di-mount dengan `{ target }` saja THEN sistem SHALL set default `duration=1.2` (detik), `delay=0` (detik), `decimals=0`, `prefix=''`, `suffix=''`, `ease=EASE.expo`, `triggerOnView=true`.
2. WHEN action `counter` mount dan `target` adalah `NaN` atau bukan finite number THEN sistem SHALL throw assertion error di mode development; di production, set `node.textContent` ke nilai aman (string `'0'`) dan log warning.
3. WHEN action `counter` mount dan `shouldAnimate() === false` THEN sistem SHALL set `node.textContent = formatValue(target, decimals, prefix, suffix)` langsung tanpa animasi.
4. WHEN action `counter` mount dan `triggerOnView === true` THEN sistem SHALL membuat ScrollTrigger dengan `once: true` yang start tween saat node masuk viewport.
5. WHEN action `counter` mount dan `triggerOnView === false` THEN sistem SHALL start tween segera setelah `loadGsap()` resolve.
6. WHEN tween counter berjalan THEN setiap frame `node.textContent` MUST sama dengan `formatValue(currentValue, decimals, prefix, suffix)` di mana `currentValue ∈ [0, target]`.
7. WHEN tween counter selesai THEN `node.textContent` MUST tepat sama dengan `formatValue(target, decimals, prefix, suffix)` (snap ke target, hindari floating point drift).
8. WHEN `decimals === 0` THEN `formatValue(value)` SHALL menggunakan `Math.round(value).toLocaleString()` (locale-aware grouping).
9. WHEN `decimals > 0` THEN `formatValue(value)` SHALL menggunakan `value.toFixed(decimals)`.
10. WHEN action `counter` `destroy()` dipanggil sebelum tween selesai THEN sistem SHALL mengkill tween dan ScrollTrigger; `node.textContent` boleh di state intermediate (tidak ada postcondition snap-to-target jika di-destroy).
11. WHEN action `counter` `update(newOptions)` dipanggil THEN sistem SHALL kill tween lama, reset `node.textContent` ke `formatValue(0, ...)`, dan re-create ScrollTrigger atau langsung start sesuai `triggerOnView`.

### Requirement 6: Chart Actions (`animateBars`, `animateProgress`)

**Objective:** As an engineer, I want action `animateBars` dan `animateProgress` yang menganimasikan tinggi bar dan lebar progress dari 0 ke target saat masuk viewport, with stagger untuk bars.

#### Acceptance Criteria

1. WHEN action `animateBars` di-mount tanpa options THEN sistem SHALL set default `delay=0` (detik), `duration=0.6` (detik), `stagger=0.03` (detik), `ease=EASE.out`.
2. WHEN action `animateBars` mount THEN sistem SHALL menemukan seluruh descendant `[data-bar]` dari node, menyimpan `style.height` mereka sebagai target, dan set `style.height = '0%'` (atau `'2px'`) sebagai initial state.
3. WHEN action `animateBars` aktif dan node masuk viewport (ScrollTrigger fired) THEN sistem SHALL men-tween setiap bar ke target heightnya dengan offset `i * stagger` detik.
4. WHEN tween bar selesai THEN setiap bar MUST punya `style.height === targetHeight[i]` (snap ke target).
5. WHEN action `animateBars` mount dan `shouldAnimate() === false` THEN sistem SHALL tidak mengubah `style.height` (biarkan target).
6. WHEN action `animateBars` `destroy()` dipanggil THEN sistem SHALL kill seluruh tween dan ScrollTrigger.
7. WHEN action `animateProgress` di-mount tanpa options THEN sistem SHALL set default `delay=0` (detik), `duration=0.8` (detik), `ease=EASE.out`.
8. WHEN action `animateProgress` mount THEN sistem SHALL menyimpan `style.width` sebagai target dan set ke `'0%'` sebagai initial.
9. WHEN action `animateProgress` aktif dan masuk viewport THEN sistem SHALL men-tween `width` dari `'0%'` ke target.
10. WHEN tween progress selesai THEN `node.style.width` MUST sama dengan target width.
11. WHEN action `animateProgress` `destroy()` dipanggil THEN sistem SHALL kill tween dan ScrollTrigger.

### Requirement 7: Hero Entrance Timeline (Home Page)

**Objective:** As an engineer, I want hero entrance di home page menggunakan satu `gsap.timeline()` di dalam `gsap.context()` yang menganimasikan badge, line1, line2 (per-character via SplitText), bio, buttons, dan socials dalam orchestrated sequence — sekaligus memperbaiki bug 3 `onMount` duplikat yang ada saat ini.

#### Acceptance Criteria

1. WHEN file `src/routes/(public)/+page.svelte` di-render di browser THEN sistem SHALL hanya memiliki **satu** `onMount` yang menjalankan animasi hero (bug 3 onMount harus dihilangkan).
2. WHEN home page mount dan `shouldAnimate() === false` THEN sistem SHALL tidak menjalankan animasi hero, semua elemen hero langsung visible di state final.
3. WHEN home page mount dan `shouldAnimate() === true` THEN sistem SHALL memanggil `loadGsap()`, lalu di dalam `gsap.context(setupFn, scope)` membuat satu `gsap.timeline({ defaults: { ease: 'power3.out' } })` yang menganimasikan urutan: badge → heroLine1 → heroLine2 chars (via SplitText) → bio → buttons → socials.
4. WHEN element ref hero (badge mobile/desktop, line1, line2, bio, buttons, socials) ada yang `null`/`undefined` saat timeline build THEN sistem SHALL filter null via `[...elements].filter(Boolean)` agar timeline tidak crash.
5. WHEN SplitText berhasil split `heroLine2` (text "Atmojo" atau nama serupa) THEN sistem SHALL menganimasikan `split.chars` dengan `y: 40, opacity: 0, stagger: 0.04, ease: 'back.out(1.4)'`.
6. WHEN SplitText gagal (target null atau no text content) THEN sistem SHALL fallback ke whole-line animation (`.from(heroLine2, { y: 40, opacity: 0 })`) tanpa crash.
7. WHEN home page unmount (`onDestroy`) THEN sistem SHALL memanggil `ctx.revert()` yang membersihkan seluruh tween + ScrollTrigger + SplitText DOM injection sehingga state DOM kembali ke kondisi sebelum animasi.
8. WHEN home page di-HMR (file save di dev) THEN jumlah `ScrollTrigger.getAll()` setelah HMR SHALL tidak terus naik (max sama dengan jumlah trigger yang dibuat oleh komponen baru).
9. WHEN diukur dalam window `[onMount, onMount + 2s]` THEN jumlah tween yang menarget `heroLine1` SHALL ≤ 1 (memvalidasi bug 3 onMount terselesaikan).
10. WHEN timeline hero selesai THEN seluruh elemen hero MUST visible di state final tanpa residual `opacity:0` atau transform offset.

### Requirement 8: Navbar Scroll Behavior

**Objective:** As an engineer, I want navbar sticky shrink dan progress bar dikendalikan ScrollTrigger sehingga tidak ada custom scroll listener manual yang re-render Svelte tiap pixel.

#### Acceptance Criteria

1. WHEN komponen Navbar mount dan `shouldAnimate() === true` THEN sistem SHALL membuat `gsap.context()` yang berisi: (a) ScrollTrigger untuk sticky shrink toggle dan (b) ScrollTrigger scrub untuk progress bar.
2. WHEN halaman di-scroll lewat 20px dari top THEN sistem SHALL set state `scrolled = true` (mengaktifkan class shrink di template).
3. WHEN halaman di-scroll kembali ke top (≤ 20px) THEN sistem SHALL set state `scrolled = false`.
4. WHEN halaman di-scroll dari atas ke bawah THEN progress bar SHALL menampilkan `width` dari `0%` ke `100%` secara linear terhadap progress dokumen, dengan scrub responsif (`scrub: 0.3`).
5. WHEN reduced-motion aktif THEN sistem SHALL skip progress bar tween (atau tetap aktif tanpa scrub smoothing). State `scrolled` tetap diperbarui.
6. WHEN Navbar unmount THEN `ctx.revert()` SHALL membersihkan ScrollTrigger dan tween, dan `ScrollTrigger.getAll()` tidak meninggalkan ghost trigger untuk Navbar.
7. WHEN implementasi GSAP berjalan THEN sistem SHALL TIDAK mempertahankan reactive `$derived` chain atau `requestAnimationFrame` loop manual yang re-run tiap pixel scroll (verifikasi via review kode: `addEventListener('scroll', ...)` manual untuk progress dihilangkan).

### Requirement 9: Page Transitions (View Transitions API + GSAP Fallback)

**Objective:** As a user, I want transisi halaman antar route SPA yang halus, with native View Transitions di browser yang support dan GSAP fade fallback di browser yang tidak.

#### Acceptance Criteria

1. WHEN navigasi SPA terjadi via SvelteKit (`onNavigate`) dan `shouldAnimate() === false` THEN sistem SHALL skip seluruh animasi transisi, langsung lanjut ke `navigation.complete`.
2. WHEN navigasi terjadi dan browser support View Transitions API (`'startViewTransition' in document`) THEN sistem SHALL memakai `document.startViewTransition(async () => { resolve(); await navigation.complete; })`.
3. WHEN navigasi terjadi dan browser TIDAK support View Transitions THEN sistem SHALL load GSAP via `loadGsap()`, lalu jalankan: tween fade-out container `main` (`opacity: 0, y: -8, duration: 0.18`) → resolve navigation → tween fade-in container baru (`fromTo({opacity:0, y:8}, {opacity:1, y:0, duration:0.24})`).
4. WHEN GSAP fallback path dijalankan dan `loadGsap()` reject atau resolve `null` THEN sistem SHALL resolve transition immediately tanpa animasi (graceful degradation).
5. WHEN Navbar memiliki `view-transition-name: site-logo` (atau nama serupa) THEN shared element transition native SHALL berfungsi tanpa konfigurasi GSAP tambahan di path View Transitions.

### Requirement 10: Marquee (Tech Logo) — Out of Scope

**Objective:** As an engineer, I want marquee tech logo TIDAK dimigrasi ke GSAP, tetap menggunakan CSS keyframe `@keyframes marquee` di `app.css` agar tidak menambah JS execution untuk animasi yang sudah optimal di compositor thread.

#### Acceptance Criteria

1. WHEN marquee tech logo dirender di home page THEN sistem SHALL tetap menggunakan CSS keyframe `@keyframes marquee` yang sudah ada di `src/app.css`.
2. WHEN user hover marquee THEN sistem SHALL menjeda animasi via `animation-play-state: paused` pada `:hover` (perilaku saat ini dipertahankan).
3. WHEN scope migrasi GSAP ini selesai THEN file `app.css` tidak dimodifikasi untuk marquee (zero diff di blok `@keyframes marquee`).

### Requirement 11: Reduced-Motion Compliance

**Objective:** As a user dengan setting `prefers-reduced-motion: reduce` aktif, I want zero animasi non-essential di seluruh public site, sehingga pengalaman tetap nyaman tanpa gerakan.

#### Acceptance Criteria

1. WHEN user OS mengaktifkan `prefers-reduced-motion: reduce` AND user mengunjungi home page THEN seluruh elemen hero MUST visible di state final dalam waktu ≤ 100ms dari mount, tanpa fade/slide/stagger.
2. WHEN `prefers-reduced-motion` aktif AND user scroll halaman portfolio/blog/gallery THEN seluruh element yang menggunakan `reveal` / `revealStagger` MUST visible di state default browser (tidak di-set ke `opacity:0`).
3. WHEN `prefers-reduced-motion` aktif AND user hover element dengan `hoverLift` THEN element MUST tidak mengalami perubahan transform/boxShadow.
4. WHEN `prefers-reduced-motion` aktif AND user scroll ke section dengan `counter` THEN counter MUST langsung menampilkan nilai `target` final (no count-up).
5. WHEN `prefers-reduced-motion` aktif AND user scroll ke chart THEN bars dan progress MUST langsung di state target (no growth animation).
6. WHEN `prefers-reduced-motion` aktif AND user navigasi SPA THEN page transition MUST instant (no fade), `navigation.complete` di-await tanpa `startViewTransition` wrapper atau GSAP tween.

### Requirement 12: SSR Safety

**Objective:** As an engineer, I want seluruh modul animasi aman saat SvelteKit SSR build sehingga tidak ada error "window is not defined" atau "document is not defined".

#### Acceptance Criteria

1. WHEN `npm run build` dijalankan THEN proses SSR pre-render SHALL tidak melempar error terkait `window`, `document`, atau global browser-only.
2. WHEN file `src/lib/utils/gsap-client.ts`, `src/lib/utils/animation.ts`, atau action di `src/lib/actions/*.ts` di-import statis dari komponen Svelte THEN modul SHALL tidak meng-import `gsap` di top-level (semua via dynamic import di dalam handler/function).
3. WHEN `loadGsap()` dipanggil di SSR context THEN sistem SHALL return `Promise.resolve(null)` tanpa men-trigger import gsap.
4. WHEN action mount di SSR (jika frame Svelte memang menjalankan action di server) THEN sistem SHALL guard dengan `typeof window === 'undefined'` dan return `{}` (no-op destroy).
5. WHEN `npm run check` (svelte-check) dijalankan THEN tidak ada error type GSAP atau action signature mismatch.

### Requirement 13: Cleanup & Memory Management

**Objective:** As an engineer, I want zero memory leak dari ScrollTrigger atau tween setelah komponen unmount atau navigasi SPA.

#### Acceptance Criteria

1. WHEN action GSAP `destroy()` dipanggil THEN sistem SHALL memanggil `trigger.kill()` untuk ScrollTrigger yang dibuat dan `tween.kill()` untuk tween yang dibuat.
2. WHEN komponen yang menggunakan `gsap.context()` unmount THEN `ctx.revert()` SHALL dipanggil di `onDestroy`.
3. WHEN diukur setelah navigasi SPA bolak-balik 5 kali ke route yang sama THEN `ScrollTrigger.getAll().length` SHALL tidak terus bertambah (tidak akumulasi ghost trigger).
4. WHEN HMR berjalan (file save di dev) THEN setelah module replacement, `ScrollTrigger.getAll().length` SHALL kembali ke jumlah trigger yang seharusnya ada di komponen versi baru (tidak akumulasi dari versi lama).
5. WHEN SplitText digunakan di hero THEN `split.revert()` SHALL dipanggil sebagai bagian dari `ctx.revert()` agar DOM injection per-char dibersihkan.

### Requirement 14: Migration & Dependency Cleanup

**Objective:** As an engineer, I want dependency `motion` dihapus dan `gsap` ditambahkan, dengan seluruh call site sudah migrate sehingga build dan check pass.

#### Acceptance Criteria

1. WHEN scope migrasi selesai THEN `package.json` SHALL berisi dependency `gsap@^3.13.0` di `dependencies` (BUKAN `devDependencies`).
2. WHEN scope migrasi selesai THEN `package.json` SHALL TIDAK lagi memiliki `motion` di `dependencies`.
3. WHEN scope migrasi selesai THEN seluruh file di `src/` SHALL TIDAK lagi memiliki `import('motion')` atau `from 'motion'` (verifikasi via grep).
4. WHEN scope migrasi selesai THEN `npm run check` SHALL pass tanpa error.
5. WHEN scope migrasi selesai THEN `npm run build` SHALL pass tanpa error.
6. WHEN scope migrasi selesai THEN `npm run lint` SHALL pass tanpa error baru yang diperkenalkan migrasi.
7. WHEN call site existing memakai `delay` ms-based pada `hoverLift`/counter THEN nilai SHALL dikonversi ke detik (audit site-wide; mis. `delay: 200` ms → `delay: 0.2` detik).

### Requirement 15: Visual Quality Upgrade

**Objective:** As a user, I want animasi yang lebih ekspresif dan halus dibanding implementasi `motion` saat ini, dengan per-character text reveal di hero, easing yang lebih dramatic, dan stagger yang lebih natural.

#### Acceptance Criteria

1. WHEN home page mount dengan animasi aktif THEN heroLine2 (nama "Atmojo" atau serupa) MUST mengalami per-character reveal dengan `back.out(1.4)` ease (overshoot subtle) — BUKAN whole-line fade saat ini.
2. WHEN counter mount dengan animasi aktif THEN ease default MUST `EASE.expo` (`expo.out`) yang memberikan dramatic deceleration di akhir.
3. WHEN reveal-on-scroll aktif THEN ease default MUST `EASE.out` (`power3.out`) yang lebih ekspresif dibanding bezier `[0,0,0.2,1]` saat ini.
4. WHEN `revealStagger` aktif THEN delay antar child MUST mengikuti `STAGGER.normal` (0.07s) dengan visual perception yang flowing (tidak terputus).
5. WHEN hover lift aktif THEN tween MUST menggunakan `quickTo` setter sehingga response per event ≤ 16ms (single frame) tanpa allocation.
6. WHEN dibandingkan dengan implementasi `motion` saat ini THEN feature parity MUST 100% (semua surface yang sebelumnya dianimasikan tetap dianimasikan dengan kualitas ≥ saat ini).

