import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  as?: "input" | "select";
  children?: React.ReactNode;
}

export default function Input({ label, as = "input", children, ...props }: InputProps) {
  const Component = as;

  return (
    <div className="mb-5 relative">
      <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-medium text-green-700">
        {label}
      </label>

      <Component
        {...props}
        className="w-full border border-gray-400 rounded-lg p-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600 transition"
      >
        {children}
      </Component>
    </div>
  );
}
