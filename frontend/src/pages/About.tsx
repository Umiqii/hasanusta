import { useEffect } from "react";
import SectionTitle from "@/components/SectionTitle";
import { useTranslation, Trans } from 'react-i18next';
import { NavLink } from "react-router-dom";

const About = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 py-12">
        <SectionTitle 
          title={t('aboutPage.pageTitle')}
          subtitle={t('aboutPage.pageSubtitle')}
        />

        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {/* 1. Madde */}
            <div className="my-8">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="md:w-1/3">
                  <img 
                    src="/adanakebap.png" 
                    alt={t('aboutPage.section1Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section1Title').substring(3)}</h3>
                  <p>{t('aboutPage.section1P1')}</p>
                  <p>{t('aboutPage.section1P2')}</p>
                  <p>{t('aboutPage.section1P3')}</p>
                  <p>{t('aboutPage.section1P4')}</p>
                </div>
              </div>
              
              {/* YouTube Video Alanı */}
              <div className="my-8 aspect-video w-full">
                <iframe 
                  className="w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/9u3h8ze_yzw" 
                  title={t('aboutPage.videoTitle')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
                </iframe>
              </div>
            </div>

            {/* 2. Madde */}
            <div className="my-12">
              <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                <div className="md:w-1/3">
                  <img 
                    src="/pirzola.png" 
                    alt={t('aboutPage.section2Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section2Title').substring(3)}</h3>
                  <p>{t('aboutPage.section2P1')}</p>
                </div>
              </div>
            </div>

            {/* 3. Madde */}
            <div className="my-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3">
                  <img 
                    src="/metrelik.png" 
                    alt={t('aboutPage.section3Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section3Title').substring(3)}</h3>
                  <p>{t('aboutPage.section3P1')}</p>
                  <p>{t('aboutPage.section3P2')}</p>
                </div>
              </div>
            </div>

            {/* 4. Madde */}
            <div className="my-12">
              <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                <div className="md:w-1/3">
                  <img 
                    src="/ciger.png" 
                    alt={t('aboutPage.section4Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section4Title').substring(3)}</h3>
                  <p>{t('aboutPage.section4P1')}</p>
                  <p>{t('aboutPage.section4P2')}</p>
                  <p>{t('aboutPage.section4P3')}</p>
                </div>
              </div>
            </div>

            {/* 5. Madde */}
            <div className="my-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3">
                  <img 
                    src="/LAHMACUN.png" 
                    alt={t('aboutPage.section5Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section5Title').substring(3)}</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{t('aboutPage.section5ListItem1')}</li>
                    <li>{t('aboutPage.section5ListItem2')}</li>
                    <li>{t('aboutPage.section5ListItem3')}</li>
                    <li>{t('aboutPage.section5ListItem4')}</li>
                    <li>{t('aboutPage.section5ListItem5')}</li>
                    <li>{t('aboutPage.section5ListItem6')}</li>
                    <li>{t('aboutPage.section5ListItem7')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 6. Madde */}
            <div className="my-12">
              <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                <div className="md:w-1/3">
                  <img 
                    src="/PATLICAN KEBABI.png" 
                    alt={t('aboutPage.section6Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section6Title').substring(3)}</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{t('aboutPage.section6ListItem1')}</li>
                    <li>{t('aboutPage.section6ListItem2')}</li>
                    <li>{t('aboutPage.section6ListItem3')}</li>
                    <li>{t('aboutPage.section6ListItem4')}</li>
                    <li>{t('aboutPage.section6ListItem5')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7. Madde */}
            <div className="my-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3">
                  <img 
                    src="/USTA KEBAP.png" 
                    alt={t('aboutPage.section7Title')}
                    className="rounded-lg shadow-md w-full h-[28rem] object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-3">{t('aboutPage.section7Title').substring(3)}</h3>
                  <p>{t('aboutPage.section7P1')}</p>
                  <p className="mt-4 font-semibold text-primary-red">
                    <Trans i18nKey="aboutPage.moreInfoText"
                           components={[
                             <NavLink key="contact-link" to="/contact" className="underline hover:text-red-700" />,
                             <a key="order-link" href="https://hasanusta.myrezzta.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-700" />
                           ]}
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
