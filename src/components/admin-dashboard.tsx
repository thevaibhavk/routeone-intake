"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { RouteOneLogo } from "@/components/routeone-logo";
import type { InviteRecord } from "@/lib/store";

export function AdminDashboard({
  authenticated,
  initialInvites,
}: {
  authenticated: boolean;
  initialInvites: InviteRecord[];
}) {
  const [isAuthed, setIsAuthed] = useState(authenticated);
  const [invites, setInvites] = useState(initialInvites);
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ email: "", companyName: "", contactName: "" });
  const deferredFilter = useDeferredValue(filter);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLink(invite: InviteRecord) {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${base}/?invite=${invite.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered = useMemo(() => {
    const q = deferredFilter.toLowerCase().trim();
    if (!q) return invites;
    return invites.filter((invite) =>
      [invite.companyName, invite.contactName, invite.email].some((value) => value.toLowerCase().includes(q)),
    );
  }, [deferredFilter, invites]);

  const stats = useMemo(() => {
    const submitted = invites.filter((invite) => invite.status === "submitted").length;
    const active = invites.filter((invite) => invite.status === "active").length;
    const avg =
      invites.length === 0
        ? 0
        : Math.round(invites.reduce((sum, invite) => sum + (invite.draft?.completion || 0), 0) / invites.length);
    return { submitted, active, avg };
  }, [invites]);

  async function login() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setMessage("Admin password rejected.");
      return;
    }
    setIsAuthed(true);
    const list = await fetch("/api/admin/invites").then((r) => r.json());
    setInvites(list.invites || []);
    setMessage(null);
  }

  async function createInvite() {
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Unable to create invite.");
      return;
    }
    setInvites((current) => [data.invite, ...current]);
    setForm({ email: "", companyName: "", contactName: "" });
    setMessage(`Invite created. Share link: ${data.link}`);
  }

  if (!isAuthed) {
    return (
      <div className="shell">
        <div className="hero-band">
          <div className="hero-top">
            <img src="/RouteOne-Logo-dark-theme.svg" alt="Route One" style={{ height: 44, display: "block" }} />
            <div className="status">Admin</div>
          </div>
          <div className="hero-copy">
            <h1>Admin Dashboard</h1>
            <p>Issue secure intake invites, monitor completion, and review submissions from one place.</p>
          </div>
        </div>
        <div className="auth-card panel stack">
          <h2 style={{ margin: 0 }}>Sign in</h2>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" />
          <button className="btn" onClick={login}>Open dashboard</button>
          {message ? <span style={{ color: "var(--danger)" }}>{message}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="hero-band">
        <div className="hero-top">
          <RouteOneLogo />
          <div className="status">Operations Active</div>
        </div>
        <div className="hero-copy">
          <h1>Client Intake Control Room</h1>
          <p>Manage invitations, track progress, and see which clients are waiting, active, or fully submitted.</p>
        </div>
      </div>
      <div className="dashboard-grid">
        <aside className="panel sticky stack">
          <div className="kpis">
            <div className="kpi"><span className="muted">Total invites</span><strong>{invites.length}</strong></div>
            <div className="kpi"><span className="muted">Active</span><strong>{stats.active}</strong></div>
            <div className="kpi"><span className="muted">Submitted</span><strong>{stats.submitted}</strong></div>
          </div>
          <div className="panel" style={{ padding: 0, border: "none", boxShadow: "none", background: "transparent" }}>
            <span className="eyebrow" style={{ color: "var(--brand)" }}>Average completion</span>
            <strong style={{ display: "block", fontSize: "2.4rem", marginTop: 10 }}>{stats.avg}%</strong>
            <div className="progress"><span style={{ width: `${stats.avg}%` }} /></div>
          </div>
        </aside>

        <main className="stack">
          <section className="panel stack">
            <div>
              <span className="eyebrow" style={{ color: "var(--brand)" }}>New Invite</span>
              <h2 style={{ margin: "8px 0" }}>Share a secure intake</h2>
            </div>
            <div className="field-grid">
              <div className="field">
                <label className="label">Company</label>
                <input className="input" value={form.companyName} onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))} />
              </div>
              <div className="field">
                <label className="label">Contact Name</label>
                <input className="input" value={form.contactName} onChange={(e) => setForm((s) => ({ ...s, contactName: e.target.value }))} />
              </div>
              <div className="field full">
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
              </div>
            </div>
            <div className="toolbar">
              <button className="btn" onClick={createInvite}>Create and email invite</button>
              {message ? <span className="mini-pill">{message}</span> : null}
            </div>
          </section>

          <section className="panel stack">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div>
                <span className="eyebrow" style={{ color: "var(--brand)" }}>Pipeline</span>
                <h2 style={{ margin: "8px 0" }}>Invites and progress</h2>
              </div>
              <input className="input" style={{ maxWidth: 280 }} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search company, email, contact" />
            </div>
            <div className="list">
              <div className="invite-row" style={{ borderTop: "none", paddingTop: 0, color: "var(--muted)" }}>
                <span>Client</span>
                <span>Owner</span>
                <span>Status</span>
                <span>Completion</span>
              </div>
              {filtered.length ? filtered.map((invite) => (
                <div className="invite-row" key={invite.id}>
                  <div>
                    <strong>{invite.companyName}</strong>
                    <div className="muted">{invite.email}</div>
                  </div>
                  <div>
                    <strong>{invite.contactName}</strong>
                    <div className="muted">{invite.lastOpenedAt ? `Last opened ${new Date(invite.lastOpenedAt).toLocaleString()}` : "Not opened yet"}</div>
                  </div>
                  <div>
                    <span className="status" data-tone={invite.status}>{invite.status}</span>
                  </div>
                  <div className="stack" style={{ gap: 6 }}>
                    <strong>{invite.draft?.completion || 0}%</strong>
                    <div className="progress"><span style={{ width: `${invite.draft?.completion || 0}%` }} /></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-copy"
                        onClick={() => copyLink(invite)}
                        title="Copy form link"
                      >
                        {copiedId === invite.id ? "Copied!" : "Copy link"}
                      </button>
                      <a
                        className="btn-copy"
                        href={`/admin/internal/${invite.id}`}
                        title="Open internal form"
                      >
                        Internal form
                      </a>
                    </div>
                  </div>
                </div>
              )) : <div className="empty-state">No invites match that search.</div>}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
