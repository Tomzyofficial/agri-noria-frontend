"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  value = "",
  onChange,
  placeholder = "Select date...",
  minDate = null,
  maxDate = null,
  disabled = false,
  required = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const [coords, setCoords] = useState({
    top: "auto",
    bottom: "auto",
    left: "auto",
    right: "auto",
    isUp: false,
    isRight: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse date string (YYYY-MM-DD)
  const parseDateString = (str) => {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(str);
  };

  const selectedDate = value ? parseDateString(value) : null;
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

  useEffect(() => {
    if (value) {
      const parsed = parseDateString(value);
      if (parsed && !isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  // Smart floating coordinates calculation
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 340;
    const popoverWidth = 320;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip upwards if space below is too tight and there is room above
    const isUp = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    // Align to right edge of trigger if on the right side of the screen
    const isRight =
      rect.left + popoverWidth > window.innerWidth - 16 ||
      (rect.right - popoverWidth >= 16 && rect.left > window.innerWidth / 2);

    setCoords({
      isUp,
      isRight,
      top: isUp ? "auto" : `${rect.bottom + 8}px`,
      bottom: isUp ? `${window.innerHeight - rect.top + 8}px` : "auto",
      left: isRight ? "auto" : `${Math.max(16, rect.left)}px`,
      right: isRight ? `${Math.max(16, window.innerWidth - rect.right)}px` : "auto"
    });
  }, []);

  // Recalculate position when opened, or on scroll / resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Click outside listener (handles portal DOM safely)
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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate(new Date(newYear, month, 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewDate(new Date(year, newMonth, 1));
  };

  const formatDateToString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleDaySelect = (dayNum) => {
    const chosen = new Date(year, month, dayNum);
    const dateStr = formatDateToString(chosen);
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: "" } });
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    onChange({ target: { value: formatDateToString(today) } });
    setViewDate(today);
    setIsOpen(false);
  };

  // Build calendar matrix
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const formatDisplay = (d) => {
    if (!d || isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const minObj = minDate ? parseDateString(minDate) : null;
  const maxObj = maxDate ? parseDateString(maxDate) : null;

  const isDayDisabled = (d) => {
    if (minObj) {
      const minStart = new Date(minObj.getFullYear(), minObj.getMonth(), minObj.getDate());
      if (d < minStart) return true;
    }
    if (maxObj) {
      const maxEnd = new Date(maxObj.getFullYear(), maxObj.getMonth(), maxObj.getDate());
      if (d > maxEnd) return true;
    }
    return false;
  };

  const today = new Date();
  const isToday = (d) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelected = (d) =>
    selectedDate &&
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 5; y <= currentYear + 15; y++) {
    yearOptions.push(y);
  }

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

      {/* Input Trigger Button */}
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
            <CalendarIcon className="w-4 h-4" />
          </div>
          {selectedDate ? (
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {formatDisplay(selectedDate)}
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
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </button>

      {/* Portal Calendar Popover - floats outside any clipped parent modal */}
      {isOpen && mounted && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: coords.top,
            bottom: coords.bottom,
            left: coords.left,
            right: coords.right,
            zIndex: 99999
          }}
          className={`w-80 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 transition-all duration-200 animate-in fade-in zoom-in-95 ${
            coords.isUp ? "slide-in-from-bottom-2" : "slide-in-from-top-2"
          }`}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between gap-1 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={handleMonthChange}
                className="bg-transparent text-sm font-black text-gray-900 dark:text-gray-100 cursor-pointer outline-none hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={handleYearChange}
                className="bg-transparent text-sm font-black text-gray-900 dark:text-gray-100 cursor-pointer outline-none hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {yearOptions.map((yVal) => (
                  <option key={yVal} value={yVal} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {yVal}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Prev month fill */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const day = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-xs text-gray-300 dark:text-gray-700 select-none"
                >
                  {day}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const disabledDay = isDayDisabled(dateObj);
              const selected = isSelected(dateObj);
              const todayDay = isToday(dateObj);

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleDaySelect(dayNum)}
                  className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer
                    ${
                      selected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                        : disabledDay
                        ? "opacity-25 cursor-not-allowed text-gray-400 line-through"
                        : todayDay
                        ? "border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }
                  `}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleToday}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-gray-400 hover:text-rose-500 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
