"use client";

import {
  type FormEvent,
  type HTMLInputTypeAttribute,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { ContactContentData } from "@/lib/contact-content";
import { defaultContactContent } from "@/lib/contact-content";

type AdminTextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
};

function AdminTextField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: AdminTextFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type AdminTextareaFieldProps = Omit<AdminTextFieldProps, "type"> & {
  rows?: number;
};

function AdminTextareaField({
  id,
  label,
  value,
  onChange,
  rows = 3,
}: AdminTextareaFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactContentData>(defaultContactContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/contact-content");
        const json = await res.json();
        setForm((current) => ({ ...current, ...json.data }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contact-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      alert("Contact mis à jour");
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ContactContentData>(
    key: K,
    value: ContactContentData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Contact - contenu</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez le contenu affiché sur la page Contact.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>En-tête</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AdminTextField
              id="contact-subtitle"
              label="Badge"
              value={form.subtitle}
              onChange={(value) => updateField("subtitle", value)}
            />
            <AdminTextField
              id="contact-title"
              label="Titre"
              value={form.title}
              onChange={(value) => updateField("title", value)}
            />
            <AdminTextareaField
              id="contact-intro"
              label="Texte d'intro"
              value={form.intro}
              onChange={(value) => updateField("intro", value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AdminTextField
              id="contact-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />
            <AdminTextField
              id="contact-response-delay"
              label="Délai de réponse"
              value={form.responseDelay}
              onChange={(value) => updateField("responseDelay", value)}
            />
            <AdminTextField
              id="contact-address-name"
              label="Lieu"
              value={form.addressName}
              onChange={(value) => updateField("addressName", value)}
            />
            <AdminTextField
              id="contact-address-line"
              label="Nom du club"
              value={form.addressLine}
              onChange={(value) => updateField("addressLine", value)}
            />
            <AdminTextField
              id="contact-address-city"
              label="Ville"
              value={form.addressCity}
              onChange={(value) => updateField("addressCity", value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liens CTA</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AdminTextField
              id="contact-cta-primary-label"
              label="CTA primaire - label"
              value={form.ctaPrimaryLabel}
              onChange={(value) => updateField("ctaPrimaryLabel", value)}
            />
            <AdminTextField
              id="contact-cta-primary-href"
              label="CTA primaire - lien"
              value={form.ctaPrimaryHref}
              onChange={(value) => updateField("ctaPrimaryHref", value)}
            />
            <AdminTextField
              id="contact-cta-secondary-label"
              label="CTA secondaire - label"
              value={form.ctaSecondaryLabel}
              onChange={(value) => updateField("ctaSecondaryLabel", value)}
            />
            <AdminTextField
              id="contact-cta-secondary-href"
              label="CTA secondaire - lien"
              value={form.ctaSecondaryHref}
              onChange={(value) => updateField("ctaSecondaryHref", value)}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving || loading}
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  );
}
