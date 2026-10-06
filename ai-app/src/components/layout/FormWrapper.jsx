/**
 * FormWrapper component acts as a styled container layout for forms,
 * providing a dark frosted-glass aesthetic, rounded borders, a shadow effect,
 * and a decorative gradient border along the top edge.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Form elements and content to be rendered inside the wrapper
 * @returns {JSX.Element} The styled form wrapper container
 */

export default function FormWrapper({ children }) {
  return (
    <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3b82f6] to-[#DE145C]"></div>

      {children}
    </div>
  );
}