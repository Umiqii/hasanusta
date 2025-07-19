import SectionTitle from "./SectionTitle";
import { useTranslation } from 'react-i18next';

const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title={t('aboutSection.title')}
          subtitle={t('aboutSection.subtitle')}
        />
        
        <div className="grid sm:grid-cols-2 gap-8 items-center">
          <div className="order-2 sm:order-1 animate-fade-in-right">
            <h3 className="text-2xl font-serif font-bold mb-4">
              {t('aboutSection.heading')}
            </h3>
            <p className="mb-4">
              {t('aboutSection.p1')}
            </p>
            <p className="mb-4">
              {t('aboutSection.p2')}
            </p>
            
            <blockquote className="border-l-4 border-primary-red pl-4 italic my-6">
              "{t('aboutSection.quote')}"
              <footer className="text-right font-medium mt-2">
                {t('aboutSection.quoteFooter')}
              </footer>
            </blockquote>
          </div>
          
          <div className="order-1 sm:order-2 animate-fade-in-left">
            <img 
              src="/yeni.png" 
              alt="Hasan Usta Hakkımızda" 
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
