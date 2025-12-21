import React, { useState, useEffect, useMemo } from 'react';
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
import { api } from '../../services/api';
import { createCategory, deleteCategory, updateCategory } from '../../services/categoriesService';
import { addResource, getResources, updateResource, deleteResource } from '../../services/resourceService';
import { getUsers, updateUserPlan } from '../../services/userService';
import { DesignResource, Category, Banner, User, UserPlan } from '../../types';


export const AdminDashboard = () => {

  const { user, categories, refreshCategories, banners, refreshBanners } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileList, setFileList] = useState<DesignResource[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [loadError, setLoadError] = useState(false); 

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof DesignResource; direction: 'asc' | 'desc' } | null>(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newWatermarkImageUrl, setNewWatermarkImageUrl] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState(''); 
  const [zipFileName, setZipFileName] = useState('');
  const [resourceType, setResourceType] = useState('PSD');
  const [orientation, setOrientation] = useState('Portrait');

  // New Metadata Fields
  const [newResolution, setNewResolution] = useState('200 DPI');
  const [newDimensions, setNewDimensions] = useState('');
  const [newFileSize, setNewFileSize] = useState('');

  const [isPremium, setIsPremium] = useState(true);
  const [isCanvaAvailable, setIsCanvaAvailable] = useState(false);
  const [canvaUrl, setCanvaUrl] = useState('');
  
  const [adminSearch, setAdminSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [totalDownloads, setTotalDownloads] = useState(0);

  // Category Manager State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Banner Manager State
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '', subtitle: '', cta: '', category: '', image: ''
  });


  useEffect(() => {
    if (!user || user.role !== 'admin') {
        window.location.href = '/'; 
    }
  }, [user]);

  useEffect(() => {
      if (isUploadModalOpen) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'auto';
      }
      return () => { document.body.style.overflow = 'auto'; };
  }, [isUploadModalOpen]);

  const loadData = async () => {
    try {
        setLoadError(false);
        const data = await getResources();
        setFileList(data);
        const downloads = data.reduce((acc, curr) => acc + curr.downloads, 0);
        setTotalDownloads(downloads);
        
        const users = await getUsers();
        setUserList(users);
    } catch (e) {
        console.error("Load Data Error:", e);
        setLoadError(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev => 
      prev.includes(catName) 
        ? prev.filter(c => c !== catName)
        : [...prev, catName]
    );
  };

  const openUploadModal = () => {
      setIsEditMode(false);
      setNewTitle('');
      setSelectedCategories(categories.length > 0 ? [categories[0].name] : ['Flyers']);
      setKeywords('');
      setNewImageUrl('');
      setNewWatermarkImageUrl('');
      setNewDownloadUrl('');
      setZipFileName('');
      setResourceType('PSD');
      setOrientation('Portrait');
      
      setNewResolution('200 DPI');
      setNewDimensions('');
      setNewFileSize('');

      setIsPremium(true);
      setIsCanvaAvailable(false);
      setCanvaUrl('');
      setEditingId(null);
      setIsUploadModalOpen(true);
      console.log(123);
  };

  const openEditModal = (resource: DesignResource) => {
      setIsEditMode(true);
      setNewTitle(resource.title);
      setSelectedCategories(resource.categories || []); // Load multiple categories
      setKeywords(resource.searchTerms || '');
      setNewImageUrl(resource.imageUrl);
      setNewWatermarkImageUrl(resource.watermarkImageUrl || '');
      setNewDownloadUrl(resource.downloadUrl || ''); 
      setZipFileName(resource.downloadUrl ? resource.downloadUrl.split('/').pop() || 'arquivo_existente.zip' : '');
      setResourceType(resource.format === 'CANVA' ? 'PSD' : resource.format); 
      setOrientation(resource.orientation);
      setNewResolution(resource.resolution || '200 DPI');
      setNewDimensions(resource.dimensions || '');
      setNewFileSize(resource.fileSize || '');
      setIsPremium(resource.premium);
      setIsCanvaAvailable(resource.canvaAvailable || false);
      setCanvaUrl(resource.canvaUrl || '');
      setEditingId(resource.id);
      setIsUploadModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
      setResourceToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const showFeedback = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToastMessage(msg);
      setToastType(type);
      setShowToast(true);
  }

  // --- IMAGE PROCESSING HELPERS ---

  const processImage = (file: File, maxWidth: number, applyWatermark: boolean): Promise<string> => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new Image();
              img.crossOrigin = "anonymous"; 
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                      if (width > maxWidth) {
                          height *= maxWidth / width;
                          width = maxWidth;
                      }
                  } else {
                      if (height > maxWidth) {
                          width *= maxWidth / height;
                          height = maxWidth;
                      }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  ctx.drawImage(img, 0, 0, width, height);

                  if (applyWatermark) {
                      ctx.save();
                      ctx.rotate(-30 * Math.PI / 180);
                      ctx.font = "bold 24px Inter, sans-serif";
                      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                      ctx.textAlign = "center";
                      
                      for (let y = -height; y < height * 2; y += 120) {
                          for (let x = -width; x < width * 2; x += 300) {
                              ctx.fillText("KADOSH DESIGN", x, y);
                          }
                      }
                      ctx.restore();

                      ctx.save();
                      ctx.translate(width / 2, height / 2);
                      ctx.rotate(-30 * Math.PI / 180);
                      ctx.font = "bold 60px Inter, sans-serif";
                      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.fillText("KADOSH DESIGN", 0, 0);
                      ctx.restore();
                  }

                  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                  resolve(dataUrl);
              };
              img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
      });
  };

  const dataURLtoBlob = (dataurl: string) => {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
  };

  const uploadFileToServer = async (file: File | Blob, originalName?: string): Promise<{ url: string; filename: string; size: number }> => {
      const formData = new FormData();
      formData.append('file', file, originalName || (file instanceof File ? file.name : 'upload.jpg'));

      try {
          const result = await api.upload<{ url: string; filename: string; size: number }>('/upload', formData);
          return result;
      } catch (error: any) {
          console.error("Erro no upload:", error);
          showFeedback(error.message || "Erro ao fazer upload do arquivo. Verifique o servidor.", 'error');
          throw error;
      }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
          setNewDimensions(`${img.width}x${img.height}px`);
          
          if (img.width > img.height) {
              setOrientation('Landscape');
          } else if (img.height > img.width) {
              setOrientation('Portrait');
          } else {
              setOrientation('Square');
          }

          URL.revokeObjectURL(img.src);
      };

      try {
          showFeedback("Enviando imagem para o servidor...", "info");
          const uploadResult = await uploadFileToServer(file);
          setNewImageUrl(uploadResult.url);

          const previewBase64 = await processImage(file, 1000, true);
          const watermarkedBlob = dataURLtoBlob(previewBase64);
          const wmUploadResult = await uploadFileToServer(watermarkedBlob, `wm-${file.name}`);
          setNewWatermarkImageUrl(wmUploadResult.url);

          showFeedback("Imagens processadas e enviadas com sucesso!");
      } catch (e) {
          showFeedback("Falha no upload das imagens. Verifique se o servidor está ativo.", "error");
      }
  };

  const handleGenericImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const result = await uploadFileToServer(file);
        setter(result.url);
        showFeedback("Imagem enviada!");
    } catch (e) {
        // error handled in uploadFileToServer
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setZipFileName(file.name);
      setNewFileSize(formatBytes(file.size));

      try {
          showFeedback("Enviando arquivo...", "info");
          const result = await uploadFileToServer(file);
          setNewDownloadUrl(result.url);
          showFeedback("Arquivo enviado com sucesso!");
      } catch (e) {
          showFeedback("Erro ao enviar arquivo.", "error");
      }
  };

  const generateDemoContent = async () => {
    showFeedback("Gerando conteúdo de demonstração...", "info");
    
    try {
        const demoImageUrl = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"; 
        
        let file: File;
        try {
            // Unsplash sometimes blocks scripts, using a fallback if fetch fails
            const response = await fetch(demoImageUrl);
            if (!response.ok) throw new Error("Failed to fetch demo image");
            const blob = await response.blob();
            file = new File([blob], "demo-worship.jpg", { type: "image/jpeg" });
        } catch (fetchError) {
             console.warn("External image fetch failed, creating blank image");
             const canvas = document.createElement('canvas');
             canvas.width = 800; canvas.height = 1000;
             const ctx = canvas.getContext('2d');
             if(ctx) { ctx.fillStyle = '#333'; ctx.fillRect(0,0,800,1000); ctx.fillStyle='#fff'; ctx.fillText("DEMO", 350, 500); }
             const blob = await new Promise<Blob | null>(r => canvas.toBlob(r));
             if(!blob) throw new Error("Canvas blob failed");
             file = new File([blob], "demo-fallback.jpg", { type: "image/jpeg" });
        }

        const uploadResult = await uploadFileToServer(file);
        setNewImageUrl(uploadResult.url);

        const previewBase64 = await processImage(file, 1000, true);
        const watermarkedBlob = dataURLtoBlob(previewBase64);
        const wmUploadResult = await uploadFileToServer(watermarkedBlob, "wm-demo.jpg");
        setNewWatermarkImageUrl(wmUploadResult.url);

        // Fill Data
        setNewTitle("Culto de Adoração - Atmosfera");
        setSelectedCategories(['Cultos', 'Flyers']);
        setKeywords("worship, adoração, igreja, jovem, atmosfera");
        setOrientation('Landscape');
        setResourceType('PSD');
        setNewResolution('300 DPI');
        setNewDimensions(`1080x1350px`);
        setNewFileSize("45 MB");

        setNewDownloadUrl("/uploads/dummy-demo.zip");
        setZipFileName("culto_adoracao_psd.zip");
        setIsPremium(true);

        showFeedback("Conteúdo de demonstração gerado!");

    } catch (e) {
        console.error(e);
        showFeedback("Erro ao gerar demo. Verifique se o backend está rodando.", "error");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) {
        showFeedback("Por favor, selecione uma imagem para a capa.", 'error');
        return;
    }

    if (selectedCategories.length === 0) {
        showFeedback("Selecione pelo menos uma categoria.", 'error');
        return;
    }
    
    if (!isCanvaAvailable && !newDownloadUrl) {
         showFeedback("Por favor, faça upload do arquivo ou ative o Canva.", 'error');
         return;
    }

    if (isEditMode && editingId) {
        const originalResource = fileList.find(r => r.id === editingId);
        
        const updatedProduct: DesignResource = {
            id: editingId,
            title: newTitle,
            categories: selectedCategories,
            searchTerms: keywords,
            imageUrl: newImageUrl,
            watermarkImageUrl: newWatermarkImageUrl || undefined,
            downloads: originalResource ? originalResource.downloads : 0,
            author: user?.name || 'Kadosh Admin',
            premium: isPremium,
            tags: ['editado', ...selectedCategories.map(c => c.toLowerCase())],
            format: resourceType as any, 
            orientation: orientation as any,
            canvaAvailable: isCanvaAvailable,
            canvaUrl: isCanvaAvailable ? canvaUrl : undefined,
            downloadUrl: newDownloadUrl,
            resolution: newResolution,
            dimensions: newDimensions,
            fileSize: newFileSize
        };
        await updateResource(updatedProduct);
        showFeedback("Arte atualizada com sucesso!");
    } else {
        const newProduct: DesignResource = {
            id: Date.now().toString(),
            title: newTitle,
            categories: selectedCategories,
            searchTerms: keywords,
            imageUrl: newImageUrl,
            watermarkImageUrl: newWatermarkImageUrl || undefined,
            downloads: 0,
            author: user?.name || 'Kadosh Admin',
            premium: isPremium,
            tags: ['novo', 'upload', ...selectedCategories.map(c => c.toLowerCase())],
            format: resourceType as any,
            orientation: orientation as any,
            canvaAvailable: isCanvaAvailable,
            canvaUrl: isCanvaAvailable ? canvaUrl : undefined,
            downloadUrl: newDownloadUrl,
            resolution: newResolution,
            dimensions: newDimensions,
            fileSize: newFileSize
        };
        await addResource(newProduct);
        showFeedback("Arte publicada com sucesso!");
    }

    loadData();
    setIsUploadModalOpen(false);
  };

  const confirmDelete = () => {
      if (resourceToDelete) {
          deleteResource(resourceToDelete);
          loadData();
          setIsDeleteModalOpen(false);
          setResourceToDelete(null);
          showFeedback("Arte excluída com sucesso!", 'info');
      }
  };

  // --- Category Management Logic ---
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;

    try {
        const created = await createCategory(newCatName);
        refreshCategories();
        setNewCatName('');
        showFeedback('Categoria criada com sucesso!');
    } catch (e: any) {
        showFeedback(e.message || 'Erro ao criar categoria', 'error');
    }
  };

  // --- Banner Management Logic ---
  const handleEditBanner = (banner: Banner) => {
      setEditingBannerId(banner.id);
      setBannerForm(banner);
  }

  const handleCreateBanner = () => {
      setEditingBannerId('new');
      setBannerForm({
          title: '',
          subtitle: '',
          cta: 'Ver Detalhes',
          category: categories.length > 0 ? categories[0].name : '',
          image: ''
      });
  }

  const handleSaveBanner = () => {
      if (!bannerForm.title || !bannerForm.image || !bannerForm.category) {
          showFeedback("Preencha os campos obrigatórios", "error");
          return;
      }

      let updatedBanners = [...banners];
      
      if (editingBannerId === 'new') {
          // Creating new banner
          const newBanner: Banner = {
              id: Date.now().toString(),
              title: bannerForm.title || 'Novo Banner',
              subtitle: bannerForm.subtitle || '',
              cta: bannerForm.cta || 'Ver Mais',
              image: bannerForm.image || '',
              category: bannerForm.category || 'Geral',
              order: banners.length + 1
          };
          updatedBanners.push(newBanner);
          showFeedback("Banner criado com sucesso!");
      } else if (editingBannerId) {
          // Updating existing
          updatedBanners = updatedBanners.map(b => 
            b.id === editingBannerId ? { ...b, ...bannerForm } as Banner : b
          );
          showFeedback("Banner atualizado!");
      }
      
      refreshBanners(updatedBanners);
      setEditingBannerId(null);
      setBannerForm({ title: '', subtitle: '', cta: '', category: '', image: '' });
  }

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleGenericImageUpload(e, (url) => setBannerForm(prev => ({ ...prev, image: url })));
  }

  // --- User Management Logic ---
  const handlePlanChange = (userId: string, newPlan: UserPlan) => {
      updateUserPlan(userId, newPlan);
      loadData(); // Refresh list to show update
      showFeedback(`Plano do usuário atualizado para ${newPlan.toUpperCase()}`);
  };

  // --- Sorting & Filtering ---
  const filteredAdminFiles = useMemo(() => {
    return fileList.filter(f => 
        f.title.toLowerCase().includes(adminSearch.toLowerCase()) || 
        (f.categories && f.categories.some(c => c.toLowerCase().includes(adminSearch.toLowerCase())))
    );
  }, [fileList, adminSearch]);

  const sortedFiles = useMemo(() => {
      let sortableItems = [...filteredAdminFiles];
      if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
              const aValue = a[sortConfig.key] ?? ''; 
              const bValue = b[sortConfig.key] ?? '';
              if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
              if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return sortableItems;
  }, [filteredAdminFiles, sortConfig]);

  const requestSort = (key: keyof DesignResource) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof DesignResource) => {
      if (!sortConfig || sortConfig.key !== key) {
          return <i className="fas fa-sort text-xs text-text-muted opacity-30 ml-2"></i>;
      }
      return sortConfig.direction === 'asc' 
          ? <i className="fas fa-sort-up text-xs text-white ml-2"></i>
          : <i className="fas fa-sort-down text-xs text-white ml-2"></i>;
  };

  const filteredUsers = Array.isArray(userList) ? userList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ) : [];

  if (!user || user.role !== 'admin') return null;


















  // Salva umm banner
  const handleChangeUserPlan = async (banner: Banner) => {
  };

  const handleCreateCategory = async (name: string) => {
    await createCategory(name);
    await refreshCategories();
  };
  
  const handleUpdateCategory = async (id: string, name: string) => {
    await updateCategory(id, name);
    await refreshCategories();
  };
  
  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    await refreshCategories();
  };

  const adminData = useAdminData();

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-[#121212] text-text-main font-sans">
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        openUploadModal={() => openUploadModal()}
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
          <CategoriesView
            {...adminData}
            categories={categories}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
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
      {isUploadModalOpen && (
        <UploadModal
          isEditMode={isEditMode}
          categories={categories}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          keywords={keywords}
          setKeywords={setKeywords}
          resourceType={resourceType}
          setResourceType={setResourceType}
          orientation={orientation}
          setOrientation={setOrientation}
          newDimensions={newDimensions}
          setNewDimensions={setNewDimensions}
          newResolution={newResolution}
          setNewResolution={setNewResolution}
          newFileSize={newFileSize}
          setNewFileSize={setNewFileSize}
          isPremium={isPremium}
          setIsPremium={setIsPremium}
          isCanvaAvailable={isCanvaAvailable}
          setIsCanvaAvailable={setIsCanvaAvailable}
          canvaUrl={canvaUrl}
          setCanvaUrl={setCanvaUrl}
          newImageUrl={newImageUrl}
          newWatermarkImageUrl={newWatermarkImageUrl}
          zipFileName={zipFileName}
          handleCoverUpload={handleCoverUpload}
          handleZipUpload={handleZipUpload}
          handleUploadSubmit={handleUploadSubmit}
          generateDemoContent={generateDemoContent}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
};
