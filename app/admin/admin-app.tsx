"use client"

import { useEffect, useState } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface Project {
  id: string
  title: string
  category: string
  location: string
  year: string
  area: string
  description: string
  concept: string
  style: string[]
  images: string[]
  featured: boolean
}

interface NavItem { name: string; href: string }
interface Stat { value: string; label: string }
interface Social { label: string; href: string }

interface SiteContent {
  loading: { monogram: string; subtitle: string }
  hero: {
    subtitle: string; titleLine1: string; titleLine2Prefix: string; titleLine2Highlight: string
    description: string
    ctaPrimaryLabel: string; ctaPrimaryHref: string
    ctaSecondaryLabel: string; ctaSecondaryHref: string
    sideTextLeft: string; sideTextRight: string
  }
  navigation: { brand: string; items: NavItem[] }
  about: {
    label: string; heading: string; name: string
    bio: string[]
    philosophyBadgeTitle: string; philosophyBadgeSubtitle: string
    expertiseLabel: string
    skills: string[]
    stats: Stat[]
    philosophyLabel: string; philosophyQuote: string
    photo: string; monogram: string
  }
  projectsHeader: { label: string; heading: string; description: string }
  contact: {
    label: string; heading: string; description: string
    emailLabel: string; email: string
    phoneLabel: string; phone: string
    locationLabel: string; locationLine1: string; locationLine2: string
    connectLabel: string
    socials: Social[]
    formNameLabel: string; formEmailLabel: string; formMessageLabel: string; submitLabel: string
  }
  footer: { brand: string; rightsText: string; backToTopLabel: string }
}

interface PendingFileUpload { path: string; base64: string; previewUrl: string }

const REPO = { owner: "anmolpanjwani-ux", repo: "anmol-portfolio", branch: "main" }
const PROJECTS_PATH = "data/projects.json"
const SITE_PATH = "data/site.json"
const TOKEN_KEY = "admin_gh_pat"

// ── GitHub API ────────────────────────────────────────────────────────────────
async function gh(token: string, path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  })
  const text = await res.text()
  let data: any = null; try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(data && data.message) || res.statusText}`)
  return data
}

async function fetchJsonFile<T>(token: string, path: string): Promise<T> {
  const data = await gh(token, `/repos/${REPO.owner}/${REPO.repo}/contents/${path}?ref=${REPO.branch}`)
  return JSON.parse(atob(data.content.replace(/\n/g, ""))) as T
}

async function commitFiles(
  token: string,
  message: string,
  files: Array<{ path: string; content: string; encoding: "utf-8" | "base64" }>,
  deletePaths: string[] = [],
) {
  const { owner, repo, branch } = REPO
  const ref = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`)
  const latestCommitSha = ref.object.sha
  const latestCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`)
  const baseTreeSha = latestCommit.tree.sha

  const blobs = await Promise.all(files.map(async (f) => {
    const b = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
      method: "POST", body: JSON.stringify({ content: f.content, encoding: f.encoding }),
    })
    return { path: f.path, sha: b.sha as string, mode: "100644", type: "blob" as const }
  }))
  const deletions = deletePaths.map((p) => ({ path: p, mode: "100644", type: "blob" as const, sha: null }))
  const tree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTreeSha, tree: [...blobs, ...deletions] }),
  })
  const commit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [latestCommitSha] }),
  })
  await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }),
  })
  return commit.sha as string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const s = r.result as string
      const c = s.indexOf(",")
      resolve(c >= 0 ? s.slice(c + 1) : s)
    }
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

function safeId(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled"
}

function emptyProject(): Project {
  return {
    id: `new-${Date.now().toString(36)}`,
    title: "Untitled Project",
    category: "Residential",
    location: "", year: String(new Date().getFullYear()),
    area: "", description: "", concept: "",
    style: [], images: [], featured: false,
  }
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }: { onAuth: (token: string) => void }) {
  const [token, setToken] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null)
    try {
      await gh(token, `/repos/${REPO.owner}/${REPO.repo}`);
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
      onAuth(token)
    } catch (err: any) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md">
        <p className="text-bronze text-xs tracking-[0.3em] uppercase mb-3">Admin Console</p>
        <h1 className="font-serif text-4xl text-cream mb-2">Sign in</h1>
        <p className="text-warm-beige/60 text-sm mb-8 leading-relaxed">
          Paste a GitHub fine-grained PAT with <span className="text-bronze">Contents: read/write</span> scoped to{" "}
          <span className="text-bronze">{REPO.owner}/{REPO.repo}</span>.
        </p>
        <label className="block text-xs tracking-wider text-warm-beige/60 uppercase mb-2">Personal Access Token</label>
        <input type="password" autoComplete="current-password" value={token}
          onChange={(e) => setToken(e.target.value)} placeholder="github_pat_xxxxxxxx"
          className="w-full bg-transparent border border-stone/40 focus:border-bronze outline-none py-3 px-4 text-cream font-mono text-sm" required />
        <label className="mt-4 flex items-center gap-2 text-sm text-warm-beige/60 cursor-pointer">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember this token on this device
        </label>
        {error && <div className="mt-4 text-sm text-red-400/80 border border-red-400/30 px-4 py-3">{error}</div>}
        <button type="submit" disabled={busy || !token}
          className="mt-8 w-full py-4 bg-bronze text-charcoal uppercase tracking-wider text-sm font-medium hover:bg-cream disabled:opacity-40 transition-all">
          {busy ? "Verifying…" : "Sign in"}
        </button>
        <p className="mt-8 text-xs text-warm-beige/40 leading-relaxed">
          Need a token?{" "}
          <a className="text-bronze underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Create one here</a>
          {" "}— scope it to <span className="text-bronze">anmol-portfolio</span> with Contents: Read &amp; write.
        </p>
      </form>
    </div>
  )
}

// ── Field components ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string
}) {
  return (
    <label className="block mb-5">
      <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">{label}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
            className="w-full bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream resize-y" />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />}
      {hint && <span className="block text-xs text-warm-beige/40 mt-1">{hint}</span>}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-stone/30 px-5 md:px-7 py-6 mb-6">
      <h3 className="text-bronze text-xs tracking-[0.3em] uppercase mb-5">{title}</h3>
      {children}
    </section>
  )
}

// ── Projects screen (unchanged logic, repackaged) ─────────────────────────────
function ProjectsPanel({
  token, projects, setProjects,
  pendingFiles, setPendingFiles, pendingDeletes, setPendingDeletes,
  setDirty,
}: {
  token: string
  projects: Project[] | null; setProjects: (p: Project[]) => void
  pendingFiles: PendingFileUpload[]; setPendingFiles: (f: PendingFileUpload[]) => void
  pendingDeletes: string[]; setPendingDeletes: (d: string[]) => void
  setDirty: (d: boolean) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0)

  function update<K extends keyof Project>(field: K, value: Project[K]) {
    if (!projects) return
    const next = [...projects]; next[selectedIdx] = { ...next[selectedIdx], [field]: value }
    setProjects(next); setDirty(true)
  }
  function addProject() {
    if (!projects) return
    const p = emptyProject()
    setProjects([...projects, p]); setSelectedIdx(projects.length); setDirty(true)
  }
  function deleteProject() {
    if (!projects || projects.length === 0) return
    if (!confirm(`Delete "${projects[selectedIdx].title}"?`)) return
    const removed = projects[selectedIdx]
    const photoPaths = removed.images
      .map((p) => p.replace(/^\//, ""))
      .map((p) => p.startsWith("projects/") ? `public/${p}` : null)
      .filter((x): x is string => Boolean(x))
    setPendingDeletes([...pendingDeletes, ...photoPaths])
    setProjects(projects.filter((_, i) => i !== selectedIdx))
    setSelectedIdx(Math.max(0, selectedIdx - 1)); setDirty(true)
  }
  async function handleAddImage(files: FileList | null) {
    if (!files || !projects) return
    const project = projects[selectedIdx]
    const id = safeId(project.id || project.title)
    const additions: PendingFileUpload[] = []
    const newImages = [...project.images]
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} > 5 MB; please compress first.`); continue }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
      const filename = `img-${Date.now()}-${Math.floor(Math.random() * 1e4)}.${ext}`
      const repoPath = `public/projects/${id}/${filename}`
      const publicPath = `/projects/${id}/${filename}`
      additions.push({ path: repoPath, base64: await fileToBase64(file), previewUrl: URL.createObjectURL(file) })
      newImages.push(publicPath)
    }
    setPendingFiles([...pendingFiles, ...additions])
    update("images", newImages)
  }
  function removeImage(idx: number) {
    if (!projects) return
    const project = projects[selectedIdx]
    const path = project.images[idx]
    const next = [...project.images]; next.splice(idx, 1)
    update("images", next)
    const pPath = `public/${path.replace(/^\//, "")}`
    const pIdx = pendingFiles.findIndex((f) => f.path === pPath)
    if (pIdx >= 0) { const n = [...pendingFiles]; n.splice(pIdx, 1); setPendingFiles(n) }
    else setPendingDeletes([...pendingDeletes, pPath])
  }
  function moveImage(idx: number, dir: -1 | 1) {
    if (!projects) return
    const project = projects[selectedIdx]
    const j = idx + dir; if (j < 0 || j >= project.images.length) return
    const next = [...project.images];[next[idx], next[j]] = [next[j], next[idx]]
    update("images", next)
  }

  const current = projects && projects.length > 0 ? projects[selectedIdx] : null
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-0 min-h-[calc(100vh-128px)]">
      <aside className="border-r border-stone/30 px-3 py-5">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-xs tracking-[0.3em] uppercase text-warm-beige/60">Projects</h2>
          <button onClick={addProject} className="text-bronze text-xs tracking-wider uppercase hover:text-cream">+ Add</button>
        </div>
        <ul className="space-y-1">
          {(projects || []).map((p, i) => (
            <li key={p.id}>
              <button onClick={() => setSelectedIdx(i)}
                className={`w-full text-left px-3 py-2 border-l-2 transition-all ${
                  i === selectedIdx ? "border-bronze bg-stone/20 text-cream" : "border-transparent text-warm-beige/60 hover:text-cream hover:bg-stone/10"
                }`}>
                <span className="block text-sm">{p.title || <span className="italic opacity-60">Untitled</span>}</span>
                <span className="block text-xs text-warm-beige/40 mt-0.5">{p.category} · {p.year} · {p.images.length} photo{p.images.length !== 1 ? "s" : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="px-6 md:px-8 py-7">
        {!projects && <p className="text-warm-beige/60">Loading…</p>}
        {projects && projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-warm-beige/60 mb-4">No projects yet.</p>
            <button onClick={addProject} className="px-4 py-2 bg-bronze text-charcoal uppercase tracking-wider text-sm">Add your first project</button>
          </div>
        )}
        {current && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-serif text-3xl">{current.title || "Untitled"}</h2>
              <button onClick={deleteProject} className="text-red-400/70 hover:text-red-400 text-xs uppercase tracking-wider">Delete project</button>
            </div>
            <Field label="Title" value={current.title} onChange={(v) => update("title", v)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Category" value={current.category} onChange={(v) => update("category", v)} />
              <Field label="Year" value={current.year} onChange={(v) => update("year", v)} />
              <Field label="Location" value={current.location} onChange={(v) => update("location", v)} />
              <Field label="Area" value={current.area} onChange={(v) => update("area", v)} />
            </div>
            <Field label="Style tags (comma separated)" value={current.style.join(", ")}
              onChange={(v) => update("style", v.split(",").map((s) => s.trim()).filter(Boolean))} />
            <Field label="Description" value={current.description} onChange={(v) => update("description", v)} multiline />
            <Field label="Concept" value={current.concept} onChange={(v) => update("concept", v)} multiline />
            <label className="flex items-center gap-2 mt-2 mb-7 text-sm text-warm-beige/70 cursor-pointer">
              <input type="checkbox" checked={current.featured} onChange={(e) => update("featured", e.target.checked)} />
              Featured project
            </label>
            <h3 className="text-xs tracking-[0.3em] uppercase text-warm-beige/60 mt-3 mb-3">Photos</h3>
            <p className="text-xs text-warm-beige/40 mb-3">First photo is the card cover and modal hero. Max 5 MB per file.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {current.images.map((path, i) => {
                const pending = pendingFiles.find((f) => f.path === `public/${path.replace(/^\//, "")}`)
                const src = pending ? pending.previewUrl
                  : `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}/public${path.startsWith("/") ? path : "/" + path}`
                return (
                  <div key={path + i} className="relative aspect-[4/3] bg-stone/20 group overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 bg-bronze/90 text-charcoal text-[10px] tracking-wider uppercase px-2 py-0.5">Cover</span>}
                    {pending && <span className="absolute top-2 right-2 bg-amber-500/90 text-charcoal text-[10px] tracking-wider uppercase px-2 py-0.5">Pending</span>}
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/70 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-8 h-8 bg-cream text-charcoal disabled:opacity-30" title="Move up">↑</button>
                      <button onClick={() => moveImage(i, 1)} disabled={i === current.images.length - 1} className="w-8 h-8 bg-cream text-charcoal disabled:opacity-30" title="Move down">↓</button>
                      <button onClick={() => removeImage(i)} className="w-8 h-8 bg-red-400 text-charcoal" title="Remove">✕</button>
                    </div>
                  </div>
                )
              })}
              <label className="aspect-[4/3] border-2 border-dashed border-stone/40 hover:border-bronze flex items-center justify-center text-warm-beige/60 hover:text-bronze text-sm cursor-pointer transition-all">
                <span>+ Add photo(s)</span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { handleAddImage(e.target.files); e.target.value = "" }} />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Site content panel ────────────────────────────────────────────────────────
function SiteContentPanel({
  token, site, setSite, pendingFiles, setPendingFiles, pendingDeletes, setPendingDeletes, setDirty,
}: {
  token: string
  site: SiteContent | null; setSite: (s: SiteContent) => void
  pendingFiles: PendingFileUpload[]; setPendingFiles: (f: PendingFileUpload[]) => void
  pendingDeletes: string[]; setPendingDeletes: (d: string[]) => void
  setDirty: (d: boolean) => void
}) {
  if (!site) return <p className="px-6 md:px-10 py-8 text-warm-beige/60">Loading site content…</p>

  function patch<T extends keyof SiteContent>(key: T, partial: Partial<SiteContent[T]>) {
    setSite({ ...site!, [key]: { ...(site as any)[key], ...partial } } as SiteContent)
    setDirty(true)
  }

  async function uploadAboutPhoto(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.size > 5 * 1024 * 1024) { alert("Photo > 5 MB; compress first."); return }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
    const filename = `anmol-${Date.now()}.${ext}`
    const repoPath = `public/about/${filename}`
    const publicPath = `/about/${filename}`
    const base64 = await fileToBase64(file)

    // If there's an existing photo (and it's NOT a pending upload), mark for deletion
    const existing = site!.about.photo
    if (existing) {
      const existingRepoPath = `public/${existing.replace(/^\//, "")}`
      const existingPending = pendingFiles.find((f) => f.path === existingRepoPath)
      if (existingPending) {
        // drop pending one (was never committed)
        setPendingFiles(pendingFiles.filter((f) => f.path !== existingRepoPath))
      } else {
        setPendingDeletes([...pendingDeletes, existingRepoPath])
      }
    }
    setPendingFiles([...pendingFiles, { path: repoPath, base64, previewUrl: URL.createObjectURL(file) }])
    patch("about", { photo: publicPath })
  }

  function removeAboutPhoto() {
    const existing = site!.about.photo
    if (!existing) return
    const existingRepoPath = `public/${existing.replace(/^\//, "")}`
    const existingPending = pendingFiles.find((f) => f.path === existingRepoPath)
    if (existingPending) setPendingFiles(pendingFiles.filter((f) => f.path !== existingRepoPath))
    else setPendingDeletes([...pendingDeletes, existingRepoPath])
    patch("about", { photo: "" })
  }

  // Render helpers for list fields
  function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
    return (
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={v} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n) }}
              placeholder={placeholder}
              className="flex-1 bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
            <button onClick={() => { const n = [...items]; n.splice(i, 1); onChange(n) }}
              className="w-10 border border-stone/40 hover:border-red-400 text-warm-beige/60 hover:text-red-400">✕</button>
          </div>
        ))}
        <button onClick={() => onChange([...items, ""])}
          className="text-bronze text-xs tracking-wider uppercase hover:text-cream">+ Add</button>
      </div>
    )
  }

  const about = site.about
  const photoPending = pendingFiles.find((f) => f.path === `public/${(about.photo || "").replace(/^\//, "")}`)
  const photoSrc = photoPending
    ? photoPending.previewUrl
    : about.photo ? `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}/public${about.photo.startsWith("/") ? about.photo : "/" + about.photo}` : ""

  return (
    <div className="px-6 md:px-10 py-8 max-w-4xl">
      <Section title="Hero">
        <Field label="Eyebrow / Role" value={site.hero.subtitle} onChange={(v) => patch("hero", { subtitle: v })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Headline — line 1" value={site.hero.titleLine1} onChange={(v) => patch("hero", { titleLine1: v })} />
          <Field label="Headline — line 2 prefix" value={site.hero.titleLine2Prefix} onChange={(v) => patch("hero", { titleLine2Prefix: v })}
            hint='Followed by the italic word below' />
        </div>
        <Field label="Headline — italic highlight word" value={site.hero.titleLine2Highlight} onChange={(v) => patch("hero", { titleLine2Highlight: v })} />
        <Field label="Description tagline" value={site.hero.description} onChange={(v) => patch("hero", { description: v })} multiline />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary button label" value={site.hero.ctaPrimaryLabel} onChange={(v) => patch("hero", { ctaPrimaryLabel: v })} />
          <Field label="Primary button link" value={site.hero.ctaPrimaryHref} onChange={(v) => patch("hero", { ctaPrimaryHref: v })} hint='Use "#projects" to jump to section' />
          <Field label="Secondary button label" value={site.hero.ctaSecondaryLabel} onChange={(v) => patch("hero", { ctaSecondaryLabel: v })} />
          <Field label="Secondary button link" value={site.hero.ctaSecondaryHref} onChange={(v) => patch("hero", { ctaSecondaryHref: v })} />
          <Field label="Side text (left)" value={site.hero.sideTextLeft} onChange={(v) => patch("hero", { sideTextLeft: v })} />
          <Field label="Side text (right)" value={site.hero.sideTextRight} onChange={(v) => patch("hero", { sideTextRight: v })} />
        </div>
      </Section>

      <Section title="Navigation">
        <Field label="Brand text" value={site.navigation.brand} onChange={(v) => patch("navigation", { brand: v })} />
        <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">Menu items</span>
        <div className="space-y-2">
          {site.navigation.items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2">
              <input value={item.name} onChange={(e) => {
                const n = [...site.navigation.items]; n[i] = { ...n[i], name: e.target.value }; patch("navigation", { items: n })
              }} placeholder="Label" className="bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
              <input value={item.href} onChange={(e) => {
                const n = [...site.navigation.items]; n[i] = { ...n[i], href: e.target.value }; patch("navigation", { items: n })
              }} placeholder="#anchor or URL" className="bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
              <button onClick={() => {
                const n = [...site.navigation.items]; n.splice(i, 1); patch("navigation", { items: n })
              }} className="border border-stone/40 hover:border-red-400 text-warm-beige/60 hover:text-red-400">✕</button>
            </div>
          ))}
          <button onClick={() => patch("navigation", { items: [...site.navigation.items, { name: "", href: "" }] })}
            className="text-bronze text-xs tracking-wider uppercase hover:text-cream">+ Add item</button>
        </div>
      </Section>

      <Section title="About">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Section eyebrow" value={about.label} onChange={(v) => patch("about", { label: v })} />
          <Field label="Section heading" value={about.heading} onChange={(v) => patch("about", { heading: v })} />
          <Field label="Your name" value={about.name} onChange={(v) => patch("about", { name: v })} />
          <Field label="Monogram (fallback when no photo)" value={about.monogram} onChange={(v) => patch("about", { monogram: v })} />
          <Field label="Philosophy badge — title" value={about.philosophyBadgeTitle} onChange={(v) => patch("about", { philosophyBadgeTitle: v })} />
          <Field label="Philosophy badge — subtitle" value={about.philosophyBadgeSubtitle} onChange={(v) => patch("about", { philosophyBadgeSubtitle: v })} />
        </div>

        <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2 mt-3">Photo</span>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-48 aspect-[3/4] bg-stone/20 overflow-hidden flex items-center justify-center relative">
            {photoSrc
              ? <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  {photoPending && <span className="absolute top-2 right-2 bg-amber-500/90 text-charcoal text-[10px] tracking-wider uppercase px-2 py-0.5">Pending</span>}
                </>
              : <span className="font-serif text-5xl text-bronze/30">{about.monogram}</span>}
          </div>
          <div className="space-y-2">
            <label className="inline-block px-4 py-2 bg-bronze text-charcoal uppercase tracking-wider text-xs cursor-pointer hover:bg-cream">
              <span>{about.photo ? "Replace photo" : "Upload photo"}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { uploadAboutPhoto(e.target.files); e.target.value = "" }} />
            </label>
            {about.photo && (
              <button onClick={removeAboutPhoto}
                className="block px-4 py-2 border border-stone/40 hover:border-red-400 text-warm-beige/70 hover:text-red-400 uppercase tracking-wider text-xs">
                Remove photo
              </button>
            )}
            <p className="text-xs text-warm-beige/40 leading-relaxed">Max 5 MB. Tall portrait (3:4) works best.</p>
          </div>
        </div>

        <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">Bio paragraphs</span>
        <div className="space-y-2 mb-5">
          {about.bio.map((para, i) => (
            <div key={i} className="flex gap-2">
              <textarea value={para} rows={3} onChange={(e) => {
                const n = [...about.bio]; n[i] = e.target.value; patch("about", { bio: n })
              }} className="flex-1 bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream resize-y" />
              <button onClick={() => { const n = [...about.bio]; n.splice(i, 1); patch("about", { bio: n }) }}
                className="self-start w-10 h-10 border border-stone/40 hover:border-red-400 text-warm-beige/60 hover:text-red-400">✕</button>
            </div>
          ))}
          <button onClick={() => patch("about", { bio: [...about.bio, ""] })}
            className="text-bronze text-xs tracking-wider uppercase hover:text-cream">+ Add paragraph</button>
        </div>

        <Field label="Expertise label" value={about.expertiseLabel} onChange={(v) => patch("about", { expertiseLabel: v })} />
        <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">Skills</span>
        <div className="mb-5">
          <StringListEditor items={about.skills} onChange={(v) => patch("about", { skills: v })} placeholder="e.g. AutoCAD (2D)" />
        </div>

        <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">Stats</span>
        <div className="space-y-2 mb-5">
          {about.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[100px_1fr_40px] gap-2">
              <input value={s.value} onChange={(e) => {
                const n = [...about.stats]; n[i] = { ...n[i], value: e.target.value }; patch("about", { stats: n })
              }} placeholder="4+" className="bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
              <input value={s.label} onChange={(e) => {
                const n = [...about.stats]; n[i] = { ...n[i], label: e.target.value }; patch("about", { stats: n })
              }} placeholder="Years Experience" className="bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
              <button onClick={() => { const n = [...about.stats]; n.splice(i, 1); patch("about", { stats: n }) }}
                className="border border-stone/40 hover:border-red-400 text-warm-beige/60 hover:text-red-400">✕</button>
            </div>
          ))}
          <button onClick={() => patch("about", { stats: [...about.stats, { value: "", label: "" }] })}
            className="text-bronze text-xs tracking-wider uppercase hover:text-cream">+ Add stat</button>
        </div>

        <Field label="Philosophy label" value={about.philosophyLabel} onChange={(v) => patch("about", { philosophyLabel: v })} />
        <Field label="Philosophy quote (no quotes — added automatically)" value={about.philosophyQuote}
          onChange={(v) => patch("about", { philosophyQuote: v })} multiline />
      </Section>

      <Section title="Projects section header">
        <Field label="Eyebrow label" value={site.projectsHeader.label} onChange={(v) => patch("projectsHeader", { label: v })} />
        <Field label="Heading" value={site.projectsHeader.heading} onChange={(v) => patch("projectsHeader", { heading: v })} />
        <Field label="Description" value={site.projectsHeader.description} onChange={(v) => patch("projectsHeader", { description: v })} multiline />
      </Section>

      <Section title="Contact">
        <Field label="Eyebrow" value={site.contact.label} onChange={(v) => patch("contact", { label: v })} />
        <Field label="Heading" value={site.contact.heading} onChange={(v) => patch("contact", { heading: v })} />
        <Field label="Description" value={site.contact.description} onChange={(v) => patch("contact", { description: v })} multiline />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email label" value={site.contact.emailLabel} onChange={(v) => patch("contact", { emailLabel: v })} />
          <Field label="Email" value={site.contact.email} onChange={(v) => patch("contact", { email: v })} />
          <Field label="Phone label" value={site.contact.phoneLabel} onChange={(v) => patch("contact", { phoneLabel: v })} />
          <Field label="Phone" value={site.contact.phone} onChange={(v) => patch("contact", { phone: v })} />
          <Field label="Location label" value={site.contact.locationLabel} onChange={(v) => patch("contact", { locationLabel: v })} />
          <Field label="Location line 1" value={site.contact.locationLine1} onChange={(v) => patch("contact", { locationLine1: v })} />
          <Field label="Location line 2" value={site.contact.locationLine2} onChange={(v) => patch("contact", { locationLine2: v })} />
          <Field label="Connect label" value={site.contact.connectLabel} onChange={(v) => patch("contact", { connectLabel: v })} />
        </div>
        <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">Social links</span>
        <div className="space-y-2 mb-5">
          {site.contact.socials.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_40px] gap-2">
              <input value={s.label} onChange={(e) => {
                const n = [...site.contact.socials]; n[i] = { ...n[i], label: e.target.value }; patch("contact", { socials: n })
              }} placeholder="Label" className="bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
              <input value={s.href} onChange={(e) => {
                const n = [...site.contact.socials]; n[i] = { ...n[i], href: e.target.value }; patch("contact", { socials: n })
              }} placeholder="https://..." className="bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream" />
              <button onClick={() => {
                const n = [...site.contact.socials]; n.splice(i, 1); patch("contact", { socials: n })
              }} className="border border-stone/40 hover:border-red-400 text-warm-beige/60 hover:text-red-400">✕</button>
            </div>
          ))}
          <button onClick={() => patch("contact", { socials: [...site.contact.socials, { label: "", href: "" }] })}
            className="text-bronze text-xs tracking-wider uppercase hover:text-cream">+ Add social</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Form: Name label" value={site.contact.formNameLabel} onChange={(v) => patch("contact", { formNameLabel: v })} />
          <Field label="Form: Email label" value={site.contact.formEmailLabel} onChange={(v) => patch("contact", { formEmailLabel: v })} />
          <Field label="Form: Message label" value={site.contact.formMessageLabel} onChange={(v) => patch("contact", { formMessageLabel: v })} />
          <Field label="Submit button label" value={site.contact.submitLabel} onChange={(v) => patch("contact", { submitLabel: v })} />
        </div>
      </Section>

      <Section title="Footer">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Brand" value={site.footer.brand} onChange={(v) => patch("footer", { brand: v })} />
          <Field label="Rights text" value={site.footer.rightsText} onChange={(v) => patch("footer", { rightsText: v })} />
          <Field label="Back-to-top label" value={site.footer.backToTopLabel} onChange={(v) => patch("footer", { backToTopLabel: v })} />
        </div>
      </Section>

      <Section title="Loading screen">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Monogram" value={site.loading.monogram} onChange={(v) => patch("loading", { monogram: v })} />
          <Field label="Subtitle" value={site.loading.subtitle} onChange={(v) => patch("loading", { subtitle: v })} />
        </div>
      </Section>
    </div>
  )
}

