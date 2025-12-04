import React, { useEffect, useState } from "react";
import { 
  DollarSign,
  Plus, 
  Trash2, 
  Users,
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Recycle, 
  ShoppingCart, 
  LogOut, 
  Menu,
  Calendar,
  FileText,
  Tag,
} from "lucide-react";
import supabase from "../services/supabase";
import { Link } from "react-router-dom";




export default function DashboardInstCustos() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estados da sua lógica original
  const [custos, setCustos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const cnpj = localStorage.getItem("instituicao_cnpj") || "mock_cnpj";

  useEffect(() => {
    loadCustos();
  }, []);

  // --- LÓGICA ORIGINAL RESTAURADA ---
  async function loadCustos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("custos")
      .select("*")
      .eq("cnpj", cnpj)
      .order("vencimento_cus", { ascending: true });

    if (!error) setCustos(data || []);
    setLoading(false);
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("custos").insert({
      descricao_cus: descricao,
      valor_cus: valor,
      vencimento_cus: vencimento,
      cnpj,
    });

    if (error) {
      alert("Erro ao salvar custo: " + error.message);
      return;
    }

    setDescricao("");
    setValor("");
    setVencimento("");

    loadCustos(); // Recarrega a lista
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este custo?")) return;

    const { error } = await supabase.from("custos").delete().eq("cod_cus", id);
    
    if (error) {
        alert("Erro ao excluir: " + error.message);
    } else {
        loadCustos();
    }
  }
  // ----------------------------------

  return (
    <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <style>{`body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; }`}</style>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-emerald-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20 relative shrink-0`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Recycle className="text-emerald-400" /> Ciclo Verde
            </h1>
          ) : <Recycle className="mx-auto text-emerald-400" />}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem to="/dashboard-instituicao" icon={LayoutDashboard} label="Dashboard" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/mensagens-recebidas" icon={MessageSquare} label="Mensagens" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboardinst-Instituicao" icon={Building2} label="Instituição" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/funcionarios" icon={Users} label="Funcionários" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Catadores" icon={Recycle} label="Catadores" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Compras" icon={ShoppingCart} label="Compras" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Custos" icon={DollarSign} label="Custos" active isOpen={sidebarOpen} />
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
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden"><Menu /></button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Controle de Custos</h2>
              <p className="text-xs text-slate-500">Gerencie as despesas da instituição</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">I</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-slate-50">
          {/* CARD DE REGISTRO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
             <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold text-lg border-b border-slate-100 pb-2">
                <Tag size={20} /> <h3>Registrar Novo Custo</h3>
             </div>
             
             <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                   <Input label="Descrição" value={descricao} onChange={(e: any) => setDescricao(e.target.value)} required placeholder="Ex: Conta de Luz" icon={FileText} />
                </div>
                <div className="w-full md:w-48">
                   <Input label="Valor (R$)" type="number" step="0.01" value={valor} onChange={(e: any) => setValor(e.target.value)} required placeholder="0.00" icon={DollarSign} />
                </div>
                <div className="w-full md:w-48">
                   <Input label="Vencimento" type="date" value={vencimento} onChange={(e: any) => setVencimento(e.target.value)} required icon={Calendar} />
                </div>
                <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-emerald-200 transition-all h-[42px]">
                  <Plus size={18} /> Registrar
                </button>
             </form>
          </div>

          {/* LISTAGEM */}
          {loading ? (
             <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow-sm"></div>)}</div>
          ) : custos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <DollarSign size={48} strokeWidth={1} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">Nenhum custo registrado</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Valor</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Cadastro</th>
                    <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {custos.map((c) => (
                    <tr key={c.cod_cus} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{c.descricao_cus}</td>
                      <td className="py-4 px-6 font-mono text-emerald-700 font-bold text-sm">R$ {Number(c.valor_cus).toFixed(2)}</td>
                      <td className="py-4 px-6 text-slate-600 text-sm">{new Date(c.vencimento_cus).toLocaleDateString("pt-BR")}</td>
                      <td className="py-4 px-6 text-slate-500 text-sm">{c.cadastro_cus ? new Date(c.cadastro_cus).toLocaleDateString("pt-BR") : "-"}</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => excluir(c.cod_cus)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Subcomponentes visuais
const Input = ({ label, name, type, required, step, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"><Icon size={18} /></div>}
      <input type={type} name={name} step={step} required={required} value={value} onChange={onChange} placeholder={placeholder} 
        className={`w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 block p-2.5 ${Icon ? 'pl-10' : 'pl-3'} outline-none h-[42px]`} />
    </div>
  </div>
);

function SidebarItem({ to, icon: Icon, label, active, isOpen }: any) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${active ? 'bg-emerald-800 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'} ${!isOpen && 'justify-center'}`}>
      <Icon size={20} className={active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} />
      {isOpen && <span className="font-medium text-sm">{label}</span>}
    </Link>
  );
}