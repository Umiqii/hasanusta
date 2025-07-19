import { NavLink } from "react-router-dom";
import { Instagram, Youtube, Facebook, Phone, Mail, MapPin, Twitter, Clock } from "lucide-react";
import Logo from "/public/lovable-uploads/e8027b6d-65ce-470a-9c5f-cb7f520d3a5c.png";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light-gray pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <img src={Logo} alt="Hasan Usta Kebap Logo" className="h-24 mb-6" />
          <h3 className="text-2xl font-serif font-bold mb-2">
            {t('footer.brandName')}
          </h3>
          <p className="text-text-gray text-lg">
            {t('footer.tagline')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center md:text-left">
          <div>
            <h4 className="text-xl font-serif font-bold mb-4">
              {t('footer.contactTitle')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start">
                <Phone size={18} className="text-primary-red mr-2" />
                <span>+90 216 418 01 01</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Mail size={18} className="text-primary-red mr-2" />
                <span>info@hasanustakebap.com</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <MapPin size={18} className="text-primary-red mr-2" />
                <span>{t('footer.addressValue')}</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Clock size={18} className="text-primary-red mr-2" />
                <span>{t('footer.hoursLabel')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold mb-4">
              {t('footer.quickLinksTitle')}
            </h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/" className="hover:text-primary-red transition-colors">
                  {t('navbar.home')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:text-primary-red transition-colors">
                  {t('navbar.about')}
                </NavLink>
              </li>
              <li>
                <a href="https://www.instagram.com/hasanustakebap/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-red transition-colors">
                  {t('navbar.gallery')}
                </a>
              </li>
              <li>
                <NavLink to="/careers" className="hover:text-primary-red transition-colors">
                  {t('navbar.careers')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="hover:text-primary-red transition-colors">
                  {t('navbar.contact')}
                </NavLink>
              </li>
              <li>
                <a 
                  href="https://hasanusta.myrezzta.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-red transition-colors"
                >
                  {t('footer.orderOnline')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold mb-4">
              {t('footer.followUsTitle')}
            </h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://www.instagram.com/hasanustakebap/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-red text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <Instagram size={24} />
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
                href="https://www.facebook.com/HasanUstaAdana1986"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-red text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <Facebook size={24} />
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

        <div className="border-t border-gray-300 pt-8 text-center">
          <p className="text-sm text-gray-500">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="mt-2">
            <NavLink to="/privacy-policy" className="text-sm text-gray-500 hover:text-primary-red transition-colors">
              {t('footer.privacyPolicy')}
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
