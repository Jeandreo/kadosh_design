import { Category } from '../../../types';
import { useState } from 'react';

interface Props {
  categories: Category[];
  onCreate: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const CategoriesView = ({
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: Props) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-white mb-6">
        Gerenciar Categorias
      </h1>

      {/* CREATE */}
      <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            Nova Categoria
          </label>
          <input
            type="text"
            placeholder="Ex: Cartões de Visita"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="
              w-full bg-[#181A1B]
              border border-white/10
              rounded-lg px-4 py-3
              text-white outline-none
              focus:border-blue-500
            "
          />
        </div>

        <button
          onClick={() => {
            if (!newName.trim()) return;
            onCreate(newName);
            setNewName('');
          }}
          className="
            bg-green-600 hover:bg-green-500
            text-white font-bold
            py-3 px-6 rounded-lg
            transition-colors
            flex items-center gap-2
            h-[46px]
          "
        >
          <i className="fas fa-plus" />
          Adicionar
        </button>
      </div>

      {/* LIST */}
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
              <tr
                key={cat.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4">
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      defaultValue={cat.name}
                      onBlur={(e) => {
                        onUpdate(cat.id, e.target.value);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdate(cat.id, e.currentTarget.value);
                          setEditingId(null);
                        }
                      }}
                      className="
                        bg-black/20
                        border border-blue-500/50
                        rounded px-2 py-1
                        text-white outline-none
                        w-full max-w-xs
                      "
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {cat.name}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditingId(cat.id)}
                    className="
                      text-text-muted hover:text-white
                      p-2 hover:bg-white/10
                      rounded transition-colors mr-2
                    "
                  >
                    <i className="fas fa-pen" />
                  </button>

                  <button
                    onClick={() => onDelete(cat.id)}
                    className="
                      text-text-muted hover:text-red-400
                      p-2 hover:bg-red-500/10
                      rounded transition-colors
                    "
                  >
                    <i className="fas fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            Nenhuma categoria cadastrada.
          </div>
        )}
      </div>
    </div>
  );
};
