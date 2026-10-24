"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MapPin, Search, Check, X } from "lucide-react";
import { NIGERIA_STATES, getNigeriaStatesWithFallback } from "@/data/nigeriaStates";

export default function StateSelect({
  value = "",
  onChange,
  placeholder = "Select target state / capital...",
  disabled = false,
  required = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statesList, setStatesList] = useState(NIGERIA_STATES);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const searchInputRef = useRef(null);

  const [coords, setCoords] = useState({
    top: "auto",
    bottom: "auto",
    left: "auto",
    right: "auto",
    width: "auto",
    isUp: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;
    getNigeriaStatesWithFallback().then((list) => {
      if (active && list && list.length > 0) {
        setStatesList(list);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const isUp = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    setCoords({
      isUp,
      width: `${Math.max(280, rect.width)}px`,
      top: isUp ? "auto" : `${rect.bottom + 6}px`,
      bottom: isUp ? `${window.innerHeight - rect.top + 6}px` : "auto",
      left: `${Math.max(16, Math.min(rect.left, window.innerWidth - Math.max(280, rect.width) - 16))}px`,
      right: "auto"
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 60);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      const isInsideTrigger = triggerRef.current && triggerRef.current.contains(event.target);
      const isInsidePopover = popoverRef.current && popoverRef.current.contains(event.target);
      if (!isInsideTrigger && !isInsidePopover) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedState = statesList.find(
    (s) =>
      s.name.toLowerCase() === (value || "").toLowerCase() ||
      `${s.name} State`.toLowerCase() === (value || "").toLowerCase()
  );

  const filteredStates = statesList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.capital.toLowerCase().includes(search.toLowerCase()) ||
      (s.zone && s.zone.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (stateObj) => {
    onChange({ target: { value: stateObj.name } });
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: "" } });
  };

  return (
    <div className={`relative w-full ${className}`}>
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Main Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          updatePosition();
          setIsOpen((prev) => !prev);
        }}
        className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between text-left transition-all duration-200 outline-none
          ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-gray-900"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          {selectedState ? (
            <div className="truncate flex items-baseline gap-2">
              <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                {selectedState.name}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                (Capital: {selectedState.capital})
              </span>
            </div>
          ) : value ? (
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
              {value}
            </span>
          ) : (
            <span className="text-gray-400 text-sm font-medium">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && !disabled && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Menu rendered in Portal to avoid overflow clipping */}
      {isOpen && mounted && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: coords.top,
            bottom: coords.bottom,
            left: coords.left,
            width: coords.width,
            zIndex: 99999
          }}
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            coords.isUp ? "slide-in-from-bottom-2" : "slide-in-from-top-2"
          }`}
        >
          {/* Search Header */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by state or capital..."
                className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-blue-500 font-medium text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* States List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/40 p-1.5">
            {filteredStates.length > 0 ? (
              filteredStates.map((st) => {
                const isSelected =
                  selectedState && selectedState.name.toLowerCase() === st.name.toLowerCase();
                return (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => handleSelect(st)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{st.name}</span>
                        {st.zone && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {st.zone}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-medium mt-0.5">
                        Capital: <strong className="text-gray-600 dark:text-gray-300">{st.capital}</strong>
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No Nigerian states match "{search}"
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50 dark:bg-gray-950/30">
            37 States & FCT (Nigeria)
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
