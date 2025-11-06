import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const TextHeader = () => {
    const navigate = useNavigate();
    return (
        <div className='flex flex-col justify-center text-center'>
            <h1 className="hero-title text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
                Your Legal Guidance
                <span className="block bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    Made Simple
                </span>
            </h1>

            <p className="hero-subtitle text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Get expert legal advice in any Indian language. Connect with lawyers, understand IPC sections, and
              participate in mock trials - all in one platform.
            </p>

            <div className='hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center'>
                <button onClick={() => navigate('/signin')} className='bg-slate-900 hover:bg-slate-800 text-white px-10 py-3 text-lg shadow-xl group font-bold hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300'>
                    <span className='flex items-center'>
                        Submit Your Case
                        <ArrowRight className='mt-0.5 ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform'/>
                    </span>
                </button>
            </div>
        </div>
    )
}

export default TextHeader