export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex-1">
      {children}
    </section>
  );
}