// ── Admin shell ───────────────────────────────────────────────────────────────
function AdminScreen({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"projects" | "site">("projects")
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [site, setSite] = useState<SiteContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [pendingFiles, setPendingFiles] = useState<PendingFileUpload[]>([])
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([])
  const [dirty, setDirty] = useState(false)
  const [lastCommit, setLastCommit] = useState<string | null>(null)

  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function reload() {
    setBusy(true); setError(null)
    try {
      const [p, s] = await Promise.all([
        fetchJsonFile<Project[]>(token, PROJECTS_PATH),
        fetchJsonFile<SiteContent>(token, SITE_PATH),
      ])
      setProjects(p); setSite(s)
      setPendingFiles([]); setPendingDeletes([]); setDirty(false)
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function save() {
    if (!projects || !site) return
    setBusy(true); setError(null)
    try {
      const normalized = projects.map((p) => p.id.startsWith("new-") ? { ...p, id: safeId(p.title) || p.id } : p)
      const files = [
        { path: PROJECTS_PATH, content: JSON.stringify(normalized, null, 2) + "\n", encoding: "utf-8" as const },
        { path: SITE_PATH, content: JSON.stringify(site, null, 2) + "\n", encoding: "utf-8" as const },
        ...pendingFiles.map((f) => ({ path: f.path, content: f.base64, encoding: "base64" as const })),
      ]
      const msg = `chore(admin): update site (+${pendingFiles.length} files, -${pendingDeletes.length} files)`
      const sha = await commitFiles(token, msg, files, pendingDeletes)
      setLastCommit(sha)
      setPendingFiles([]); setPendingDeletes([]); setDirty(false)
      setProjects(normalized)
      alert(`Saved ✓\nCommit: ${sha.slice(0, 7)}\n\nThe GitHub Action will rebuild the site in ~1 min.`)
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <header className="border-b border-stone/30 px-6 md:px-10 py-4 sticky top-0 z-30 bg-charcoal">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-xl">Admin</span>
            <span className="text-xs text-warm-beige/40 tracking-wider uppercase hidden md:inline">
              {REPO.owner}/{REPO.repo}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {dirty && <span className="text-bronze tracking-wider uppercase">Unsaved</span>}
            {lastCommit && !dirty && <span className="text-emerald-400/70 tracking-wider uppercase">✓ {lastCommit.slice(0, 7)}</span>}
            <button onClick={save} disabled={busy || !dirty}
              className="px-4 py-2 bg-bronze text-charcoal uppercase tracking-wider hover:bg-cream disabled:opacity-30 transition-all">
              {busy ? "Saving…" : "Save & Deploy"}
            </button>
            <button onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`, "_blank")}
              className="px-3 py-2 border border-stone/40 hover:border-bronze text-warm-beige/70 hover:text-cream uppercase tracking-wider transition-all">View Site</button>
            <button onClick={onLogout}
              className="px-3 py-2 border border-stone/40 hover:border-red-400 text-warm-beige/70 hover:text-red-400 uppercase tracking-wider transition-all">Sign out</button>
          </div>
        </div>
        <nav className="mt-4 flex gap-1">
          <TabBtn active={tab === "projects"} onClick={() => setTab("projects")}>Projects</TabBtn>
          <TabBtn active={tab === "site"} onClick={() => setTab("site")}>Site Content</TabBtn>
        </nav>
      </header>
      {error && <div className="mx-6 md:mx-10 mt-4 text-sm text-red-400/90 border border-red-400/30 px-4 py-3">{error}</div>}
      {tab === "projects" ? (
        <ProjectsPanel
          token={token}
          projects={projects} setProjects={(p) => { setProjects(p); setDirty(true) }}
          pendingFiles={pendingFiles} setPendingFiles={setPendingFiles}
          pendingDeletes={pendingDeletes} setPendingDeletes={setPendingDeletes}
          setDirty={setDirty}
        />
      ) : (
        <SiteContentPanel
          token={token}
          site={site} setSite={(s) => { setSite(s); setDirty(true) }}
          pendingFiles={pendingFiles} setPendingFiles={setPendingFiles}
          pendingDeletes={pendingDeletes} setPendingDeletes={setPendingDeletes}
          setDirty={setDirty}
        />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-xs tracking-[0.2em] uppercase transition-all ${
        active ? "text-bronze border-b-2 border-bronze" : "text-warm-beige/60 hover:text-cream border-b-2 border-transparent"
      }`}>{children}</button>
  )
}

export function AdminApp() {
  const [token, setToken] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
    const t = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
    if (t) setToken(t)
  }, [])
  function logout() { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); setToken(null) }
  if (!hydrated) return null
  return token ? <AdminScreen token={token} onLogout={logout} /> : <LoginScreen onAuth={setToken} />
}
