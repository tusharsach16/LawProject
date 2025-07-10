import { Scale, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from "@gsap/react";



const LogoHeader = () => {
    useGSAP(() => {
      const icon = document.getElementById('scale-logo')
      gsap.fromTo(
        icon,
        { scale: 0, rotation: -360 },
        { scale: 1, rotation: 0, duration: 2, ease: "elastic.out(1, 0.3)" },
      )

      gsap.to(icon, {
        rotate: '+=360', // har cycle me 360 aur
        duration: 8,
        ease: "none",
        repeat: -1, // infinite,
        transformOrigin: "50% 50%"
      });

      gsap.to(icon, {
        y: -25,               // 10px upar
        duration: 2,        // speed of bob
        repeat: -1,           // infinite
        yoyo: true,           // upar‑niche
        ease: "power1.inOut", // smooth
      })
    }, []);
  return (
      <div  className='flex justify-center items-center pt-16 pb-5 px-4 z-10'>
        <div id='scale-logo' className='relative h-32 w-32 border-2xl bg-red-200 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-gray-700 shadow-2xl cursor-pointer'>
          <Scale className='h-16 w-16 rounded-full text-white'/>
          <Sparkles className='absolute top-2 right-2 text-white h-4 w-4 animate-pulse'/>
        </div>
      </div>
  )
}

export default LogoHeader