
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
        

// import { createClient } from "@supabase/supabase-js";

// // 1. Carrega a URL do projeto Supabase das variáveis de ambiente (.env)
// // O "import.meta.env" é específico para projetos criados com Vite.
// // O "!" no final diz ao TypeScript que temos certeza que essa variável existe.
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;

// // 2. Carrega a chave pública (ANON KEY)
// // IMPORTANTE: Esta chave é segura para usar no navegador, desde que você
// // tenha configurado as políticas de segurança (RLS) no banco de dados.
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// // 3. Inicializa o cliente do Supabase
// // "export" permite usar essa conexão em qualquer lugar da sua aplicação.
// export const supabase = createClient(supabaseUrl, supabaseKey);