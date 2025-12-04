interface HeaderProps {
  username: string;
}

export default function Header({ username }: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full">
      <h1 className="text-3xl font-semibold text-green-900">Visão Geral</h1>

      <div className="flex items-center gap-3 bg-white border shadow-sm px-4 py-2 rounded-lg">
        <span>{username}</span>
        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
      </div>
    </header>
  );
}
