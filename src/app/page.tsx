import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/auth";

export default async function Home() {
  const coach = await getCurrentCoach();
  if (coach) redirect("/coach");
  redirect("/login");
}
