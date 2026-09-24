export default function PageTitle({ title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-4xl font-bold text-white tracking-wide">
          {title}
        </h1>
      </div>
      
      {subtitle && (
        <p className="text-slate-400 text-base md:text-lg mt-2 font-light tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}