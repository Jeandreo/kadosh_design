import { Banner, Category } from '../../../types';
import { useState } from 'react';

interface Props {
  banners: Banner[];
  categories: Category[];
  onSave: (banners: Banner[]) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export const BannersView = ({
  banners,
  categories,
  onSave,
  onUploadImage,
}: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Banner>>({});

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Gerenciar Banners (Hero)
        </h1>

        <button
          onClick={() => {
            setEditingId('new');
            setForm({
              title: '',
              subtitle: '',
              cta: '',
              image: '',
              category: categories[0]?.name,
            });
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
        >
          Novo Banner
        </button>
      </div>

      <p className="text-text-muted mb-8 text-sm">
        Edite os destaques que aparecem no topo da página inicial.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LISTA */}
        <div className="space-y-4">
          {banners.map((b, index) => (
            <div
              key={b.id}
              onClick={() => {
                setEditingId(b.id);
                setForm({
                  id: b.id,
                  title: b.title,
                  subtitle: b.subtitle,
                  cta: b.cta,
                  image: b.image,
                  category: b.category,
                  order: b.order,
                });
              }}
              className={`
                bg-[#1e1e1e] border rounded-xl overflow-hidden cursor-pointer
                ${editingId === b.id ? 'border-blue-500' : 'border-white/5'}
              `}
            >
              <div className="h-32 relative">
                <img
                  src={b.image}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute bottom-3 left-4">
                  <div className="text-xs text-secondary font-bold">
                    Slide {index + 1}
                  </div>
                  <h3 className="text-white font-bold text-sm">
                    {b.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EDITOR */}
        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 h-fit sticky top-24">
          {editingId ? (
              <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">{editingId === 'new' ? 'Novo Banner' : 'Editando Slide'}</h3>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Título Principal</label>
                    <input 
                      type="text" 
                      value={form.title} 
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Subtítulo</label>
                    <input 
                      type="text" 
                      value={form.subtitle} 
                      onChange={(e) => setForm({...form, subtitle: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Texto do Botão (CTA)</label>
                      <input 
                          type="text" 
                          value={form.cta} 
                          onChange={(e) => setForm({...form, cta: e.target.value})}
                          className="w-full bg-background border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-blue-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Link / Categoria</label>
                      <select 
                          value={form.category} 
                          onChange={(e) => setForm({...form, category: e.target.value})}
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
                      {form.image && (
                          <img src={form.image} className="w-20 h-12 object-cover rounded border border-white/10" alt="Preview" />
                      )}
                      <label className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-4 rounded cursor-pointer transition-colors border border-white/5">
                          Trocar Imagem
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              try {
                                const url = await onUploadImage(file);
                                setForm(prev => ({ ...prev, image: url }));
                              } catch {
                                alert('Erro ao enviar imagem');
                              }
                            }}
                          />
                      </label>
                    </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button className="flex-1 py-2 text-text-muted hover:text-white text-sm">Cancelar</button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm"
                      onClick={() => {
                        let updated = [...banners];

                        if (editingId === 'new') {
                          updated.push({
                            id: Date.now().toString(),
                            title: form.title!,
                            subtitle: form.subtitle || '',
                            cta: form.cta || 'Ver Mais',
                            image: form.image!,
                            category: form.category!,
                            order: banners.length + 1,
                          });
                        } else {
                          updated = updated.map(b =>
                            b.id === editingId ? { ...b, ...form } as Banner : b
                          );
                        }

                        onSave(updated);
                        setEditingId(null);
                        setForm({});
                      }}
                    >
                      {editingId === 'new' ? 'Criar Banner' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center">
              Selecione um banner ou clique em “Novo Banner”
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
