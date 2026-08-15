import React, { useState, useRef, useEffect } from 'react';

/**
 * AnimatedSelect Component
 * Replaces standard HTML <select> elements with an animated, accessible,
 * customized dropdown with smooth open/close transitions, hover micro-animations,
 * icon support, and keyboard accessibility.
 */
export default function AnimatedSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  icon = null,
  size = "md",
  name = "",
  id = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options array: supports strings ["A", "B"] or objects [{ value: "A", label: "Alpha", iconClass: "..." }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.label,
        label: opt.label || String(opt.value),
        iconClass: opt.iconClass || opt.icon,
        color: opt.color,
        description: opt.description || opt.desc,
        badge: opt.badge
      };
    }
    return {
      value: opt,
      label: String(opt),
      iconClass: null,
      color: null,
      description: null,
      badge: null
    };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard events (Escape to close, Arrows, Enter)
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex(opt => String(opt.value) === String(value));
        if (currentIndex < normalizedOptions.length - 1) {
          handleSelect(normalizedOptions[currentIndex + 1].value);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        const currentIndex = normalizedOptions.findIndex(opt => String(opt.value) === String(value));
        if (currentIndex > 0) {
          handleSelect(normalizedOptions[currentIndex - 1].value);
        }
      }
    }
  };

  const handleSelect = (val) => {
    if (disabled) return;
    if (onChange) {
      // Support both direct value or synthetic event pattern for backwards compatibility
      onChange({ target: { value: val, name } });
    }
    setIsOpen(false);
  };

  // Size variations
  const sizeStyles = {
    sm: "py-1.5 px-3 text-[11px]",
    md: "py-2.5 px-3.5 text-[12.5px]",
    lg: "py-3 px-4 text-[13.5px]"
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block w-full text-left font-sans select-none ${className}`}
      onKeyDown={handleKeyDown}
      id={id}
    >
      {/* Hidden input for standard form submission if needed */}
      <input type="hidden" name={name} value={value || ''} />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full bg-white text-[#071A35] font-bold rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${sizeStyles[size] || sizeStyles.md} ${
          isOpen
            ? "border-[#00c2cb] ring-2 ring-[#00c2cb]/15 shadow-sm"
            : "border-[#E8E1D5] hover:border-[#00c2cb]/60 hover:bg-slate-50/50"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {icon && <i className={`${icon} text-slate-400 text-xs shrink-0`} />}
          {selectedOption?.iconClass && (
            <i className={`${selectedOption.iconClass} text-[#00c2cb] text-xs shrink-0`} />
          )}
          <span className={`truncate ${selectedOption ? "text-[#071A35]" : "text-slate-400 font-medium"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1 text-slate-400">
          <i
            className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180 text-[#00c2cb]" : ""
            }`}
          />
        </div>
      </button>

      {/* Animated Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-[120] mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[0_10px_35px_rgba(7,26,53,0.15)] border border-[#E8E1D5] custom-scrollbar animate-dropdown-open origin-top backdrop-blur-md ${dropdownClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="py-3 text-center text-xs font-semibold text-slate-400">
              No options available
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {normalizedOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#071A35] text-white shadow-xs"
                        : "text-[#071A35] hover:bg-[#00c2cb]/10 hover:text-[#00a8b5] hover:translate-x-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {opt.iconClass && (
                        <i
                          className={`${opt.iconClass} text-xs transition-colors shrink-0 ${
                            isSelected ? "text-[#00c2cb]" : "text-slate-400 group-hover:text-[#00a8b5]"
                          }`}
                        />
                      )}
                      <div className="flex flex-col text-left truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.description && (
                          <span
                            className={`text-[10px] font-normal truncate ${
                              isSelected ? "text-slate-300" : "text-slate-400"
                            }`}
                          >
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <i className="fa-solid fa-check text-[10px] text-[#00c2cb] shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
