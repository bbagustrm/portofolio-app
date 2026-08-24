# 🎯 FINISHING TASKS — Portfolio Enhancement Specification

**Version:** 1.0  
**Audit Date:** 2026-08-22  
**Status:** Ready for Implementation

---

## 📊 AUDIT SUMMARY

### Animation Coverage
- ✅ **7 routes** with GSAP animations (homepage, blog, portfolio, gallery listing, dashboard home)
- ❌ **14 routes** without animations (login, gallery detail, all dashboard CRUD pages)
- ✅ Page transitions via View Transition API implemented
- ⚠️ Only 2 components use animations (PostCard, ProjectCard)

### Current State
- **Tech Stack:** 8 items displayed (need to add 6 more: Java, Spring Boot, Supabase, PHP, Laravel)
- **Favicon:** ❌ None (no favicon.ico or PWA icons)
- **404 Page:** ❌ Not implemented
- **Skills Page:** ❌ No `/skills` route
- **Dribbble:** ⚠️ Only in hero section, not in footer
- **Rich Text Editor:** ⚠️ No drag & drop for images
- **i18n:** ✅ Both en.json & id.json synced (136 keys)

---

## 🎨 TASK 1: Add Animations to All Pages

### Routes Needing Animations (Priority Order)

#### Public Routes
1. **Login** (`src/routes/login/+page.svelte`)
   - Card entrance: `use:reveal={{ y: 24, duration: 0.5 }}`
   - Form fields: `use:revealStagger{{ stagger: 0.08, y: 16 }}`

2. **Gallery Detail** (`src/routes/(public)/gallery/[id]/+page.svelte`)
   - Main image: `use:reveal{{ y: 20, scale: 0.98 }}`
   - Thumbnails: `use:revealStagger{{ stagger: 0.05 }}`

#### Dashboard Routes
3. **Profile, Projects List, Blog List, Gallery List** (all dashboard CRUD pages)
   - Header: `use:reveal{{ y: 16 }}`
   - Content sections: `use:revealStagger{{ stagger: 0.1, y: 20 }}`
   - Table rows: `use:revealStagger{{ stagger: 0.04, y: 12 }}`
   - Action buttons: `hoverLift{{ y: -2, duration: 0.15 }}`

### Component Enhancements
- `FeedPost.svelte` — hover effects
- `Navbar.svelte` — menu slide-in on mobile
- `Footer.svelte` — social icon hover scale

**Standard Pattern:**
```svelte
<div use:reveal={{ y: 20, duration: 0.5 }}>Content</div>
<div use:revealStagger={{ stagger: 0.08, y: 24 }}>List items</div>
<div use:hoverLift={{ y: -4, duration: 0.18 }}>Card</div>
```

---

## 🖼️ TASK 2: Rich Text Editor — Drag & Drop Images

**File:** `src/lib/components/blog/RichTextEditor.svelte`

### Requirements
- Upload Method: **Base64 embed** (NOT Supabase)
- File Size Limit: **5MB**
- Preview: Show before inserting
- Formats: JPEG, PNG, WebP, GIF

### Implementation Steps
1. Add TipTap drag & drop plugin to editor extensions
2. Implement file validation (size, type)
3. Convert to base64 via FileReader
4. Create preview dialog component
5. Handle both drag-drop and paste events

### i18n Keys to Add
```json
{
  "editor_image_drop_zone": "Drag & drop images here, or click to upload",
  "editor_image_uploading": "Processing image...",
  "editor_image_error_size": "Image too large. Maximum size is 5MB.",
  "editor_image_error_format": "Invalid format. Use JPEG, PNG, WebP, or GIF.",
  "editor_image_preview_title": "Insert Image",
  "editor_image_preview_confirm": "Insert",
  "editor_image_preview_cancel": "Cancel"
}
```

---

## 🎯 TASK 3: Favicon & PWA Icons

### File Structure
```
static/
├── favicon.ico              (32x32, 16x16 multi-size)
├── favicon.svg              (vector, theme-aware)
├── apple-touch-icon.png     (180x180)
├── icon-192.png             (192x192, PWA)
├── icon-512.png             (512x512, PWA)
└── manifest.webmanifest     (PWA manifest)
```

### Update `src/app.html`
```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#3c6e47" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#5cd67b" media="(prefers-color-scheme: dark)">
```

