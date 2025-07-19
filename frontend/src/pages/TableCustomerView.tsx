import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { AlertCircle, MoreHorizontal, Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface LinkItem {
  key: string;
  label: string;
  icon: string;
  url: string;
}

interface TableCustomerViewData {
  ordered_links: LinkItem[];
  display_whatsapp_number?: string | null;
}

const formatBranchName = (slug: string) => {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const createWhatsAppLink = (number: string) => {
  const cleanedNumber = number.replace(/\D/g, '');
  const fullNumber = cleanedNumber.startsWith('90') ? cleanedNumber : `90${cleanedNumber}`;
  return `https://wa.me/${fullNumber}`;
};

// Define Instagram URL and icon path (assuming icon exists)
const INSTAGRAM_URL = "https://www.instagram.com/hasanustakebap/";
const INSTAGRAM_ICON_FILENAME = "icons8-instagram-48.png";

// Share Target Data (Updated with new PNG icons)
// Icon type is now always a string (image path)
const shareTargets: { name: string; icon: string; iconAlt: string; action: string; urlPrefix?: string }[] = [
  { name: 'Copy link', icon: '/lovable-uploads/icons8-link-50.png', iconAlt: 'Copy Link Icon', action: 'copy' },
  { name: 'X', icon: '/lovable-uploads/icons8-twitter-50.png', iconAlt: 'X (Twitter) Icon', action: 'share', urlPrefix: 'https://twitter.com/intent/tweet?url=' },
  { name: 'Facebook', icon: '/lovable-uploads/icons8-facebook-48.png', iconAlt: 'Facebook Icon', action: 'share', urlPrefix: 'https://www.facebook.com/sharer/sharer.php?u=' },
  { name: 'WhatsApp', icon: '/lovable-uploads/icons8-whatsapp-48.png', iconAlt: 'WhatsApp Icon', action: 'share', urlPrefix: 'whatsapp://send?text=' },
  { name: 'LinkedIn', icon: '/lovable-uploads/icons8-linkedin-48.png', iconAlt: 'LinkedIn Icon', action: 'share', urlPrefix: 'https://www.linkedin.com/shareArticle?mini=true&url=' },
  { name: 'Messenger', icon: '/lovable-uploads/icons8-messenger-48.png', iconAlt: 'Messenger Icon', action: 'share', urlPrefix: 'fb-messenger://share?link=' }, 
  { name: 'Snapchat', icon: '/lovable-uploads/icons8-snapchat-48.png', iconAlt: 'Snapchat Icon', action: 'share', urlPrefix: 'https://www.snapchat.com/share?url=' },
  { name: 'E-posta', icon: '/lovable-uploads/icons8-mail-48.png', iconAlt: 'Email Icon', action: 'mailto' },
  { name: 'More', icon: '/lovable-uploads/icons8-more-50.png', iconAlt: 'More Options Icon', action: 'nativeShare' },
];

const TableCustomerView = () => {
  const { branch_slug, table_number } = useParams<{ branch_slug: string; table_number: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [viewData, setViewData] = useState<TableCustomerViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPopoverKey, setOpenPopoverKey] = useState<string | null>(null);

  // branch_slug will be available here from useParams
  const baseBranchName = formatBranchName(branch_slug || t('tableCustomerView.unknownBranch', 'Bilinmeyen Şube'));
  const formattedBranchNameForShare = `Hasan Usta ${baseBranchName}`;

  useEffect(() => {
    const fetchViewData = async () => {
      if (!branch_slug || !table_number) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/musteri/sube/${branch_slug}/table/${table_number}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          let errorMsg = t('tableCustomerView.errors.fetchFailed', 'Masa bilgileri yüklenemedi.');
          if (response.status === 404) {
            try {
              const errData = await response.json();
              if (errData.detail === "Branch not found") {
                  errorMsg = t('tableCustomerView.errors.branchNotFound', 'Şube bulunamadı.');
              } else if (errData.detail === "Table not found in this branch") {
                  errorMsg = t('tableCustomerView.errors.tableNotFoundInBranch', 'Bu şubede belirtilen masa bulunamadı.');
              }
            } catch (e) { /* ignore json parse error */ }
          } else {
             try {
                const errData = await response.json();
                errorMsg = errData.detail || errorMsg;
             } catch (e) { /* ignore */ }
          }
          throw new Error(errorMsg);
        }
        const data: TableCustomerViewData = await response.json();
        setViewData(data);
      } catch (err: any) {
        console.error("Error fetching view data:", err);
        setError(err.message || t('tableCustomerView.errors.fetchFailed', 'Masa bilgileri yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };

    fetchViewData();
  }, [branch_slug, table_number, t]);

  const handleShare = useCallback(async (action: string, linkUrl: string, linkLabel: string, shareTargetName?: string, urlPrefix?: string) => {
    if (!linkUrl) {
      toast({
        title: t('tableCustomerView.shareError.title', 'Paylaşım Hatası'),
        description: t('tableCustomerView.shareError.noUrl', 'Paylaşılacak bir bağlantı bulunamadı.'),
        variant: "destructive",
      });
      return;
    }

    const encodedLinkUrl = encodeURIComponent(linkUrl);
    const encodedLinkLabel = encodeURIComponent(linkLabel);

    // Construct a more descriptive share text
    const descriptiveShareText = `${formattedBranchNameForShare} - ${linkLabel}`;
    const encodedDescriptiveShareText = encodeURIComponent(descriptiveShareText);

    switch (action) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(linkUrl);
          toast({
            title: t('tableCustomerView.shareSuccess.copiedTitle', 'Kopyalandı!'),
            description: t('tableCustomerView.shareSuccess.copiedText', 'Bağlantı panoya kopyalandı.'),
          });
        } catch (err) {
          console.error("Failed to copy link: ", err);
          toast({
            title: t('tableCustomerView.shareError.title', 'Paylaşım Hatası'),
            description: t('tableCustomerView.shareError.copyFailed', 'Bağlantı kopyalanamadı.'),
            variant: "destructive",
          });
        }
        break;

      case 'share':
        if (urlPrefix) {
          let shareUrl = '';
          if (shareTargetName === 'WhatsApp') {
            // For WhatsApp, text= should include a message and the URL
            const message = encodeURIComponent(`${descriptiveShareText}: ${linkUrl}`);
            shareUrl = `${urlPrefix}${message}`;
          } else {
            shareUrl = `${urlPrefix}${encodedLinkUrl}`;
          }
          window.open(shareUrl, '_blank', 'noopener,noreferrer');
        } else {
          console.warn('Share action called without urlPrefix for target:', shareTargetName);
        }
        break;

      case 'mailto':
        const mailtoLink = `mailto:?subject=${encodedDescriptiveShareText}&body=${encodeURIComponent(t('tableCustomerView.emailBodyContext', '{context} için bağlantı:', { context: descriptiveShareText }))} ${encodedLinkUrl}`;
        window.location.href = mailtoLink;
        break;

      case 'nativeShare':
        if (navigator.share) {
          try {
            await navigator.share({
              title: descriptiveShareText,
              text: t('tableCustomerView.nativeShareTextContext', '{context} için bağlantıyı kontrol et:', { context: descriptiveShareText }),
              url: linkUrl,
            });
          } catch (err) {
            // Handle errors (e.g., user cancelled share dialog)
            // Don't show error toast if user cancels, as it's expected behavior
            if ((err as Error).name !== 'AbortError') {
                 console.error('Error using Web Share API:', err);
                 toast({
                    title: t('tableCustomerView.shareError.title', 'Paylaşım Hatası'),
                    description: t('tableCustomerView.shareError.nativeShareFailed', 'Paylaşım yapılamadı.'),
                    variant: "destructive",
                });
            }
          }
        } else {
            // Fallback if Web Share API is not supported (e.g., copy to clipboard or show message)
            // For now, we can try to copy as a fallback or inform the user.
            try {
                await navigator.clipboard.writeText(linkUrl);
                toast({
                    title: t('tableCustomerView.shareSuccess.copiedTitle', 'Kopyalandı!'),
                    description: t('tableCustomerView.shareSuccess.nativeShareFallback', 'Paylaşım özelliği desteklenmiyor. Bağlantı panoya kopyalandı.'),
                });
            } catch (copyErr) {
                 toast({
                    title: t('tableCustomerView.shareError.title', 'Paylaşım Hatası'),
                    description: t('tableCustomerView.shareError.nativeShareNotSupported', 'Cihazınız bu paylaşım özelliğini desteklemiyor.'),
                    variant: "destructive",
                });
            }
        }
        break;

      default:
        console.warn('Unknown share action:', action);
    }
    setOpenPopoverKey(null); // Close popover after action
  }, [toast, t, formattedBranchNameForShare]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>{t('common.loading', 'Yükleniyor...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('common.error', 'Hata')}</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!viewData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>{t('tableCustomerView.errors.noData', 'Masa bilgileri bulunamadı.')}</p>
      </div>
    );
  }

  const formattedBranchName = formatBranchName(branch_slug || '');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-between p-4 font-sans">
      <main className="w-full max-w-md flex flex-col items-center justify-center flex-grow pt-8">
        <img src="/lovable-uploads/logo.png" alt="Hasan Usta Kebap Logo" className="w-36 h-36 mb-6 shadow-md rounded-full" />
        
        <div className="text-2xl font-bold text-primary-red mb-3 text-center whitespace-nowrap">
          Hasan Usta {formattedBranchName || t('tableCustomerView.branchDefault', 'Şube')} 
        </div>

        {viewData.display_whatsapp_number && (
          <a 
            href={createWhatsAppLink(viewData.display_whatsapp_number)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-600 hover:text-green-700 mb-6 text-base"
          >
            <img 
              src="/lovable-uploads/icons8-whatsapp-48.png" 
              alt="WhatsApp" 
              className="w-5 h-5 mr-2"
            />
            {viewData.display_whatsapp_number}
          </a>
        )}

        <div className="w-full space-y-3">
          {viewData.ordered_links.map((link) => (
            <div 
              key={link.key} 
              className="flex items-center justify-between w-full rounded-full px-6 py-4 bg-white shadow-[6px_6px_0px_#000] transition-all duration-200 ease-in-out group hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000]"
            >
              <a
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center flex-grow text-gray-700 font-medium text-sm truncate mr-2",
                  !link.url && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  if (!link.url) e.preventDefault();
                }}
                title={link.label}
              >
                <img 
                  src={`/lovable-uploads/${link.icon}`} 
                  alt=""
                  className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
                />
                <span className="truncate">{link.label}</span>
              </a>

              <Popover open={openPopoverKey === link.key} onOpenChange={(isOpen) => setOpenPopoverKey(isOpen ? link.key : null)}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-1 flex-shrink-0 p-1 rounded-full hover:bg-gray-200"
                    disabled={!link.url}
                    title={t('tableCustomerView.shareAction', 'Paylaş')}
                  >
                    <MoreHorizontal className="h-6 w-6 text-gray-500 group-hover:text-primary-red" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2">
                  <div className="space-y-2">
                    <p className="font-medium text-sm px-2">{t('tableCustomerView.shareLink', 'Bağlantıyı Paylaş')}</p>
                    <div className="flex overflow-x-auto space-x-2 py-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {shareTargets.map((target) => (
                        <button
                          key={target.name}
                          onClick={() => handleShare(target.action, link.url, link.label, target.name, target.urlPrefix)}
                          className="flex flex-col items-center space-y-1 p-1 rounded hover:bg-gray-100 flex-shrink-0 text-center w-16"
                          title={target.name}
                          disabled={!link.url}
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            <img src={target.icon} alt={target.iconAlt} className='w-full h-full object-contain' />
                          </div>
                          <span className="text-xs text-gray-600">{target.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ))}
          
          <a
            key="instagram-footer"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block pt-4 flex justify-center items-center" 
          >
            <img 
              src={`/lovable-uploads/${INSTAGRAM_ICON_FILENAME}`} 
              alt="Instagram" 
              className="w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            />
          </a>
        </div>
      </main>

      <footer className="text-center text-gray-500 text-sm mt-16 mb-4">
        Made with <span className="text-red-500">❤️</span> by Mutfak Yazılım
      </footer>
    </div>
  );
};

export default TableCustomerView;
