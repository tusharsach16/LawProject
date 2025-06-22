import { BsPeople } from "react-icons/bs"
const info = [
  {
    title: "Professional Lawyers",
    desc: "Get expert consultation from verified lawyers",
    desc1: "Find Lawyers"
  },
  {
    title: "Law Students",
    desc: "Connect with law students for guidance and support",
    desc1: "Browse Students"
  },
]

const ConnectLawyers = () => {
  return (
    <div className="bg-white p-6 rounded border shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <BsPeople className="h-6 w-6 text-black"/>
        <h2 className="font-bold text-2xl">Connect with Legal Experts</h2>
      </div>
      <p>Get professional advice from lawyers and law students</p>

      <div className="p-4 grid md:grid-cols-2 gap-4">
        {info.map((index, i) => (
          <div key={i} className="bg-blue-50 p-4 border-s-gray-400 rounded shadow-sm hover:shadow-md flex flex-col">
            <h2 className="font-bold text-2xl mb-2">{index.title}</h2>
            <p className="text-sm text-gray-500">{index.desc}</p>
            <button className="bg-gray-900 text-white px-3 py-2 rounded cursor-pointer border">{index.desc1}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectLawyers