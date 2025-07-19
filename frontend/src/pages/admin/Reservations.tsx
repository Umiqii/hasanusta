import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

// Backend'den gelen ReservationRead şemasına uygun interface
interface Reservation {
    id: number;
    name: string;
    email: string;
    phone: string;
    reservation_date: string; // Date string from backend
    reservation_time: string; // Time string from backend
    guest_count: number;
    branch_key: string;
    message?: string | null;
    consent: boolean;
    status: 'pending' | 'confirmed' | 'cancelled';
    received_at: string; // DateTime string from backend
}

const Reservations = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Rezervasyonları Çekme ---
  const fetchReservations = useCallback(async () => {
      if (!token) {
          setError("Yetkilendirme token'ı bulunamadı.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/reservations/`; 

          const response = await fetch(apiUrl, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
          if (!response.ok) {
              let errorMsg = t('adminReservations.errors.fetchFailed', 'Rezervasyonlar yüklenemedi.');
              try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch (e) { /* ignore */ }
              throw new Error(errorMsg);
          }
          const data: Reservation[] = await response.json();
          // Tarihe göre sırala (en yeni başta)
          data.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
          setReservations(data);
      } catch (err: any) {
          console.error("Error fetching reservations:", err);
          setError(err.message || t('adminReservations.errors.fetchFailed', 'Rezervasyonlar yüklenemedi.'));
      } finally {
          setLoading(false);
      }
  }, [token, t]);

  useEffect(() => {
      fetchReservations();
  }, [fetchReservations]);

  // --- Durum Güncelleme --- 
  const handleUpdateStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
     if (!token) return;
     // Belirli bir satır için loading state yönetilebilir veya genel loading kullanılabilir
     const originalStatus = reservations.find(r => r.id === id)?.status;
     // Optimistic UI update
     setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));

     try {
         const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/reservations/${id}`;

         const response = await fetch(apiUrl, {
             method: 'PATCH',
             headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ status }),
         });

         if (!response.ok) {
              // Optimistic update'i geri al
             if(originalStatus) {
                 setReservations(prev => prev.map(r => r.id === id ? { ...r, status: originalStatus } : r));
             }
             let errorMsg = t('adminReservations.errors.updateFailed', 'Durum güncellenemedi.');
             try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch (e) { /* ignore */ }
             throw new Error(errorMsg);
         }
         // Başarılı - state zaten güncellendi (veya fetchReservations() tekrar çağrılabilir)
         toast({
            title: t('adminReservations.updateSuccessTitle', 'Başarılı'),
            description: t('adminReservations.updateSuccessDesc', 'Rezervasyon durumu güncellendi.'),
         });

     } catch (err: any) {
         console.error("Error updating reservation status:", err);
         setError(err.message || t('adminReservations.errors.updateFailed', 'Durum güncellenemedi.'));
          // Optimistic update'i geri al (hata durumunda)
         if(originalStatus) {
             setReservations(prev => prev.map(r => r.id === id ? { ...r, status: originalStatus } : r));
         }
     }
  };


  // Function to format date and time (optional)
  const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), 'dd/MM/yyyy');
    } catch { return 'N/A'; }
  };
   const formatTime = (timeString: string) => {
     // Backend HH:MM:SS gönderiyorsa sadece HH:MM alabiliriz
     return timeString ? timeString.substring(0, 5) : 'N/A';
   };


  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t('adminReservations.title', 'Rezervasyon Talepleri')}</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
           <AlertCircle className="mr-2 h-5 w-5" />
           <span>{error}</span>
           <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Kapat</Button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <Table>
          <TableCaption>{t('adminReservations.caption', 'Son rezervasyon talepleri listesi.')}</TableCaption>
          <TableHeader>
            <TableRow className="bg-accent-beige hover:bg-accent-beige/90">
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.name', 'Ad Soyad')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.contact', 'İletişim')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.branch', 'Şube')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.date', 'Tarih')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.time', 'Saat')}</TableHead>
              <TableHead className="text-right text-primary-red font-semibold">{t('adminReservations.guests', 'Kişi Sayısı')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.status', 'Durum')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminReservations.message', 'Mesaj')}</TableHead>
              <TableHead className="text-right text-primary-red font-semibold">{t('adminReservations.actions', 'İşlemler')}</TableHead> { /* Yeni Sütun */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
                <TableRow><TableCell colSpan={9} className="text-center">{t('common.loading', 'Yükleniyor...')}</TableCell></TableRow>
            )}
            {!loading && reservations.length === 0 && (
                 <TableRow><TableCell colSpan={9} className="text-center">{t('adminReservations.noReservations', 'Bekleyen veya geçmiş rezervasyon bulunmuyor.')}</TableCell></TableRow>
            )}
            {!loading && reservations.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.name}</TableCell>
                <TableCell>
                  <div>{res.email}</div>
                  <div>{res.phone}</div>
                  </TableCell>
                {/* branch_key yerine slug gösterilebilir veya backend'den gelen branch name */}
                <TableCell>{res.branch_key}</TableCell> 
                <TableCell>{formatDate(res.reservation_date)}</TableCell>
                <TableCell>{formatTime(res.reservation_time)}</TableCell>
                <TableCell className="text-right">{res.guest_count}</TableCell>
                 <TableCell>
                   <Badge
                     variant={res.status === 'confirmed' ? 'default' : res.status === 'cancelled' ? 'destructive' : 'secondary'}
                     // Shadcn UI Badge variantları (success, destructive) kullanılabilir veya özel stil
                     // className={...} 
                    >
                     {t(`adminReservations.status_${res.status}`, res.status)}
                   </Badge>
                 </TableCell>
                 <TableCell>
                   {res.message ? (
                     <Accordion type="single" collapsible className="w-full max-w-xs"> 
                       <AccordionItem value="item-1" className="border-b-0">
                         <AccordionTrigger className="p-0 hover:no-underline text-left text-sm font-normal">
                            {res.message.length > 30 ? res.message.substring(0, 30) + '...' : res.message}
                         </AccordionTrigger>
                         <AccordionContent className="pt-2 text-sm">
                           {res.message}
                         </AccordionContent>
                       </AccordionItem>
                     </Accordion>
                   ) : (
                     <span className="text-gray-400">-</span>
                   )}
                 </TableCell>
                  {/* İşlemler Sütunu */}
                 <TableCell className="text-right">
                    {res.status === 'pending' && (
                        <div className="space-x-1">
                           <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                           >
                               <Check className="h-4 w-4" />
                           </Button>
                           <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                            >
                               <X className="h-4 w-4" />
                           </Button>
                        </div>
                    )}
                    {/* Diğer durumlar için belki başka işlemler? */}
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Reservations; 