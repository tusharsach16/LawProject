import React from 'react';
import { Scale, Sparkles, Shield, Building, Users as UsersIcon } from 'lucide-react';

interface WelcomeScreenProps {
  onQuickAction: (action: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction }) => {
  const quickActions = [
    { icon: Shield, title: "Contract Review", description: "Get help reviewing contracts and legal documents", action: "I need help reviewing a contract..." },
    { icon: Scale, title: "Know Your Rights", description: "Learn about your legal rights and obligations", action: "What are my basic legal rights as a consumer?" },
    { icon: Building, title: "Business Legal Help", description: "Guidance on business formation and compliance", action: "I'm starting a business, what are the legal steps?" },
    { icon: UsersIcon, title: "Family Law", description: "Assistance with family law matters", action: "What is the procedure for divorce in India?" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-30 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-2xl">
          <Scale size={64} className="text-white"/>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
        LegalAssist AI
        <Sparkles className="h-8 w-8 text-amber-500" />
      </h1>
      <p className="text-lg text-slate-600 mb-12 max-w-2xl">
        Your intelligent legal companion for information on Indian Law. Ask me anything!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div 
              key={index} 
              onClick={() => onQuickAction(action.action)} 
              className="p-6 bg-white border-2 border-slate-200 rounded-2xl cursor-pointer hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 text-left group"
              style={{
                animation: `slideInQuick 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;