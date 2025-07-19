import { useState } from "react";
import SectionTitle from "./SectionTitle";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const dishIds = [1, 2, 3, 4];

const SignatureDishes = () => {
  const { t } = useTranslation();
  const [activeDish, setActiveDish] = useState(dishIds[0]);

  const getDishDetails = (id: number) => {
    return {
      id,
      name: t(`signatureDishes.dishes.${id}.name`),
      description: t(`signatureDishes.dishes.${id}.description`),
      image: [
        "/adanakebap.png",        // Adana kebap - 1. sırada
        "/USTA KEBAP.png",        // Usta kebap - 2. sırada
        "/patlıcanlıkebap.png",   // Patlıcanlı kebap - 3. sırada
        "/metrelik.png"           // Metrelik kebap - 4. sırada
      ][id - 1]
    };
  };

  return (
    <section className="section-padding bg-accent-beige">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title={t('signatureDishes.title')}
          subtitle={t('signatureDishes.subtitle')}
        />
        
        {/* Mobil Accordion Yapısı */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {dishIds.map(id => {
              const dish = getDishDetails(id);
              return (
                <div key={dish.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => setActiveDish(dish.id)}
                    className={cn(
                      "w-full text-left p-4 transition-all duration-300",
                      activeDish === dish.id 
                        ? "bg-primary-red text-white shadow-md" 
                        : "bg-white hover:bg-gray-100"
                    )}
                  >
                    <h3 className={cn(
                      "text-xl font-serif font-bold mb-2",
                      activeDish === dish.id ? "text-white" : "text-dark-gray"
                    )}>
                      {dish.name}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      activeDish === dish.id ? "text-white/90" : "text-gray-600"
                    )}>
                      {dish.description}
                    </p>
                  </button>
                  
                  {activeDish === dish.id && (
                    <div className="animate-fade-in">
                      <img 
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Yan Yana Yapısı */}
        <div className="hidden sm:flex gap-8">
          <div className="w-full sm:w-1/3">
            <ul className="space-y-4">
              {dishIds.map(id => {
                const dish = getDishDetails(id);
                return (
                  <li key={dish.id}>
                    <button
                      onClick={() => setActiveDish(dish.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-md transition-all duration-300",
                        activeDish === dish.id 
                          ? "bg-primary-red text-white shadow-md" 
                          : "bg-white hover:bg-gray-100"
                      )}
                    >
                      <h3 className={cn(
                        "text-xl font-serif font-bold mb-2",
                        activeDish === dish.id ? "text-white" : "text-dark-gray"
                      )}>
                        {dish.name}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        activeDish === dish.id ? "text-white/90" : "text-gray-600"
                      )}>
                        {dish.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="w-full sm:w-2/3">
            {dishIds.map(id => {
              const dish = getDishDetails(id);
              return (
                dish.id === activeDish && (
                  <div key={dish.id} className="animate-fade-in">
                    <img 
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-[32rem] object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignatureDishes;
