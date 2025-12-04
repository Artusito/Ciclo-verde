import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import supabase from "../services/supabase";

/* ---- REGISTRA TODOS OS ELEMENTOS NECESSÁRIOS DO CHART.JS ---- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardInstituicao() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [totalCatadores, setTotalCatadores] = useState(0);
  const [mensagens, setMensagens] = useState(0);
  const [comprasMes, setComprasMes] = useState(0);
  const [custosMes, setCustosMes] = useState(0);

  const [compraGroup, setCompraGroup] = useState<Record<string, number>>({});
  const [custosGroup, setCustosGroup] = useState<{ labels: string[]; valores: number[] }>({
    labels: [],
    valores: [],
  });

  useEffect(() => {
    async function loadUser() {
      // Usa um valor padrão se não houver no localStorage (para o mock funcionar)
      const rawCnpj = localStorage.getItem("instituicao_cnpj") || "mock_cnpj";
      const cnpj = rawCnpj.trim();

      if (!cnpj) {
        console.warn("Nenhum CNPJ salvo no localStorage");
        setUserName("Instituição");
        setLoadingUser(false);
        await loadDashboardData(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("instituicao")
          .select("nome_ins")
          .eq("cnpj", cnpj)
          .maybeSingle();

        if (error) {
          console.warn("Erro ao carregar nome:", error.message);
          setUserName("Instituição");
        } else {
          setUserName(data?.nome_ins || "Instituição");
        }
      } catch (err) {
        console.error("Erro loadUser:", err);
        setUserName("Instituição");
      } finally {
        setLoadingUser(false);
      }

      await loadDashboardData(cnpj);
    }

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function loadDashboardData(cnpj: string | null) {
    // 1. CATADORES
    try {
      let query = supabase.from("catador").select("*", { count: "exact", head: true });
      if (cnpj) query = query.eq("cnpj", cnpj);
      
      const { count, error } = await query;
      
      if (error) console.error("Erro Catadores:", error);
      setTotalCatadores(count ?? 0);
    } catch (err) {
      console.error("Erro catch catadores:", err);
    }

    // 2. MENSAGENS
    try {
      let query = supabase.from("mensagem").select("*", { count: "exact", head: true });
      if (cnpj) query = query.eq("cnpj", cnpj);
      
      const { count, error } = await query;

      if (error) {
        // Fallback para singular se plural falhar
        let querySingular = supabase.from("mensagem").select("*", { count: "exact", head: true });
        if (cnpj) querySingular = querySingular.eq("cnpj", cnpj);
        const { count: countS } = await querySingular;
        setMensagens(countS ?? 0);
      } else {
        setMensagens(count ?? 0);
      }
    } catch (err) {
      console.error("Erro catch mensagens:", err);
    }

    // 3. COMPRAS
    try {
      let query = supabase.from("compra").select("valor, material");
      if (cnpj) query = query.eq("cnpj", cnpj);

      const { data: compras, error } = await query;

      if (error) {
        console.error("Erro Compras:", error);
      } else if (compras) {
        const totalCompras = compras.reduce((s: number, it: any) => s + Number(it.valor ?? 0), 0);
        setComprasMes(totalCompras);

        const group: Record<string, number> = {};
        compras.forEach((c: any) => {
          const mat = c.material || "Outros";
          group[mat] = (group[mat] || 0) + Number(c.valor || 0);
        });
        setCompraGroup(group);
      }
    } catch (err) {
      console.error("Erro catch compras:", err);
    }

    // 4. CUSTOS
    try {
      let query = supabase.from("custos").select("valor_cus, descricao_cus");
      if (cnpj) query = query.eq("cnpj", cnpj);

      const { data: custos, error } = await query;

      if (error) {
        console.error("Erro Custos:", error);
      } else if (custos) {
        const totalCustos = custos.reduce((s: number, it: any) => s + Number(it.valor_cus ?? 0), 0);
        setCustosMes(totalCustos);

        setCustosGroup({
          labels: custos.map((x: any) => x.descricao_cus).slice(0, 6),
          valores: custos.map((x: any) => Number(x.valor_cus)).slice(0, 6),
        });
      }
    } catch (err) {
      console.error("Erro catch custos:", err);
    }
  }

  /* ---- CONFIGURAÇÃO DOS GRÁFICOS ---- */
  const doughnutData = {
    labels: Object.keys(compraGroup),
    datasets: [
      {
        data: Object.values(compraGroup),
        backgroundColor: ["#10B981", "#34D399", "#059669", "#6EE7B7", "#047857"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: custosGroup.labels,
    datasets: [
      {
        label: "Custo (R$)",
        data: custosGroup.valores,
        backgroundColor: "#F43F5E",
        borderRadius: 6,
      },
    ],
  };

  // Opções específicas para evitar erros de escala no Doughnut
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Reset CSS Global para evitar bordas brancas */}
      <style>{`body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; }`}</style>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-emerald-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20 relative shrink-0`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Recycle className="text-emerald-400" /> Ciclo Verde</h1> : <Recycle className="mx-auto text-emerald-400" />}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          <SidebarItem to="/dashboard-instituicao" icon={LayoutDashboard} label="Dashboard" active isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/mensagens-recebidas" icon={MessageSquare} label="Mensagens" badge={mensagens} isOpen={sidebarOpen} />
          <SidebarItem to="/dashboardinst-Instituicao" icon={Building2} label="Instituição" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/funcionarios" icon={Users} label="Funcionários" isOpen={sidebarOpen} />
          <SidebarItem to="/dashboard-instituicao/Catadores" icon={Recycle} label="Catadores" isOpen={sidebarOpen} />
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
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden"><Menu /></button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800">Visão Geral</h2>
              <p className="text-xs text-slate-500">Bem-vindo ao painel de controle</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">{loadingUser ? "Carregando..." : userName}</p>
              <p className="text-xs text-emerald-600 font-medium">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
              {userName ? userName.charAt(0) : "I"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 w-full bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Catadores Ativos" value={totalCatadores} icon={Users} color="emerald" />
            <StatCard title="Compras (Mês)" value={`R$ ${comprasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={ShoppingCart} color="blue" />
            <StatCard title="Custos (Mês)" value={`R$ ${custosMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={Wallet} color="rose" />
            <StatCard title="Novas Mensagens" value={mensagens} icon={MessageSquare} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GRÁFICO DE COMPRAS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Materiais Comprados</h3>
                  <p className="text-sm text-slate-500">Distribuição por tipo de material</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp size={20} /></div>
              </div>
              <div className="flex-1 relative w-full min-h-0">
                {Object.keys(compraGroup).length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions as any} />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem dados de compras</div>
                )}
              </div>
            </div>

            {/* GRÁFICO DE CUSTOS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Custos Operacionais</h3>
                  <p className="text-sm text-slate-500">Principais despesas do mês</p>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><DollarSign size={20} /></div>
              </div>
              <div className="flex-1 relative w-full min-h-0">
                {custosGroup.labels.length > 0 ? (
                  <Bar data={barData} options={barOptions as any} />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem dados de custos</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- SUB-COMPONENTES ---------------- */
function SidebarItem({ to, icon: Icon, label, active, badge, isOpen }: any) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${active ? "bg-emerald-800 text-white shadow-lg" : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"} ${!isOpen && "justify-center"}`}>
      <Icon size={20} className={active ? "text-emerald-400" : "group-hover:text-emerald-400"} />
      {isOpen && <span className="font-medium text-sm">{label}</span>}
      {badge > 0 && <span className={`absolute ${isOpen ? "right-3" : "top-2 right-2"} bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>{badge}</span>}
      {!isOpen && <div className="absolute left-14 bg-emerald-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">{label}</div>}
    </Link>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorStyles: any = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", rose: "bg-rose-50 text-rose-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.emerald}`}><Icon size={24} /></div>
      </div>
    </div>
  );
}