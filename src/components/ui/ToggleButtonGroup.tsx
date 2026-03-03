interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface SingleProps<T extends string> {
  options: ToggleOption<T>[];
  multiple?: false;
  variant?: 'outline' | 'filled';
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

interface MultiProps<T extends string> {
  options: ToggleOption<T>[];
  multiple: true;
  variant?: 'outline' | 'filled';
  value: T[];
  onChange: (value: T[]) => void;
  className?: string;
}

type ToggleButtonGroupProps<T extends string> = SingleProps<T> | MultiProps<T>;

export function ToggleButtonGroup<T extends string>(props: ToggleButtonGroupProps<T>) {
  const { options, variant = 'outline', className } = props;

  const isSelected = (v: T) =>
    props.multiple ? props.value.includes(v) : props.value === v;

  const handleClick = (v: T) => {
    if (props.multiple) {
      const next = props.value.includes(v)
        ? props.value.filter((x) => x !== v)
        : [...props.value, v];
      props.onChange(next);
    } else {
      props.onChange(v);
    }
  };

  const activeClass =
    variant === 'filled'
      ? 'border-primary bg-primary text-white'
      : 'border-primary bg-primary/5 text-primary';

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleClick(opt.value)}
          className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
            isSelected(opt.value) ? activeClass : 'border-border text-txt-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
