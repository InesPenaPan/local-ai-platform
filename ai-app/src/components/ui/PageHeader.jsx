/**
 * PageTitle component renders a styled header section featuring a main title
 * and an optional descriptive subtitle with light font weight and tracking.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.title - The primary heading text to display
 * @param {string} [props.subtitle] - Optional secondary descriptive text displayed below the title
 * @returns {JSX.Element} The rendered page title container
 */
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