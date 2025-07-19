import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import ContactForm from "@/components/ContactForm";
import GeneralContactForm from "@/components/GeneralContactForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = useState<'reservation' | 'general'>('reservation');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <SectionTitle 
            title={t('contactPage.pageTitle')}
            subtitle={t('contactPage.pageSubtitle')}
          />
        </div>

        <div className="flex mb-8 border-b">
          <Button
            variant="ghost"
            onClick={() => setActiveForm('reservation')}
            className={cn(
              "flex-1 rounded-none border-b-2 px-4 py-3 text-sm font-medium",
              activeForm === 'reservation' 
                ? 'border-primary-red text-primary-red' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {t('contactPage.reservationTabButton')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveForm('general')}
            className={cn(
              "flex-1 rounded-none border-b-2 px-4 py-3 text-sm font-medium",
              activeForm === 'general' 
                ? 'border-primary-red text-primary-red' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {t('contactPage.generalTabButton')}
          </Button>
        </div>
        
        <div className="mb-12 text-center">
          {activeForm === 'reservation' && (
            <SectionTitle 
              title={t('contactForm.title')}
              subtitle={t('contactForm.subtitle')}
            />
          )}
          {activeForm === 'general' && (
            <SectionTitle 
              title={t('generalContactForm.title')}
              subtitle={t('generalContactForm.subtitle')}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            {activeForm === 'reservation' && <ContactForm />}
            {activeForm === 'general' && <GeneralContactForm />}
          </div>
          
          <div>
            <div className="bg-accent-beige rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-serif font-bold mb-6">
                {t('contactPage.infoTitle')}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone size={24} className="text-primary-red mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.phoneLabel')}</h4>
                    <p>+90 216 418 01 01</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail size={24} className="text-primary-red mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.emailLabel')}</h4>
                    <p>info@hasanustakebap.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin size={24} className="text-primary-red mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.addressLabel')}</h4>
                    <p>{t('contactPage.addressValue')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={24} className="text-primary-red mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.hoursLabel')}</h4>
                    <p>{t('contactPage.hoursValue')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h3 className="text-2xl font-serif font-bold mb-4">
                  {t('contactPage.socialMediaTitle')}
                </h3>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://www.instagram.com/hasanustakebap/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-red text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="https://www.facebook.com/HasanUstaAdana1986"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-red text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UCJAFOZ5uSZa-Xr1cPuI5HKg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-red text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Youtube size={24} />
                  </a>
                  <a
                    href="https://x.com/HasanUstaKebap3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-red text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Twitter size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
