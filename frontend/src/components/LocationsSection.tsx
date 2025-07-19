import { MapPin, Phone } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { useTranslation } from 'react-i18next';

const locationsData = [
  { id: 1, key: "kurttepe", address: "Yurt Mah. Kurttepe Cad. No:4, Çukurova/Adana", phone: "0322 247 00 00", image: "/kurttepe.jpg", mapUrl: "https://maps.google.com/?q=Hasan+Usta+Kebap+Kurttepe,+Yurt,+Kurttepe+Cd.+No:2,+01170+Çukurova/Adana" },
  { id: 2, key: "barajyolu", address: "Yenibaraj Mah. 68030 Sok. No:1/A, Seyhan/Adana", phone: "0322 225 97 98", image: "/barajyolu.jpg", mapUrl: "https://maps.google.com/?q=Hasan+Usta+Barajyolu,+Yenibaraj,+68030.+Sk.,+01150+Seyhan/Adana" },
  { id: 3, key: "kosuyolu", address: "Koşuyolu Mah. Dr. Eyüp Aksoy Cad. No:29, Kadıköy/İstanbul", phone: "0216 418 01 01", image: "/koşuyolu.jpg", mapUrl: "https://maps.google.com/?q=Hasan+Usta+Kebap,+Koşuyolu,+Dr.+Eyüp+Aksoy+Cd.+No:+29,+34716+Kadıköy/İstanbul" },
  { id: 4, key: "ankara", address: "Kızılırmak Mah. Ufuk Üni. Cad. No:11 A/1, Çankaya/Ankara", phone: "0312 643 01 01", image: "/ankara .jpg", mapUrl: "https://maps.google.com/?q=Ufuk+Ünv.+Cd+No:18,+Kızılırmak,+06510+Çankaya/Ankara" }
];

const LocationsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding bg-light-gray">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title={t('locationsSection.title')}
          subtitle={t('locationsSection.subtitle')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {locationsData.map((location) => {
            const translatedName = t(`locationsSection.${location.key}`);
            return (
              <div 
                key={location.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <img 
                  src={location.image} 
                  alt={translatedName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold mb-2">
                    {translatedName}
                  </h3>
                  <p className="flex items-start mb-2">
                    <MapPin size={18} className="text-primary-red mr-2 flex-shrink-0 mt-1" />
                    <span>{location.address}</span>
                  </p>
                  <p className="flex items-center mb-4">
                    <Phone size={18} className="text-primary-red mr-2" />
                    <span>{location.phone}</span>
                  </p>
                  <div className="flex space-x-2">
                    <a 
                      href={location.mapUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary-red text-white py-2 px-4 rounded-md transition-colors hover:bg-red-700 text-sm flex-1 text-center"
                    >
                      {t('locationsSection.getDirections')}
                    </a>
                    <a 
                      href={`tel:${location.phone.replace(/\s/g, '')}`} 
                      className="border border-primary-red text-primary-red py-2 px-4 rounded-md transition-colors hover:bg-primary-red hover:text-white text-sm flex-1 text-center"
                    >
                      {t('locationsSection.callNow')}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
