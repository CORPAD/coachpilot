import { requireCoach } from "@/lib/auth";
import { BrandSettingsForm } from "@/components/brand-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const coach = await requireCoach();
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Personnalisation</h1>
        <p className="text-zinc-500 mt-1">
          Ta marque, tes couleurs, ton logo — appliqués à ton espace coach ET aux espaces clients.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Identité visuelle</CardTitle>
          <CardDescription>Ce que tes clients verront sur leur espace personnel.</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandSettingsForm
            initial={{
              brand_name: coach.brand_name ?? "",
              brand_primary: coach.brand_primary,
              brand_secondary: coach.brand_secondary,
              brand_accent: coach.brand_accent,
              brand_logo: coach.brand_logo ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
