
import { useEffect } from "react";
import SectionTitle from "@/components/SectionTitle";

const images = [
  "https://images.unsplash.com/photo-1470256699805-a29e1b58598a?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598514983318-2f64f55f1b0b?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1644364936154-a6ed34501e35?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576488489579-6967c02c56fc?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1651795898659-4b10b72ff60d?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1644364935906-792b2245a2c0?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581681813565-99e6ce56586c?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1287&auto=format&fit=crop"
];

const Gallery = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 py-12">
        <SectionTitle 
          title="Galeri" 
          subtitle="Adana'nın en lezzetli kebabının yanı sıra restoranımızdaki özel anları keşfedin"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div 
              key={index}
              className="overflow-hidden rounded-lg group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={image} 
                alt={`Hasan Usta Galeri ${index + 1}`} 
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
