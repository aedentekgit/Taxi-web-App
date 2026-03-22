import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function CustomSelect({ className, value, onChange, children, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyles, setDropdownStyles] = useState({});
  const [dropdownId] = useState(() => 'portal-dropdown-' + Math.random().toString(36).substr(2, 9));
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown && dropdown.contains(e.target)) return;
        setIsOpen(false);
      }
    }
    function updatePosition() {
      if (!isOpen || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < 240 && rect.top > spaceBelow;
      setDropdownStyles({
        position: 'fixed',
        top: openUpwards ? 'auto' : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : 'auto',
        left: rect.left,
        width: rect.width,
        zIndex: 999999
      });
    }
    function handleScroll(e) {
      if (!isOpen) return;
      const dropdown = document.getElementById(dropdownId);
      if (dropdown && dropdown.contains(e.target)) return; // don't close if scrolling the dropdown itself
      setIsOpen(false);
    }

    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleScroll);
      document.addEventListener('scroll', handleScroll, true); 
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, dropdownId]);

  const options = React.Children.toArray(children)
    .filter(child => child?.type === 'option')
    .map(child => ({
      value: child.props.value !== undefined ? child.props.value : child.props.children,
      label: child.props.children,
      disabled: child.props.disabled
    }));

  const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

  const handleSelect = (option, e) => {
    e.stopPropagation();
    if (option.disabled) return;
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: option.value } });
    }
  };

  return (
    <>
      <style>{`
        .custom-select-dropdown {
          background-color: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 999999;
        }
        .custom-select-option {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.15s;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text);
        }
        .custom-select-option:hover {
          background-color: #f8fafc;
        }
        .custom-select-option.active {
          background-color: var(--orange);
          color: #ffffff;
          font-weight: 600;
        }
        .custom-select-option.active:hover {
          background-color: var(--orange);
        }
        .custom-select-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <div className={`relative ${props.disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`} ref={containerRef} style={props.style || { minWidth: 120 }}>
        <div 
          className={`flex items-center justify-between cursor-pointer ${className || 'form-input'}`}
          style={{ paddingRight: 10, backgroundRepeat: 'unset', backgroundImage: 'none', userSelect: 'none' }}
          onClick={(e) => { e.stopPropagation(); if (!props.disabled) setIsOpen(!isOpen); }}
          tabIndex={0}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : 'Select...'}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
               style={{ width: 14, height: 14, marginLeft: 8, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        {isOpen && typeof window !== 'undefined' && createPortal(
          <div 
            id={dropdownId}
            style={{ ...dropdownStyles, maxHeight: 240, overflowY: 'auto' }}
            className="custom-select-dropdown overflow-hidden"
          >
            <ul className="m-0 p-0 list-none">
              {options.map((option, i) => {
                const isActive = String(option.value) === String(value);
                const isDisabled = option.disabled;
                return (
                  <li 
                    key={i}
                    className={`custom-select-option ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={(e) => handleSelect(option, e)}
                  >
                    {option.label}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}
