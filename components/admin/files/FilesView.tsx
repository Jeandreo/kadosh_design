import { useMemo, useState } from 'react';
import { DesignResource } from '../../../types';

interface Props {
  files: DesignResource[];
  openEditModal: (file: DesignResource) => void;
  onDelete: (id: string) => void;
}

export const FilesView = ({
  files,
  openEditModal,
  onDelete,
}: Props) => {
  const [search, setSearch] = useState('');

  const filteredFiles = useMemo(() => {
    return files.filter(f =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.categories?.some(c =>
        c.toLowerCase().includes(search.toLowerCase())
      ))
    );
  }, [files, search]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">
          Meus Arquivos
        </h1>

        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              bg-[#1e1e1e]
              border border-white/10
              rounded-lg
              py-3 pl-10 pr-4
              text-sm text-white
              outline-none
              focus:border-blue-500
              w-full md:w-80
            "
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                <th className="px-3 md:px-6 py-4">Preview</th>
                <th className="px-3 md:px-6 py-4">Título</th>
                <th className="px-6 py-4 hidden md:table-cell">Categoria</th>
                <th className="px-3 md:px-6 py-4">Downloads</th>
                <th className="px-3 md:px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-white/5">
              {filteredFiles.map(file => (
                <tr
                  key={file.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-3 md:px-6 py-3">
                    <img
                      src={file.imageUrl}
                      alt={file.title}
                      className="w-12 h-12 rounded object-cover bg-black/50 border border-white/10"
                    />
                  </td>

                  <td className="px-3 md:px-6 py-3 font-medium text-white max-w-[180px] truncate">
                    {file.title}
                  </td>

                  <td className="px-6 py-3 hidden md:table-cell">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-text-muted">
                      {file.categories?.join(', ')}
                    </span>
                  </td>

                  <td className="px-3 md:px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {file.downloads}
                      </span>
                      <i className="fas fa-download text-[10px] text-text-muted opacity-50" />
                    </div>
                  </td>

                  <td className="px-3 md:px-6 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(file)}
                      className="
                        text-text-muted hover:text-white
                        p-2 hover:bg-white/10
                        rounded transition-colors
                      "
                    >
                      <i className="fas fa-pen" />
                    </button>

                    <button
                      onClick={() => onDelete(file.id)}
                      className="
                        text-text-muted hover:text-red-400
                        p-2 hover:bg-red-500/10
                        rounded transition-colors ml-1
                      "
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              Nenhum arquivo encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
