import { ArrowRight } from 'lucide-react'
const GetHelp = () => {
  return (
    <section className='py-20 px-4'>
      <div className='container mx-auto px-4 text-center'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-8'>Ready to Get Legal Help?</h2>
          <p className='md:text-2xl text-xl text-gray-600 mb-12 leading-relaxed'>Join thousands of users who have found legal solutions through our platform</p>
        </div>

        <div className='relative inline-block'>
          <button className='bg-gray-900 rounded-xl hover:bg-gray-800 text-white px-13 py-2 text-xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 group cursor-pointer'>
            <span className='relative z-10 flex items-center'>
              Get Started Today
              <ArrowRight className='mt-0.5 group-hover:translate-x-2 transition-transform'/>
              
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-500 rounded-xl" />

          </button>
          <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-gray-400 rounded-full animate-bounce opacity-60" />
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gray-400 rounded-full animate-pulse opacity-60" />
        </div>

      </div>
    </section>
  )
}

export default GetHelp