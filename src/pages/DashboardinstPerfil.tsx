import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  Hash, 
  MapPin, 
  Save, 
  ArrowLeft, 
  LayoutDashboard, 
  MessageSquare, 
  Users,
  Clock,
  Recycle, 
  ShoppingCart, 
  DollarSign, 
  LogOut, 
  Menu, 
  FileText, 
  CheckCircle2 
} from "lucide-react";

import Input from "../components/Input";
import Button from "../components/button";
import supabase from "../services/supabase";
import { Link } from "react-router-dom"; 

export default function DashboardUsuario() {
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [filteredInstituicoes, setFilteredInstituicoes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Usuário");
  
  // Estado do Modal e Toast
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const userCpf = localStorage.getItem("usuario_cpf") || "mock_cpf";

  const categorias = ["Todos", "Plástico", "Papel", "Metal", "Vidro", "Eletrônicos"];

  useEffect(() => {
    loadUser();
    loadInstituicoes();
  }, []);

  // Filtragem local (Busca + Categoria)
  useEffect(() => {
    let result = instituicoes;

    // Filtro por texto
    if (busca) {
      const term = busca.toLowerCase();
      result = result.filter((i: any) => 
         i.nome_ins.toLowerCase().includes(term) || 
         i.cidade_ins.toLowerCase().includes(term)
      );
    }

    // Filtro por categoria
    if (categoria !== "Todos") {
      result = result.filter((i: any) => 
        i.materiais && i.materiais.includes(categoria)
      );
    }

    setFilteredInstituicoes(result);
  }, [busca, categoria, instituicoes]);

  // Função auxiliar para mostrar Toast
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  async function loadUser() {
    if (!userCpf || userCpf === "mock_cpf") {
        setUserName("Visitante"); 
        if (userCpf === "mock_cpf") setUserName("Carlos Eduardo");
        return;
    }
    const { data, error } = await supabase
      .from("usuario")
      .select("nome_usu")
      .eq("cpf_usu", userCpf)
      .maybeSingle();

    if (!error && data) setUserName(data.nome_usu);
  }

  async function loadInstituicoes() {
    setLoading(true);
    // Carrega tudo e filtra no front para performance em listas pequenas/médias
    await supabase.from("instituicao")
      .select("*")
      .ilike("cidade_ins", `%%`) 
      .then(({ data }: any) => {
        setInstituicoes(data || []);
        setFilteredInstituicoes(data || []); // Inicializa filtrado
        setLoading(false);
      });
  }

  function abrirModal(inst: any) {
    setSelectedInst(inst);
    setModalOpen(true);
    setMensagem("");
  }

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim()) return;
    setEnviando(true);

    const { error } = await supabase.from("mensagem").insert({
      descricao_men: mensagem,
      assunto_men: "Contato via App",
      cnpj: selectedInst.cnpj,
      cpf_usu: userCpf,
      turno_men: "Integral",
      emissao_men: new Date()
    }).then((res: any) => res);

    setEnviando(false);

    if (error) {
      showToast('error', "Erro ao enviar mensagem.");
    } else {
      showToast('success', "Mensagem enviada com sucesso!");
      setModalOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 relative overflow-x-hidden">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-2.5">
           <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-emerald-200 shadow-lg transform rotate-3">
              <Recycle size={20} strokeWidth={2.5} />
           </div>
           <div>
             <h1 className="text-lg font-bold leading-none text-slate-800">Ciclo Verde</h1>
             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Doador</p>
           </div>
        </div>
        
        <Link to="/perfil-usuario" className="w-10 h-10 bg-slate-100 hover:bg-emerald-50 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors border border-slate-200">
           <User size={20} />
        </Link>
      </header>

      <div className="px-6 pt-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Olá, <span className="text-emerald-600">{userName.split(' ')[0]}.</span>
          </h1>
          <p className="text-sm text-slate-500">O que você vai reciclar hoje?</p>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="relative mb-6 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nome da cooperativa ou cidade..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

        {/* FILTROS (Categorias) */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`
                whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
                ${categoria === cat 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LISTA DE INSTITUIÇÕES (GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100" />)
          ) : filteredInstituicoes.length === 0 ? (
             <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Filter size={32} className="text-slate-300" />
               </div>
               <p className="text-slate-500 font-medium">Nenhuma instituição encontrada.</p>
               <p className="text-xs text-slate-400 mt-1">Tente mudar os filtros ou a busca.</p>
             </div>
          ) : (
            filteredInstituicoes.map((inst) => (
              <div key={inst.cnpj} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
                
                {/* Efeito de fundo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{inst.nome_ins}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
                        <Clock size={10} /> {inst.horario || "08:00 - 18:00"}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-emerald-500">
                      <Recycle size={16} />
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-6 space-y-2">
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                      <span className="line-clamp-2">{inst.endereco_ins}, {inst.cidade_ins} - {inst.uf_ins}</span>
                    </p>
                  </div>

                  {/* Materiais (Tags Limitas) */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {inst.materiais?.split(',').slice(0, 3).map((mat: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-100">
                        {mat.trim()}
                      </span>
                    ))}
                    {inst.materiais?.split(',').length > 3 && (
                      <span className="px-2 py-1 rounded bg-slate-50 text-slate-400 text-[10px] font-medium border border-slate-100">
                        +{inst.materiais.split(',').length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 mt-auto">
                  <button 
                    onClick={() => abrirModal(inst)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-emerald-200/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare size={16} /> Entrar em Contato
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==================================================================
          MODAL DE CONTATO (Clean & Modern)
      ================================================================== */}
      {modalOpen && selectedInst && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2rem] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
               <div>
                 <h2 className="text-lg font-bold text-slate-800 line-clamp-1">{selectedInst.nome_ins}</h2>
                 <p className="text-xs text-slate-500 flex items-center gap-1">
                   <MapPin size={10} /> {selectedInst.cidade_ins}
                 </p>
               </div>
               <button 
                 onClick={() => setModalOpen(false)}
                 className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
               >
                 <X size={16} />
               </button>
            </div>

            {/* Conteúdo Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
               
               {/* Cards de Info */}
               <div className="grid grid-cols-2 gap-3 mb-6">
                  <a href={`tel:${selectedInst.telefone_ins}`} className="bg-emerald-50/50 hover:bg-emerald-50 p-3 rounded-2xl border border-emerald-100 transition-colors group">
                     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-500 mb-2 shadow-sm group-hover:scale-110 transition-transform"><Phone size={16}/></div>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Telefone</p>
                     <p className="text-xs font-semibold text-slate-700 truncate">{selectedInst.telefone_ins}</p>
                  </a>
                  <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-sm"><Mail size={16}/></div>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email</p>
                     <p className="text-xs font-semibold text-slate-700 truncate">{selectedInst.email_ins}</p>
                  </div>
               </div>

               <div className="mb-4">
                 <label className="text-sm font-bold text-slate-800 mb-1 block">Mensagem</label>
                 <p className="text-xs text-slate-500 mb-3">Combine a entrega ou tire dúvidas.</p>
                 
                 <form onSubmit={enviarMensagem}>
                   <div className="relative">
                     <textarea
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none min-h-[140px] transition-all"
                       placeholder="Olá, gostaria de saber se vocês coletam..."
                       value={mensagem}
                       onChange={(e) => setMensagem(e.target.value)}
                       required
                     ></textarea>
                     <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">
                        {mensagem.length} chars
                     </div>
                   </div>
                   
                   <button 
                     type="submit"
                     disabled={enviando}
                     className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                   >
                     {enviando ? (
                       <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Enviando...</span>
                     ) : (
                       <><Send size={18} /> Enviar Mensagem</>
                     )}
                   </button>
                 </form>
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}