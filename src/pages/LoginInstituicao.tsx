import { useState } from "react";
import { Building2, Lock, LogIn, ArrowRight, Mail, KeyRound } from "lucide-react";
import Button from "../components/Button";
import supabase from "../services/supabase";

const Input = ({ label, name, type = "text", required, maxLength, value, onChange, onBlur, placeholder, icon: Icon }: any) => {
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
          onBlur={onBlur}
          className={`w-full bg-white border-2 border-slate-100 text-slate-800 text-sm rounded-xl 
          focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 
          block p-3.5 ${Icon ? 'pl-12' : 'pl-4'} transition-all duration-200 outline-none font-medium placeholder:text-slate-300 shadow-sm group-hover:border-slate-200`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};


export default function LoginInstituicao() {
  const [email_ins, setEmail] = useState("");
  const [senha_ins, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      // 1. Busca APENAS pelo email primeiro
      const { data, error } = await supabase
        .from("instituicao")
        .select("*")
        .eq("email_ins", email_ins)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setErro("Instituição não encontrada.");
        setLoading(false);
        return;
      }

      // 2. Compara a senha digitada com o hash do banco (RPC)
      // Isso mantém a compatibilidade com o cadastro que usa criptografia
      const { data: isValid, error: rpcError } = await supabase.rpc("compare_password", {
        hashed: data.senha_ins,
        plain: senha_ins,
      });

      // Se sua RPC retornar objeto, ajuste aqui (ex: isValid[0].match)
      // Considerando que retorna boolean direto ou erro se falhar
      if (rpcError || !isValid) {
        setErro("Senha incorreta.");
        setLoading(false);
        return;
      }

      // 🔥 SALVAR SESSION PADRÃO
      localStorage.setItem("instituicao_cnpj", data.cnpj);
      localStorage.setItem("instituicao_email", data.email_ins);
      localStorage.setItem("instituicao_nome", data.nome_ins);

      // Redirecionamento
      window.location.href = "/dashboard-instituicao";

    } catch (err: any) {
      console.error(err);
      setErro("Ocorreu um erro ao tentar entrar.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-green-50 p-6 font-sans selection:bg-emerald-100 selection:text-emerald-700">
      <div className="w-full max-w-md">
        
        {/* Card de Login */}
        <form
          onSubmit={handleLogin}
          className="relative bg-white shadow-2xl shadow-emerald-100 rounded-3xl p-8 md:p-10 w-full border border-white overflow-hidden"
        >
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-2xl text-emerald-600 mb-5 shadow-sm ring-1 ring-emerald-100 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Building2 size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Portal da Instituição</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Gerencie sua organização com segurança</p>
          </div>

          <div className="space-y-6">
            <Input 
              label="Email Corporativo" 
              name="email" 
              type="email"
              value={email_ins} 
              onChange={(e: any) => setEmail(e.target.value)} 
              required 
              icon={Mail}
              placeholder="exemplo@instituicao.com"
            />
            
            <div className="space-y-2">
              <Input 
                label="Senha" 
                name="senha" 
                type="password" 
                value={senha_ins} 
                onChange={(e: any) => setSenha(e.target.value)} 
                required 
                icon={Lock}
                placeholder="••••••••"
              />
              <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-slate-300 group-hover:border-emerald-500 transition-colors" />
                    <span className="text-xs font-medium text-slate-500 group-hover:text-slate-600">Lembrar-me</span>
                </label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {erro && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium text-center animate-pulse">
                {erro}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                   <>
                   <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Acessando...
                 </>
                ) : (
                  <>
                    Acessar Painel <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Rodapé fora do card */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500 font-medium">
            Sua instituição ainda não possui cadastro?
          </p>
          <a 
            href="/cadastro-instituicao" 
            className="inline-flex items-center justify-center px-6 py-2.5 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm"
          >
            Cadastrar Instituição
          </a>
        </div>
      </div>
    </div>
  );
}