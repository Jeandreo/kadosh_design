import { DualLineChart } from './DualLineChart';
import { MetricCard } from './MetricCard';

interface Props {
  totalDownloads: number;
  totalUsers: number;
  subscriptionsData: number[];
  churnData: number[];
}
export const DashboardView = ({
  totalDownloads,
  totalUsers,
  subscriptionsData,
  churnData,
}: Props) => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-white mb-6">
        Performance
      </h1>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Receita Mensal"
          value="R$ 4.580,00"
          icon="fa-dollar-sign"
          color="text-green-500"
        />

        <MetricCard
          label="Downloads Totais"
          value={`${(totalDownloads / 1000).toFixed(1)}k`}
          icon="fa-cloud-download-alt"
          color="text-purple-500"
        />

        <MetricCard
          label="Usuários Totais"
          value={totalUsers}
          icon="fa-users"
          color="text-blue-500"
        />

        <MetricCard
          label="Crescimento"
          value="+12%"
          icon="fa-arrow-trend-up"
          color="text-emerald-400"
        />
      </div>

      {/* CHART */}
      <DualLineChart
        subscriptionsData={subscriptionsData}
        churnData={churnData}
      />
    </div>
  );
};
