import { useTranslation } from 'react-i18next';

const MarqueeText = () => {
  const { t } = useTranslation();
  const marqueeContent = t('marqueeText.content');
  
  // Yazının hiç kaybolmaması için çok tekrarlıyoruz
  const repeatedContent = Array(8).fill(marqueeContent).join(' • ');

  return (
    <section className="bg-primary-red py-4 overflow-hidden">
      <div className="whitespace-nowrap flex">
        <div className="animate-marquee-1 text-white font-bold text-lg md:text-xl shrink-0">
          {repeatedContent}
        </div>
        <div className="animate-marquee-2 text-white font-bold text-lg md:text-xl shrink-0 ml-4">
          {repeatedContent}
        </div>
      </div>
      <style>{`
        @keyframes marquee1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-1 {
          animation: marquee1 120s linear infinite;
        }
        .animate-marquee-2 {
          animation: marquee2 120s linear infinite;
          animation-delay: -60s;
        }
      `}</style>
    </section>
  );
};

export default MarqueeText; 