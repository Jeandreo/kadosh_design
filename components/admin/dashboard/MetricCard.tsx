interface Props {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export const MetricCard = ({
  label,
  value,
  icon,
  color,
}: Props) => (
  <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden group">
    
    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <i className={`fas ${icon} text-5xl ${color}`} />
    </div>

    <p className="text-text-muted text-xs uppercase font-bold tracking-wider mb-2">
      {label}
    </p>

    <h3 className="text-2xl font-extrabold text-white">
      {value}
    </h3>
  </div>
);
