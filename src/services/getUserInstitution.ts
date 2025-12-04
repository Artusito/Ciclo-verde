import supabase from "../services/supabase";

export async function getUserInstitution() {
  // 1. Recupera e-mail salvo no login
  const email = localStorage.getItem("instituicao_cnpj");

  if (!email) {
    console.log("Nenhum e-mail encontrado no localStorage.");
    return null;
  }

  // 2. Busca a instituição correspondente
  const { data, error } = await supabase
    .from("instituicao")
    .select("*")
    .eq("email_inst", email)
    .single();

  if (error) {
    console.log("Erro ao buscar instituição:", error);
    return null;
  }

  return data; // retorna a instituição completa
}
