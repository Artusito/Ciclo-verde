import { BrowserRouter, Routes, Route } from "react-router-dom";

import CadastroUsuario from "../pages/CadastroUsuario";
import LoginUsuario from "../pages/LoginUsuario";
import CadastroInstituicao from "../pages/CadastroInstituicao"; 
import LoginInstituicao from "../pages/LoginInstituicao";
import Dashboardinstituicao from "../pages/DashboardInstituicao";
import Mensagensrec from "../pages/MensagensRecebidas";
import Instituicao from "../pages/DashboardinstPerfil"
import DashboardInstFuncionarios from "../pages/funcionarios";
import DashboardInstCatadores from "../pages/catadores"
import DashboardInstcompras from "../pages/Compras"
import DashboardInstCustos from "../pages/custos"
import DashboardUsuario from "../pages/DashboardUsuario";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CadastroUsuario />} />

        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/login-usuario" element={<LoginUsuario />} />
        <Route path="/cadastro-instituicao" element={<CadastroInstituicao />} />
         <Route path="/login-instituicao" element={<LoginInstituicao />} />
        <Route path="/dashboard-instituicao" element={<Dashboardinstituicao />} /> 
        <Route path="/dashboard-instituicao/mensagens-recebidas" element={<Mensagensrec />} /> 
        <Route path="/dashboardinst-Instituicao" element={<Instituicao />} />
        <Route path="/dashboard-instituicao/funcionarios" element={<DashboardInstFuncionarios />} />
        <Route path="/dashboard-instituicao/Catadores" element={<DashboardInstCatadores />} />
        <Route path="/dashboard-instituicao/Compras" element={<DashboardInstcompras />} />
        <Route path="/dashboard-instituicao/Custos" element={<DashboardInstCustos />} />
        <Route path="/dashboard-usuario" element={<DashboardUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}
