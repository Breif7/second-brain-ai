import Link from "next/link";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/?kind=note", label: "Notes", icon: "📝" },
  { href: "/?kind=idea", label: "Ideas", icon: "💡" },
  { href: "/?kind=class", label: "Class notes", icon: "🎓" },
  { href: "/files", label: "PDFs & files", icon: "📄" },
  { href: "/?favorite=1", label: "Favorites", icon: "⭐" },
  { href: "/trash", label: "Trash", icon: "🗑️" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-border p-4 hidden sm:flex sm:flex-col">
      <Link href="/" className="font-semibold text-lg mb-6 px-2">
        🧠 Second Brain
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-bg hover:text-white transition"
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/notes/new"
        className="mt-auto bg-accent rounded-lg py-2 text-sm font-medium text-center"
      >
        + New note
      </Link>
    </aside>
  );
}
