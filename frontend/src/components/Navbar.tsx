import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, Smartphone } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the logo
import Logo from "/public/lovable-uploads/e8027b6d-65ce-470a-9c5f-cb7f520d3a5c.png";

interface NavbarProps {
  scrolled: boolean;
}

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const Navbar = ({ scrolled }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { downloadUrl, platform } = useDeviceDetection();

  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { key: "home", path: "/" },
    { key: "about", path: "/about" },
    { key: "gallery", path: "https://www.instagram.com/hasanustakebap/", external: true },
    { key: "careers", path: "/careers" },
    { key: "contact", path: "/contact" },
  ];

  // Logo dinamik seçimi
  const logoSrc = scrolled
    ? "/lovable-uploads/ana_sayfa_1.png" // kırmızı logo
    : "/lovable-uploads/ana_sayfa_2.png"; // beyaz logo

  // Navbar arka planı dinamik
  const navbarBg = scrolled
    ? "bg-white/95 shadow-md py-2"
    : "bg-black/60 backdrop-blur-sm py-4";

  // Menü yazı rengi dinamik
  const navLinkClass = scrolled
    ? "nav-link text-dark-gray"
    : "nav-link text-warm-white";

  const languageSelectClass = scrolled
    ? "text-dark-gray bg-gray-100 border-gray-300"
    : "text-warm-white bg-gray-700 border-gray-600";

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${navbarBg}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/">
              <img src={logoSrc} alt="Hasan Usta Logo" className="h-14 md:h-16 transition-all duration-300" />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.key}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navLinkClass}
                >
                  {t(`navbar.${link.key}`)}
                </a>
              ) : (
                <NavLink
                  key={link.key}
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? `${navLinkClass} active-nav-link`
                      : navLinkClass
                  }
                >
                  {t(`navbar.${link.key}`)}
                </NavLink>
              )
            ))}
          </nav>

          {/* Dil Seçici ve CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Dil Seçici Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={`flex items-center gap-2 ${scrolled ? 'text-dark-gray border-gray-300 hover:bg-gray-100' : 'text-warm-white border-gray-600 bg-gray-800/70 hover:bg-gray-700/90'}`}>
                  {languages.find(l => l.code === i18n.language)?.flag}
                  <span className="hidden lg:inline">
                    {languages.find(l => l.code === i18n.language)?.name}
                  </span>
                  <Globe size={16} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onSelect={() => changeLanguage(lang.code)}>
                    {lang.flag} {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Uygulama İndir Button */}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium flex items-center gap-2">
                <Smartphone size={16} />
                <span className="hidden lg:inline">{t('navbar.downloadApp')}</span>
                <span className="lg:hidden">
                  {platform === 'ios' ? '🍎' : '🤖'}
                </span>
              </Button>
            </a>

            {/* CTA Button */}
            <a href="https://hasanusta.myrezzta.com/" target="_blank" rel="noopener noreferrer">
                              <Button className="bg-primary-red hover:bg-red-700 text-white">
                  <span className="hidden xl:inline">{t('navbar.orderNow')}</span>
                  <span className="xl:hidden">Sipariş</span>
                </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className={`${isMenuOpen ? 'bg-black/80 text-white hover:bg-black/90' : scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'} transition-all duration-300`}
            >
              {isMenuOpen ? <X className="text-white" /> : <Menu className={scrolled ? "text-dark-gray" : "text-warm-white"} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full shadow-md animate-fade-in ${scrolled ? 'bg-white' : 'bg-gray-800'}`}>
          <nav className="flex flex-col py-4">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.key}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-3 ${scrolled ? "text-dark-gray" : "text-warm-white"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`navbar.${link.key}`)}
                </a>
              ) : (
                <NavLink
                  key={link.key}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 ${isActive ? "text-primary-red font-medium" : scrolled ? "text-dark-gray" : "text-warm-white"}`
                  }
                >
                  {t(`navbar.${link.key}`)}
                </NavLink>
              )
            ))}
            
            {/* Mobil Uygulama İndir Button */}
            <div className="px-4 py-3">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-medium flex items-center justify-center gap-2">
                  <Smartphone size={16} />
                  {t('navbar.downloadApp')}
                </Button>
              </a>
            </div>
            
            {/* Mobil Dil Seçici */}
            <div className="px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={`w-full flex items-center justify-center gap-2 ${scrolled ? 'text-dark-gray border-gray-300 hover:bg-gray-100' : 'text-warm-white border-gray-600 bg-gray-800/70 hover:bg-gray-700/90'}`}>
                    {languages.find(l => l.code === i18n.language)?.flag}
                    <span>{languages.find(l => l.code === i18n.language)?.name}</span>
                    <Globe size={16} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)]">
                  {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onSelect={() => changeLanguage(lang.code)}>
                      {lang.flag} {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Mobil CTA */}            
            <div className="px-4 py-3">
              <a href="https://hasanusta.myrezzta.com/" target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full bg-primary-red hover:bg-red-700 text-white">
                  {t('navbar.orderNow')}
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
