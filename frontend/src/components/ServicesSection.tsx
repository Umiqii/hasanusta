import SectionTitle from "./SectionTitle";
import { useTranslation } from 'react-i18next';

const serviceIds = [1, 2, 3, 4, 5, 6, 7, 8];

// Gerçek görseller
const serviceImages = [
  "/KAHVALTI.png", // Kahvaltı
  "/OYUN PARKI.png", // Çocuk oyun alanı
  "/atolye.png", // Çocuk atölyesi
  "/sarj.png", // Elektrikli araç şarj
  "/aracaservis.png", // Araca servis
  "/LOCA.png", // Localar
  "/ucretsizoto.png", // Ücretsiz otopark
  "/ucretsizvale.png" // Ücretsiz vale
];

const ServicesSection = () => {
  const { t } = useTranslation();

  const getServiceDetails = (id: number) => {
    return {
      id,
      title: t(`servicesSection.services.${id}.title`),
      description: t(`servicesSection.services.${id}.description`),
      image: serviceImages[id - 1]
    };
  };

  return (
    <section className="section-padding bg-light-gray">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title={t('servicesSection.title')}
          subtitle={t('servicesSection.subtitle')}
        />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceIds.map(id => {
            const service = getServiceDetails(id);
            return (
              <div 
                key={service.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold mb-3 text-dark-gray">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 