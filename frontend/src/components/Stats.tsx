import { Zap } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
const stats = [
    { number: "10000", label: "Cases Resolved", suffix: "+" },
    { number: "500", label: "Legal Experts", suffix: "+" },
    { number: "15", label: "Indian Languages", suffix: "+" },
    { number: "24", label: "Support Available", suffix: "/7" },
];

const Stats = () => {
  
  useGSAP(() => {
    const elements = document.querySelectorAll(".stat-number");

    elements.forEach((el) => {
      const element = el as HTMLElement;
      const finalValue = parseInt(element.dataset.count!);
      const obj = { val: 0 };

      gsap.to(obj, {
        val: finalValue,
        duration: 2,
        ease: "power2.out",
        snap: { val: 1 }, // ensures clean integer jumps
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          once: true, // optional: only runs once
        },
        onUpdate: () => {
          element.textContent = obj.val.toString();
        },
      });
    });
  });


  const statsRef = useRef(null);
  return (
    <section className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20 px-4 relative overflow-hiddenx' ref={statsRef}>
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
          {stats.map((stat, index) => {
            return (
              <div key={index} className= ' group cursor-pointer'>
                <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:bg-white/20'>
                  <div className='flex items-center justify-center text-4xl md:text-5xl font-bold text-white mb-3'>
                    <span className="stat-number" data-count={stat.number}>
                        0
                    </span>
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                  <Zap className="h-6 w-6 text-white/60 mx-auto mt-3 group-hover:text-white transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Stats