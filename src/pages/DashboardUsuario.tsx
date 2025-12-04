import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../services/supabase";

import { 
  User, 
  MapPin, 
  MessageSquare, 
  X, 
  Send,
  LogOut,
  Recycle 
} from "lucide-react";

export default function DashboardUsuario() {
    const [instituicoes, setInstituicoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Usuário");

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInst, setSelectedInst] = useState<any>(null);
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    // CPF salvo no login (usando mock_cpf para o preview funcionar)
    const userCpf = localStorage.getItem("usuario_cpf") || "mock_12345";

    useEffect(() => {
      loadUser();
      loadInstituicoes();
    }, []);

    // -------------------------------------------------------------
    // 1. Carregar nome do usuário
    // -------------------------------------------------------------
    async function loadUser() {
      if (!userCpf || userCpf === "mock_12345") {
        setUserName("Visitante");
        return;
      }

      const { data, error } = await supabase
        .from("usuario")
        .select("nome_usu")
        .eq("cpf_usu", userCpf)
        .maybeSingle();

      if (!error && data) {
        setUserName(data.nome_usu);
      }
    }

    // -------------------------------------------------------------
    // 2. Carregar Instituições (sem busca)
    // -------------------------------------------------------------
    async function loadInstituicoes() {
      setLoading(true);

      const { data } = await supabase
        .from("instituicao")
        .select("*");

      setInstituicoes(data || []);
      setLoading(false);
    }

    function abrirModal(inst: any) {
      setSelectedInst(inst);
      setMensagem("");
      setModalOpen(true);
    }

    // -------------------------------------------------------------
    // 3. Enviar Mensagem
    // -------------------------------------------------------------
    async function enviarMensagem(e: React.FormEvent) {
      e.preventDefault();
      if (!mensagem.trim()) return;

      if (!userCpf || userCpf === "mock_12345") {
        alert("Você precisa estar logado para enviar mensagens.");
        return;
      }

      setEnviando(true);

      const { error } = await supabase
        .from("mensagem")
        .insert({
          descricao_men: mensagem,
          assunto_men: "Contato via Aplicativo",
          cpf_usu: userCpf,
          cnpj: selectedInst.cnpj,
          turno_men: "Integral" 
        });

      setEnviando(false);

      if (error) {
        alert("Erro ao enviar: " + error.message);
        return;
      }

      alert("Mensagem enviada com sucesso!");
      setModalOpen(false);
    }

    // -------------------------------------------------------------
    // 4. LOGOUT
    // -------------------------------------------------------------
    async function handleLogout() {
      if (window.confirm("Deseja realmente sair da sua conta?")) {
        await supabase.auth.signOut();
        
        localStorage.removeItem("usuario_cpf");
        window.location.href = "/login-usuario"; 
      }
    }

    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">

        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-emerald-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400">
              <Recycle size={20} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Ciclo Verde</h1>
              <p className="text-xs text-emerald-300">Área do Doador</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
              {/* Botão de Logout */}
              <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-emerald-300 hover:bg-emerald-700 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                  <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
              </button>

              {/* Ícone do Perfil */}
              <Link 
                to="/perfil-usuario"
                className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition border border-emerald-700"
              >
                <User size={20} />
              </Link>
          </div>
        </header>

        {/* Saudação e Busca */}
        <div className="px-6 pt-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">
            Olá, <span className="text-emerald-600">{userName.split(' ')[0]}</span>.
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Escolha uma cooperativa e faça sua parte 🌱
          </p>
          
        

          {/* LISTA */}
          <div className="space-y-4">
            
            {loading ? (
              [1,2,3].map(i => 
                <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border shadow-sm" />
              )
            ) : instituicoes.length === 0 ? (
              <p className="text-center py-12 text-slate-400">Nenhuma instituição encontrada.</p>
            ) : (
              instituicoes.map(inst => (
                <div 
                  key={inst.cnpj} 
                  className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  <h2 className="font-bold text-lg mb-1">{inst.nome_ins}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600"/> {inst.endereco_ins}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{inst.cidade_ins} - {inst.uf_ins}</p>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => abrirModal(inst)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl flex items-center gap-2"
                    >
                      <MessageSquare size={16}/> Contato
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* ------------------ MODAL ------------------ */}
        {modalOpen && selectedInst && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-end sm:items-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">

              {/* HEADER */}
              <div className="bg-emerald-900 text-white p-6 relative">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X size={20}/>
                </button>
                <h1 className="text-xl font-bold">{selectedInst.nome_ins}</h1>
              </div>

              {/* CONTEÚDO */}
              <div className="p-6">
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border">
                    <p className="text-xs text-slate-500">Telefone</p>
                    <p className="font-semibold">{selectedInst.telefone_ins}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-semibold">{selectedInst.email_ins}</p>
                  </div>
                </div>

                <form onSubmit={enviarMensagem}>
                  <textarea
                    className="w-full bg-slate-50 border p-4 rounded-xl mb-4 min-h-[120px]"
                    placeholder="Escreva sua mensagem..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  ></textarea>

                  <button 
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    {enviando ? "Enviando..." : <><Send size={18}/> Enviar</>}
                  </button>
                </form>

              </div>

            </div>
          </div>
        )}

      </div>
    );
  }