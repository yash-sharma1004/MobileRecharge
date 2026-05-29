import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
 
const testimonials = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Founder at Sparkly",
    avatar: "https://i.pravatar.cc/150?u=alex",
    content: "The attention to detail is unmatched. Our conversion rate increased by 40% after the redesign. Absolutely game-changing for our startup.",
    rating: 5,
    size: "large" // Bento grid span
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Senior Product Designer",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    content: "Intuitive, clean, and fast. It's rare to find a developer who understands both code and aesthetics so well.",
    rating: 5,
    size: "small"
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Marketing Director",
    avatar: "https://i.pravatar.cc/150?u=james",
    content: "Highly recommend! They delivered ahead of schedule and the code quality was top-tier. Will definitely work together again.",
    rating: 4,
    size: "small"
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    role: "Tech Lead at Nova",
    avatar: "https://i.pravatar.cc/150?u=elena",
    content: "A seamless experience from start to finish. The final product exceeded our expectations in every way.",
    rating: 5,
    size: "medium"
  }
];

const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative group p-8 rounded-3xl border border-slate-200 bg-white hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 
        ${testimonial.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}`}
    >
      <div className="absolute top-6 right-8 text-slate-100 group-hover:text-indigo-100 transition-colors">
        <Quote size={48} strokeWidth={3} />
      </div>

      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>

      <p className="text-slate-700 text-lg leading-relaxed mb-8 relative z-10">
        "{testimonial.content}"
      </p>

      <div className="flex items-center gap-4">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
        />
        <div>
          <h4 className="font-bold text-slate-900 leading-tight">{testimonial.name}</h4>
          <p className="text-sm text-slate-500">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Wall of Love
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Trusted by folks worldwide.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <TestimonialCard key={t.id} testimonial={t} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}