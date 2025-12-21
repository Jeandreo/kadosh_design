import { User } from '../../../types';

interface Props {
  user: User;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  openUploadModal: () => void;
}

export const AdminSidebar = ({
  user,
  activeTab,
  onChangeTab,
  openUploadModal,
}: Props) => {
  return (
    <aside className="w-64 bg-[#181A1B] border-r border-white/5 fixed h-full flex flex-col z-30 hidden md:flex">
      
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="font-bold text-white tracking-wider flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-extrabold text-xs">
            K
          </div>
          <span>
            KADOSH <span className="text-secondary font-light text-xs">ADMIN</span>
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4">
        <button
          onClick={openUploadModal}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500
                     hover:from-blue-500 hover:to-blue-400
                     text-white font-bold py-3 rounded-lg
                     shadow-lg shadow-blue-500/20
                     transition-all flex items-center justify-center gap-2"
        >
          <i className="fas fa-cloud-upload-alt"></i>
          Novo Upload
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <SidebarItem
          label="Dashboard"
          icon="fa-chart-pie"
          tab="dashboard"
          activeTab={activeTab}
          onClick={onChangeTab}
        />
        <SidebarItem
          label="Meus Arquivos"
          icon="fa-folder-open"
          tab="files"
          activeTab={activeTab}
          onClick={onChangeTab}
        />
        <SidebarItem
          label="Categorias"
          icon="fa-tags"
          tab="categories"
          activeTab={activeTab}
          onClick={onChangeTab}
        />
        <SidebarItem
          label="Banners (Hero)"
          icon="fa-images"
          tab="banners"
          activeTab={activeTab}
          onClick={onChangeTab}
        />
        <SidebarItem
          label="Usuários"
          icon="fa-users"
          tab="users"
          activeTab={activeTab}
          onClick={onChangeTab}
        />
      </nav>

      {/* USER */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`}
            className="w-9 h-9 rounded-full"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate">
              {user.name}
            </div>
            <div className="text-xs text-text-muted truncate">
              Administrador
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ----------------------------- */

interface ItemProps {
  label: string;
  icon: string;
  tab: string;
  activeTab: string;
  onClick: (tab: string) => void;
}

const SidebarItem = ({
  label,
  icon,
  tab,
  activeTab,
  onClick,
}: ItemProps) => {
  const active = activeTab === tab;

  return (
    <button
      onClick={() => onClick(tab)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg
        transition-colors text-sm font-medium
        ${active
          ? 'bg-white/10 text-white'
          : 'text-text-muted hover:bg-white/5 hover:text-white'}
      `}
    >
      <i className={`fas ${icon} w-5 text-center`} />
      {label}
    </button>
  );
};
