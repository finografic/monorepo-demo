import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';

interface SourceToggleProps {
  showRaw: boolean;
  onToggle: () => void;
}

const TOGGLE_ID = 'demo-source-raw-markdown';

export function SourceToggle({ showRaw, onToggle }: SourceToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id={TOGGLE_ID}
        checked={showRaw}
        onCheckedChange={onToggle}
        aria-label={showRaw ? 'Switch to rendered view' : 'Switch to raw markdown view'}
        className="
        h-6 w-11 shrink-0 data-[size=default]:h-6 data-[size=default]:w-11 data-unchecked:border-white data-unchecked:border-2 data-unchecked:bg-white [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:data-checked:bg-white [&_[data-slot=switch-thumb]]:bg-blue-500 [&_[data-slot=switch-thumb]]:data-checked:translate-x-5"
      />
      <Label htmlFor={TOGGLE_ID} className="cursor-pointer text-sm font-medium text-foreground">
        Raw markdown
      </Label>
    </div>
  );
}
