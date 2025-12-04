import React, { useEffect, useState } from "react";
import { 
  ShoppingCart,
  Plus, 
  Trash2, 
  Search, 
  LayoutDashboard, 
  Users,
  MessageSquare, 
  Building2, 
  Recycle, 
  DollarSign, 
  LogOut, 
  Menu,
  Calendar,
  Scale, 
  Tag,
  User
} from "lucide-react";
import Input from "../components/Input";
import supabase from "../services/supabase";
import { Link } from "react-router-dom";


export default function DashboardInstCompras() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estados da sua lógica original
  const [compras, setCompras] = useState<any[]>([]);
  const [catadores, setCatadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [material, setMaterial] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [codCat, setCodCat] = useState("");
  
  // Adicionei um estado para data, pois é útil, mas mantive sua lógica de limpeza
  const [dataCompra, setDataCompra] = useState("");

  const cnpj = localStorage.getItem("instituicao_cnpj") || "mock_cnpj";

  useEffect(() => {
    // Inicializar data com hoje
    setDataCompra(new Date().toISOString().split('T')[0]);
    
    // Função unificada de carregamento para garantir ordem
    async function initData() {
        setLoading(true);
        await loadCatadores(); // 1. Carrega catadores
        await loadCompras();   // 2. Carrega compras e faz o join
        setLoading(false);
    }
    initData();
  }, []);

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

  // --- LÓGICA ORIGINAL RESTAURADA ---
  
  async function loadCatadores() {
    const { data, error } = await supabase
      .from("catador")
      .select("cod_cat, nome_cat")
      .eq("cnpj", cnpj);

    if (!error) {
        setCatadores(data || []);
        return data || []; // Retorna para uso imediato se necessário
    }
    return [];
  }

  async function loadCompras() {
    // Nota: Como o estado 'catadores' pode não ter atualizado ainda dentro do mesmo ciclo,
    // buscamos novamente ou usamos o retorno de loadCatadores se chamados em cadeia.
    // Para segurança na UI, vamos garantir que temos os catadores.
    
    const { data: listaCatadores } = await supabase.from("catador").select("cod_cat, nome_cat").eq("cnpj", cnpj);
    
    const { data, error } = await supabase
      .from("compra")
      .select("*")
      .eq("cnpj", cnpj)
      .order("data_compra", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // 🟩 JUNTANDO AS COMPRAS COM OS CATADORES MANUALMENTE
    const comprasComNomes = (data || []).map((c: any) => ({
      ...c,
      catador_nome:
        (listaCatadores || []).find((x: any) => x.cod_cat === c.cod_cat)?.nome_cat || "Não encontrado",
    }));

    setCompras(comprasComNomes);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("compra").insert({
      material,
      quantidade, // Usando quantidade conforme seu código original
      valor,
      cod_cat: codCat,
      data_compra: dataCompra, // Incluindo data
      cnpj,
    });

    if (error) {
      alert("Erro ao salvar compra: " + error.message);
      return;
    }

    setMaterial("");
    setQuantidade("");
    setValor("");
    setCodCat("");
    
    loadCompras();
  }

  async function excluir(id: number) {
    if (!confirm("Excluir esta compra?")) return;

    const { error } = await supabase.from("compra").delete().eq("cod_compra", id);
    
    if (error) {
        alert("Erro ao excluir: " + error.message);
    } else {
        loadCompras();
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
          <SidebarItem to="/dashboard-instituicao/Compras" icon={ShoppingCart} label="Compras" active isOpen={sidebarOpen} />
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
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden"><Menu /></button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registro de Compras</h2>
              <p className="text-xs text-slate-500">Controle de materiais recicláveis adquiridos</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">I</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-slate-50">
          {/* CARD DE REGISTRO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
             <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold text-lg border-b border-slate-100 pb-2">
                <ShoppingCart size={20} /> <h3>Nova Compra</h3>
             </div>
             
             <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                   <Input label="Catador" name="codCat" as="select" value={codCat} onChange={(e: any) => setCodCat(e.target.value)} required icon={User}>
                      <option value="">Selecione o Catador...</option>
                      {catadores.map((cat: any) => (
                        <option key={cat.cod_cat} value={cat.cod_cat}>{cat.nome_cat}</option>
                      ))}
                   </Input>
                </div>

                <div className="md:col-span-2">
                   <Input label="Material" name="material" value={material} onChange={(e: any) => setMaterial(e.target.value)} required placeholder="Ex: Plástico" icon={Tag} />
                </div>
                
                <div>
                   <Input label="Qtd (kg)" type="number" step="0.1" value={quantidade} onChange={(e: any) => setQuantidade(e.target.value)} required placeholder="0.0" icon={Scale} />
                </div>
                
                <div>
                   <Input label="Valor (R$)" type="number" step="0.01" value={valor} onChange={(e: any) => setValor(e.target.value)} required placeholder="0.00" icon={DollarSign} />
                </div>

                <div className="md:col-span-6 flex justify-end mt-2">
                    <button type="submit" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-md shadow-emerald-200 transition-all h-[42px]">
                      <Plus size={18} /> Registrar Compra
                    </button>
                </div>
             </form>
          </div>

          {/* LISTAGEM */}
          {loading ? (
             <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow-sm"></div>)}</div>
          ) : compras.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <ShoppingCart size={48} strokeWidth={1} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">Nenhuma compra registrada</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Catador</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Material</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Qtd (Kg)</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Valor Pago</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Data</th>
                    <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compras.map((c) => (
                    <tr key={c.cod_compra} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{c.catador_nome}</td>
                      <td className="py-4 px-6">{c.material}</td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-sm">{Number(c.quantidade).toFixed(1)}</td>
                      <td className="py-4 px-6 font-mono text-emerald-700 font-bold text-sm">R$ {Number(c.valor).toFixed(2)}</td>
                      <td className="py-4 px-6 text-slate-500 text-sm">{new Date(c.data_compra).toLocaleDateString("pt-BR")}</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => excluir(c.cod_compra)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
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