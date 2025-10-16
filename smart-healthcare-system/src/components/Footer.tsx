export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto max-w-6xl px-4 py-6 text-sm text-center text-foreground/70">
        © {new Date().getFullYear()} Smart Healthcare System — Urban Hospitals
      </div>
    </footer>
  );
}
