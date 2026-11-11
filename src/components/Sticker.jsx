export default function Sticker({ children, className = '' }) {
  return <span className={`sticker ${className}`}>{children}</span>;
}
