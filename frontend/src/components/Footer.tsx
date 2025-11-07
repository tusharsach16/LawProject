import { Scale } from 'lucide-react'
import { Link } from 'react-router-dom';

const sections = [
  {
    title: "Services",
    items: ["Legal Consultation", "IPC Guidance", "Mock Trials", "Case Studies"],
  },
  {
    title: "Support",
    items: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
  },
  {
    title: "Languages",
    items: ["Hindi", "English", "Tamil", "Bengali"],
  },
];

const Footer = () => {
  return (
    <footer className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 relative overflow-hidden border-t-2 border-amber-500/20'>
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)",
          }}
        />
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='group'>
            <div className='flex items-center space-x-3 mb-6'>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-2 rounded-xl shadow-lg border border-slate-700">
                <Scale className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-amber-400">Nyay Setu</span>
            </div>
            <p className="text-slate-400 leading-relaxed">Making legal guidance accessible to everyone in India</p>
          </div>

          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-lg mb-6 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link 
                      to='/' 
                      className='text-slate-400 hover:text-amber-400 transition-colors duration-300 hover:translate-x-1 inline-block'
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700/50 mt-12 pt-8 text-center">
          <p className="text-slate-400">&copy; 2024 Nyay Setu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;