interface Props {
  activeTab: string;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  files: 'Meus Arquivos',
  categories: 'Categorias',
  banners: 'Banners (Hero)',
  users: 'Usuários',
};

export const AdminHeader = ({ activeTab }: Props) => {
  return (
    <header
      className="
        h-16 bg-[#181A1B]/80 backdrop-blur-md
        border-b border-white/5
        sticky top-0 z-20
        px-6 flex items-center justify-between
      "
    >
      {/* BREADCRUMB */}
      <div className="flex items-center text-sm text-text-muted">
        <span className="hover:text-white cursor-pointer">Admin</span>
        <i className="fas fa-chevron-right text-[10px] mx-2 opacity-50" />
        <span className="text-white font-medium">
          {TAB_LABELS[activeTab] ?? activeTab}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        <button
          className="
            w-8 h-8 rounded-full
            hover:bg-white/5
            flex items-center justify-center
            text-text-muted hover:text-white
            transition-colors
          "
          title="Notificações"
        >
          <i className="far fa-bell" />
        </button>

        <button
          className="
            w-8 h-8 rounded-full
            hover:bg-white/5
            flex items-center justify-center
            text-text-muted hover:text-white
            transition-colors
          "
          title="Configurações"
        >
          <i className="fas fa-cog" />
        </button>
      </div>
    </header>
  );
};
