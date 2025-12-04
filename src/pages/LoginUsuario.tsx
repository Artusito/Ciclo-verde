import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { User, Lock, LogIn, ArrowRight } from "lucide-react";
import Button from "../components/Button";
import supabase from "../services/supabase";

const Input = ({ label, name, type = "text", required, maxLength, value, onChange, placeholder, icon: Icon }: any) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors duration-300">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          type={type}
          name={name}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl 
          focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white
          block p-3 ${Icon ? 'pl-11' : ''} transition-all duration-300 outline-none font-medium placeholder:text-gray-300`}
          placeholder={placeholder || `Digite ${label.toLowerCase()}...`}
        />
      </div>
    </div>
  );
};

export default function LoginUsuario() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar hash da senha do usuário pelo CPF
      // Adicionei email_usu no select para salvar no localStorage corretamente
      const { data: rows, error: fetchError } = await supabase
        .from("usuario")
        .select("senha_usu, cpf_usu, nome_usu, email_usu") 
        .eq("cpf_usu", cpf)
        .limit(1)
        .single();

      if (fetchError) {
        alert("Erro ao buscar usuário: " + fetchError.message);
        setLoading(false);
        return;
      }

      if (!rows) {
        alert("Usuário não encontrado.");
        setLoading(false);
        return;
      }

      const hash = rows.senha_usu;

      // Comparar senha via RPC
      const { data: cmp, error: cmpError } = await supabase.rpc("compare_password", {
        hashed: hash,
        plain: senha,
      });

      if (cmpError) {
        alert("Erro ao verificar senha: " + cmpError.message);
        setLoading(false);
        return;
      }

      const match = Array.isArray(cmp) ? cmp[0] : cmp;
      const isMatch = match === true || (match && match.compare_password === true);

      if (!isMatch) {
        alert("Senha inválida.");
        setLoading(false);
        return;
      }

      // Login OK
      localStorage.setItem("usuario_cpf", cpf);
      localStorage.setItem("usuario_nome", rows.nome_usu || "");
      // Corrigido: 'data' não existia aqui, o correto é usar 'rows'
      if (rows.email_usu) {
        localStorage.setItem("emailUsuario", rows.email_usu.trim());
      }

      // Redireciona
      navigate("/dashboard-usuario");
      
    } catch (err: any) {
      console.error(err);
      alert("Erro inesperado: " + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-green-50 p-6 font-sans selection:bg-green-100 selection:text-green-700">
      <div className="w-full max-w-md">
        
        {/* Card de Login */}
        <form
          onSubmit={handleLogin}
          className="relative bg-white shadow-xl rounded-3xl p-8 md:p-10 w-full border border-white overflow-hidden"
        >
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-600" />

          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl text-green-600 mb-4 shadow-sm ring-1 ring-green-100">
              <LogIn size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Bem-vindo de volta!</h2>
            <p className="text-gray-500 text-sm mt-1">Insira suas credenciais para acessar sua conta.</p>
          </div>

          <div className="space-y-5">
            <Input 
              label="CPF" 
              name="cpf" 
              value={cpf} 
              onChange={(e: any) => setCpf(e.target.value)} 
              required 
              icon={User}
              placeholder="000.000.000-00"
              maxLength={11} // Limitando caracteres visualmente
            />
            
            <div className="space-y-1">
              <Input 
                label="Senha" 
                name="senha" 
                type="password" 
                value={senha} 
                onChange={(e: any) => setSenha(e.target.value)} 
                required 
                icon={Lock}
                placeholder="••••••••"
              />
              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                   <>
                   <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Verificando...
                 </>
                ) : (
                  <>
                    Entrar <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Rodapé fora do card */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Não tem uma conta ainda?{" "}
            <a 
              href="/cadastro-usuario" 
              className="font-bold text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-1 hover:underline"
            >
              Criar conta gratuita
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}