### PWA Manifest (`static/manifest.webmanifest`)
```json
{
  "name": "Atmojo Portfolio",
  "short_name": "Atmojo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafaf8",
  "theme_color": "#3c6e47",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Note:** Designer will provide logo artwork.

---

## 🚫 TASK 4: 404 Error Page

**File:** `src/routes/+error.svelte` (NEW)

### Features
- Animated 404 illustration (GSAP)
- Error message with i18n
- CTA button to home
- Match design system

### Structure
```svelte
<div class="min-h-screen flex items-center justify-center px-4">
  <div class="text-center max-w-md">
    <div use:reveal={{ scale: 0.9, duration: 0.6 }}>
      <p class="text-9xl font-bold text-primary opacity-20">404</p>
    </div>
    <div use:reveal={{ y: 20, delay: 0.2 }}>
      <h1 class="text-3xl font-bold mb-3">{m.error_404_title()}</h1>
      <p class="text-muted-foreground mb-8">{m.error_404_message()}</p>
      <a href="/">
        <Button size="lg" class="gap-2">
          <Home class="size-4" /> {m.error_404_cta()}
        </Button>
      </a>
    </div>
  </div>
</div>
```

**i18n keys already exist** in messages/*.json

---

## 💼 TASK 5: Skills Page

**Route:** `/skills` (public)  
**Files:** 
- `src/routes/(public)/skills/+page.svelte` (NEW)
- `src/lib/data/skills.ts` (NEW)

### Data Structure (`skills.ts`)
```typescript
export type SkillCategory = {
  title: string;
  titleKey: string; // i18n
  skills: { name: string; logo: string }[];
};

export const skillCategories: SkillCategory[] = [
  {
    title: 'Software Development',
    titleKey: 'skills_category_software_dev',
    skills: [
      // Languages
      { name: 'PHP', logo: 'https://cdn.worldvectorlogo.com/logos/php-1.svg' },
      { name: 'JavaScript', logo: '...' },
      { name: 'TypeScript', logo: '...' },
      { name: 'Java', logo: '...' },
      
      // Frameworks
      { name: 'Spring Boot', logo: '...' },
      { name: 'Laravel', logo: '...' },
      { name: 'React', logo: '...' },
      { name: 'Next.js', logo: '...' },
      { name: 'NestJS', logo: '...' },
      { name: 'SvelteKit', logo: '...' },
      { name: 'Tailwind CSS', logo: '...' },
      
      // Databases
      { name: 'MySQL', logo: '...' },
      { name: 'PostgreSQL', logo: '...' },
      { name: 'MongoDB', logo: '...' },
      { name: 'Supabase', logo: '...' },
      
      // VCS
      { name: 'Git', logo: '...' },
      { name: 'GitHub', logo: '...' },
      { name: 'GitLab', logo: '...' },
    ]
  },
  {
    title: 'Graphic Design',
    titleKey: 'skills_category_graphic_design',
    skills: [
      { name: 'Adobe Illustrator', logo: '...' },
      { name: 'Adobe Photoshop', logo: '...' },
      { name: 'Adobe After Effects', logo: '...' },
      { name: 'Adobe InDesign', logo: '...' },
      { name: 'Adobe Premiere Pro', logo: '...' },
      { name: 'CorelDRAW', logo: '...' },
      { name: 'Figma', logo: '...' },
      { name: 'Affinity Designer', logo: '...' },
      { name: 'Canva', logo: '...' },
      { name: 'CapCut', logo: '...' },
    ]
  }
];
```

### Page Layout (Grid-based, responsive)
- Header with title & subtitle
- Category sections
- 2-5 columns responsive grid
- Hover effects on skill cards

### i18n Keys
```json
{
  "skills_page_title": "Skills & Tools",
  "skills_page_subtitle": "Technologies and tools I work with",
  "skills_category_software_dev": "Software Development",
  "skills_category_graphic_design": "Graphic Design"
}
```

---

## 🏠 TASK 6: Update Homepage Tech Stack Marquee

**File:** `src/lib/data/tech-stack.ts`

### Changes
1. Import skills from `skills.ts`
2. Filter to show SELECTED featured tech
3. Keep marquee animation
4. Make entire strip clickable → `/skills`
5. Add tooltip: "Click to see all my skills"

### Featured Tech (Show on Homepage)
- SvelteKit, TypeScript, React, Next.js, NestJS
- Tailwind CSS, PostgreSQL, Supabase, Docker, Spring Boot

### Implementation
```typescript
import { skillCategories } from './skills';

