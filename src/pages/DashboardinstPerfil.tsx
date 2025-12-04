import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  Hash, 
  MapPin, 
  Save, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Recycle, 
  ShoppingCart, 
  DollarSign, 
  LogOut, 
  Menu, 
  FileText, 
  CheckCircle2,
  AlertTriangle 
} from "lucide-react";

import supabase from "../services/supabase";
import { Link } from "react-router-dom"; 


const Button = ({ children, disabled, type = "button", className = "" }: any) => (
  <button
    type={type}
    disabled={disabled}
    className={`w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/40 
    transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
    flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${className}`}
  >
    {children}
  </button>
);


const Input = ({ label, name, type = "text", required, maxLength, value, onChange, disabled, icon: Icon, placeholder }: any) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wider flex items-center gap-1">
        {label} {required && <span className="text-rose-500 text-lg leading-none">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300">
            <Icon size={20} strokeWidth={1.8} />
          </div>
        )}
        <input
          type={type}
          name={name}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-white border-2 border-slate-100 text-slate-800 text-sm rounded-xl 
          focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 
          block p-3.5 ${Icon ? 'pl-12' : 'pl-4'} transition-all duration-200 outline-none font-medium placeholder:text-slate-300 shadow-sm group-hover:border-slate-200 ${disabled ? 'bg-slate-50 opacity-80 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

// Subcomponente SidebarItem
function SidebarItem({ to, icon: Icon, label, active, isOpen }: any) {
  return (
    <Link 
      to={to} 
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
        ${active ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/50' : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'}
        ${!isOpen && 'justify-center'}
      `}
    >
      <Icon size={20} className={active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} />
      
      {isOpen && <span className="font-medium text-sm">{label}</span>}
      
      {!isOpen && (
        <div className="absolute left-14 bg-emerald-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
          {label}
        </div>
      )}
    </Link>
  );
}


type InstituicaoData = {
  cnpj: string;
  nome_ins: string;
  razao_soc: string;
  email_ins: string;
  telefone_ins: string;
  endereco_ins: string;
  cidade_ins: string;
  uf_ins: string;
  numero_ins: string;
};

export default function PerfilInstituicao() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<InstituicaoData>({
    cnpj: "",
    nome_ins: "",
    razao_soc: "",
    email_ins: "",
    telefone_ins: "",
    endereco_ins: "",
    cidade_ins: "",
    uf_ins: "",
    numero_ins: "",
  });

  // -------- CARREGAR DADOS ----------
  useEffect(() => {
    async function fetchInstituicao() {
      setLoading(true);
      setError(null);

      try {
        const email = localStorage.getItem("instituicao_email") || "contato@ecorecicle.com"; 

        if (!email) {
          throw new Error("Sessão inválida. E-mail não encontrado.");
        }

        const { data, error: sbError } = await supabase
          .from("instituicao")
          .select("cnpj, nome_ins, razao_soc, email_ins, telefone_ins, endereco_ins, cidade_ins, uf_ins, numero_ins")
          .eq("email_ins", email)
          .single();

        if (sbError) throw sbError;

        setFormData(data as InstituicaoData); 
      } catch (err: any) {
        console.error("Erro:", err);
        setError(err.message || "Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    }

    fetchInstituicao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- LOGOUT ----------
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/login-instituicao";
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao tentar sair.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // -------- SALVAR DADOS ----------
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const email = formData.email_ins; 
      if (!email) throw new Error("Email da instituição não disponível para salvar.");

      const { cnpj, email_ins, ...updatableData } = formData;

      const { error: updateError } = await supabase
        .from("instituicao")
        .update(updatableData)
        .eq("email_ins", email)
        .then((res: any) => res); // Ajuste para o mock/real

      if (updateError) throw updateError;

      setSuccessMsg("Dados atualizados com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // -------- TELA DE CARREGAMENTO ----------
  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-emerald-600 font-medium text-lg">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // -------- LAYOUT PRINCIPAL ----------
  return (
    <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Reset Global */}
      <style>{`body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; }`}</style>
      
      {/* SIDEBAR */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-emerald-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20 relative shrink-0`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Recycle className="text-emerald-400" /> Ciclo Verde
            </h1>
          ) : (
             <Recycle className="mx-auto text-emerald-400" />
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem to="/dashboard-instituicao" icon={LayoutDashboard} label="Dashboard" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/mensagens-recebidas" icon={MessageSquare} label="Mensagens" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboardinst-Instituicao" icon={Building2} label="Instituição" active isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/funcionarios" icon={Users} label="Funcionários" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Catadores" icon={Recycle} label="Catadores" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Compras" icon={ShoppingCart} label="Compras" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Custos" icon={DollarSign} label="Custos" isOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3 p-3 rounded-xl text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (Formulário) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu />
            </button>
            
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800">Perfil da Instituição</h2>
              <p className="text-xs text-slate-500">Visualize e edite os dados cadastrais da sua empresa</p>
            </div>
          </div>

          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
             {formData.nome_ins ? formData.nome_ins.charAt(0) : "I"}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-slate-50">
          
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100">

            <div className="p-8">
              
              {/* Notificações */}
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <div>
                    <p className="font-semibold">Erro ao carregar/salvar:</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 size={20} />
                  <p className="font-semibold text-sm">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-8">

                {/* 1. IDENTIFICAÇÃO */}
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Building2 size={20} className="text-emerald-500" /> Identificação
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Input
                      label="CNPJ"
                      name="cnpj"
                      value={formData.cnpj}
                      disabled
                      icon={Hash}
                    />
                    
                    <Input
                      label="Email Institucional (Principal)"
                      name="email_ins"
                      value={formData.email_ins}
                      disabled
                      icon={Mail}
                    />
                    
                    <Input
                      label="Nome Fantasia"
                      name="nome_ins"
                      value={formData.nome_ins}
                      onChange={handleChange}
                      icon={Building2}
                      required
                    />

                    <Input
                      label="Razão Social"
                      name="razao_soc"
                      value={formData.razao_soc}
                      onChange={handleChange}
                      icon={FileText}
                      required
                    />
                  </div>
                </div>

                {/* 2. CONTATO & LOCALIZAÇÃO */}
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                     <MapPin size={20} className="text-emerald-500" /> Contato e Endereço
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Input
                      label="Telefone"
                      name="telefone_ins"
                      value={formData.telefone_ins}
                      onChange={handleChange}
                      icon={Phone}
                    />

                    <Input
                      label="Endereço (Rua/Avenida)"
                      name="endereco_ins"
                      value={formData.endereco_ins}
                      onChange={handleChange}
                      icon={MapPin}
                      required
                    />

                    <Input
                      label="Número"
                      name="numero_ins"
                      value={formData.numero_ins}
                      onChange={handleChange}
                      icon={Hash}
                      required
                    />

                    <Input
                      label="Cidade"
                      name="cidade_ins"
                      value={formData.cidade_ins}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="UF"
                      name="uf_ins"
                      value={formData.uf_ins}
                      maxLength={2}
                      onChange={handleChange}
                      required
                    />
                    <div></div> 

                  </div>
                </div>


                {/* Rodapé do Formulário */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <div className="w-full md:w-auto md:min-w-[200px]">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                         <>
                         <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Salvando...
                       </>
                      ) : (
                        <>
                           <Save size={20} /> Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}