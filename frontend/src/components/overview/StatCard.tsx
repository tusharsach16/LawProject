import type { JSX } from "react";

interface StatCardProps {
    icon: JSX.Element;  
    title: string;
    value: string | number;
    color: string;
    index: number;
  }
  
  export default function StatCard({ title, value }: StatCardProps) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-4 text-center">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
    );
  }
  