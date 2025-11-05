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
  const statsRef = useRef(null);

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
        snap: { val: 1 },
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          once: true,
        },
        onUpdate: () => {
          element.textContent = obj.val.toString();
        },
      });
    });
  });

  return (
    <section className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20 px-4 relative overflow-hidden' ref={statsRef}>
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
              <div key={index} className='group cursor-pointer'>
                <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 hover:bg-white/20'>
                  <div className='flex items-center justify-center text-4xl md:text-5xl font-bold text-white mb-3'>
                    <span className="stat-number" data-count={stat.number}>0</span>
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-slate-300 font-medium">{stat.label}</div>
                  <Zap className="h-6 w-6 text-amber-400/60 mx-auto mt-3 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Stats;
