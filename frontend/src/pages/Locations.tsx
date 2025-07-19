
import { useEffect } from "react";
import SectionTitle from "@/components/SectionTitle";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

const locations = [
  {
    id: 1,
    name: "Merter",
    address: "Fatih Sultan Mehmet Cad. No:12 Merter, İstanbul",
    phone: "+90 212 643 73 40",
    email: "info@hasanustakebap.com",
    hours: "Her gün 09:00 - 00:00",
    image: "https://images.unsplash.com/photo-1581681813565-99e6ce56586c?q=80&w=1287&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Arnavutköy",
    address: "Fatih Cad. No:5/6-7 Arnavutköy, İstanbul",
    phone: "+90 212 287 71 80",
    email: "info@hasanustakebap.com",
    hours: "Her gün 09:00 - 00:00",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1287&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Bakırköy",
    address: "Ebuzziya Cad. No:11 Bakırköy, İstanbul",
    phone: "+90 212 466 42 42",
    email: "info@hasanustakebap.com",
    hours: "Her gün 09:00 - 00:00",
    image: "https://images.unsplash.com/photo-1541086095944-f4b5412d3d6f?q=80&w=1287&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Sefaköy",
    address: "Ahmet Kocabıyık Bulvarı No:22/2 Sefaköy, İstanbul",
    phone: "+90 212 580 80 80",
    email: "info@hasanustakebap.com",
    hours: "Her gün 09:00 - 00:00",
    image: "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?q=80&w=1287&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Başakşehir",
    address: "Başak Mah. Ertuğrul Gazi Cad. No:25/D Başakşehir, İstanbul",
    phone: "+90 212 485 00 99",
    email: "info@hasanustakebap.com",
    hours: "Her gün 09:00 - 00:00",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1287&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Bahçelievler",
    address: "Şirinevler Mah. Fetih Cad. No:5/A Bahçelievler, İstanbul",
    phone: "+90 212 503 49 54",
    email: "info@hasanustakebap.com",
    hours: "Her gün 09:00 - 00:00",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1287&auto=format&fit=crop"
  }
];

const Locations = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 py-12">
        <SectionTitle 
          title="Şubelerimiz" 
          subtitle="Türkiye'nin dört bir yanında aynı lezzet ve kaliteyle hizmetinizdeyiz."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <div 
              key={location.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${(location.id - 1) * 0.1}s` }}
            >
              <img 
                src={location.image} 
                alt={location.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">{location.name}</h3>
                
                <div className="space-y-3 mb-4">
                  <p className="flex items-start">
                    <MapPin size={18} className="text-primary-red mr-2 flex-shrink-0 mt-1" />
                    <span>{location.address}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone size={18} className="text-primary-red mr-2" />
                    <span>{location.phone}</span>
                  </p>
                  <p className="flex items-center">
                    <Mail size={18} className="text-primary-red mr-2" />
                    <span>{location.email}</span>
                  </p>
                  <p className="flex items-center">
                    <Clock size={18} className="text-primary-red mr-2" />
                    <span>{location.hours}</span>
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <a 
                    href="#" 
                    className="bg-primary-red text-white py-2 px-4 rounded-md transition-colors hover:bg-red-700 text-sm flex-1 text-center"
                  >
                    Yol Tarifi Al
                  </a>
                  <a 
                    href={`tel:${location.phone.replace(/\s/g, '')}`} 
                    className="border border-primary-red text-primary-red py-2 px-4 rounded-md transition-colors hover:bg-primary-red hover:text-white text-sm flex-1 text-center"
                  >
                    Hemen Ara
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;
