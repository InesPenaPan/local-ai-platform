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