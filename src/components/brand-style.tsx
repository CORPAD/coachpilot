export function BrandStyle({
  primary,
  secondary,
  accent,
}: {
  primary: string;
  secondary: string;
  accent: string;
}) {
  const css = `:root{--brand-primary:${primary};--brand-secondary:${secondary};--brand-accent:${accent};}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
