import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";

const OPTIONS = [
  { label: "All Systems", value: "all" },
  { label: "Include BTS", value: "BTS" },
  { label: "Include MRT", value: "MRT" },
  { label: "Include SRT", value: "SRT" },
  { label: "Include ARL", value: "Airport" },
];

export default function SystemFilterDropdown({ value, onChange }) {
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  const handleSelect = (option) => {
    setSelected(option.value);
    onChange(option.value);
  };

  return (
    <div className="relative w-35 md:w-40">
      <Menu as="div" className="relative w-full">
        <MenuButton className="inline-flex w-full justify-between rounded-lg bg-[#0c152a]/80 px-3 py-2 
          text-sm text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent-2)] focus:outline-none"
        >
          {OPTIONS.find((opt) => opt.value === selected)?.label || "All Systems"}
          <ChevronDownIcon aria-hidden="true" className="h-5 w-5 text-[var(--text-secondary)]" />
        </MenuButton>

        <MenuItems
          transition
          modal={false}
          className="absolute left-0 z-50 mt-2 w-full origin-top rounded-md bg-[#0d182d] 
          border border-[var(--border)] shadow-xl focus:outline-none
          overflow-y-auto transition-all duration-200 ease-out
          scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800
          data-closed:scale-95 data-closed:opacity-0 data-closed:transform 
          data-enter:duration-100 data-enter:ease-out 
          data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            {OPTIONS.map((option) => (
              <MenuItem key={option.value}>
                {({ focus }) => (
                  <button
                    onClick={() => handleSelect(option)}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      focus
                        ? "bg-white/10 text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {option.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
