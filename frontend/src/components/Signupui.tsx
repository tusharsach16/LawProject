import { useEffect, useState } from "react";
import { Scale, BookOpen, Users, Award, Shield, Gavel } from "lucide-react";

const stats = [
  { number: "10000", label: "Cases Resolved", suffix: "+" },
  { number: "500", label: "Legal Experts", suffix: "+" },
  { number: "15", label: "Indian Languages", suffix: "+" },
];

const features = [
  { icon: Users, label: "Expert Lawyers", color: "text-blue-400" },
  { icon: BookOpen, label: "Legal Resources", color: "text-emerald-400" },
  { icon: Award, label: "Mock Trials", color: "text-amber-400" },
  { icon: Shield, label: "Secure Platform", color: "text-purple-400" }
];

const Signupui = () => {
  const [counters, setCounters] = useState<Record<number, number>>({
  0: 0,
  1: 0,
  2: 0,
});

  useEffect(() => {
    // Animate statistics counters
    stats.forEach((stat, index) => {
      const target = parseInt(stat.number);
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounters(prev => ({ ...prev, [index]: target }));
          clearInterval(timer);
        } else {
          setCounters(prev => ({ ...prev, [index]: Math.floor(current) }));
        }
      }, duration / steps);
    });
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center items-center p-8 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-amber-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main icon with glow effect */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border-2 border-amber-500/30 shadow-2xl hover:scale-105 transition-transform duration-300">
              <Scale className="h-20 w-20 text-amber-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:transform hover:scale-105 group cursor-pointer"
                style={{ 
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-slate-900/50 rounded-lg group-hover:bg-slate-900 transition-colors">
                    <Icon className={`h-8 w-8 ${feature.color}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-slate-200 font-medium text-sm">{feature.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Title section */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
            <Gavel className="h-6 w-6 text-amber-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
          </div>
          <h2 className="font-bold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 animate-gradient">
            Law Connect
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
            Your trusted platform for legal guidance, connecting with expert lawyers, 
            and participating in mock trials across India
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer group"
              style={{ 
                animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-amber-600">
                  {counters[index]?.toLocaleString()}{stat.suffix}a
                </div>
                <div className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Signupui;