import { useEffect, useState } from 'react';
import { getResources, getUsers } from '../../../services/resourceService';
import { DesignResource, User } from '../../../types';

export const useAdminData = () => {
  const [files, setFiles] = useState<DesignResource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const loadData = async () => {
    const res = await getResources();
    setFiles(res);
    setTotalDownloads(res.reduce((a, b) => a + b.downloads, 0));

    const usr = await getUsers();
    setUsers(usr);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    files,
    users,
    totalDownloads,
    reload: loadData,
  };
};
