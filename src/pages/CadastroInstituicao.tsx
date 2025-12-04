  import { useState } from "react";
  import { Building2, Lock, MapPin, User, Phone, Mail, Hash, CheckCircle2, Search, ArrowLeft, FileText } from "lucide-react";

  // import Input from "../components/Input";
  import Button from "../components/button";
  import supabase from "../services/supabase";




  const Input = ({ label, name, type = "text", required, maxLength, value, onChange, onBlur, placeholder, icon: Icon }: any) => {
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
            onBlur={onBlur}
            className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl 
            focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white
            block p-3 ${Icon ? 'pl-11' : ''} transition-all duration-300 outline-none font-medium placeholder:text-gray-300`}
            placeholder={placeholder || `Digite ${label.toLowerCase()}...`}
          />
        </div>
      </div>
    );
  };



  export default function CadastroInstituicao() {
  const [form, setForm] = useState({
    cnpj: "",
    nome_ins: "",
    razao_soc: "",
    email_ins: "",
    telefone_ins: "",
    cep_ins: "",
    endereco_ins: "",
    cidade_ins: "",
    uf_ins: "",
    numero_ins: "",
    senha_ins: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function buscarCEP(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, '');

    if (cep.length === 8) {
      try {
        document.body.style.cursor = 'wait';
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            endereco_ins: data.logradouro,
            cidade_ins: data.localidade,
            uf_ins: data.uf
          }));
        } else {
          alert("CEP não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        document.body.style.cursor = 'default';
      }
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { data: hash, error: hashError } = await supabase.rpc("hash_password", {
        password: form.senha_ins,
      });

      if (hashError) throw new Error("Erro ao gerar hash: " + hashError.message);

      const { error } = await supabase.from("instituicao").insert({
        cnpj: form.cnpj,
        nome_ins: form.nome_ins,
        razao_soc: form.razao_soc,
        email_ins: form.email_ins,
        telefone_ins: form.telefone_ins,
        endereco_ins: form.endereco_ins,
        cidade_ins: form.cidade_ins,
        uf_ins: form.uf_ins,
        numero_ins: form.numero_ins,
        senha_ins: hash,
      });

      if (error) throw new Error(error.message);

      setStatus("success");
      setForm({
        cnpj: "", nome_ins: "", razao_soc: "", email_ins: "", telefone_ins: "",
        cep_ins: "", endereco_ins: "", cidade_ins: "", uf_ins: "", numero_ins: "", senha_ins: ""
      });

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      alert("Erro: " + (err.message || "Falha desconhecida"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-green-50 p-4 sm:p-8 font-sans selection:bg-green-100 selection:text-green-700">
      
      {/* --- SELETOR / MENU DE ABAS --- */}
      <div className="w-full max-w-5xl bg-white p-2 rounded-2xl shadow-2xl shadow-emerald-100 border border-slate-100 flex justify-between sticky top-4 z-10 mb-8">
          
          {/* Link para Pessoa Física */}
          <a 
            href="/cadastro-usuario"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
          >
            <User size={18} /> Sou Pessoa Física
          </a>

          {/* Botão Ativo (Instituição) */}
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm bg-emerald-600 text-white shadow-md shadow-emerald-300 cursor-default"
          >
            <Building2 size={18} /> Sou Instituição
          </button>
      </div>
      {/* -------------------------------------- */}

      <form
        onSubmit={handleCadastro}
        className="relative bg-white shadow-xl rounded-3xl p-8 md:p-12 w-full max-w-5xl border border-white"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-t-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <div>
               <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Cadastro de Instituição</h2>
               <p className="text-gray-500 text-sm font-medium mt-1">Registre sua organização no sistema</p>
            </div>
          </div>
        </div>

        {status === 'success' && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <CheckCircle2 className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Instituição cadastrada com sucesso!</p>
              <p className="text-xs opacity-90 mt-1">Os dados foram salvos e o acesso já pode ser realizado.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* LADO ESQUERDO */}
          <div className="md:col-span-12 lg:col-span-6 space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-px bg-gray-200"></span>
                <span className="text-xs font-bold text-gray-400 uppercase">Dados Empresariais</span>
                <span className="flex-1 h-px bg-gray-200"></span>
             </div>

             <div className="grid grid-cols-1 gap-5">
                <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} maxLength={18} required icon={Hash} placeholder="00.000.000/0000-00" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div className="sm:col-span-2">
                      <Input label="Razão Social" name="razao_soc" value={form.razao_soc} onChange={handleChange} required icon={FileText} />
                   </div>
                   <div className="sm:col-span-2">
                      <Input label="Nome Fantasia" name="nome_ins" value={form.nome_ins} onChange={handleChange} required icon={Building2} />
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <Input label="Email Corporativo" name="email_ins" type="email" value={form.email_ins} onChange={handleChange} required icon={Mail} />
                   <Input label="Telefone" name="telefone_ins" value={form.telefone_ins} onChange={handleChange} maxLength={15} icon={Phone} />
                </div>
             </div>
          </div>

          {/* LADO DIREITO */}
          <div className="md:col-span-12 lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Localização & Acesso</span>
                <span className="flex-1 h-px bg-gray-200"></span>
             </div>

            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <Input label="CEP" name="cep_ins" maxLength={9} icon={Search} value={form.cep_ins} onChange={handleChange} onBlur={buscarCEP} placeholder="00000-000" />
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input label="Endereço" name="endereco_ins" value={form.endereco_ins} onChange={handleChange} icon={MapPin} />
                  </div>
                  <Input label="Nº" name="numero_ins" value={form.numero_ins} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input label="Cidade" name="cidade_ins" value={form.cidade_ins} onChange={handleChange} />
                  </div>
                  <Input label="UF" name="uf_ins" maxLength={2} value={form.uf_ins} onChange={handleChange} />
                </div>
              </div>
              
              <div className="pt-2">
                <Input label="Senha de Acesso" name="senha_ins" type="password" value={form.senha_ins} onChange={handleChange} required icon={Lock} placeholder="Defina uma senha segura" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-gray-100">
           <div className="flex flex-col gap-2 text-center md:text-left">
              <a href="/login-instituicao" className="inline-flex items-center justify-center md:justify-start gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group">
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Voltar para Login
              </a>
              <p className="text-xs text-gray-400">Seus dados estão protegidos conforme a LGPD.</p>
           </div>

           <div className="w-full md:w-auto md:min-w-[240px]">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : "Cadastrar Instituição"}
              </Button>
           </div>
        </div>
      </form>
    </div>
  );
}