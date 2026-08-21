// components/SensorCard.tsx

interface SensorCardProps {
  label: string;
  value: string | number;
  isDarkMode: boolean; // Tambahan prop tema
}

export default function SensorCard({ label, value, isDarkMode }: SensorCardProps) {
  return (
    <div className={`p-5 rounded-xl border flex flex-col items-center justify-center transition-all 
      ${isDarkMode 
        ? 'bg-slate-800/50 border-slate-700/50 text-slate-100 hover:border-slate-600' 
        : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-sm'
      }`}>
      <p className={`text-xs font-semibold tracking-widest mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className="text-2xl font-mono font-light">{value}</p>
    </div>
  );
}