"use client"

import { useEffect, useMemo, useState } from "react"

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

interface PendingFileUpload {
  // path relative to repo root, e.g. "public/projects/pune-duplex/img-1700000000.jpg"
  path: string
  // base64 (no data-URI prefix)
  base64: string
  // local object URL for previewing before commit
  previewUrl: string
}

type RepoConfig = {
  owner: string
  repo: string
  branch: string
}

const REPO_CONFIG: RepoConfig = {
  owner: "anmolpanjwani-ux",
  repo: "anmol-portfolio",
  branch: "main",
}

const PROJECTS_JSON_PATH = "data/projects.json"
const TOKEN_KEY = "admin_gh_pat"

// ── GitHub API helpers ────────────────────────────────────────────────────────
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
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText
    throw new Error(`GitHub ${res.status} on ${path}: ${msg}`)
  }
  return data
}

async function fetchProjectsJson(token: string): Promise<Project[]> {
  // Use the contents endpoint which gives us the latest committed version
  const data = await gh(
    token,
    `/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/${PROJECTS_JSON_PATH}?ref=${REPO_CONFIG.branch}`,
  )
  const decoded = atob(data.content.replace(/\n/g, ""))
  return JSON.parse(decoded)
}

// Atomic commit of multiple files via Git Data API
async function commitFiles(
  token: string,
  message: string,
  files: Array<{ path: string; content: string; encoding: "utf-8" | "base64" }>,
  deletePaths: string[] = [],
) {
  const { owner, repo, branch } = REPO_CONFIG

  // 1. Get current ref
  const ref = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`)
  const latestCommitSha = ref.object.sha

  // 2. Get current commit to find tree
  const latestCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`)
  const baseTreeSha = latestCommit.tree.sha

  // 3. Create blobs for all files
  const blobs = await Promise.all(
    files.map(async (f) => {
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: f.encoding }),
      })
      return { path: f.path, sha: blob.sha as string, mode: "100644", type: "blob" as const }
    }),
  )

  // 4. For deletions, we need the file SHAs in the base tree set to null
  const deletions = deletePaths.map((p) => ({
    path: p,
    mode: "100644",
    type: "blob" as const,
    sha: null,
  }))

  // 5. Create new tree
  const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [...blobs.map(({ path, sha, mode, type }) => ({ path, sha, mode, type })), ...deletions],
    }),
  })

  // 6. Create new commit
  const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
    }),
  })

  // 7. Update ref to point at new commit
  await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  })

  return newCommit.sha as string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // strip "data:image/...;base64," prefix
      const comma = result.indexOf(",")
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
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
    location: "",
    year: String(new Date().getFullYear()),
    area: "",
    description: "",
    concept: "",
    style: [],
    images: [],
    featured: false,
  }
}

// ── Components ────────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }: { onAuth: (token: string) => void }) {
  const [token, setToken] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      // Test by trying to read the repo
      await gh(token, `/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}`)
      const store = remember ? localStorage : sessionStorage
      store.setItem(TOKEN_KEY, token)
      onAuth(token)
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md">
        <p className="text-bronze text-xs tracking-[0.3em] uppercase mb-3">Admin Console</p>
        <h1 className="font-serif text-4xl text-cream mb-2">Sign in</h1>
        <p className="text-warm-beige/60 text-sm mb-8 leading-relaxed">
          Paste a GitHub fine-grained PAT with{" "}
          <span className="text-bronze">Contents: read/write</span> scoped to{" "}
          <span className="text-bronze">{REPO_CONFIG.owner}/{REPO_CONFIG.repo}</span>.
        </p>

        <label className="block text-xs tracking-wider text-warm-beige/60 uppercase mb-2">
          Personal Access Token
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="github_pat_xxxxxxxx"
          className="w-full bg-transparent border border-stone/40 focus:border-bronze outline-none py-3 px-4 text-cream font-mono text-sm"
          required
        />

        <label className="mt-4 flex items-center gap-2 text-sm text-warm-beige/60 cursor-pointer">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember this token on this device
        </label>

        {error && (
          <div className="mt-4 text-sm text-red-400/80 border border-red-400/30 px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !token}
          className="mt-8 w-full py-4 bg-bronze text-charcoal uppercase tracking-wider text-sm font-medium hover:bg-cream disabled:opacity-40 transition-all"
        >
          {busy ? "Verifying…" : "Sign in"}
        </button>

        <p className="mt-8 text-xs text-warm-beige/40 leading-relaxed">
          Need a token? Open{" "}
          <a
            className="text-bronze underline"
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
          >
            github.com/settings/personal-access-tokens/new
          </a>
          {" "}→ Resource owner: your account → Repository access: select{" "}
          <span className="text-bronze">anmol-portfolio</span> → Repository permissions:
          Contents = Read &amp; write.
        </p>
      </form>
    </div>
  )
}

