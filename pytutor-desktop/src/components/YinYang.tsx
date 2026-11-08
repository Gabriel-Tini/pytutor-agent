export function YinYang({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#fff" stroke="#fff" strokeWidth="2" />
      <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2 Z" fill="#141414" />
      <circle cx="50" cy="26" r="7" fill="#141414" />
      <circle cx="50" cy="74" r="7" fill="#fff" />
    </svg>
  );
}
