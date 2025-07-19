import SectionTitle from "./SectionTitle";
import { useTranslation } from 'react-i18next';

const images = [
  "/adanakebap.png",
  "/LAHMACUN.png",
  "/metrelik.png",
  "/imza yemekler (3).png", // 4. görsel - yeni imza yemek görseli
  "/KAHVALTI.png",
  "/imza yemekler.png" // 6. görsel - yeni imza yemek görseli
];

const GalleryPreview = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title={t('galleryPreview.title')}
          subtitle={t('galleryPreview.subtitle')}
        />
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index}
              className="overflow-hidden rounded-lg group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={image} 
                alt={`Hasan Usta Galeri ${index + 1}`} 
                className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a 
            href="https://www.instagram.com/hasanustakebap/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="primary-btn inline-block"
          >
            {t('galleryPreview.viewAll')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
