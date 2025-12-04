import { useState } from "react";
import { User, Lock, Building2,  Calendar, MapPin, Phone, Mail, Hash, CheckCircle2, Search, ChevronDown, ArrowLeft } from "lucide-react";


import supabase from "../services/supabase";

const Button = ({ children, disabled, type = "button", className = "" }: any) => (
  <button
    type={type}
    disabled={disabled}
    className={`w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-xl shadow-lg shadow-green-200 
    transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
    flex items-center justify-center gap-2 text-sm uppercase tracking-wide ${className}`}
  >
    {children}
  </button>
);

const Input = ({ label, name, type = "text", required, maxLength, as, children, icon: Icon, value, onChange, onBlur, placeholder }: any) => {
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
        {as === "select" ? (
          <div className="relative">
            <select
              name={name}
              required={required}
              value={value}
              onChange={onChange}
              className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl 
              focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white
              block p-3 ${Icon ? 'pl-11' : ''} appearance-none transition-all duration-300 outline-none font-medium`}
            >
              {children}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            required={required}
            maxLength={maxLength}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl 
            focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white
            block p-3 ${Icon ? 'pl-11' : ''} transition-all duration-300 outline-none font-medium placeholder:text-gray-300`}
            placeholder={placeholder || `Digite ${label.toLowerCase()}...`}
          />
        )}
      </div>
    </div>
  );
};
// =================================================================================
// FIM DOS COMPONENTES INTERNOS
// =================================================================================


// ----------------------------------------------------------------------------------
// 🔵 NOVO FORMULÁRIO DE INSTITUIÇÃO (Versão simplificada para este arquivo)
// ----------------------------------------------------------------------------------

