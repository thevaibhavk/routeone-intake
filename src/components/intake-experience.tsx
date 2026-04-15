"use client";

import clsx from "clsx";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { intakeSections, contactRoleOptions, type BaseField } from "@/lib/form-schema";
import { computeCompletion } from "@/lib/intake";
import type { Contact, InviteRecord, UploadItem } from "@/lib/store";
import { RouteOneLogo } from "@/components/routeone-logo";

type PublicInvite = Omit<InviteRecord, "otpHash" | "otpExpiresAt" | "draft"> & {
  draft: {
    values: Record<string, string | string[]>;
    contacts: Contact[];
    uploads: Record<string, UploadItem[]>;
    completion: number;
    lastSavedAt: string | null;
  };
};

type SaveState = "idle" | "saving" | "saved" | "error";

function emptyContact(role = "Primary Contact"): Contact {
  return { id: crypto.randomUUID(), role, roleOther: "", name: "", title: "", email: "", phone: "" };
}

export function IntakeExperience() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";
  const [invite, setInvite] = useState<PublicInvite | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [contacts, setContacts] = useState<Contact[]>([emptyContact()]);
  const [uploads, setUploads] = useState<Record<string, UploadItem[]>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "submitted">("idle");
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentDeclined, setConsentDeclined] = useState(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (!inviteToken) return;
    fetch(`/api/client/session?invite=${inviteToken}`)
      .then((res) => res.json())
      .then((data) => {
        setInvite(data.invite);
        setAuthenticated(data.authenticated);
        if (data.invite?.draft) {
          setValues(data.invite.draft.values || {});
          setContacts(data.invite.draft.contacts?.length ? data.invite.draft.contacts : [emptyContact()]);
          setUploads(data.invite.draft.uploads || {});
          if (data.invite.submittedAt) setSubmitState("submitted");
        }
      });
  }, [inviteToken]);

  const completion = useMemo(() => computeCompletion({ values, contacts, uploads }), [values, contacts, uploads]);

  useEffect(() => {
    if (!authenticated || !invite || !didHydrate.current) return;
    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      fetch("/api/client/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteId: invite.id,
          inviteToken: invite.token,
          values,
          contacts,
          uploads,
        }),
      })
        .then((res) => res.json())
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [authenticated, invite, values, contacts, uploads]);

  useEffect(() => {
    if (invite) {
      didHydrate.current = true;
    }
  }, [invite]);

  function updateValue(fieldId: string, value: string | string[]) {
    startTransition(() => setValues((current) => ({ ...current, [fieldId]: value })));
  }

  useEffect(() => {
    if (values.jurisdiction === "United States") {
      updateValue("fiscalYearEnd", "December (12/31)");
    }
  }, [values.jurisdiction]);

  function addContact() {
    setContacts((current) => [...current, emptyContact()]);
  }

  async function uploadFile(fieldId: string, fileList: FileList | null) {
    if (!invite || !fileList?.length) return;
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("inviteToken", invite.token);
      formData.append("fieldId", fieldId);
      formData.append("file", file);
      const response = await fetch("/api/client/upload", { method: "POST", body: formData });
      const data = await response.json();
      setUploads(data.uploads);
    }
  }

  async function removeFile(fieldId: string, fileId: string) {
    if (!invite) return;
    const response = await fetch(
      `/api/client/upload?inviteToken=${invite.token}&fieldId=${fieldId}&fileId=${fileId}`,
      { method: "DELETE" },
    );
    const data = await response.json();
    setUploads(data.uploads);
  }

  function submit() {
    if (!invite) return;
    setSubmitState("submitting");
    fetch("/api/client/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: invite.id, inviteToken: invite.token }),
    })
      .then(() => setSubmitState("submitted"))
      .catch(() => setSubmitState("idle"));
  }

  return (
    <div className="intake-page">
      {authenticated && !consentGiven && !consentDeclined && submitState !== "submitted" && (
        <div className="consent-overlay">
          <div className="consent-dialog">
            <div className="consent-dialog-header">
              <div className="hero-badge" style={{ marginBottom: 0 }}>
                <div className="hero-badge-dot" />
                Data &amp; Privacy
              </div>
              <h2 className="consent-title">Before you begin</h2>
            </div>
            <div className="consent-body">
              <p className="consent-lead">Please read and accept our data policy before completing your intake form.</p>
              <div className="consent-policy">
                <div className="consent-policy-section">
                  <h3>What we collect</h3>
                  <p>We collect the information you provide in this form, including company details, key contacts, and any documents you upload. This is used solely to onboard you as a Route One client.</p>
                </div>
                <div className="consent-policy-section">
                  <h3>How we use it</h3>
                  <p>Your data is used exclusively by the Route One team to set up your account, coordinate onboarding, and deliver our services. It is never sold or shared with third parties.</p>
                </div>
                <div className="consent-policy-section">
                  <h3>How we store it</h3>
                  <p>All submissions are stored securely. Uploaded documents are kept in a private, access-controlled environment. You may request deletion of your data at any time by contacting us.</p>
                </div>
                <div className="consent-policy-section">
                  <h3>Your rights</h3>
                  <p>You have the right to access, correct, or request deletion of your personal data at any time. Contact <a href="mailto:privacy@routeone.com">privacy@routeone.com</a> for any data-related requests.</p>
                </div>
              </div>
            </div>
            <div className="consent-actions">
              <button className="btn-outline consent-decline" onClick={() => setConsentDeclined(true)}>Decline</button>
              <button className="btn" onClick={() => setConsentGiven(true)}>I accept — continue to form</button>
            </div>
          </div>
        </div>
      )}
      {consentDeclined && (
        <div className="consent-overlay">
          <div className="consent-dialog">
            <div className="consent-dialog-header">
              <div className="hero-badge" style={{ marginBottom: 0 }}>
                <div className="hero-badge-dot" style={{ background: "var(--danger)" }} />
                Access Restricted
              </div>
              <h2 className="consent-title">You have declined</h2>
            </div>
            <div className="consent-body">
              <p className="consent-lead">You need to accept the data policy to access and complete the intake form. No data has been collected.</p>
              <p className="editorial-copy">If you&apos;d like to reconsider, you can go back and accept. If you have concerns about our data practices, contact us at <a href="mailto:privacy@routeone.com">privacy@routeone.com</a>.</p>
            </div>
            <div className="consent-actions">
              <button className="btn" onClick={() => setConsentDeclined(false)}>Go back and review</button>
            </div>
          </div>
        </div>
      )}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <img src="/RouteOne-Logo-dark-theme.svg" alt="Route One" style={{ height: 28, display: "block" }} />
          </div>
          <div className="topbar-right">
            <div className="topbar-status" data-tone={submitState === "submitted" ? "submitted" : invite?.status || "invited"}>
              {submitState === "submitted" ? "Submitted" : authenticated ? "Verified Access" : "Secure Intake"}
            </div>
            {authenticated && submitState !== "submitted" && (
              <div className="topbar-progress">
                <span className="topbar-completion">{completion}%</span>
                <span className="topbar-autosave">
                  {saveState === "saving" ? "Saving\u2026" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : "Autosave on"}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {authenticated && submitState !== "submitted" && (
        <div className="disclaimer-bar">
          This link is shareable and your progress is persisted — you can return anytime to continue.
        </div>
      )}

      <section className="intake-hero">
        <div className="hero-inner intake-hero-inner">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            Form
          </div>
          <div className="hero-h">RouteOne</div>
          <div className="hero-h-italic">Client Onboarding</div>
          <p className="hero-tagline">
            Welcome. Please complete the form below so we can get everything we need to hit the ground running. It should only take a few minutes — your progress is saved automatically.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hs-num">{completion}%</div>
              <div className="hs-lbl">Form completion</div>
            </div>
            <div className="hero-stat">
              <div className="hs-num">{contacts.length}</div>
              <div className="hs-lbl">Key contacts</div>
            </div>
            <div className="hero-stat">
              <div className="hs-num">{intakeSections.length}</div>
              <div className="hs-lbl">Core sections</div>
            </div>
            <div className="hero-stat">
              <div className="hs-num">
                {saveState === "saving" ? "..." : saveState === "saved" ? "OK" : saveState === "error" ? "ERR" : "ON"}
              </div>
              <div className="hs-lbl">Autosave status</div>
            </div>
          </div>
        </div>
      </section>

      {!inviteToken ? (
        <section className="content-section">
          <div className="content-inner single-column">
            <div className="editorial-card stack">
              <div className="sec-divider"><span className="sec-n">00</span><span className="sec-t">Open your invite</span></div>
              <h2 className="editorial-title">Open your Route One intake link</h2>
              <p className="editorial-copy">Use the unique Route One intake URL from your email. It should look like `/?invite=...`.</p>
            </div>
          </div>
        </section>
      ) : !authenticated ? (
        <section className="content-section off">
          <div className="content-inner single-column">
            <div className="editorial-card stack">
              <div className="sec-divider"><span className="sec-n">01</span><span className="sec-t">Loading</span></div>
              <h2 className="editorial-title">Verifying your access…</h2>
              <p className="editorial-copy">Please wait while we load your intake form.</p>
            </div>
          </div>
        </section>
      ) : submitState === "submitted" ? (
        <section className="content-section">
          <div className="content-inner single-column">
            <div className="editorial-card stack success-panel">
              <div className="sec-divider"><span className="sec-n">Done</span><span className="sec-t">Intake received</span></div>
              <h2 className="editorial-title">Route One has your submission</h2>
              <p className="editorial-copy">Your responses remain saved if you need to return later, and the team can now review everything from admin.</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="content-section off contacts-section">
            <div className="content-inner intake-topbar-layout">
              <div className="intake-topbar-left">
                <div className="sidebar-card stack">
                  <div className="sec-divider"><span className="sec-n">00</span><span className="sec-t">Key contacts</span></div>
                  <div className="section-intro">
                    <div>
                      <h2 className="editorial-title">Key Contacts</h2>
                      <p className="editorial-copy">Identify the primary people Route One should coordinate with across onboarding and delivery.</p>
                    </div>
                    <button className="btn-outline" onClick={addContact}>Add contact</button>
                  </div>
                  <div className="stack">
                    {contacts.map((contact, index) => (
                      <div className="contact-card" key={contact.id}>
                        <div className="card-headline">
                          <span className="card-tag">{contact.role || `Contact ${index + 1}`}</span>
                          {index > 0 ? (
                            <button className="text-button" onClick={() => setContacts((current) => current.filter((item) => item.id !== contact.id))}>Remove</button>
                          ) : null}
                        </div>
                        <div className="field-grid">
                          {[
                            ["role", "Role"],
                            ["name", "Full Name"],
                            ["email", "Email"],
                            ["phone", "Phone / WhatsApp"],
                          ].map(([key, label]) => (
                            <div className="field" key={key}>
                              <label className="label">{label}{index === 0 && ["name", "email"].includes(key) ? <span className="req"> *</span> : null}</label>
                              {key === "role" ? (
                                <>
                                  <select
                                    className="select"
                                    value={contact[key as keyof Contact] as string}
                                    onChange={(e) =>
                                      setContacts((current) =>
                                        current.map((item) => (item.id === contact.id ? { ...item, [key]: e.target.value } : item)),
                                      )
                                    }
                                  >
                                    <option value="">Select a role</option>
                                    {contactRoleOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                  {contact.role === "Other" && (
                                    <input
                                      className="input other-specify"
                                      placeholder="Please specify role"
                                      value={contact.roleOther}
                                      onChange={(e) =>
                                        setContacts((current) =>
                                          current.map((item) => (item.id === contact.id ? { ...item, roleOther: e.target.value } : item)),
                                        )
                                      }
                                    />
                                  )}
                                </>
                              ) : (
                                <input
                                  className="input"
                                  value={contact[key as keyof Contact] as string}
                                  onChange={(e) =>
                                    setContacts((current) =>
                                      current.map((item) => (item.id === contact.id ? { ...item, [key]: e.target.value } : item)),
                                    )
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="intake-topbar-right">
                <div className="sidebar-card sticky stack">
                  <div className="sec-divider"><span className="sec-n">Nav</span><span className="sec-t">Form sections</span></div>
                  <div className="progress-block stack">
                    <strong className="progress-value">{completion}%</strong>
                    <div className="progress"><span style={{ width: `${completion}%` }} /></div>
                    <span className="meta-copy">
                      {saveState === "saving" ? "Saving…" : saveState === "saved" ? "All changes saved." : saveState === "error" ? "Save failed." : "Autosave is on."}
                    </span>
                  </div>
                  <div className="section-nav">
                    <a className="nav-item active" href="#contacts"><span className="nav-item-title">Contacts</span><span className="nav-item-meta">{contacts.length}</span></a>
                    {intakeSections.map((section) => (
                      <a key={section.id} className="nav-item" href={`#${section.id}`}>
                        <span className="nav-item-meta">{section.number}</span>
                        <span className="nav-item-title">{section.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="content-section off form-sections">
            <div className="content-inner stack-lg">
              {intakeSections.map((section) => (
                <section id={section.id} key={section.id} className="form-section">
                  <div className="sec-divider"><span className="sec-n">{section.number}</span><span className="sec-t">{section.title}</span></div>
                  <div className="section-intro split">
                    <div>
                      <h2 className="editorial-title">{section.title}</h2>
                      {section.description ? <p className="editorial-copy">{section.description}</p> : null}
                    </div>
                  </div>
                  <div className="field-grid">
                    {section.fields
                      .filter((field) => {
                        if (!field.visibleWhen) return true;
                        const depValue = values[field.visibleWhen.fieldId];
                        if (Array.isArray(field.visibleWhen.value)) {
                          return field.visibleWhen.value.includes(String(depValue));
                        }
                        return depValue === field.visibleWhen.value;
                      })
                      .map((field) => (
                        <FieldRenderer
                          key={field.id}
                          field={field}
                          value={values[field.id]}
                          otherValue={String(values[field.id + "_other"] || "")}
                          uploads={uploads[field.id] || []}
                          onChange={(value) => updateValue(field.id, value)}
                          onOtherChange={(value) => updateValue(field.id + "_other", value)}
                          onUpload={(files) => uploadFile(field.id, files)}
                          onRemoveUpload={(fileId) => removeFile(field.id, fileId)}
                        />
                      ))}
                  </div>
                </section>
              ))}

              <section className="form-section submit-section">
                <div className="sec-divider"><span className="sec-n">End</span><span className="sec-t">Submit intake</span></div>
                <div className="submit-row">
                  <p className="editorial-copy submit-copy">
                    By submitting this form you confirm the information provided is accurate. Route One treats all client
                    data with strict confidentiality.
                  </p>
                  <button className="btn" onClick={submit}>Submit intake</button>
                </div>
              </section>
            </div>
          </section>
        </>
      )}
    </div>
  );
  }

function FieldRenderer({
  field,
  value,
  otherValue,
  uploads,
  onChange,
  onOtherChange,
  onUpload,
  onRemoveUpload,
}: {
  field: BaseField;
  value: string | string[] | undefined;
  otherValue?: string;
  uploads: UploadItem[];
  onChange: (value: string | string[]) => void;
  onOtherChange?: (value: string) => void;
  onUpload: (files: FileList | null) => void;
  onRemoveUpload: (fileId: string) => void;
}) {
  const showOtherInput = field.hasOtherSpecify && (
    field.type === "checkbox-group"
      ? Array.isArray(value) && value.includes("Other")
      : value === "Other"
  );
  const isFull = field.type === "textarea" || field.type === "checkbox-group";
  const label = (
    <label className="label">
      {field.label}
      {field.required ? <span className="req"> *</span> : null}
    </label>
  );

  if (field.type === "textarea") {
    return (
      <div className="field full">
        <div className="label-row">
          {label}
          {field.hasAiAssist && (
            <button type="button" className="btn-ai" onClick={() => { /* AI fill placeholder */ }}>
              ✨ AI Fill
            </button>
          )}
        </div>
        <textarea className="textarea" value={String(value || "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={clsx("field", isFull && "full")}>
        {label}
        <select className="select" value={String(value || "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {showOtherInput && (
          <input className="input other-specify" placeholder="Please specify" value={otherValue || ""} onChange={(e) => onOtherChange?.(e.target.value)} />
        )}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className={clsx("field", isFull && "full")}>
        {label}
        <div className="choices pills">
          {field.options?.map((option) => (
            <div className="pill" data-active={value === option.value} key={option.value}>
              <input type="radio" checked={value === option.value} onChange={() => onChange(option.value)} />
              <label>{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox-group") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="field full">
        {label}
        <div className="choices pills">
          {field.options?.map((option) => {
            const active = selected.includes(option.value);
            return (
              <div className="pill" data-active={active} key={option.value}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() =>
                    onChange(active ? selected.filter((item) => item !== option.value) : [...selected, option.value])
                  }
                />
                <label>{option.label}</label>
              </div>
            );
          })}
        </div>
        {showOtherInput && (
          <input className="input other-specify" placeholder="Please specify" value={otherValue || ""} onChange={(e) => onOtherChange?.(e.target.value)} />
        )}
      </div>
    );
  }

  if (field.type === "upload") {
    return (
      <div className="field">
        {label}
        <div className="upload">
          <label className="upload-trigger">
            <span className="upload-title">Add files</span>
            <span className="upload-hint">Upload supporting documents for this section.</span>
            <input type="file" multiple={field.multiple} accept={field.accept} onChange={(e) => onUpload(e.target.files)} />
          </label>
          <div className="upload-files">
            {uploads.length ? uploads.map((file) => (
              <span className="file-chip" key={file.id}>
                <span>{file.originalName}</span>
                <button className="text-button" onClick={() => onRemoveUpload(file.id)}>Remove</button>
              </span>
            )) : <span className="meta-copy">No files uploaded yet.</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("field", isFull && "full")}>
      {label}
      {field.prefix ? (
        <div className="prefix-wrap">
          <span>{field.prefix}</span>
          <input
            className="input with-prefix"
            type={field.type}
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      ) : (
        <input
          className="input"
          type={field.type}
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}
