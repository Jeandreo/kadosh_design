import { useState }         from 'react';
import { useAuth }          from '../../../contexts/AuthContext';
import { AdminSidebar }     from '../layout/AdminSidebar';
import { AdminHeader }      from '../layout/AdminHeader';
import { DashboardView }    from '../dashboard/DashboardView';
import { FilesView }        from '../files/FilesView';
import { CategoriesView }   from '../categories/CategoriesView';
import { BannersView }      from '../banners/BannersView';
import { UsersView }        from '../users/UsersView';
import { useAdminData }     from '../hooks/useAdminData';
import { UploadModal }      from '../modals/UploadModal';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadOpen, setUploadOpen] = useState(false);

  const adminData = useAdminData();

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onNewUpload={() => setUploadOpen(true)}
      />

      <main className="flex-1 md:ml-64">
        <AdminHeader activeTab={activeTab} />

        {activeTab === 'dashboard' && (
          <DashboardView
            totalDownloads={adminData.totalDownloads}
            totalUsers={adminData.users.length}
          />
        )}

        {activeTab === 'files' && (
          <FilesView {...adminData} />
        )}

        {activeTab === 'categories' && (
          <CategoriesView />
        )}

        {activeTab === 'banners' && (
          <BannersView />
        )}

        {activeTab === 'users' && (
          <UsersView users={adminData.users} />
        )}
      </main>

      {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} />
      )}
    </div>
  );
};
