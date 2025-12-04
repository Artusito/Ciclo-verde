import React from "react";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, ...props }: BtnProps) {
  return (
    <button
      {...props}
      className="w-full py-3 rounded-full bg-green-700 hover:bg-green-800 transition text-white font-semibold shadow-md"
    >
      {children}
    </button>
  );
}