function AdminScreen({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [pendingFiles, setPendingFiles] = useState<PendingFileUpload[]>([])
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([])
  const [dirty, setDirty] = useState(false)
  const [lastCommit, setLastCommit] = useState<string | null>(null)

  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function reload() {
    setBusy(true); setError(null)
    try {
      const list = await fetchProjectsJson(token)
      setProjects(list)
      setSelectedIdx(0)
      setPendingFiles([])
      setPendingDeletes([])
      setDirty(false)
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  function update<K extends keyof Project>(field: K, value: Project[K]) {
    if (!projects) return
    const next = [...projects]
    next[selectedIdx] = { ...next[selectedIdx], [field]: value }
    setProjects(next); setDirty(true)
  }

  function addProject() {
    if (!projects) return
    const p = emptyProject()
    setProjects([...projects, p])
    setSelectedIdx(projects.length); setDirty(true)
  }

  function deleteProject() {
    if (!projects || projects.length === 0) return
    if (!confirm(`Delete "${projects[selectedIdx].title}"? Photos will also be removed on save.`)) return
    const removed = projects[selectedIdx]
    // mark photos for deletion
    const photoPathsToDelete = removed.images
      .map((p) => p.replace(/^\//, ""))
      .map((p) => p.startsWith("projects/") ? `public/${p}` : null)
      .filter((x): x is string => Boolean(x))
    setPendingDeletes([...pendingDeletes, ...photoPathsToDelete])
    const next = projects.filter((_, i) => i !== selectedIdx)
    setProjects(next)
    setSelectedIdx(Math.max(0, selectedIdx - 1))
    setDirty(true)
  }

  async function handleAddImage(files: FileList | null) {
    if (!files || !projects) return
    const project = projects[selectedIdx]
    const id = safeId(project.id || project.title)
    const additions: PendingFileUpload[] = []
    const newImages = [...project.images]
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is over 5 MB; please compress before uploading.`); continue
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
      const filename = `img-${Date.now()}-${Math.floor(Math.random() * 1e4)}.${ext}`
      const repoPath = `public/projects/${id}/${filename}`
      const publicPath = `/projects/${id}/${filename}`
      const base64 = await fileToBase64(file)
      additions.push({ path: repoPath, base64, previewUrl: URL.createObjectURL(file) })
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

    // If this is a pending (uncommitted) upload, just drop it
    const pendingPath = `public/${path.replace(/^\//, "")}`
    const pendingIdx = pendingFiles.findIndex((f) => f.path === pendingPath)
    if (pendingIdx >= 0) {
      const next2 = [...pendingFiles]; next2.splice(pendingIdx, 1)
      setPendingFiles(next2)
    } else {
      // Mark for deletion in repo on save
      setPendingDeletes([...pendingDeletes, pendingPath])
    }
  }

  function moveImage(idx: number, dir: -1 | 1) {
    if (!projects) return
    const project = projects[selectedIdx]
    const j = idx + dir
    if (j < 0 || j >= project.images.length) return
    const next = [...project.images]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    update("images", next)
  }

  async function save() {
    if (!projects) return
    setBusy(true); setError(null)
    try {
      // Normalize IDs to safe slugs (only update if title-derived id was placeholder)
      const normalized = projects.map((p) =>
        p.id.startsWith("new-") ? { ...p, id: safeId(p.title) || p.id } : p,
      )
      const files = [
        {
          path: PROJECTS_JSON_PATH,
          content: JSON.stringify(normalized, null, 2) + "\n",
          encoding: "utf-8" as const,
        },
        ...pendingFiles.map((f) => ({
          path: f.path, content: f.base64, encoding: "base64" as const,
        })),
      ]
      const sha = await commitFiles(
        token,
        `chore(admin): update portfolio (${normalized.length} projects, +${pendingFiles.length} files, -${pendingDeletes.length} files)`,
        files,
        pendingDeletes,
      )
      setLastCommit(sha)
      setPendingFiles([]); setPendingDeletes([]); setDirty(false)
      setProjects(normalized)
      alert(
        `Saved ✓\nCommit: ${sha.slice(0, 7)}\n\nThe GitHub Action will rebuild the site in ~1 min.`,
      )
    } catch (e: any) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  const current = projects && projects.length > 0 ? projects[selectedIdx] : null

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <header className="border-b border-stone/30 px-6 md:px-10 py-5 flex items-center justify-between gap-4 sticky top-0 z-30 bg-charcoal">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-xl text-cream">Admin</span>
          <span className="text-xs text-warm-beige/40 tracking-wider uppercase hidden md:inline">
            {REPO_CONFIG.owner}/{REPO_CONFIG.repo}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {dirty && <span className="text-bronze tracking-wider uppercase">Unsaved changes</span>}
          {lastCommit && !dirty && (
            <span className="text-emerald-400/70 tracking-wider uppercase">
              ✓ Saved {lastCommit.slice(0, 7)}
            </span>
          )}
          <button
            onClick={save}
            disabled={busy || !dirty}
            className="px-4 py-2 bg-bronze text-charcoal uppercase tracking-wider hover:bg-cream disabled:opacity-30 transition-all"
          >
            {busy ? "Saving…" : "Save & Deploy"}
          </button>
          <button
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`, "_blank")}
            className="px-3 py-2 border border-stone/40 hover:border-bronze text-warm-beige/70 hover:text-cream uppercase tracking-wider transition-all"
          >
            View Site
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-2 border border-stone/40 hover:border-red-400 text-warm-beige/70 hover:text-red-400 uppercase tracking-wider transition-all"
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 md:mx-10 mt-4 text-sm text-red-400/90 border border-red-400/30 px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-0 min-h-[calc(100vh-72px)]">
        {/* Sidebar */}
        <aside className="border-r border-stone/30 px-4 py-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs tracking-[0.3em] uppercase text-warm-beige/60">Projects</h2>
            <button
              onClick={addProject}
              className="text-bronze text-xs tracking-wider uppercase hover:text-cream"
            >
              + Add
            </button>
          </div>
          <ul className="space-y-1">
            {(projects || []).map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedIdx(i)}
                  className={`w-full text-left px-3 py-2.5 border-l-2 transition-all ${
                    i === selectedIdx
                      ? "border-bronze bg-stone/20 text-cream"
                      : "border-transparent text-warm-beige/60 hover:text-cream hover:bg-stone/10"
                  }`}
                >
                  <span className="block text-sm">{p.title || <span className="italic opacity-60">Untitled</span>}</span>
                  <span className="block text-xs text-warm-beige/40 mt-0.5">
                    {p.category} · {p.year} · {p.images.length} photo{p.images.length !== 1 ? "s" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor */}
        <main className="px-6 md:px-10 py-8">
          {busy && !projects && <p className="text-warm-beige/60">Loading…</p>}
          {!busy && projects && projects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-warm-beige/60 mb-4">No projects yet.</p>
              <button onClick={addProject} className="px-4 py-2 bg-bronze text-charcoal uppercase tracking-wider text-sm">
                Add your first project
              </button>
            </div>
          )}
          {current && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-3xl">{current.title || "Untitled"}</h2>
                <button
                  onClick={deleteProject}
                  className="text-red-400/70 hover:text-red-400 text-xs uppercase tracking-wider"
                >
                  Delete project
                </button>
              </div>

              <Field label="Title" value={current.title} onChange={(v) => update("title", v)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category" value={current.category} onChange={(v) => update("category", v)} />
                <Field label="Year" value={current.year} onChange={(v) => update("year", v)} />
                <Field label="Location" value={current.location} onChange={(v) => update("location", v)} />
                <Field label="Area" value={current.area} onChange={(v) => update("area", v)} />
              </div>
              <Field
                label="Style tags (comma separated)"
                value={current.style.join(", ")}
                onChange={(v) => update("style", v.split(",").map((s) => s.trim()).filter(Boolean))}
              />
              <Field label="Description" value={current.description} onChange={(v) => update("description", v)} multiline />
              <Field label="Concept" value={current.concept} onChange={(v) => update("concept", v)} multiline />

              <label className="flex items-center gap-2 mt-2 mb-8 text-sm text-warm-beige/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={current.featured}
                  onChange={(e) => update("featured", e.target.checked)}
                />
                Featured project
              </label>

              {/* Photos */}
              <h3 className="text-xs tracking-[0.3em] uppercase text-warm-beige/60 mt-4 mb-3">Photos</h3>
              <p className="text-xs text-warm-beige/40 mb-3">
                First photo becomes the card cover and modal hero. Drag-reorder via the ↑↓ buttons. Max 5 MB per file.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {current.images.map((path, i) => {
                  const pending = pendingFiles.find(
                    (f) => f.path === `public/${path.replace(/^\//, "")}`,
                  )
                  const src = pending
                    ? pending.previewUrl
                    : `https://raw.githubusercontent.com/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/${REPO_CONFIG.branch}/public${path.startsWith("/") ? path : "/" + path}`
                  return (
                    <div key={path + i} className="relative aspect-[4/3] bg-stone/20 group overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-2 left-2 bg-bronze/90 text-charcoal text-[10px] tracking-wider uppercase px-2 py-0.5">
                          Cover
                        </span>
                      )}
                      {pending && (
                        <span className="absolute top-2 right-2 bg-amber-500/90 text-charcoal text-[10px] tracking-wider uppercase px-2 py-0.5">
                          Pending
                        </span>
                      )}
                      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/70 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          className="w-8 h-8 bg-cream text-charcoal disabled:opacity-30"
                          title="Move up"
                        >↑</button>
                        <button
                          onClick={() => moveImage(i, 1)}
                          disabled={i === current.images.length - 1}
                          className="w-8 h-8 bg-cream text-charcoal disabled:opacity-30"
                          title="Move down"
                        >↓</button>
                        <button
                          onClick={() => removeImage(i)}
                          className="w-8 h-8 bg-red-400 text-charcoal"
                          title="Remove"
                        >✕</button>
                      </div>
                    </div>
                  )
                })}
                <label className="aspect-[4/3] border-2 border-dashed border-stone/40 hover:border-bronze flex items-center justify-center text-warm-beige/60 hover:text-bronze text-sm cursor-pointer transition-all">
                  <span>+ Add photo(s)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { handleAddImage(e.target.files); e.target.value = "" }}
                  />
                </label>
              </div>

              {(pendingFiles.length > 0 || pendingDeletes.length > 0) && (
                <p className="text-xs text-bronze">
                  Pending: {pendingFiles.length} upload(s), {pendingDeletes.length} delete(s) — click <b>Save &amp; Deploy</b> to commit.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, multiline = false,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <label className="block mb-5">
      <span className="block text-xs tracking-[0.2em] uppercase text-warm-beige/60 mb-2">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border border-stone/40 focus:border-bronze outline-none px-3 py-2 text-cream"
        />
      )}
    </label>
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

  if (!hydrated) return null

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  return token
    ? <AdminScreen token={token} onLogout={logout} />
    : <LoginScreen onAuth={setToken} />
}
