import { Category } from '../../../types';

interface UploadModalProps {
  isEditMode: boolean;

  categories: Category[];

  newTitle: string;
  setNewTitle: (v: string) => void;

  selectedCategories: string[];
  toggleCategory: (name: string) => void;

  keywords: string;
  setKeywords: (v: string) => void;

  resourceType: string;
  setResourceType: (v: string) => void;

  orientation: string;
  setOrientation: (v: string) => void;

  newDimensions: string;
  setNewDimensions: (v: string) => void;

  newResolution: string;
  setNewResolution: (v: string) => void;

  newFileSize: string;
  setNewFileSize: (v: string) => void;

  isPremium: boolean;
  setIsPremium: (v: boolean) => void;

  isCanvaAvailable: boolean;
  setIsCanvaAvailable: (v: boolean) => void;

  canvaUrl: string;
  setCanvaUrl: (v: string) => void;

  newImageUrl: string;
  newWatermarkImageUrl?: string;

  zipFileName: string;

  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleZipUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadSubmit: (e: React.FormEvent) => void;

  generateDemoContent: () => void;
  onClose: () => void;
}

export const UploadModal = ({
  isEditMode,
  categories,
  newTitle,
  setNewTitle,
  selectedCategories,
  toggleCategory,
  keywords,
  setKeywords,
  resourceType,
  setResourceType,
  orientation,
  setOrientation,
  newDimensions,
  setNewDimensions,
  newResolution,
  setNewResolution,
  newFileSize,
  setNewFileSize,
  isPremium,
  setIsPremium,
  isCanvaAvailable,
  setIsCanvaAvailable,
  canvaUrl,
  setCanvaUrl,
  newImageUrl,
  newWatermarkImageUrl,
  zipFileName,
  handleCoverUpload,
  handleZipUpload,
  handleUploadSubmit,
  generateDemoContent,
  onClose,
}: UploadModalProps) => {
  return (
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
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors">
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
  );
};
