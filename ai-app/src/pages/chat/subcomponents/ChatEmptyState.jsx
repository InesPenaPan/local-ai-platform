/**
 * ChatEmptyState component displays the initial empty state of the chat interface,
 * featuring a customizable icon with background glow effects, a title, and an optional subtitle.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {React.ComponentType<{size?: number, strokeWidth?: number, className?: string}>} props.icon - The Lucide icon component to render in the center
 * @param {string} props.title - The primary message or title displayed below the icon
 * @param {string} [props.subtitle] - Optional secondary descriptive text for further guidance
 * @returns {JSX.Element} The rendered chat empty state container
 */
export default function ChatEmptyState({icon: Icon, title, subtitle,}) {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in pointer-events-none">

      {/* Icon and background glow */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-[#3b82f6]/45 blur-[35px] -translate-x-6 rounded-full" />
        <div className="absolute w-32 h-32 bg-[#DE145C]/45 blur-[35px] translate-x-6 rounded-full" />

        <Icon
          size={65}
          strokeWidth={1.2}
          className="text-slate-200 relative z-10 drop-shadow-lg"
        />
      </div>

      {/* Text */}
      <div className="text-center relative z-10 mt-20">
        <p className="text-lg font-medium text-slate-200 tracking-wide">
          {title}
        </p>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}