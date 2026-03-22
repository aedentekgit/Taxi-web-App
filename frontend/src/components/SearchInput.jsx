import { useState, useEffect } from 'react';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync external value changes (e.g. from Reset button)
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Debounce the input before propagating to parent (which triggers a refetch)
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only invoke onChange if it actually differs from the parent's value
      if (localValue !== (value || '')) {
        onChange(localValue);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <input
      type="search"
      name="global_search_input"
      id="global_search_input"
      autoComplete="off"
      className="filter-input"
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
}
