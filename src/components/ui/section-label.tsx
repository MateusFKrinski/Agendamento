export default function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-muted">
      {children}
    </p>
  );
}
