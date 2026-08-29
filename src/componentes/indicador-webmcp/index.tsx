export default function IndicadorWebmcp() {
  const activo =
    typeof document !== 'undefined' &&
    typeof document.modelContext?.registerTool === 'function';

  return (
    <span
      className={activo ? 'badge-webmcp activo' : 'badge-webmcp inactivo'}
      role="status"
      aria-label={activo ? 'WebMCP activo' : 'WebMCP no detectado'}
    >
      {activo ? 'WebMCP ready' : 'WebMCP not detected'}
    </span>
  );
}
