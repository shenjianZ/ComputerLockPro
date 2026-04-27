import * as Switch from "@radix-ui/react-switch";

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="toggle-row">
      <div>
        <strong style={{ fontSize: 14 }}>{title}</strong>
        <p style={{ fontSize: 12 }}>{description}</p>
      </div>
      <Switch.Root
        className="switch-root"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </div>
  );
}
