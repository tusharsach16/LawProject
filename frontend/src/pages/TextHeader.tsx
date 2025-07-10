import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from "@gsap/react";




const TextHeader = () => {

    return (
        <div className='flex  flex-col justify-center text-center'>
            <h1 className="hero-title text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Your Legal Guidance
                <span className="block bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
                    Made Simple
                </span>
            </h1>

            <p className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Get expert legal advice in any Indian language. Connect with lawyers, understand IPC sections, and
              participate in mock trials - all in one platform.
            </p>

            <div className='hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center'>
                <button className='bg-gray-900 hover:bg-gray-800 text-white px-10 py-2 text-lg shadow-xl group font-bold hover:shadow-2xl hover:scale-105 rounded-xl'>
                    <span className='flex items-center '>
                        Submit Your Case
                        <ArrowRight className='mt-0.5 ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform'/>
                    </span>
                </button>

                
                <button className='border-2 text-lg rounded-xl px-10 py-2   border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-transparent'>
                    Browse Legal Info
                </button>
            </div>
        </div>
    )
}

export default TextHeader