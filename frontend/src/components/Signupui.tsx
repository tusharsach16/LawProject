import { Scale, BookOpen, Users, Award, Shield } from "lucide-react"

const stats = [
    { number: "10K", label: "Cases Resolved", suffix: "+" },
    { number: "500", label: "Expert Lawyers", suffix: "+" },
    { number: "24", label: "Support Available", suffix: "/7" },
];
const Signupui = () => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center">
      <div className="bg-red-600 flex items-center flex-col p-8 rounded-2xl">
        <div className="text-white mb-6">
          <Scale className="h-24 w-24"/>
        </div>

        <div className="grid grid-cols-2 space-x-2 space-y-2">
          <div className="flex flex-col items-center">
            <div className="flex justify-center">
              <Users className="h-8 w-8 text-blue-300" />
            </div>
            <span>Expert Lawyers</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center">
              <BookOpen className="h-8 w-8 text-green-300" />
            </div>
            <span>Legal Resources</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center">
              <Award className="h-8 w-8 text-amber-400" />
            </div>
            <span>Mock Trails</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <span>Secure Platform</span>
          </div>

        </div>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="mt-8 font-bold text-5xl">Welcome to LegalGuide</h2>
        <p className="mt-4 text-xl text-center max-w-lg font-semibold">Your trusted platform for legal guidance, mock trials, and connecting with expert lawyers across India</p>

        <div className="grid grid-cols-3 mt-8 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="font-bold text-xl">
                <span className="">{stat.number}</span>
                <span>{stat.suffix}</span>
              </div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Signupui