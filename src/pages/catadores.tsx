import React, { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Recycle, 
  ShoppingCart, 
  DollarSign, 
  LogOut, 
  Menu,
  Phone,
  CreditCard, // Para CPF
  X
} from "lucide-react";
import supabase from "../services/supabase";
import { Link } from "react-router-dom";


// Subcomponente Input
const Input = ({ label, name, type = "text", required, value, onChange, placeholder, icon: Icon, maxLength }: any) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          name={name}
          maxLength={maxLength}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg 
          focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 
          block p-2.5 ${Icon ? 'pl-10' : 'pl-3'} outline-none transition-all placeholder:text-slate-300`}
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


export default function DashboardInstCatadores() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [catadores, setCatadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const cnpj = localStorage.getItem("instituicao_cnpj") || "mock_cnpj";

  useEffect(() => {
    if (!cnpj) {
      alert("Sessão expirada. Faça login novamente.");
      // window.location.href = "/login-instituicao";
      return;
    }
    carregarCatadores();
  }, []);

  async function carregarCatadores() {
    setLoading(true);
    await supabase
      .from("catador")
      .select("*")
      .eq("cnpj", cnpj)
      .then(({ data }: any) => {
        setCatadores(data || []);
        setLoading(false);
      });
  }

   // -------- FUNÇÃO DE LOGOUT (NOVA) ----------
  async function handleLogout() {
    try {
      // 1. Deslogar do Supabase
      await supabase.auth.signOut();
      
      // 2. Limpar dados locais sensíveis
      localStorage.removeItem("instituicao_cnpj");
      localStorage.removeItem("instituicao_email");
      localStorage.removeItem("instituicao_nome");
      // Ou limpar tudo: localStorage.clear();

      // 3. Redirecionar para login
      window.location.href = "/login-instituicao";
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao tentar sair. Tente novamente.");
    }
  }
  async function cadastrarCatador(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("catador").insert([
      { nome_cat: nome, cpf_cat: cpf, telefone_cat: telefone, cnpj: cnpj },
    ]).then(({ error }: any) => {
      if (error) {
        alert("Erro ao salvar: " + error.message);
      } else {
        setModalOpen(false);
        setNome("");
        setCpf("");
        setTelefone("");
        setCatadores([...catadores, { cod_cat: Math.random(), nome_cat: nome, cpf_cat: cpf, telefone_cat: telefone }]);
      }
    });
  }

  async function excluirCatador(id: number) {
    if (!confirm("Deseja realmente excluir este catador?")) return;
    
    await supabase
      .from("catador")
      .delete()
      .eq("cod_cat", id)
      .then(({ error }: any) => {
        if (error) alert("Erro: " + error.message);
        else setCatadores(catadores.filter(c => c.cod_cat !== id));
      });
  }

  return (
    <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
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
          <SidebarItem to="/dashboardinst-Instituicao" icon={Building2} label="Instituição" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/funcionarios" icon={Users} label="Funcionários" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Catadores" icon={Recycle} label="Catadores" active isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Compras" icon={ShoppingCart} label="Compras" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Custos" icon={DollarSign} label="Custos" isOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-emerald-800">
        <button 
                    onClick={handleLogout} 
                    className={`w-full flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} gap-3 p-3 rounded-xl text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors`}
                  >
                    <LogOut size={20} />
                    {sidebarOpen && <span>Sair</span>}
                  </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800">Catadores</h2>
              <p className="text-xs text-slate-500">Parceiros cadastrados para coleta</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">I</div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-slate-50">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar catador..." 
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none w-64 text-sm"
              />
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5"
            >
              <Plus size={20} /> Novo Catador
            </button>
          </div>

          {loading ? (
             <div className="grid gap-4">
               {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow-sm"></div>)}
             </div>
          ) : catadores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <Recycle size={48} strokeWidth={1} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">Nenhum catador cadastrado</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">CPF</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catadores.map((c) => (
                    <tr key={c.cod_cat} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 font-medium text-slate-800 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                           {c.nome_cat.charAt(0)}
                         </div>
                         {c.nome_cat}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                         {c.cpf_cat}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-sm">{c.telefone_cat}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => excluirCatador(c.cod_cat)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h2 className="text-lg font-bold text-slate-800">Novo Catador</h2>
                 <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={cadastrarCatador} className="p-6 space-y-5">
                 <Input label="Nome Completo" value={nome} onChange={(e: any) => setNome(e.target.value)} required placeholder="Ex: Carlos Pereira" icon={Users} />
                 <Input label="CPF" value={cpf} maxLength={14} onChange={(e: any) => setCpf(e.target.value)} required placeholder="000.000.000-00" icon={CreditCard} />
                 <Input label="Telefone" value={telefone} maxLength={15} onChange={(e: any) => setTelefone(e.target.value)} required placeholder="(00) 00000-0000" icon={Phone} />
                 
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 transition-all">Salvar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}