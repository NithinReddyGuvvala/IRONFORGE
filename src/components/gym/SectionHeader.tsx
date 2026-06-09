export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      <span className="text-base md:text-lg font-black uppercase tracking-[0.3em] text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display font-bold text-4xl leading-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}