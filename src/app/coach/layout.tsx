import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/auth";
import { BrandStyle } from "@/components/brand-style";
import { CoachShell } from "@/components/coach-shell";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const coach = await getCurrentCoach();
  if (!coach) redirect("/login");
  return (
    <>
      <BrandStyle
        primary={coach.brand_primary}
        secondary={coach.brand_secondary}
        accent={coach.brand_accent}
      />
      <CoachShell
        coach={{
          id: coach.id,
          name: coach.name,
          email: coach.email,
          brand_logo: coach.brand_logo,
          brand_name: coach.brand_name,
        }}
      >
        {children}
      </CoachShell>
    </>
  );
}
