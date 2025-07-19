import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string: string | null | undefined) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Backend'den gelen MessageRead şemasına uygun interface
interface Message {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    received_at: string; // DateTime string from backend
}

const GeneralMessages = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Mesajları Çekme ---
  const fetchMessages = useCallback(async () => {
      if (!token) {
          setError("Yetkilendirme token'ı bulunamadı.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
          // Use VITE_API_URL instead of VITE_API_BASE_URL
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/messages/`;

          const response = await fetch(apiUrl, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
          if (!response.ok) {
              let errorMsg = t('adminMessages.errors.fetchFailed', 'Mesajlar yüklenemedi.');
              try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch (e) { /* ignore */ }
              throw new Error(errorMsg);
          }
          const data: Message[] = await response.json();
           // Tarihe göre sırala (en yeni başta)
          data.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
          setMessages(data);
      } catch (err: any) {
          console.error("Error fetching messages:", err);
          setError(err.message || t('adminMessages.errors.fetchFailed', 'Mesajlar yüklenemedi.'));
      } finally {
          setLoading(false);
      }
  }, [token, t]);

  useEffect(() => {
      fetchMessages();
  }, [fetchMessages]);

   const formatReceivedDate = (dateString: string) => {
      try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
      } catch {
        return 'N/A';
      }
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t('adminMessages.title', 'Genel Mesajlar')}</h1>

       {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
           <AlertCircle className="mr-2 h-5 w-5" />
           <span>{error}</span>
           <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Kapat</Button>
        </div>
      )}

       <div className="bg-white p-6 rounded-lg shadow-md">
        <Table>
           <TableCaption>{t('adminMessages.caption', 'Genel iletişim formu aracılığıyla gönderilen mesajlar.')}</TableCaption>
          <TableHeader>
            <TableRow className="bg-accent-beige hover:bg-accent-beige/90">
              <TableHead className="text-primary-red font-semibold">{t('adminMessages.sender', 'Gönderen')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminMessages.phone', 'Telefon')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminMessages.subject', 'Konu')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminMessages.receivedDate', 'Alınma Tarihi')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminMessages.message', 'Mesaj')}</TableHead>
              {/* Optional: Actions */}
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading && (
                <TableRow><TableCell colSpan={5} className="text-center">{t('common.loading', 'Yükleniyor...')}</TableCell></TableRow>
             )}
             {!loading && messages.length === 0 && (
                 <TableRow><TableCell colSpan={5} className="text-center">{t('adminMessages.noMessages', 'Henüz mesaj bulunmuyor.')}</TableCell></TableRow>
             )}
             {!loading && messages.map((msg) => (
              <TableRow key={msg.id}>
                 <TableCell>
                   <div className="font-medium">{msg.name}</div>
                   <div className="text-sm text-muted-foreground">{msg.email}</div>
                 </TableCell>
                 <TableCell>{msg.phone || '-'}</TableCell>
                <TableCell>{t(`generalContactForm.topicOption${capitalizeFirstLetter(msg.subject)}`, msg.subject)}</TableCell>
                 <TableCell>{formatReceivedDate(msg.received_at)}</TableCell>
                <TableCell>
                   {/* Use Accordion for long messages */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="p-0 hover:no-underline text-left text-sm font-normal">
                         {msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 text-sm">
                        {msg.message}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
       </div>
    </AdminLayout>
  );
};

export default GeneralMessages; 