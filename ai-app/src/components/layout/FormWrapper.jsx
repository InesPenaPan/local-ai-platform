export default function FormWrapper({ children }) {
  return (
    <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3b82f6] to-[#DE145C]"></div>
      
      {/* Everything placed inside the wrapper will be rendered here */}
      {children}
    </div>
  );
}