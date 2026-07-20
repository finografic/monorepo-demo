import qldLogoUrl from '../../assets/qld.svg';

interface StandbyPlaceholderProps {
  label: string;
  hint?: string;
}

export function StandbyPlaceholder({ label, hint }: StandbyPlaceholderProps) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center">
        <img src={qldLogoUrl} alt="Queensland Government" className="w-72 max-w-[70vw] opacity-90" />
        <div className="flex max-w-lg flex-col items-center gap-2 px-4 pt-15">
          <p className="text-sm font-medium text-primary opacity-80">{label}</p>
          {hint ? <p className="text-xs font-normal text-primary/60">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
