export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full border rounded-lg p-5">
      {children}
    </div>
  );
}