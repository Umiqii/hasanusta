import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown, AlertCircle, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Backend Schema'larına uygun interface'ler
interface BranchLinkData {
    [key: string]: string; // Dinamik anahtarlar
}

interface BranchSetting {
  id: number; // Şube ID'si kaydetme ve güncelleme için gerekli
  name: string;
  slug: string; // Slug genellikle güncellenmez ama okunabilir
  display_whatsapp_number: string | null;
  default_links: BranchLinkData;
  link_order: string[];
}

// Frontend'deki gösterim için config (Bu backend'den gelmeyecek)
export const initialLinkSettingsConfig: { key: string; icon: string; label: string }[] = [
  { key: 'order', icon: 'icons8-buy-100.png', label: 'Bir Tıkla Sipariş Ver!' },
  { key: 'feedback', icon: 'icons8-feedback-100.png', label: 'Yorum Bırak' },
  { key: 'instagram', icon: 'icons8-instagram-48.png', label: 'Instagram' },
  { key: 'whatsapp', icon: 'icons8-whatsapp-48.png', label: 'WhatsApp' },
  { key: 'branchIstanbul', icon: 'icons8-location-50.png', label: 'İstanbul Şubemiz' },
  { key: 'branchAnkara', icon: 'icons8-location-50.png', label: 'Ankara Şubemiz' },
  { key: 'branchKurttepe', icon: 'icons8-location-50.png', label: 'Kurttepe Şubemiz' },
  { key: 'branchBarajyolu', icon: 'icons8-location-50.png', label: 'Barajyolu Şubemiz' },
  { key: 'threads', icon: 'icons8-threads-50.png', label: 'Konular (Threads)' },
  { key: 'twitter', icon: 'icons8-twitter-50.png', label: 'Twitter' },
  { key: 'tiktok', icon: 'icons8-tiktok-50.png', label: 'TikTok' }
];

// Bu config'i de export edelim
export const linkSettingsConfig = initialLinkSettingsConfig;

const BranchSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, token } = useAuth();
  // State'i başlangıçta null yapalım, API'den gelince dolacak
  const [settings, setSettings] = useState<BranchSetting | null>(null);
  const [linkOrder, setLinkOrder] = useState<string[]>([]); // Başlangıçta boş
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Ayarları Backend'den Çekme --- 
  const fetchBranchSettings = useCallback(async () => {
      if (!token || !user) {
          setError("Kullanıcı bilgileri veya token bulunamadı.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);

      // Prepend /v1 to the dynamic path part before combining with base URL
      let pathWithV1 = '';
      if (user.is_superuser) {
          pathWithV1 = '/api/v1/admin/settings/branches/?limit=1'; 
          console.warn("Süper kullanıcı: İlk şube yükleniyor. Şube seçimi eklenmeli.")
      } else if (user.branch_id) {
          pathWithV1 = `/api/v1/admin/settings/branches/${user.branch_id}`;
      } else {
          setError(t('branchSettings.errors.noBranchAssigned', 'Kullanıcıya atanmış bir şube bulunmuyor.'));
          setLoading(false);
          return;
      }

      try {
          // Use the path with /v1 and environment variable for base URL
          const apiUrl = `${import.meta.env.VITE_API_URL}${pathWithV1}`;

          const response = await fetch(apiUrl, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              let errorMsg = t('branchSettings.errors.fetchFailed', 'Şube ayarları yüklenemedi.');
              try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch(e) { /* ignore */ }
              // Kullanıcıya atanmış şube yoksa veya ilk şube bulunamazsa 404 olabilir
              if (response.status === 404) {
                   errorMsg = t('branchSettings.errors.branchNotFound', 'Şube bulunamadı veya erişim yetkiniz yok.');
              }
              throw new Error(errorMsg);
          }

          let branchData: BranchSetting;
          const responseData = await response.json();

          if (user.is_superuser && Array.isArray(responseData)) {
             // Listeleme endpoint'inden geldiyse ve dizi ise ilk elemanı al
             if (responseData.length > 0) {
                 branchData = responseData[0];
             } else {
                  throw new Error(t('branchSettings.errors.noBranchesFoundSuperuser', 'Süper kullanıcı için görüntülenecek şube bulunamadı.'));
             }
          } else if (!Array.isArray(responseData)){
              // Tek şube endpoint'inden geldiyse doğrudan kullan
              branchData = responseData;
          } else {
              throw new Error(t('branchSettings.errors.unexpectedResponse', 'Beklenmeyen API yanıtı.'));
          }
          
          setSettings(branchData);
          setLinkOrder(branchData.link_order || []); // Gelen sırayı kullan, yoksa boş dizi

      } catch (err: any) {
          console.error("Error fetching branch settings:", err);
          setError(err.message || t('branchSettings.errors.fetchFailed', 'Şube ayarları yüklenemedi.'));
          setSettings(null); // Hata durumunda state'i temizle
          setLinkOrder([]);
      } finally {
          setLoading(false);
      }
  }, [token, user, t]);

  useEffect(() => {
      fetchBranchSettings();
  }, [fetchBranchSettings]);

  // --- Input Değişikliklerini Handle Etme --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleLinkChange = (key: string, value: string) => {
    setSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        default_links: {
          ...prev.default_links,
          [key]: value,
        },
      };
    });
  };

  // --- Link Sıralamasını Değiştirme --- 
  const moveLink = (key: string, direction: 'up' | 'down') => {
    setLinkOrder(prevOrder => {
      const currentIndex = prevOrder.indexOf(key);
      if (currentIndex === -1) return prevOrder;
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prevOrder.length) {
        return prevOrder;
      }
      const newOrder = [...prevOrder];
      [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
      return newOrder;
    });
  };

  // --- Ayarları Kaydetme --- 
  const handleSave = async () => {
    if (!settings || !token) {
        setError(t('branchSettings.errors.cannotSave', 'Kaydedilecek ayar bulunamadı veya yetkilendirme eksik.'));
        return;
    }
    setLoading(true);
    setError(null);

    // Backend'e gönderilecek payload (BranchSettingUpdate şemasına uygun)
    const dataToSave = {
      name: settings.name,
      // slug: settings.slug, // Slug genellikle güncellenmez, gerekirse ekle ve kontrol yap
      display_whatsapp_number: settings.display_whatsapp_number,
      default_links: settings.default_links,
      link_order: linkOrder, // Güncel sıralama
    };



    try {
        // Prepend VITE_API_URL and add /v1
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/settings/branches/${settings.id}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
             let errorMsg = t('branchSettings.errors.saveFailed', 'Ayarlar kaydedilemedi.');
              try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch(e) { /* ignore */ }
             throw new Error(errorMsg);
        }

        const updatedSettings: BranchSetting = await response.json();

        // Başarılı kaydetme sonrası state'i güncelle
        setSettings(updatedSettings);
        setLinkOrder(updatedSettings.link_order || []);

        toast({
            title: t('branchSettings.saveSuccessTitle', 'Başarılı'),
            description: t('branchSettings.saveSuccessDesc', 'Şube bilgileri başarıyla kaydedildi.'),
        });

    } catch (err: any) {
        console.error("Error saving branch settings:", err);
        setError(err.message || t('branchSettings.errors.saveFailed', 'Ayarlar kaydedilemedi.'));
    } finally {
        setLoading(false);
    }
  };

  // Ayarları linkOrder state'ine göre sırala
  const orderedLinkSettings = linkOrder.map(key =>
     initialLinkSettingsConfig.find(c => c.key === key)
  ).filter(Boolean) as typeof initialLinkSettingsConfig;

  // --- Render Kısmı --- 
  if (loading) {
      return <AdminLayout><p>{t('common.loading', 'Yükleniyor...')}</p></AdminLayout>;
  }

  if (error) {
    return (
      <AdminLayout>
         <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
           <AlertCircle className="mr-2 h-5 w-5" />
           <span>{error}</span>
           {/* Yeniden deneme butonu eklenebilir */}
           <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Kapat</Button> 
         </div>
      </AdminLayout>
     );
  }

  if (!settings) { // Ayarlar yüklenemediyse veya kullanıcıya atanmış şube yoksa
     return <AdminLayout><p>{t('branchSettings.noSettings', 'Düzenlenecek şube ayarı bulunamadı.')}</p></AdminLayout>;
  }

  // Settings yüklendiğinde gösterilecek içerik
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t('branchSettings.pageTitle', 'Şube Bilgilerini Düzenle')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */} 
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-8">
          {/* Temel Bilgiler */}
          <section>
             {/* Şube Adı backend'den gelen 'name' ile eşleşti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <Label htmlFor="name">{t('branchSettings.branchNameLabel', 'Şube Adı')}</Label>
                <Input
                  id="name"
                  name="name" // name attribute'ü eşleşmeli
                  value={settings.name || ''} // null kontrolü
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="display_whatsapp_number">{t('branchSettings.whatsappLabel', 'WhatsApp Telefon Numarası (Müşteri Görünümü)')}</Label>
                <div className="flex items-center">
                   <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <img src="/lovable-uploads/icons8-whatsapp-48.png" alt="WhatsApp" className="w-4 h-4" />
                   </span>
                    <Input
                      id="display_whatsapp_number"
                      name="display_whatsapp_number" // name attribute'ü eşleşmeli
                      value={settings.display_whatsapp_number || ''} // null kontrolü
                      onChange={handleInputChange}
                      placeholder="+90 5XX XXX XX XX"
                      className="rounded-l-none"
                    />
                </div>
                 <p className="text-xs text-gray-500 mt-1">{t('branchSettings.whatsappHint', 'Bu numara müşteri QR kod sayfasında gösterilecektir.')}</p>
              </div>
            </div>
          </section>

          {/* Varsayılan Bağlantı Ayarları */}
          <section>
            <h2 className="text-xl font-semibold mb-3 border-t pt-6">{t('branchSettings.defaultLinksTitle', 'Varsayılan Bağlantı Ayarları')}</h2>
            <p className="text-sm text-gray-600 mb-6">{t('branchSettings.defaultLinksDesc', 'Bu bağlantılar yeni masa oluşturulduğunda veya linki boş olan masalarda otomatik olarak kullanılacaktır. Sıralamayı aşağıdaki butonlarla değiştirebilirsiniz.')}</p>
            
            {/* Link Ekleme Butonu */}
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  // Link order'a olmayan keylerden bir tanesini ekleyelim
                  const allKeys = initialLinkSettingsConfig.map(c => c.key);
                  const unusedKeys = allKeys.filter(key => !linkOrder.includes(key));
                  
                  if (unusedKeys.length > 0) {
                    setLinkOrder(prev => [...prev, unusedKeys[0]]);
                  } else {
                    // Tüm keyler zaten eklenmiş, kullanıcıya bilgi verebiliriz
                    toast({
                      title: "Bilgi",
                      description: "Tüm link tipleri zaten eklenmiş durumda.",
                    });
                  }
                }}
                className="mb-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Yeni Bağlantı Ekle
              </Button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {orderedLinkSettings.map((link, index) => (
                <div key={link.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveLink(link.key, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveLink(link.key, 'down')}
                      disabled={index === orderedLinkSettings.length - 1}
                      className="h-6 w-6 p-0 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-12 h-10 flex items-center justify-center bg-white rounded-md shadow-sm">
                    <img src={`/lovable-uploads/${link.icon}`} alt="" className="w-7 h-7 flex-shrink-0" />
                  </div>
                  <Label htmlFor={link.key} className="w-40 flex-shrink-0 font-medium">{t(`branchSettings.link_${link.key}`, link.label)}</Label>
                  <Input
                    id={link.key}
                    value={settings.default_links[link.key] || ''}
                    onChange={(e) => handleLinkChange(link.key, e.target.value)}
                    placeholder="https://..."
                  />
                  {settings.default_links[link.key] && (
                    <a href={settings.default_links[link.key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      // Link'i sıralamadan çıkar
                      setLinkOrder(prevOrder => prevOrder.filter(k => k !== link.key));
                      // Link değerini de temizle
                      handleLinkChange(link.key, '');
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {linkOrder.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  Henüz bir bağlantı eklenmedi. Yukarıdaki "Yeni Bağlantı Ekle" butonunu kullanarak bağlantı ekleyebilirsiniz.
                </div>
              )}
            </div>
          </section>

          {/* Kaydet Butonu */}
          <div className="flex justify-end mt-8 border-t pt-6">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? t('common.saving', 'Kaydediliyor...') : t('branchSettings.saveButton', 'Şube Bilgilerini Kaydet')}
            </Button>
          </div>
        </div>

        {/* Sağ Taraf: Logo */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-fit">
           <Label className="mb-4 text-center font-semibold">{t('branchSettings.logoLabel', 'Şube Logosu')}</Label>
           {/* Logo backend'den gelmiyorsa placeholder veya sabit kalabilir */}
           <img src="/lovable-uploads/logo.png" alt="Şube Logosu" className="w-32 h-32 mb-2" />
           <p className="text-xs text-gray-500">{t('branchSettings.logoNotEditable', 'Logo değiştirilemez')}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BranchSettings; 