"use client";

import clsx from "clsx";
import { startTransition, useEffect, useRef, useState } from "react";

import { internalSections } from "@/lib/internal-schema";
import type { BaseField } from "@/lib/form-schema";
import type { InternalForm } from "@/lib/store";

type SaveState = "idle" | "saving" | "saved" | "error";

export function InternalForm({
  inviteId,
  initialData,
}: {
  inviteId: string;
  initialData: InternalForm;
}) {
  const [values, setValues] = useState<Record<string, string | string[]>>(initialData.values || {});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Object.keys(initialData.values).length > 0) {
      setValues(initialData.values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateValue(fieldId: string, value: string | string[]) {
    startTransition(() => {
      setValues((current) => ({ ...current, [fieldId]: value }));
    });
    setSaveState("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveForm({ ...values, [fieldId]: value }), 1500);
  }

  async function saveForm(currentValues: Record<string, string | string[]>) {
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/internal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, values: currentValues }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <img src="/RouteOne-Logo-dark-theme.svg" alt="Route One" style={{ height: 28, display: "block" }} />
          </div>
          <div className="topbar-right">
            <div className="topbar-status" data-tone="internal">Internal</div>
            <div className="topbar-progress">
              <span className="topbar-autosave">
                {saveState === "saving" ? "Saving\u2026" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : "Autosave on"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="disclaimer-bar">
        This is an internal form for Route One accountants only. Not visible to clients.{" "}
        <a href="/admin" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>Back to dashboard</a>
      </div>

      <section className="content-section off form-sections">
        <div className="content-inner stack-lg">
          {internalSections.map((section) => (
            <section id={section.id} key={section.id} className="form-section">
              <div className="sec-divider"><span className="sec-n">{section.number}</span><span className="sec-t">{section.title}</span></div>
              <div className="section-intro split">
                <div>
                  <h2 className="editorial-title">{section.title}</h2>
                </div>
              </div>
              <div className="field-grid">
                {section.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    onChange={(value) => updateValue(field.id, value)}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="form-section">
            <div className="submit-row">
              <p className="editorial-copy submit-copy">
                Internal form data is saved automatically. Use this form to track accountant notes and internal operational details.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: BaseField;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
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
        {label}
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
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className={clsx("field", isFull && "full")}>
        {label}
        <div className="choices pills">
          {field.options?.map((option) => {
            const active = value === option.value;
            return (
              <div className="pill" data-active={active} key={option.value}>
                <input
                  type="radio"
                  name={field.id}
                  checked={Boolean(active)}
                  onChange={() => onChange(option.value)}
                />
                <label>{option.label}</label>
              </div>
            );
          })}
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
      </div>
    );
  }

  // text, email, tel, number, date
  return (
    <div className={clsx("field", isFull && "full")}>
      {label}
      {field.prefix ? (
        <div className="pfx-wrap">
          <span className="pfx">{field.prefix}</span>
          <input
            className="input pfx-in"
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
