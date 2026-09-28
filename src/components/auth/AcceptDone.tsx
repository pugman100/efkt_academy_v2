import { ButtonLink } from '@/components/ui';
import { RoundIcon } from './AuthBits';

export function AcceptDone({ groups }: { groups: string[] }) {
  const gl = groups.join(' and ');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <RoundIcon icon="check" bold />
      <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, letterSpacing: '-0.04em', fontWeight: 300 }}>
        You are <span style={{ fontWeight: 800 }}>in</span>
      </h2>
      <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        {gl ? `Your profile is saved and your courses are ready — starting with what ${gl} covers.` : 'Your profile is saved and your courses are ready.'}
      </div>
      <ButtonLink href="/" iconRight="arrow-right">Go to my courses</ButtonLink>
    </div>
  );
}
