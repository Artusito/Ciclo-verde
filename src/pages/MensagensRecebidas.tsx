import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Users, 
  Recycle, 
  ShoppingCart, 
  DollarSign, 
  LogOut, 
  Menu, 
  Check,
  Clock,
  User,
  Calendar,
} from "lucide-react";

import { Link } from "react-router-dom";
import supabase from "../services/supabase";

export default function MensagensInstituicao() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'lidas' | 'nao_lidas'>('todos');

  // -------- CARREGAR MENSAGENS ----------
  useEffect(() => {
    loadMensagens();
  }, []);

  async function loadMensagens() {
    setLoading(true);
    // Mockando a chamada para usar o .then do mock
    await supabase
      .from("mensagem")
      .select("*")
      .order("cod_men", { ascending: false })
      .then(({ data }: any) => {
        setMensagens(data || []);
        setLoading(false);
      });
  }

  async function marcarComoLida(cod_men: number) {
    // Atualiza localmente para feedback instantâneo (Optimistic UI)
    setMensagens(prev => prev.map(m => 
      m.cod_men === cod_men ? { ...m, realizado_men: new Date().toISOString() } : m
    ));

    await supabase
      .from("mensagem")
      .update({ realizado_men: new Date() })
      .eq("cod_men", cod_men)
      .then(() => {
        // Recarrega para garantir sincronia (opcional se usar optimistic UI)
        // loadMensagens(); 
      });
  }

  // Filtragem no front-end
  const mensagensFiltradas = mensagens.filter(m => {
    if (filtro === 'lidas') return m.realizado_men !== null;
    if (filtro === 'nao_lidas') return m.realizado_men === null;
    return true;
  });

  return (
    <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Reset Global */}
      <style>{`body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; }`}</style>
      
      {/* SIDEBAR (Mesmo estilo do Dashboard) */}
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
          <SidebarItem to="/dashboard-instituicao/mensagens-recebidas" icon={MessageSquare} label="Mensagens" active isOpen={sidebarOpen} />
          <SidebarItem to="/dashboardinst-Instituicao" icon={Building2} label="Instituição" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/funcionarios" icon={Users} label="Funcionários" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Catadores" icon={Recycle} label="Catadores" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Compras" icon={ShoppingCart} label="Compras" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Custos" icon={DollarSign} label="Custos" isOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <button
            onClick={() => supabase.auth.signOut()}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3 p-3 rounded-xl text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors`}
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
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu />
            </button>
            
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800">Caixa de Entrada</h2>
              <p className="text-xs text-slate-500">Gerencie a comunicação com seus parceiros</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Removida a Barra de pesquisa */}
             
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
                I
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-slate-50">
          
          {/* Toolbar de Filtros */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <FilterButton active={filtro === 'todos'} onClick={() => setFiltro('todos')} label="Todas" count={mensagens.length} />
              <FilterButton active={filtro === 'nao_lidas'} onClick={() => setFiltro('nao_lidas')} label="Não lidas" count={mensagens.filter(m => !m.realizado_men).length} />
              <FilterButton active={filtro === 'lidas'} onClick={() => setFiltro('lidas')} label="Lidas" count={mensagens.filter(m => m.realizado_men).length} />
            </div>
          </div>

          {/* Lista de Mensagens */}
          {loading ? (
             <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse h-32"></div>
               ))}
             </div>
          ) : mensagensFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <MessageSquare size={48} strokeWidth={1} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">Nenhuma mensagem encontrada</p>
              <p className="text-sm">Tente mudar os filtros ou aguarde novas mensagens.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {mensagensFiltradas.map((m) => {
                const isRead = !!m.realizado_men;
                return (
                  <div
                    key={m.cod_men}
                    className={`
                      relative bg-white border rounded-xl p-6 transition-all duration-200 group
                      ${isRead ? 'border-slate-200 opacity-80 hover:opacity-100' : 'border-emerald-200 shadow-md shadow-emerald-100/50 border-l-4 border-l-emerald-500'}
                    `}
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          )}
                          <h3 className={`text-lg font-bold ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {m.assunto_men}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                           <div className="flex items-center gap-1">
                             <User size={14} />
                             <span className="font-medium text-slate-700">{m.nome_usu}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Clock size={14} />
                             <span>{m.turno_men}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Calendar size={14} />
                             <span>{new Date(m.emissao_men).toLocaleDateString("pt-BR")} às {new Date(m.emissao_men).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                        </div>

                        <p className={`text-sm leading-relaxed ${isRead ? 'text-slate-500' : 'text-slate-700'}`}>
                          {m.descricao_men}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isRead ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
                            <Check size={14} /> Lida em {new Date(m.realizado_men).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <button
                            onClick={() => marcarComoLida(m.cod_men)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 hover:shadow-sm transition-all border border-emerald-200"
                          >
                            <Check size={16} /> Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------- SUB-COMPONENTES ----------------

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
      
      {/* Tooltip quando fechado */}
      {!isOpen && (
        <div className="absolute left-14 bg-emerald-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
          {label}
        </div>
      )}
    </Link>
  );
}

function FilterButton({ active, onClick, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
        ${active ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}
      `}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500'}`}>
        {count}
      </span>
    </button>
  );
}