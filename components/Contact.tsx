
import React, { useState } from 'react';
import { Toast } from './Toast';
import { CONFIG } from '../config';

const FAQ_ITEMS = [
    {
        question: "Como funciona a cota de downloads?",
        answer: "A cota é diária e não cumulativa. Ela renova automaticamente à meia-noite. Se você tem o plano Ministério, tem direito a 7 downloads por dia."
    },
    {
        question: "Posso cancelar minha assinatura a qualquer momento?",
        answer: "Sim! Não temos fidelidade nos planos mensais. Você pode cancelar direto no seu Painel do Usuário sem burocracia."
    },
    {
        question: "Os arquivos são compatíveis com quais programas?",
        answer: "A maioria dos nossos arquivos são PSD (Photoshop). Alguns também incluem versões JPG e PNG. Temos uma categoria específica para artes editáveis no Canva."
    },
    {
        question: "Emitem nota fiscal para igrejas?",
        answer: "Sim, emitimos nota fiscal de prestação de serviços. Basta solicitar ao nosso suporte após o pagamento informando os dados da igreja."
    }
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Dúvida sobre Planos',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic Validation
      if (!formData.name || !formData.email || !formData.message) {
          setToastMessage("Por favor, preencha todos os campos obrigatórios.");
          setToastType('error');
          setShowToast(true);
          return;
      }

      setIsSending(true);

      // Simulate API Email Send
      setTimeout(() => {
          setIsSending(false);
          setToastMessage("Mensagem enviada com sucesso! Responderemos em breve.");
          setToastType('success');
          setShowToast(true);
          
          // Reset Form
          setFormData({
              name: '',
              email: '',
              subject: 'Dúvida sobre Planos',
              message: ''
          });
      }, 1500);
  };
  
  const toggleFaq = (index: number) => {
      setOpenFaqIndex(openFaqIndex === index ? null : index);
  }

  return (
    <section className="py-12 md:py-24 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* FAQ SECTION */}
        <div className="mb-20">
             <div className="text-center mb-12">
                 <h2 className="text-3xl font-extrabold text-white mb-4">Perguntas Frequentes</h2>
                 <p className="text-text-muted">Encontre respostas rápidas para as dúvidas mais comuns.</p>
             </div>
             
             <div className="max-w-3xl mx-auto space-y-4">
                 {FAQ_ITEMS.map((item, index) => (
                     <div key={index} className="bg-surface/50 border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
                         <button 
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                         >
                             <span className="font-bold text-white text-sm md:text-base">{item.question}</span>
                             <i className={`fas fa-chevron-down text-text-muted transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}></i>
                         </button>
                         <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                             <div className="p-5 pt-0 text-text-muted text-sm leading-relaxed border-t border-white/5">
                                 {item.answer}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* LEFT COLUMN: Info */}
            <div>
                <h2 className="text-3xl font-extrabold text-white mb-6">Ainda precisa de ajuda?</h2>
                <p className="text-text-muted text-lg mb-10 font-light">
                    Estamos prontos para atender você. Tire dúvidas sobre assinaturas, reporte problemas ou envie sugestões.
                </p>

                <div className="space-y-6">
                    {/* WhatsApp */}
                    <a 
                        href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-6 p-6 bg-surface/50 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-green-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                            <i className="fab fa-whatsapp text-3xl text-green-500"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">WhatsApp</h3>
                            <p className="text-text-muted mb-1">(31) 98602-2600</p>
                            <span className="text-xs text-green-500 font-medium uppercase tracking-wider">Atendimento Rápido</span>
                        </div>
                    </a>

                    {/* Email */}
                    <a 
                        href={`mailto:${CONFIG.SUPPORT_EMAIL}`}
                        className="flex items-center gap-6 p-6 bg-surface/50 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-primary/30 transition-all group"
                    >
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <i className="far fa-envelope text-2xl text-primary"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">E-mail</h3>
                            <p className="text-text-muted mb-1 break-all">{CONFIG.SUPPORT_EMAIL}</p>
                            <span className="text-xs text-primary font-medium uppercase tracking-wider">Suporte Técnico</span>
                        </div>
                    </a>

                    {/* Location */}
                    <div className="flex items-center gap-6 p-6 border border-transparent rounded-2xl opacity-80">
                         <div className="w-14 h-14 flex items-center justify-center shrink-0">
                            <i className="fas fa-map-marker-alt text-2xl text-text-muted"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Localização</h3>
                            <p className="text-text-muted">Divinópolis - MG</p>
                            <span className="text-xs text-text-muted/60">(Atendimento 100% Digital)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Glass Form */}
            <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Envie uma mensagem</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Nome Completo</label>
                        <input 
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 text-white rounded-xl py-3.5 px-4 outline-none focus:border-primary focus:bg-white/5 transition-all placeholder-white/20"
                            placeholder="Digite seu nome"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">E-mail</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 text-white rounded-xl py-3.5 px-4 outline-none focus:border-primary focus:bg-white/5 transition-all placeholder-white/20"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Assunto</label>
                         <select 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 text-text-muted rounded-xl py-3.5 px-4 outline-none focus:border-primary focus:bg-white/5 transition-all cursor-pointer"
                         >
                            <option className="bg-surface">Dúvida sobre Planos</option>
                            <option className="bg-surface">Suporte Técnico</option>
                            <option className="bg-surface">Parcerias</option>
                            <option className="bg-surface">Outros</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Mensagem</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            className="w-full bg-transparent border border-white/20 text-white rounded-xl py-3 px-4 outline-none focus:border-primary focus:bg-white/5 transition-all placeholder-white/20 resize-none"
                            placeholder="Escreva sua mensagem aqui..."
                            required
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                    >
                        {isSending ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Enviando...
                            </>
                        ) : (
                            'Enviar Mensagem'
                        )}
                    </button>
                </form>
            </div>

        </div>
      </div>
      <Toast 
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
      />
    </section>
  );
};
