import {  Users, BookOpen, Gavel, ArrowRight, Shield, MessageCircle, Trophy  } from "lucide-react"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: MessageCircle,
    title: "Submit Legal Queries",
    description: "Post your legal problems in any Indian language via text or voice input",
  },
  {
    icon: BookOpen,
    title: "IPC Guidance",
    description: "Get detailed guidance on relevant Indian Penal Code sections",
  },
  {
    icon: Users,
    title: "Connect with Experts",
    description: "Connect with qualified law students and practicing lawyers",
  },
  {
    icon: Gavel,
    title: "Mock Trials",
    description: "Participate in interactive mock trials to understand legal procedures",
  },
  {
    icon: Shield,
    title: "Legal Resources",
    description: "Browse comprehensive legal information and real case studies",
  },
  {
    icon: Trophy, 
    title: "Gamified Learning",
    description: "Earn 'Legal Warrior' badges by completing voice-based quizzes that teach you about your rights.",
  },
];


const Featuresection = () => {
  const featuresRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement[]>([]);
  const iconRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {

    gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 100, rotationY: 45, scale: 0.7 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.2, // animation will start one after another
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )

      cardRef.current.forEach((card, index) => {
        const icon = iconRef.current[index];
        const handleEnter = () => {
          gsap.to(card, 
            {
              y: -10,
              duration: 0.3,
              ease: "power2.out"
            }
          );
  
          gsap.to(icon, {
            rotation: 360,
            duration: 0.3,
            ease: "power2.out",
          });
        };
  
  
        const handleLeave = () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        
          gsap.to(icon, {
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        };
        card?.addEventListener("mouseenter", handleEnter);
        card?.addEventListener("mouseenter", handleEnter);
  
        return () => {
          card?.removeEventListener("mouseenter", handleEnter);
          card?.removeEventListener("mouseleave", handleLeave);
        }
      
      });

  }, []);
  return (
    <section className="px-4 py-22">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Comprehensive Legal Solutions</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-600 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 " ref={featuresRef}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (

            <div ref={(el) =>{cardRef.current[index] = el!}} id="card" key={index} className="feature-card group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-gray-200 hover:border-gray-400 bg-white/80 rounded-2xl p-8">
              <div ref={(el) => {iconRef.current[index] = el!}} className={`bg-gradient-to-br from-gray-900 to-gray-700 h-16 w-16 flex items-center justify-center rounded-xl mb-6 shadow-lg group-hover:shadow-xl transition-shadow mt-3`}>
                <Icon id="icon" className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">{feature.description}</p>

              <div className='mt-6'>
                <div className='flex items-center text-gray-900 font-medium group-hover:translate-x-2 transition-transform'>
                  Learn More
                  <ArrowRight  className='mt-0.5 ml-2 h-4 w-4'/>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default Featuresection;
