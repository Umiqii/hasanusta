import HomeHero from "@/components/HomeHero";
import MarqueeText from "@/components/MarqueeText";
import AboutSection from "@/components/AboutSection";
import SignatureDishes from "@/components/SignatureDishes";
import ServicesSection from "@/components/ServicesSection";
import GalleryPreview from "@/components/GalleryPreview";
import LocationsSection from "@/components/LocationsSection";

const Home = () => {
  return (
    <div>
      <HomeHero />
      <MarqueeText />
      <AboutSection />
      <SignatureDishes />
      <ServicesSection />
      <GalleryPreview />
      <LocationsSection />
    </div>
  );
};

export default Home;
