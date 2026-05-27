"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Initial = {
  brand_name: string;
  brand_primary: string;
  brand_secondary: string;
  brand_accent: string;
  brand_logo: string;
};

export function BrandSettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Upload échoué");
      return;
    }
    const j = await res.json();
    setForm({ ...form, brand_logo: j.url });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/brand", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_name: form.brand_name || null,
        brand_primary: form.brand_primary,
        brand_secondary: form.brand_secondary,
        brand_accent: form.brand_accent,
        brand_logo: form.brand_logo || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Erreur");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-1.5">
        <Label>Nom de marque (affiché sur tes pages)</Label>
        <Input
          placeholder="Ex: Coach Adam Performance"
          value={form.brand_name}
          onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            {form.brand_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.brand_logo} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full brand-gradient" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={onUpload}
              className="hidden"
            />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4" />
              {uploading ? "Upload..." : form.brand_logo ? "Changer" : "Téléverser un logo"}
            </Button>
            {form.brand_logo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForm({ ...form, brand_logo: "" })}
              >
                <X className="h-3 w-3" />
                Retirer
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500">PNG, JPG, WebP ou SVG. Max 2 Mo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: "brand_primary" as const, label: "Couleur principale" },
          { key: "brand_secondary" as const, label: "Couleur secondaire" },
          { key: "brand_accent" as const, label: "Accent" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label>{label}</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="h-10 w-12 rounded-md border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              />
              <Input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="text-xs font-semibold text-zinc-500 uppercase mb-2">Aperçu</div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${form.brand_primary}, ${form.brand_accent})`,
            }}
          />
          <div className="font-semibold">{form.brand_name || "CoachPilot"}</div>
          <button
            type="button"
            style={{ backgroundColor: form.brand_primary }}
            className="ml-auto text-white px-3 py-1.5 rounded text-sm"
          >
            Bouton principal
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {saved && (
        <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-md px-3 py-2">
          ✓ Modifications enregistrées
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
