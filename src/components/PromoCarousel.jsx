import { useState, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        color: 'bg-indigo-600',
        title: 'Kualitas Premium',
        desc: 'Pin & Gantungan kunci dengan bahan terbaik.',
        // placeholder image (gradient)
        bgClass: 'bg-gradient-to-r from-indigo-500 to-purple-600'
    },
    {
        id: 2,
        color: 'bg-pink-600',
        title: 'Desain Suka-Suka',
        desc: 'Upload fotomu dan lihat preview secara langsung.',
        bgClass: 'bg-gradient-to-r from-pink-500 to-rose-500'
    },
    {
        id: 3,
        color: 'bg-blue-600',
        title: 'Diskon Spesial',
        desc: 'Beli banyak lebih murah! Hubungi admin untuk grosir.',
        bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
        id: 4,
        color: 'bg-orange-600',
        title: 'Proses Cepat',
        desc: 'Pengerjaan cepat, kualitas terjamin.',
        bgClass: 'bg-gradient-to-r from-orange-400 to-red-500'
    }
];

const PromoCarousel = memo(() => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
    const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    return (
        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl mb-12 group">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center text-white px-8 md:px-20 text-center ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        } ${slide.bgClass}`}
                >
                    <div className={`transform transition-transform duration-1000 ${index === current ? 'translate-y-0' : 'translate-y-10'}`}>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
                            {slide.title}
                        </h2>
                        <p className="text-lg md:text-xl font-medium opacity-90 drop-shadow-sm max-w-2xl mx-auto">
                            {slide.desc}
                        </p>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${idx === current ? 'bg-white w-6 md:w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
});

PromoCarousel.displayName = 'PromoCarousel';

export default PromoCarousel;
