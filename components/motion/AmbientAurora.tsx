'use client';

interface AmbientAuroraProps {
  reducedMotion: boolean;
}

export function AmbientAurora({reducedMotion}: AmbientAuroraProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05070D]"
    >
      <div
        className={`absolute -left-[12%] -top-[18%] h-[560px] w-[680px] rounded-full blur-[120px] ${
          reducedMotion ? 'opacity-30' : 'aurora-orb-a'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(79,70,229,0.52) 0%, rgba(79,70,229,0.08) 58%, transparent 75%)',
        }}
      />
      <div
        className={`absolute -right-[10%] top-[18%] h-[520px] w-[620px] rounded-full blur-[130px] ${
          reducedMotion ? 'opacity-20' : 'aurora-orb-b'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.40) 0%, rgba(16,185,129,0.06) 56%, transparent 74%)',
        }}
      />
      <div
        className={`absolute bottom-[-16%] left-[28%] h-[460px] w-[580px] rounded-full blur-[130px] ${
          reducedMotion ? 'opacity-15' : 'aurora-orb-c'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.32) 0%, rgba(79,70,229,0.12) 55%, transparent 75%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
