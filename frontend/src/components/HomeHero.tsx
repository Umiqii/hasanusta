import { useTranslation } from 'react-i18next';

const HomeHero = () => {
  const { t } = useTranslation();



  return (
    <section 
      className="relative h-screen flex items-center justify-center pt-16 bg-cover bg-center"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/19201080 .png')"
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <div className="flex justify-center mb-12 animate-fade-in-up">
          <img 
            src="/lovable-uploads/ana_sayfa_4.png" 
            alt="Hasan Usta Logo" 
            className="mx-auto w-96 md:w-[480px] lg:w-[540px] drop-shadow-xl animate-logo-fade-in"
            style={{animation: 'logoFadeIn 1.5s cubic-bezier(0.4,0,0.2,1)'}}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in">
          <a href="https://hasanusta.myrezzta.com/" target="_blank" rel="noopener noreferrer" className="primary-btn text-lg px-8 py-4">
            {t('homeHero.orderOnline')}
          </a>
          <a href="/about" className="secondary-btn bg-transparent border border-white text-white hover:bg-white hover:text-dark-gray text-lg px-8 py-4">
            {t('homeHero.aboutUs')}
          </a>
        </div>
      </div>
      <style>{`
        @keyframes logoFadeIn {
          0% { opacity: 0; transform: translateY(60px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-logo-fade-in {
          animation: logoFadeIn 1.5s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </section>
  );
};

export default HomeHero;
