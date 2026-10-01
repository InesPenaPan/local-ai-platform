import { useState, useRef, useEffect } from "react";
import {
  User,
  ChevronDown,
  UserCircle,
  Brain,
  LogOut,
} from "lucide-react";

export default function UserIcon() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* User button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
      >
        {/* User information */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-sm font-medium text-slate-200">
            User
          </span>

          <span className="text-xs text-slate-500">
            Local Account
          </span>
        </div>

        {/* User icon */}
        <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center">
          <User
            size={18}
            strokeWidth={1.8}
            className="text-slate-300"
          />
        </div>

        {/* Dropdown indicator */}
        <ChevronDown
          size={15}
          className={`text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 bg-[#0b111c]/98 backdrop-blur-xl shadow-2xl overflow-hidden z-50">

          {/* Account header */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white">
              User
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Local Account
            </p>
          </div>

          {/* Menu items */}
          <div className="p-2">

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <UserCircle
                size={17}
                strokeWidth={1.8}
              />

              <span>
                Profile
              </span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Brain
                size={17}
                strokeWidth={1.8}
              />

              <span>
                Memory
              </span>
            </button>

          </div>

          {/* Logout */}
          <div className="border-t border-white/5 p-2">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
            >
              <LogOut
                size={17}
                strokeWidth={1.8}
              />

              <span>
                Log out
              </span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
