import type { ComponentProps, CSSProperties, ReactNode } from 'react';

type FieldProps = { label?: ReactNode; hint?: ReactNode; error?: ReactNode; icon?: string; style?: CSSProperties };

/** Text input. Fully rounded like the buttons it sits next to; 20px+ interior air. */
export function Input({ label, hint, error, icon, style, className, ...rest }: FieldProps & ComponentProps<'input'>) {
  return (
    <label className="efkt-field" style={style}>
      {label ? <span className="efkt-field__label">{label}</span> : null}
      <span className={`efkt-field__box${error ? ' efkt-field__box--error' : ''}`}>
        {icon ? <i className={`ph ph-${icon}`} aria-hidden /> : null}
        <input className={`efkt-field__input${className ? ' ' + className : ''}`} {...rest} />
      </span>
      {error || hint ? <span className={`efkt-field__hint${error ? ' efkt-field__hint--error' : ''}`}>{error || hint}</span> : null}
    </label>
  );
}

export function Textarea({ label, hint, error, style, rows = 4, ...rest }: FieldProps & ComponentProps<'textarea'>) {
  return (
    <label className="efkt-field" style={style}>
      {label ? <span className="efkt-field__label">{label}</span> : null}
      <span className={`efkt-field__box efkt-field__box--multi${error ? ' efkt-field__box--error' : ''}`}>
        <textarea className="efkt-field__input" rows={rows} {...rest} />
      </span>
      {error || hint ? <span className={`efkt-field__hint${error ? ' efkt-field__hint--error' : ''}`}>{error || hint}</span> : null}
    </label>
  );
}

export type SelectOption = string | { value: string; label: string };

/** Native select with EFKT chrome (pill, coral caret). */
export function Select({
  label,
  hint,
  options,
  style,
  ...rest
}: FieldProps & { options: SelectOption[] } & Omit<ComponentProps<'select'>, 'children'>) {
  return (
    <label className="efkt-field" style={style}>
      {label ? <span className="efkt-field__label">{label}</span> : null}
      <span style={{ position: 'relative', display: 'block' }}>
        <select className="efkt-select" {...rest}>
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value;
            return (
              <option key={v} value={v}>
                {typeof o === 'string' ? o : o.label}
              </option>
            );
          })}
        </select>
        <i
          className="ph ph-caret-down"
          aria-hidden
          style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--efkt-coral)', pointerEvents: 'none' }}
        />
      </span>
      {hint ? <span className="efkt-field__hint">{hint}</span> : null}
    </label>
  );
}

type ToggleProps = { label?: ReactNode; style?: CSSProperties } & Omit<ComponentProps<'input'>, 'type' | 'style'>;

export function Checkbox({ label, checked, disabled, style, ...rest }: ToggleProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, position: 'relative', ...style }}>
      <input type="checkbox" className="efkt-sr" checked={checked} disabled={disabled} {...rest} />
      <span
        style={{
          width: 24, height: 24, minWidth: 24, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? 'var(--efkt-coral)' : 'var(--efkt-white)',
          border: '1px solid ' + (checked ? 'var(--efkt-coral)' : 'var(--border-default)'),
          transition: 'background var(--efkt-duration) var(--efkt-ease)',
        }}
      >
        {checked ? <i className="ph-bold ph-check" style={{ fontSize: 14, color: 'var(--efkt-white)' }} aria-hidden /> : null}
      </span>
      {label ? <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.5, color: 'var(--text-body)' }}>{label}</span> : null}
    </label>
  );
}

export function Radio({ label, checked, disabled, style, ...rest }: ToggleProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, position: 'relative', ...style }}>
      <input type="radio" className="efkt-sr" checked={checked} disabled={disabled} {...rest} />
      <span style={{ width: 24, height: 24, minWidth: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--efkt-white)', border: '1px solid ' + (checked ? 'var(--efkt-coral)' : 'var(--border-default)') }}>
        {checked ? <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--efkt-coral)' }} /> : null}
      </span>
      {label ? <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-body)' }}>{label}</span> : null}
    </label>
  );
}

/** Pill switch, coral when on. */
export function Switch({ label, checked, disabled, style, ...rest }: ToggleProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 16, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, position: 'relative', ...style }}>
      <input type="checkbox" role="switch" className="efkt-sr" checked={checked} disabled={disabled} {...rest} />
      <span style={{ width: 52, minWidth: 52, height: 30, borderRadius: 999, padding: 3, background: checked ? 'var(--efkt-coral)' : 'var(--efkt-divider)', display: 'inline-flex', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'background var(--efkt-duration) var(--efkt-ease)' }}>
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--efkt-white)' }} />
      </span>
      {label ? <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-body)' }}>{label}</span> : null}
    </label>
  );
}
