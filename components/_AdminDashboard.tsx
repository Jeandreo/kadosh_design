
import React, { useState, useEffect, useMemo } from 'react';
import { DesignResource, Category, Banner, User, UserPlan } from '../types';
import { addResource, getResources, updateResource, deleteResource } from '../services/resourceService';
import { getUsers, updateUserPlan } from '../services/userService';
import { Toast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { CONFIG } from '../config';
import { api } from '../services/api';
import { createCategory, deleteCategory } from '../services/categoriesService';

// --- Minimalist SVG Line Chart Component ---
const DualLineChart = () => {
  const days = 30;
  
  const generateTrend = (base: number, volatility: number, trend: number) => {
    let currentValue = base;
    return Array.from({ length: days }, (_, i) => {
       const change = (Math.random() - 0.5) * volatility + trend;
       currentValue = Math.max(0, currentValue + change);
       return currentValue;
    });
  };

  const subscriptionsData = generateTrend(40, 15, 0.8);
  const churnData = generateTrend(10, 5, 0.1);

  const maxValue = Math.max(...subscriptionsData, ...churnData) * 1.2;

  const getPoints = (data: number[]) => {
    return data.map((val, index) => {
      const x = (index / (days - 1)) * 100;
      const y = 100 - (val / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg mb-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-white font-bold text-lg">Crescimento de Assinantes</h3>
            <p className="text-xs text-text-muted">Últimos 30 dias</p>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <span className="text-xs text-text-muted">Novas Assinaturas</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-gray-500"></div>
               <span className="text-xs text-text-muted">Cancelamentos (Churn)</span>
            </div>
         </div>
      </div>

      <div className="relative h-64 w-full">
         <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
               <div key={i} className="w-full h-px bg-white/[0.03]"></div>
            ))}
         </div>
         <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={getPoints(churnData)} fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50" />
            <polyline points={`0,100 ${getPoints(churnData)} 100,100`} fill="url(#gradientChurn)" stroke="none" className="opacity-20" />
            <polyline points={getPoints(subscriptionsData)} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <polyline points={`0,100 ${getPoints(subscriptionsData)} 100,100`} fill="url(#gradientSubs)" stroke="none" className="opacity-20" />
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

// Componente Visual de Erro de Carregamento
const LoadErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="text-center py-12 px-4 border border-red-500/20 rounded-xl bg-red-500/5">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-server text-red-500 text-xl"></i>
        </div>
        <h3 className="text-white font-bold mb-2">Erro de conexão com o servidor</h3>
        <p className="text-text-muted text-sm mb-6 max-w-xs mx-auto">
            Não foi possível carregar os dados. Verifique se o backend está rodando na porta 3001.
        </p>
        <button 
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
            <i className="fas fa-sync-alt mr-2"></i> Tentar Novamente
        </button>
    </div>
);

export const AdminDashboard: React.FC = () => {
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

  const handleUploadSubmit = (e: React.FormEvent) => {
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
        updateResource(updatedProduct);
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
        addResource(newProduct);
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


  const handleUpdateCategory = (id: string, newName: string) => {
    const updated = categories.map(c => 
        c.id === id ? { ...c, name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') } : c
    );
    refreshCategories();
    setEditingCatId(null);
    showFeedback("Categoria atualizada!");
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza? Isso pode afetar arquivos existentes.')) return;
    try {
        await deleteCategory(id);
        refreshCategories();
        showFeedback('Categoria removida!', 'info');
    } catch (e) {
        showFeedback('Erro ao remover categoria', 'error');
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

  return (
    <div className="flex min-h-screen bg-[#121212] text-text-main font-sans">
      <aside className="w-64 bg-[#181A1B] border-r border-white/5 fixed h-full flex flex-col z-30 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="font-bold text-white tracking-wider flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-extrabold text-xs">K</div>
            <span>KADOSH <span className="text-secondary font-light text-xs">ADMIN</span></span>
          </div>
        </div>

        <div className="p-4">
            <button 
                onClick={openUploadModal}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
                <i className="fas fa-cloud-upload-alt"></i> Novo Upload
            </button>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>
            <i className="fas fa-chart-pie w-5 text-center"></i> Dashboard
          </button>
          <button onClick={() => setActiveTab('files')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'files' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>
            <i className="fas fa-folder-open w-5 text-center"></i> Meus Arquivos
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'categories' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>
            <i className="fas fa-tags w-5 text-center"></i> Categorias
          </button>
          <button onClick={() => setActiveTab('banners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'banners' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>
            <i className="fas fa-images w-5 text-center"></i> Banners (Hero)
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>
            <i className="fas fa-users w-5 text-center"></i> Usuários
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <img src={`https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`} alt="Admin" className="w-9 h-9 rounded-full" />
             <div className="overflow-hidden">
               <div className="text-sm font-bold text-white truncate">{user.name}</div>
               <div className="text-xs text-text-muted truncate">Administrador</div>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 relative">
        <header className="h-16 bg-[#181A1B]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 px-6 flex items-center justify-between">
            <div className="flex items-center text-sm text-text-muted">
                <span className="hover:text-white cursor-pointer">Admin</span>
                <i className="fas fa-chevron-right text-[10px] mx-2 opacity-50"></i>
                <span className="text-white font-medium capitalize">{activeTab === 'users' ? 'Usuários' : activeTab}</span>
            </div>
            <div className="flex items-center gap-4">
                <button className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-white relative">
                    <i className="far fa-bell"></i>
                </button>
            </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
                <>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-6">Performance</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <i className="fas fa-dollar-sign text-5xl text-green-500"></i>
                            </div>
                            <p className="text-text-muted text-xs uppercase font-bold tracking-wider mb-2">Receita Mensal</p>
                            <h3 className="text-2xl font-extrabold text-white mb-2">R$ 4.580,00</h3>
                        </div>
                        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden group">
                             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <i className="fas fa-cloud-download-alt text-5xl text-purple-500"></i>
                            </div>
                            <p className="text-text-muted text-xs uppercase font-bold tracking-wider mb-2">Downloads Totais</p>
                            <h3 className="text-2xl font-extrabold text-white mb-2">{(totalDownloads / 1000).toFixed(1)}k</h3>
                        </div>
                        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden group">
                             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <i className="fas fa-users text-5xl text-blue-500"></i>
                            </div>
                            <p className="text-text-muted text-xs uppercase font-bold tracking-wider mb-2">Usuários Totais</p>
                            <h3 className="text-2xl font-extrabold text-white mb-2">{userList.length}</h3>
                        </div>
                    </div>
                    <DualLineChart />
                </div>
                </>
            )}

            {/* VIEW: FILES */}
            {activeTab === 'files' && (
                 <div className="mb-8">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-white">Meus Arquivos</h1>
                        <div className="relative w-full md:w-auto">
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="bg-[#1e1e1e] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 w-full md:w-80"
                                value={adminSearch}
                                onChange={(e) => setAdminSearch(e.target.value)}
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                        </div>
                    </div>

                    {loadError ? (
                        <LoadErrorState onRetry={loadData} />
                    ) : (
                        <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-3 md:px-6 py-4">Preview</th>
                                            <th 
                                                className="px-3 md:px-6 py-4 cursor-pointer hover:text-white transition-colors"
                                                onClick={() => requestSort('title')}
                                            >
                                                Título {getSortIcon('title')}
                                            </th>
                                            <th className="px-6 py-4 hidden md:table-cell">Categoria</th>
                                            <th 
                                                className="px-3 md:px-6 py-4 cursor-pointer hover:text-white transition-colors"
                                                onClick={() => requestSort('downloads')}
                                            >
                                                Downloads {getSortIcon('downloads')}
                                            </th>
                                            <th className="px-3 md:px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {sortedFiles.map(file => (
                                            <tr key={file.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-3 md:px-6 py-3">
                                                    <img src={file.imageUrl} alt="" className="w-12 h-12 rounded object-cover bg-black/50 border border-white/10" />
                                                </td>
                                                <td className="px-3 md:px-6 py-3 font-medium text-white max-w-[150px] truncate">{file.title}</td>
                                                <td className="px-6 py-3 hidden md:table-cell">
                                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-text-muted">
                                                        {file.categories?.join(', ')}
                                                    </span>
                                                </td>
                                                <td className="px-3 md:px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">{file.downloads}</span>
                                                        <i className="fas fa-download text-[10px] text-text-muted opacity-50"></i>
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-6 py-3 text-right whitespace-nowrap">
                                                    <button onClick={() => openEditModal(file)} className="text-text-muted hover:text-white p-2 hover:bg-white/10 rounded transition-colors"><i className="fas fa-pen"></i></button>
                                                    <button onClick={() => openDeleteModal(file.id)} className="text-text-muted hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors ml-1"><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                 </div>
            )}

            {/* VIEW: CATEGORIES */}
            {activeTab === 'categories' && (
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-6">Gerenciar Categorias</h1>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Nova Categoria</label>
                            <input 
                                type="text"
                                placeholder="Ex: Cartões de Visita"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <button 
                            onClick={handleAddCategory}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 h-[46px]"
                        >
                            <i className="fas fa-plus"></i> Adicionar
                        </button>
                    </div>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4">Nome da Categoria</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-white/5">
                                {categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            {editingCatId === cat.id ? (
                                                <input 
                                                    autoFocus
                                                    className="bg-black/20 border border-blue-500/50 rounded px-2 py-1 text-white outline-none w-full max-w-xs"
                                                    defaultValue={cat.name}
                                                    onBlur={(e) => handleUpdateCategory(cat.id, e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id, e.currentTarget.value)}
                                                />
                                            ) : (
                                                <span className="text-white font-medium">{cat.name}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setEditingCatId(cat.id)} className="text-text-muted hover:text-white p-2 hover:bg-white/10 rounded mr-2"><i className="fas fa-pen"></i></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-text-muted hover:text-red-400 p-2 hover:bg-red-500/10 rounded"><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VIEW: BANNERS (HERO) */}
            {activeTab === 'banners' && (
                <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Gerenciar Banners (Hero)</h1>
                        <button 
                            onClick={handleCreateBanner}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 text-sm transition-colors"
                        >
                            <i className="fas fa-plus"></i> Novo Banner
                        </button>
                    </div>
                    <p className="text-text-muted mb-8 text-sm">Edite os destaques que aparecem no topo da página inicial.</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                             {banners.map((banner, index) => (
                                 <div 
                                    key={banner.id} 
                                    className={`bg-[#1e1e1e] border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-white/20 ${editingBannerId === banner.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/5'}`}
                                    onClick={() => handleEditBanner(banner)}
                                 >
                                     <div className="h-32 w-full relative">
                                         <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-60" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                         <div className="absolute bottom-3 left-4">
                                             <div className="text-xs text-secondary font-bold mb-1">Slide {index + 1}</div>
                                             <h3 className="text-white font-bold text-sm shadow-black drop-shadow-md">{banner.title}</h3>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 h-fit sticky top-24">
                             {editingBannerId ? (
                                 <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                                     <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">{editingBannerId === 'new' ? 'Novo Banner' : 'Editando Slide'}</h3>
                                     <div>
                                         <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Título Principal</label>
                                         <input 
                                            type="text" 
                                            value={bannerForm.title} 
                                            onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                                            className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Subtítulo</label>
                                         <input 
                                            type="text" 
                                            value={bannerForm.subtitle} 
                                            onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                                            className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                                         />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Texto do Botão (CTA)</label>
                                            <input 
                                                type="text" 
                                                value={bannerForm.cta} 
                                                onChange={(e) => setBannerForm({...bannerForm, cta: e.target.value})}
                                                className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Link / Categoria</label>
                                            <select 
                                                value={bannerForm.category} 
                                                onChange={(e) => setBannerForm({...bannerForm, category: e.target.value})}
                                                className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Imagem de Fundo</label>
                                         <div className="flex items-center gap-4">
                                            {bannerForm.image && (
                                                <img src={bannerForm.image} className="w-20 h-12 object-cover rounded border border-white/10" alt="Preview" />
                                            )}
                                            <label className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-4 rounded cursor-pointer transition-colors border border-white/5">
                                                Trocar Imagem
                                                <input type="file" className="hidden" accept="image/*" onChange={handleBannerImageUpload} />
                                            </label>
                                         </div>
                                     </div>
                                     <div className="flex gap-3 pt-4 border-t border-white/5">
                                         <button onClick={() => setEditingBannerId(null)} className="flex-1 py-2 text-text-muted hover:text-white text-sm">Cancelar</button>
                                         <button onClick={handleSaveBanner} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm transition-colors">{editingBannerId === 'new' ? 'Criar Banner' : 'Salvar Alterações'}</button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="text-center py-10 text-text-muted">
                                     <i className="fas fa-mouse-pointer text-2xl mb-2 opacity-50"></i>
                                     <p className="text-sm">Selecione um banner ao lado para editar ou clique em Novo Banner.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: USERS MANAGEMENT */}
            {activeTab === 'users' && (
                <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-white">Gestão de Usuários</h1>
                        <div className="relative w-full md:w-auto">
                            <input 
                                type="text" 
                                placeholder="Buscar usuário por nome ou email..." 
                                className="bg-[#1e1e1e] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 w-full md:w-80"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                        </div>
                    </div>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                                        <th className="px-3 md:px-6 py-4">Membro</th>
                                        <th className="px-3 md:px-6 py-4">Status</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Plano Atual</th>
                                        <th className="px-3 md:px-6 py-4 text-text-muted hidden md:table-cell">Cota</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Expiração</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {filteredUsers.map(u => {
                                        const isExpired = u.plan !== 'free' && u.subscriptionExpiry && Date.now() > u.subscriptionExpiry;
                                        const isActive = !isExpired && (u.plan !== 'free' || u.role === 'admin');
                                        return (
                                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-3 md:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff`} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                                                        <div>
                                                            <div className="font-bold text-white text-sm max-w-[120px] truncate">{u.name}</div>
                                                            <div className="text-xs text-text-muted max-w-[120px] truncate">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-6 py-4">
                                                    {u.role === 'admin' ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">Admin</span> : isExpired ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/20">Expirado</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/20">Ativo</span>}
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <select 
                                                        value={u.plan} 
                                                        onChange={(e) => handlePlanChange(u.id, e.target.value as UserPlan)}
                                                        disabled={u.role === 'admin'}
                                                        className={`bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500 cursor-pointer ${u.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="free">Grátis</option>
                                                        <option value="volunteer">Voluntário</option>
                                                        <option value="ministry">Ministério</option>
                                                        <option value="premium_annual">Premium Anual</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-text-muted hidden md:table-cell">{u.quotaUsed} / {u.quotaTotal}</td>
                                                <td className="px-6 py-4 text-text-muted text-xs hidden md:table-cell">{u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString() : u.plan === 'free' ? '-' : 'Vitalício'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && <div className="text-center py-8 text-text-muted text-sm">Nenhum usuário encontrado.</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Floating Upload Button (Mobile) */}
        {activeTab === 'files' && (
            <button onClick={openUploadModal} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-40 border-2 border-white/10 md:hidden">
                <i className="fas fa-plus text-xl"></i>
            </button>
        )}

        {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] bg-[#121212] animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl md:text-2xl font-bold text-white">{isEditMode ? 'Editar Arte' : 'Novo Upload'}</h2>
                            {!isEditMode && (
                                <button 
                                    onClick={generateDemoContent}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <i className="fas fa-flask"></i> Gerar Demo
                                </button>
                            )}
                        </div>
                        <button onClick={() => setIsUploadModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <form onSubmit={handleUploadSubmit} className="flex-1 flex flex-col gap-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            
                            {/* LEFT COLUMN: VISUALS */}
                            <div className="w-full lg:w-1/3 space-y-6">
                                <div className="p-4 rounded-xl border border-white/5 bg-[#181A1B]">
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Capa (Preview)</label>
                                    <label className="relative flex flex-col items-center justify-center w-full aspect-square md:aspect-video lg:aspect-square border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group overflow-hidden">
                                        {newImageUrl ? (
                                            <img src={newImageUrl} className="absolute inset-0 w-full h-full object-cover rounded-lg group-hover:opacity-50 transition-opacity" alt="Capa" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <i className="fas fa-cloud-upload-alt text-white/30 text-3xl mb-2 group-hover:scale-110 transition-transform"></i>
                                                <p className="text-xs text-text-muted">Clique para enviar</p>
                                            </div>
                                        )}
                                        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ${!newImageUrl ? 'hidden' : ''}`}>
                                            <span className="text-white text-xs font-bold uppercase">Trocar Imagem</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                                    </label>
                                    <p className="text-[10px] text-text-muted mt-2 text-center opacity-60">Gera autom. versão com marca d'água</p>
                                </div>

                                {newWatermarkImageUrl && (
                                    <div className="p-4 rounded-xl border border-white/5 bg-[#181A1B] flex items-center gap-4">
                                        <img src={newWatermarkImageUrl} className="w-16 h-16 rounded object-cover border border-white/10 opacity-70" alt="WM" />
                                        <div>
                                            <p className="text-xs font-bold text-white mb-1">Versão Protegida</p>
                                            <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Gerada com Sucesso</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: DATA FIELDS */}
                            <div className="flex-1 space-y-6">
                                
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Título da Arte</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#181A1B] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 focus:bg-white/5 transition-all text-sm font-medium" 
                                        placeholder="Ex: Flyer Culto de Santa Ceia" 
                                        value={newTitle} 
                                        onChange={(e) => setNewTitle(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Categorias</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => {
                                            const isSelected = selectedCategories.includes(cat.name);
                                            return (
                                                <button 
                                                    type="button"
                                                    key={cat.id} 
                                                    onClick={() => toggleCategory(cat.name)}
                                                    className={`
                                                        px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none flex items-center gap-2
                                                        ${isSelected 
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                                                            : 'bg-[#181A1B] border-white/10 text-text-muted hover:border-white/30 hover:text-white'}
                                                    `}
                                                >
                                                    {isSelected && <i className="fas fa-check text-[10px]"></i>}
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-text-muted mb-1">Palavras-chave (Tags)</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-[#181A1B] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                                            placeholder="Separe por vírgula..."
                                            value={keywords}
                                            onChange={(e) => setKeywords(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted mb-1">Formato</label>
                                        <select className="w-full bg-[#181A1B] border border-white/10 rounded-lg px-2 py-2 text-white text-xs outline-none focus:border-blue-500" value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
                                            <option value="PSD">PSD</option>
                                            <option value="PNG">PNG</option>
                                            <option value="JPG">JPG</option>
                                            <option value="VETOR">VETOR</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted mb-1">Orientação</label>
                                        <select className="w-full bg-[#181A1B] border border-white/10 rounded-lg px-2 py-2 text-white text-xs outline-none focus:border-blue-500" value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                                            <option value="Portrait">Vertical</option>
                                            <option value="Landscape">Horizontal</option>
                                            <option value="Square">Quadrada</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 bg-[#181A1B] p-4 rounded-lg border border-white/5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted mb-1">Dimensões</label>
                                        <input type="text" className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500" placeholder="Auto" value={newDimensions} onChange={(e) => setNewDimensions(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted mb-1">Resolução</label>
                                        <input type="text" className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500" placeholder="300 DPI" value={newResolution} onChange={(e) => setNewResolution(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted mb-1">Tamanho</label>
                                        <input type="text" className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500" placeholder="Auto" value={newFileSize} onChange={(e) => setNewFileSize(e.target.value)} />
                                    </div>
                                </div>

                                <div className="bg-[#181A1B] p-6 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                    <div className="relative border-2 border-dashed border-blue-500/30 bg-blue-500/5 rounded-lg px-4 py-3 flex items-center gap-4 hover:bg-blue-500/10 transition-colors cursor-pointer group h-full">
                                        <input type="file" accept=".zip,.rar,.7z" onChange={handleZipUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                            <i className="fas fa-file-archive text-lg"></i>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-blue-200 font-medium text-xs truncate">
                                                {zipFileName || 'Upload do Arquivo'}
                                            </p>
                                            <p className="text-blue-400/60 text-[10px]">
                                                {newFileSize ? `Tamanho: ${newFileSize}` : 'Clique para selecionar'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div onClick={() => setIsPremium(!isPremium)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all ${isPremium ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-transparent border-white/10'}`}>
                                            <span className={`text-xs font-bold ${isPremium ? 'text-yellow-500' : 'text-text-muted'}`}>Arquivo Premium</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${isPremium ? 'bg-yellow-500' : 'bg-white/10'}`}>
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${isPremium ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                        
                                        <div onClick={() => setIsCanvaAvailable(!isCanvaAvailable)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all ${isCanvaAvailable ? 'bg-teal-500/10 border-teal-500/50' : 'bg-transparent border-white/10'}`}>
                                            <span className={`text-xs font-bold ${isCanvaAvailable ? 'text-teal-400' : 'text-text-muted'}`}>Disponível no Canva</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${isCanvaAvailable ? 'bg-teal-500' : 'bg-white/10'}`}>
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${isCanvaAvailable ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isCanvaAvailable && (
                                    <input type="text" className="w-full bg-[#181A1B] border border-teal-500/30 rounded-lg px-4 py-3 text-white outline-none focus:border-teal-500 text-sm animate-[fadeIn_0.2s_ease-out]" placeholder="Link do Template Canva..." value={canvaUrl} onChange={(e) => setCanvaUrl(e.target.value)} />
                                )}

                                <button type="submit" className="w-full bg-[#576063] hover:bg-[#6c757d] text-white font-bold py-4 rounded-lg shadow-lg mt-2 transition-all text-sm uppercase tracking-wider transform active:scale-[0.99]">
                                    {isEditMode ? 'Salvar Alterações' : 'Publicar Arte Agora'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {isDeleteModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                 <div className="relative w-full max-w-sm bg-surface rounded-xl border border-white/10 p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-trash text-red-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Excluir Arte?</h3>
                        <p className="text-text-muted text-sm mb-6">Tem certeza que deseja excluir? Essa ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">Cancelar</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">Excluir</button>
                        </div>
                    </div>
                 </div>
            </div>
        )}

        <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} type={toastType} />
      </main>
    </div>
  );
};