const UsuarioForm = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [cep, setCep] = useState("");
    const [endereco, setEndereco] = useState("");
    const [cidade, setCidade] = useState("");
    const [uf, setUf] = useState("");

    function validarCPF(cpf: string) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let add = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;
        return true;
    }

    async function buscarCEP(e: React.FocusEvent<HTMLInputElement>) {
        const valorCep = e.target.value.replace(/\D/g, '');
        if (valorCep.length === 8) {
          try {
            const response = await fetch(`https://viacep.com.br/ws/${valorCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
              setEndereco(data.logradouro);
              setCidade(data.localidade);
              setUf(data.uf);
            } else {
              alert("CEP não encontrado.");
            }
          } catch (error) {
            console.error("Erro ao buscar CEP:", error);
          }
        }
    }

    async function handleCadastro(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const form = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(form);

        if (!validarCPF(data.cpf_usu as string)) {
          alert("CPF Inválido! Por favor verifique os números.");
          setLoading(false);
          return;
        }

        try {
            const { data: hash, error: hashError } = await supabase.rpc("hash_password", { password: data.senha_usu, });
            if (hashError) throw new Error("Erro ao gerar hash: " + hashError.message);
            
            const insertData = { ...data, senha_usu: hash };
            const { error } = await supabase.from("usuario").insert(insertData);

            if (error) throw new Error("Erro no cadastro: " + error.message);

            setStatus("success");
            setCep(""); setEndereco(""); setCidade(""); setUf("");
            // @ts-ignore
            e.target.reset(); 
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            alert(err.message || "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <form
            onSubmit={handleCadastro}
            className="relative bg-white shadow-xl rounded-3xl p-8 md:p-12 w-full max-w-4xl border border-white mx-auto"
        >
            {/* Barra superior verde */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
                <div className="p-3.5 bg-green-50 rounded-2xl text-green-600 shadow-sm ring-1 ring-green-100">
                <User size={32} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Cadastro de Usuário</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Preencha seus dados para começar</p>
                </div>
            </div>
            </div>

            {status === 'success' && (
            <div className="mb-8 p-4 bg-green-100 border border-green-200 text-green-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <CheckCircle2 className="shrink-0 mt-0.5" />
                <div>
                <p className="font-bold text-sm">Cadastro realizado com sucesso!</p>
                <p className="text-xs opacity-90 mt-1">O usuário foi inserido no banco de dados.</p>
                </div>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-12 lg:col-span-7 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-px bg-gray-200"></span>
                    <span className="text-xs font-bold text-gray-400 uppercase">Dados Pessoais</span>
                    <span className="flex-1 h-px bg-gray-200"></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                    <Input label="Nome Completo" name="nome_usu" required icon={User} />
                    </div>
                    <Input label="CPF" name="cpf_usu" maxLength={11} required icon={Hash} placeholder="Apenas números" />
                    <Input label="Nascimento" type="date" name="dtnascimento_usu" required icon={Calendar} />
                    
                    <Input as="select" label="Gênero" name="genero" icon={User}>
                        <option>Masculino</option>
                        <option>Feminino</option>
                        <option>Outro</option>
                    </Input>
                    <Input label="Telefone" name="telefone_usu" maxLength={11} icon={Phone} />
                </div>
            </div>

            <div className="hidden lg:block lg:col-span-1 border-l border-gray-100 mx-auto h-full min-h-[200px]"></div>

            <div className="md:col-span-12 lg:col-span-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Localização & Login</span>
                    <span className="flex-1 h-px bg-gray-200"></span>
                </div>

                <div className="space-y-5">
                    <Input label="CEP" name="cep_usu" maxLength={8} icon={Search} value={cep} onChange={(e: any) => setCep(e.target.value)} onBlur={buscarCEP} placeholder="00000000" />

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <Input label="Rua/Av" name="endereco_usu" value={endereco} onChange={(e: any) => setEndereco(e.target.value)} />
                        </div>
                        <Input label="Nº" name="numero_usu" icon={Hash} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <Input label="Cidade" name="cidade_usu" icon={MapPin} value={cidade} onChange={(e: any) => setCidade(e.target.value)} />
                        </div>
                        <Input label="UF" name="uf_usu" maxLength={2} value={uf} onChange={(e: any) => setUf(e.target.value)} />
                    </div>

                    <Input label="Email" name="email_usu" type="email" required icon={Mail} />
                    <Input label="Senha" name="senha_usu" type="password" required icon={Lock} />
                </div>
            </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-2 text-center md:text-left">
                <a 
                    href="/login-usuario" 
                    className="inline-flex items-center justify-center md:justify-start gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors group"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
                    Voltar para Login
                </a>
                <p className="text-xs text-gray-400">
                    Ao cadastrar, você concorda com nossos <a href="#" className="text-green-600 hover:underline">Termos de Uso</a>.
                </p>
            </div>
            
            <div className="w-full md:w-auto md:min-w-[200px]">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                    </>
                    ) : (
                    "Cadastrar"
                    )}
                </Button>
            </div>
            </div>
        </form>
    );
};


// ----------------------------------------------------------------------------------
// 🔴 NOVO COMPONENTE PRINCIPAL COM O SWITCH (EXPORTADO)
// ----------------------------------------------------------------------------------

export default function InitialCadastroPage() {
  const [activeForm, setActiveForm] = useState<'user' | 'institution'>('user');

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-green-50 p-4 sm:p-8 font-sans selection:bg-green-100 selection:text-green-700">
        
        {/* Seletor/Switch Visual */}
        <div className="w-full max-w-4xl bg-white p-2 rounded-2xl shadow-2xl shadow-emerald-100 border border-slate-100 flex justify-between sticky top-4 z-10 mb-8">
            <a // Transforma em link
            href="/cadastro-usuario" 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${
                activeForm === 'user'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            >
            <User size={18} /> Sou Pessoa Física
            </a>
            <a // Transforma em link
            href="/cadastro-instituicao" 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${
                activeForm === 'institution'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            >
            <Building2 size={18} /> Sou Instituição
            </a>
        </div>

        {/* Renderização Condicional do Formulário */}
        <div className="w-full max-w-4xl">
            {activeForm === 'user' 
            ? <UsuarioForm /> 
            : <InstituicaoForm />}
        </div>
        
        {/* Rodapé Adicional (Link para Login) */}
        <p className="mt-6 text-sm text-slate-500">
            Já tem conta? <a href="/login-usuario" className="text-emerald-600 font-semibold hover:underline">Faça login.</a>
        </p>
    </div>
  );
};