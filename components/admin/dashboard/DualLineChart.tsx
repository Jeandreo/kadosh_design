import React, { useMemo } from 'react';

export const DualLineChart = () => {
  const days = 30;

  const { subscriptionsData, churnData } = useMemo(() => {
    const generateTrend = (base: number, volatility: number, trend: number) => {
      let currentValue = base;
      return Array.from({ length: days }, () => {
        const change = (Math.random() - 0.5) * volatility + trend;
        currentValue = Math.max(0, currentValue + change);
        return currentValue;
      });
    };

    return {
      subscriptionsData: generateTrend(40, 15, 0.8),
      churnData: generateTrend(10, 5, 0.1),
    };
  }, []);

  const maxValue = useMemo(
    () => Math.max(...subscriptionsData, ...churnData) * 1.2,
    [subscriptionsData, churnData]
  );

  const getPoints = (data: number[]) => {
    return data
      .map((val, index) => {
        const x = (index / (days - 1)) * 100;
        const y = 100 - (val / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const subsPoints = getPoints(subscriptionsData);
  const churnPoints = getPoints(churnData);

  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg mb-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">Crescimento de Assinantes</h3>
          <p className="text-xs text-text-muted">Últimos 30 dias</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-text-muted">Novas Assinaturas</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-xs text-text-muted">Cancelamentos (Churn)</span>
          </div>
        </div>
      </div>

      <div className="relative h-64 w-full">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-white/[0.03]" />
          ))}
        </div>

        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-label="Gráfico de crescimento e churn"
          role="img"
        >
          {/* churn line */}
          <polyline
            points={churnPoints}
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
            vectorEffect="non-scaling-stroke"
          />
          {/* churn area */}
          <polyline
            points={`0,100 ${churnPoints} 100,100`}
            fill="url(#gradientChurn)"
            stroke="none"
            className="opacity-20"
          />

          {/* subscriptions line */}
          <polyline
            points={subsPoints}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* subscriptions area */}
          <polyline
            points={`0,100 ${subsPoints} 100,100`}
            fill="url(#gradientSubs)"
            stroke="none"
            className="opacity-20"
          />

          <defs>
            <linearGradient id="gradientSubs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="gradientChurn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b7280" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6b7280" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