const featuredTechNames = [
  'SvelteKit', 'TypeScript', 'React', 'Next.js', 'NestJS',
  'Tailwind CSS', 'PostgreSQL', 'Supabase', 'Docker', 'Spring Boot'
];

export const techStack = skillCategories
  .flatMap(cat => cat.skills)
  .filter(skill => featuredTechNames.includes(skill.name));
```

### Update Homepage (`src/routes/(public)/+page.svelte`)
Wrap marquee section in `<a href="/skills">` with Tooltip

### i18n Key
```json
{ "tech_stack_tooltip": "Click to see all my skills" }
```

---

## 🎨 TASK 7: Add Dribbble to Footer

**File:** `src/lib/components/layout/Footer.svelte`

### Update
```typescript
import { DribbbleLogo } from 'phosphor-svelte';

const socials = [
  { href: 'https://github.com/bbagustrm', label: 'GitHub', icon: GithubLogo, type: 'link' },
  { href: 'https://linkedin.com/in/bagus-tri-atmojo', label: 'LinkedIn', icon: LinkedinLogo, type: 'link' },
  { href: 'https://dribbble.com/bbagustrm', label: 'Dribbble', icon: DribbbleLogo, type: 'link' },
  { href: 'mailto:bbagustrm@gmail.com', label: 'Email', icon: Envelope, type: 'email' }
];
```

No other changes needed — existing loop handles rendering.

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Animations (Task 1)
- [ ] Login page
- [ ] Gallery detail page
- [ ] Dashboard profile
- [ ] Dashboard projects list
- [ ] Dashboard blog list
- [ ] Dashboard gallery list
- [ ] All CRUD forms (new/edit pages)
- [ ] Component hover effects

### Phase 2: Rich Text Editor (Task 2)
- [ ] Drag & drop plugin
- [ ] File validation (5MB, types)
- [ ] Preview dialog
- [ ] Base64 conversion
- [ ] Paste support
- [ ] i18n keys (7 keys)

### Phase 3: Favicon (Task 3)
- [ ] favicon.ico
- [ ] favicon.svg
- [ ] apple-touch-icon.png
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] manifest.webmanifest
- [ ] Update app.html

### Phase 4: Error Page (Task 4)
- [ ] Create +error.svelte
- [ ] Add 404 animation
- [ ] Test routing

### Phase 5: Skills Page (Task 5)
- [ ] Create skills.ts data
- [ ] Create /skills route
- [ ] Grid layout with categories
- [ ] Animations
- [ ] i18n keys (4 keys)

### Phase 6: Homepage Marquee (Task 6)
- [ ] Update tech-stack.ts
- [ ] Make clickable to /skills
- [ ] Add tooltip
- [ ] i18n key (1 key)

### Phase 7: Footer (Task 7)
- [ ] Add Dribbble icon

### Phase 8: i18n
- [ ] Add all new keys to en.json (~12 keys)
- [ ] Add all new keys to id.json (~12 keys)

### Phase 9: QA
- [ ] Test animations (all screen sizes)
- [ ] Test reduced-motion
- [ ] Test image upload limits
- [ ] Verify routes
- [ ] i18n switching
- [ ] Performance audit
- [ ] Accessibility audit

---

## 📝 IMPLEMENTATION NOTES

1. **Animation Performance:** GSAP lazy-loads via `loadGsap()` (already implemented)
2. **i18n Strategy:** Add to both en.json & id.json simultaneously
3. **Image Base64:** Will increase HTML size — warn for images >2MB
4. **Skills Logos:** Use CDN URLs (worldvectorlogo, Wikipedia Commons)
5. **Marquee:** Entire strip clickable, not individual items
6. **Favicon SVG:** Should respect theme (light/dark mode)

---

## 🎯 SUCCESS CRITERIA

- [ ] All pages have smooth entrance animations
- [ ] Rich text editor accepts drag & drop images <5MB
- [ ] Favicon visible in all browsers
- [ ] 404 page accessible and animated
- [ ] Skills page shows all tech in organized grid
- [ ] Homepage marquee links to /skills
- [ ] Dribbble in footer
- [ ] All new text has EN + ID translations
- [ ] No console errors
- [ ] Animations respect reduced-motion
- [ ] All interactive elements have hover states

---

**Ready for execution! Start with Phase 1 (Animations).** 🚀
