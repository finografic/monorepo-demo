import qldLogoUrl from '../../assets/qld.svg';

interface StandbyPlaceholderProps {
  label: string;
}

export function StandbyPlaceholder({ label }: StandbyPlaceholderProps) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center">
        <img src={qldLogoUrl} alt="Queensland Government" className="w-72 max-w-[70vw] opacity-90" />
        <p className="text-sm pt-15 font-medium text-primary">{label}</p>
      </div>
    </div>
  );
}
