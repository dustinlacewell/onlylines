import React from 'react';
import { colors } from './colors';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  value: string;
  options?: string[] | SelectOption[];
  groups?: SelectGroup[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const styles = {
  select: {
    flex: 1,
    background: colors.bgInput,
    color: colors.textWhite,
    border: `1px solid ${colors.borderMedium}`,
    padding: '3px 5px',
    fontFamily: 'monospace',
    fontSize: '10px',
    borderRadius: '2px',
    minWidth: 0,
  } as React.CSSProperties,
};

export function Select({ value, options, groups, onChange, style }: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const mergedStyle = { ...styles.select, ...style };

  if (groups) {
    return (
      <select value={value} onChange={handleChange} style={mergedStyle}>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }

  const normalizedOptions: SelectOption[] = (options || []).map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <select value={value} onChange={handleChange} style={mergedStyle}>
      {normalizedOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
