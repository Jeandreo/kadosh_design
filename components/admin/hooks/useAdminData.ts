import { useEffect, useState } from 'react';
import { getResources } from '../../../services/resourceService';
import { getUsers } from '../../../services/userService';
import { getMetrics } from '../../../services/metricsService';
import { DesignResource, User } from '../../../types';

export const useAdminData = () => {
  const [files, setFiles] = useState<DesignResource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const [subscriptionsData, setSubscriptionsData] = useState<number[]>([]);
  const [churnData, setChurnData] = useState<number[]>([]);

  const [revenue, setRevenue] = useState(0);
  const [growth, setGrowth] = useState(0);


  const loadData = async () => {
    // 🔹 Resources
    const res = await getResources();
    setFiles(res);
    setTotalDownloads(res.reduce((a, b) => a + b.downloads, 0));

    // 🔹 Users
    const usr = await getUsers();
    setUsers(usr);

    // 🔹 Metrics (backend)
    const { subscriptions, churn, days, revenue, growth } = await getMetrics();

    const subsArray = Array(days).fill(0);
    const churnArray = Array(days).fill(0);

    subscriptions.forEach((item: { day: string; total: number }) => {
      const diff = Math.floor(
        (Date.now() - new Date(item.day).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diff >= 0 && diff < days) {
        subsArray[days - diff - 1] = item.total;
      }
    });

    churn.forEach((item: { day: string; total: number }) => {
      const diff = Math.floor(
        (Date.now() - new Date(item.day).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diff >= 0 && diff < days) {
        churnArray[days - diff - 1] = item.total;
      }
    });

    setSubscriptionsData(subsArray);
    setChurnData(churnArray);
    setRevenue(revenue);
    setGrowth(growth);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    files,
    users,
    totalDownloads,
    subscriptionsData,
    churnData,
    revenue,
    growth,
    reload: loadData,
  };
};
