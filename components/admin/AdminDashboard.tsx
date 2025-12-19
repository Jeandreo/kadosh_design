import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from './layout/AdminSidebar';
import { AdminHeader } from './layout/AdminHeader';
import { DashboardView } from './dashboard/DashboardView';
import { FilesView } from './files/FilesView';
import { CategoriesView } from './categories/CategoriesView';
import { BannersView } from './banners/BannersView';
import { UsersView } from './users/UsersView';
import { useAdminData } from './hooks/useAdminData';
import { UploadModal } from './modals/UploadModal';
import { createCategory, deleteCategory, updateCategory } from '../../services/categoryService';
import { Banner } from '../../types';

export const AdminDashboard = () => {

  const {
    user,
    categories,
    refreshCategories,
    banners,
    refreshBanners,
  } = useAuth();

  // Salva umm banner
  const handleSaveBanner = async (banner: Banner) => {
  };
  // Salva umm banner
  const handleChangeUserPlan = async (banner: Banner) => {
  };



  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadOpen, setUploadOpen] = useState(false);

  const adminData = useAdminData();

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-[#121212] text-text-main font-sans">
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
          <FilesView {...adminData} onEdit={() => {}} onDelete={() => {}} />
        )}
 
        {activeTab === 'categories' && (
          <CategoriesView {...adminData} categories={categories} onCreate={createCategory} onUpdate={updateCategory} onDelete={deleteCategory} />
        )}

        {activeTab === 'banners' && (
            <BannersView
                banners={banners}
                categories={categories}
                onSave={handleSaveBanner}
            />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={adminData.users}
            onChangePlan={handleChangeUserPlan}
          />
        )}

      </main>
      {/* {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} />
      )} */}
    </div>
  );
};
