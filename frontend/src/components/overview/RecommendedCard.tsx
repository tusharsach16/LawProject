interface RecommendedCardProps {
    title: string;
    desc: string;
  }
  
  export default function RecommendedCard({ title, desc }: RecommendedCardProps) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-4 hover:shadow-md transition">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    );
  }
  