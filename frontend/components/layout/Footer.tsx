// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="pt-1 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} My Dashboard. All rights reserved.
      </div>
    </footer>
  );
}