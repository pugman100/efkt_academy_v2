/** Shown on course pages an administrator opens in preview mode. */
export function PreviewNotice({ dark }: { dark?: boolean }) {
  return (
    <span
      title="Du ser kurset som administrator. Ingenting lagres som fremdrift."
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 25, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
        background: dark ? 'rgba(240,195,116,0.2)' : 'var(--efkt-gold)', color: dark ? 'var(--efkt-gold)' : 'var(--efkt-navy)',
      }}
    >
      <i className="ph ph-eye" style={{ fontSize: 16 }} aria-hidden /> Forhåndsvisning (admin)
    </span>
  );
}
