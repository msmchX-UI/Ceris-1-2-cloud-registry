/* =============================================
   Ceris-1-2 Cloud Registry – App Logic
   ============================================= */

const PACKAGES = [
  {
    id: 1,
    name: "web-server",
    namespace: "ceris",
    type: "image",
    icon: "🌐",
    description: "Production-ready Nginx-based web server image with TLS termination and Brotli compression.",
    downloads: "1.2M",
    version: "2.4.1",
    tags: ["nginx", "tls", "web"],
  },
  {
    id: 2,
    name: "postgres-ha",
    namespace: "ceris",
    type: "image",
    icon: "🐘",
    description: "High-availability PostgreSQL cluster image with automated failover and streaming replication.",
    downloads: "890K",
    version: "15.3",
    tags: ["database", "postgres", "ha"],
  },
  {
    id: 3,
    name: "auth-service",
    namespace: "ceris",
    type: "service",
    icon: "🔑",
    description: "OAuth2 / OIDC authentication microservice with JWT signing and refresh-token rotation.",
    downloads: "620K",
    version: "3.1.0",
    tags: ["auth", "oauth2", "security"],
  },
  {
    id: 4,
    name: "queue-worker",
    namespace: "ceris-labs",
    type: "service",
    icon: "⚙️",
    description: "Scalable background job worker with Redis-backed queue and dead-letter support.",
    downloads: "430K",
    version: "1.8.2",
    tags: ["redis", "jobs", "worker"],
  },
  {
    id: 5,
    name: "ceris-sdk",
    namespace: "ceris",
    type: "library",
    icon: "📦",
    description: "Official Ceris-1-2 SDK for interacting with the registry API from Python, Go, and Node.js.",
    downloads: "310K",
    version: "0.9.5",
    tags: ["sdk", "api", "library"],
  },
  {
    id: 6,
    name: "monitoring-agent",
    namespace: "ceris",
    type: "service",
    icon: "📊",
    description: "Lightweight Prometheus-compatible metrics agent with pre-built dashboards for Grafana.",
    downloads: "270K",
    version: "2.0.4",
    tags: ["metrics", "prometheus", "monitoring"],
  },
  {
    id: 7,
    name: "ml-runtime",
    namespace: "ceris-ai",
    type: "image",
    icon: "🤖",
    description: "GPU-accelerated machine-learning runtime image supporting PyTorch, TensorFlow, and ONNX.",
    downloads: "210K",
    version: "4.2.0",
    tags: ["ml", "gpu", "pytorch"],
  },
  {
    id: 8,
    name: "helm-charts",
    namespace: "ceris",
    type: "library",
    icon: "⛵",
    description: "Curated collection of production-ready Helm charts for common cloud-native workloads.",
    downloads: "195K",
    version: "1.5.0",
    tags: ["helm", "kubernetes", "charts"],
  },
  {
    id: 9,
    name: "redis-cluster",
    namespace: "ceris-infra",
    type: "image",
    icon: "🏎️",
    description: "Redis Cluster image with automatic node discovery and persistence configuration.",
    downloads: "180K",
    version: "7.2.0",
    tags: ["redis", "cache", "cluster"],
  },
];

/* ── Render package cards ── */
function renderPackages(list) {
  const grid = document.getElementById("packageGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">No packages found.</p>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (p) => `
    <div class="pkg-card" onclick="showDetail(${p.id})">
      <div class="pkg-header">
        <div class="pkg-icon">${p.icon}</div>
        <div class="pkg-meta">
          <div class="pkg-name">${p.name}</div>
          <div class="pkg-namespace">${p.namespace}/${p.name}:${p.version}</div>
        </div>
      </div>
      <p class="pkg-desc">${p.description}</p>
      <div class="pkg-footer">
        <span class="pkg-type-badge ${p.type}">${p.type}</span>
        <span class="pkg-downloads">⬇ ${p.downloads}</span>
      </div>
    </div>`
    )
    .join("");
}

/* ── Filter ── */
function filterPackages(type, btn) {
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const filtered = type === "all" ? PACKAGES : PACKAGES.filter((p) => p.type === type);
  renderPackages(filtered);
}

/* ── Search ── */
function doSearch() {
  const query = (document.getElementById("searchInput").value || "").toLowerCase().trim();
  if (!query) return;

  const results = PACKAGES.filter(
    (p) =>
      p.name.includes(query) ||
      p.namespace.includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some((t) => t.includes(query))
  );

  const overlay = document.createElement("div");
  overlay.className = "search-results";
  overlay.innerHTML = `
    <div class="search-results-box">
      <h3>Results for "${query}" (${results.length})</h3>
      ${
        results.length
          ? results
              .map(
                (p) => `
        <div class="result-item" onclick="closeSearch();showDetail(${p.id})">
          <strong>${p.icon} ${p.namespace}/${p.name}:${p.version}</strong>
          <span style="font-size:.85rem;color:var(--text-muted)">${p.description}</span>
        </div>`
              )
              .join("")
          : `<p style="color:var(--text-muted)">No packages matched your query.</p>`
      }
      <button class="close-results" onclick="closeSearch()">Close</button>
    </div>`;
  document.body.appendChild(overlay);
}

function closeSearch() {
  const overlay = document.querySelector(".search-results");
  if (overlay) overlay.remove();
}

/* Allow Enter key in search */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
  renderPackages(PACKAGES);
});

/* ── Package detail ── */
function showDetail(id) {
  const p = PACKAGES.find((pkg) => pkg.id === id);
  if (!p) return;

  const overlay = document.createElement("div");
  overlay.className = "search-results";
  overlay.innerHTML = `
    <div class="search-results-box">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
        <span style="font-size:2.5rem">${p.icon}</span>
        <div>
          <h2 style="font-size:1.4rem">${p.name}</h2>
          <span class="pkg-namespace">${p.namespace}/${p.name}:${p.version}</span>
        </div>
        <span class="pkg-type-badge ${p.type}" style="margin-left:auto">${p.type}</span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:1.25rem">${p.description}</p>
      <p style="margin-bottom:.5rem"><strong>⬇ Downloads:</strong> ${p.downloads}</p>
      <p style="margin-bottom:1rem"><strong>🏷 Tags:</strong> ${p.tags.map((t) => `<code>${t}</code>`).join(", ")}</p>
      <div class="code-block">
        <pre><code>docker pull registry.ceris.io/${p.namespace}/${p.name}:${p.version}</code></pre>
        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
      </div>
      <button class="close-results" onclick="this.closest('.search-results').remove()">Close</button>
    </div>`;
  document.body.appendChild(overlay);
}

/* ── Copy code ── */
function copyCode(btn) {
  const code = btn.closest(".code-block").querySelector("code").innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy"), 2000);
  }).catch(() => {
    btn.textContent = "Error";
    setTimeout(() => (btn.textContent = "Copy"), 2000);
  });
}
