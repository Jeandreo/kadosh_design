
import React, { useState } from 'react';

type LegalTab = 'terms' | 'privacy' | 'license';

export const Terms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LegalTab>('terms');

  return (
    <section className="py-12 md:py-20 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Central Legal</h1>
          <p className="text-text-muted">Transparência e clareza em nossa relação com você.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 border-b border-white/5 pb-1">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'terms' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}
          >
            Termos de Uso
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'privacy' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}
          >
            Privacidade
          </button>
          <button 
            onClick={() => setActiveTab('license')}
            className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'license' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}
          >
            Licença de Uso
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-surface border border-white/5 rounded-2xl p-8 md:p-12 shadow-xl text-text-muted leading-relaxed font-light text-sm md:text-base text-justify">
            
            {activeTab === 'terms' && (
                <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                    <h2 className="text-2xl font-bold text-white mb-4">Termos de Serviço</h2>
                    <p>
                        Bem-vindo ao Kadosh Design. Ao acessar nosso site e utilizar nossos serviços, você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso.
                    </p>
                    
                    <h3 className="text-lg font-bold text-white mt-6">1. Aceitação dos Termos</h3>
                    <p>
                        Ao se cadastrar, baixar ou utilizar qualquer recurso do Kadosh Design, você confirma que leu, entendeu e concordou com estes termos. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                    </p>

                    <h3 className="text-lg font-bold text-white mt-6">2. Contas e Assinaturas</h3>
                    <p>
                        Para acessar recursos premium, você deve criar uma conta e manter uma assinatura ativa. Você é responsável por manter a confidencialidade de sua conta e senha. O compartilhamento de contas é estritamente proibido e pode resultar no banimento imediato sem reembolso.
                    </p>

                    <h3 className="text-lg font-bold text-white mt-6">3. Pagamentos e Reembolsos</h3>
                    <p>
                        Nossos planos são cobrados de forma recorrente (mensal ou anual). Você pode cancelar a renovação a qualquer momento. Reembolsos são concedidos apenas em casos de erro técnico comprovado ou conforme exigido pela lei local (direito de arrependimento em até 7 dias).
                    </p>
                </div>
            )}

            {activeTab === 'privacy' && (
                <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                     <h2 className="text-2xl font-bold text-white mb-4">Política de Privacidade</h2>
                     <p>
                        Sua privacidade é fundamental para nós. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
                     </p>

                     <h3 className="text-lg font-bold text-white mt-6">1. Coleta de Dados</h3>
                     <p>
                        Coletamos informações que você nos fornece diretamente, como nome, e-mail e dados de pagamento (processados de forma segura por gateways terceiros). Também coletamos dados de uso automaticamente para melhorar nossa plataforma.
                     </p>

                     <h3 className="text-lg font-bold text-white mt-6">2. Uso das Informações</h3>
                     <p>
                        Utilizamos seus dados para: processar transações, fornecer acesso aos downloads, enviar atualizações importantes sobre o serviço e personalizar sua experiência na plataforma.
                     </p>

                     <h3 className="text-lg font-bold text-white mt-6">3. Segurança</h3>
                     <p>
                        Implementamos medidas de segurança robustas para proteger seus dados contra acesso não autorizado. Utilizamos criptografia SSL em todas as comunicações.
                     </p>
                </div>
            )}

            {activeTab === 'license' && (
                <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                    <h2 className="text-2xl font-bold text-white mb-4">Licença de Uso</h2>
                    <p>
                        Entenda o que você pode e não pode fazer com os arquivos baixados no Kadosh Design. Nossa licença é projetada para empoderar igrejas e designers.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
                            <h3 className="text-green-500 font-bold mb-4 flex items-center gap-2">
                                <i className="fas fa-check-circle"></i> O Que é Permitido
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li>• Uso em projetos pessoais e comerciais.</li>
                                <li>• Uso em mídias sociais de igrejas e ministérios.</li>
                                <li>• Impressão de flyers, banners e cartazes ilimitados.</li>
                                <li>• Edição e modificação total dos arquivos PSD.</li>
                            </ul>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
                            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                                <i className="fas fa-times-circle"></i> O Que é Proibido
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li>• Revender, sublicenciar ou redistribuir os arquivos originais.</li>
                                <li>• Disponibilizar os arquivos para download em outros sites.</li>
                                <li>• Utilizar as artes em conteúdo ofensivo ou ilegal.</li>
                                <li>• Registrar a arte como marca própria.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </section>
  );
};
