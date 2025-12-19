import { User, UserPlan } from '../../../types';
import { useState } from 'react';

interface Props {
  users: User[];
  onChangePlan: (userId: string, plan: UserPlan) => void;
}

export const UsersView = ({
  users,
  onChangePlan,
}: Props) => {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">
          Gestão de Usuários
        </h1>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar usuário por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              w-full bg-[#1e1e1e]
              border border-white/10
              rounded-lg py-3 pl-10 pr-4
              text-sm text-white
              outline-none
              focus:border-blue-500
            "
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                <th className="px-3 md:px-6 py-4">Membro</th>
                <th className="px-3 md:px-6 py-4">Status</th>
                <th className="px-6 py-4 hidden md:table-cell">Plano</th>
                <th className="px-6 py-4 hidden md:table-cell">Email</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-white/5">
              {filtered.map(user => {
                const isAdmin = user.role === 'admin';
                const isFree = user.plan === 'free';

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* USER */}
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`}
                          className="w-8 h-8 rounded-full bg-white/10"
                        />
                        <div>
                          <div className="font-bold text-white text-sm max-w-[140px] truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-text-muted md:hidden truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-3 md:px-6 py-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">
                          Admin
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold
                          ${isFree
                            ? 'bg-gray-500/20 text-gray-300 border border-gray-500/20'
                            : 'bg-green-500/20 text-green-400 border border-green-500/20'
                          }`}
                        >
                          {isFree ? 'Grátis' : 'Ativo'}
                        </span>
                      )}
                    </td>

                    {/* PLAN */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <select
                        value={user.plan}
                        disabled={isAdmin}
                        onChange={e =>
                          onChangePlan(user.id, e.target.value as UserPlan)
                        }
                        className={`
                          bg-black/20 border border-white/10
                          rounded px-2 py-1 text-xs text-white
                          outline-none focus:border-blue-500
                          cursor-pointer
                          ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <option value="free">Grátis</option>
                        <option value="premium_annual">Premium Anual</option>
                        <option value="ministry">Ministério</option>
                        <option value="volunteer">Voluntário</option>
                      </select>
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 hidden md:table-cell text-text-muted text-xs">
                      {user.email}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
