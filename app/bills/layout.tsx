export default function BillsLayout({
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