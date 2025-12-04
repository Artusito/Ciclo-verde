import { NavLink } from "react-router-dom";
import { LogOut, Mail, Building2, Badge, ShoppingCart, Wallet, Users, LayoutDashboard } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col p-4 fixed h-full">
      <div className="flex items-center gap-3 pb-6 border-b border-green-700">
        <span className="text-3xl">♻️</span>
        <h2 className="font-bold text-xl">Ciclo Verde</h2>
      </div>

      <nav className="flex flex-col gap-2 mt-6">
        <NavLink to="/dashboard" className="nav-item">
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/mensagens" className="nav-item">
          <Mail size={18} /> Mensagens
        </NavLink>

        <NavLink to="/instituicoes" className="nav-item">
          <Building2 size={18} /> Instituições
        </NavLink>

        <NavLink to="/funcionarios" className="nav-item">
          <Badge size={18} /> Funcionários
        </NavLink>

        <NavLink to="/catadores" className="nav-item">
          <Users size={18} /> Catadores
        </NavLink>

        <NavLink to="/compras" className="nav-item">
          <ShoppingCart size={18} /> Compras
        </NavLink>

        <NavLink to="/custos" className="nav-item">
          <Wallet size={18} /> Custos
        </NavLink>
      </nav>

      <button className="mt-auto flex items-center gap-3 text-red-300 hover:text-red-400 transition">
        <LogOut size={18} /> Sair
      </button>
    </aside>
  );
}
