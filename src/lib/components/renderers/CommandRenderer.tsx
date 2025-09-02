import React, { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface CommandItem {
  value: string;
  label: string;
  onSelect?: () => void;
}

interface CommandProps {
  placeholder?: string;
  items?: CommandItem[];
  emptyText?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const CommandRenderer: React.FC<CommandProps> = ({
  placeholder = 'Search...',
  items = [],
  emptyText = 'No results found.',
  onValueChange,
  className = ''
}) => {
  const [value, setValue] = useState('');

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleSelect = (selectedValue: string) => {
    const item = items.find(item => item.value === selectedValue);
    if (item?.onSelect) {
      item.onSelect();
    }
    handleValueChange(selectedValue);
  };

  return (
    <Command className={className}>
      <CommandInput
        placeholder={placeholder}
        value={value}
        onValueChange={handleValueChange}
      />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={() => handleSelect(item.value)}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
