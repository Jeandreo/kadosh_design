import React, { useMemo } from 'react';

interface DualLineChartProps {
  subscriptionsData: number[];
  churnData: number[];
  days?: number;
}

export const DualLineChart = ({
  subscriptionsData,
  churnData,
  days,
}: DualLineChartProps) => {

  const safeSubs = subscriptionsData ?? [];
  const safeChurn = churnData ?? [];

  const resolvedDays =
    days ??
    Math.max(safeSubs.length, safeChurn.length, 1);

  const maxValue = useMemo(() => {
    const all = [...safeSubs, ...safeChurn];

    if (all.length === 0) return 1;

    const max = Math.max(...all);
    return max < 5 ? 5 : max * 1.2; // piso visual
  }, [safeSubs, safeChurn]);

  const getPoints = (data: number[]) => {
    if (data.length === 0) return '';

    return data
      .map((val, index) => {
        const x = (index / (resolvedDays - 1)) * 100;
        const y = 100 - (val / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const subsPoints = getPoints(safeSubs);
  const churnPoints = getPoints(safeChurn);

  const hasData = safeSubs.length > 0 || safeChurn.length > 0;

  console.log('DualLineChart props:', {
    subscriptionsData,
    churnData,
    days,
  });


  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">
            Crescimento de Assinantes
          </h3>
          <p className="text-xs text-text-muted">
            Últimos {resolvedDays} dias
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-text-muted">
              Novas Assinaturas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-xs text-text-muted">
              Cancelamentos (Churn)
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-64 w-full">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-full h-px bg-white/[0.03]" />
          ))}
        </div>

        {hasData ? (
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Churn */}
            <polyline
              points={churnPoints}
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              opacity={0.6}
            />
            <polyline
              points={`0,100 ${churnPoints} 100,100`}
              fill="url(#gradientChurn)"
            />

            {/* Subscriptions */}
            <polyline
              points={subsPoints}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={`0,100 ${subsPoints} 100,100`}
              fill="url(#gradientSubs)"
            />

            <defs>
              <linearGradient id="gradientSubs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="gradientChurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7280" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6b7280" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Sem dados para exibir
          </div>
        )}
      </div>
    </div>
  );
};
