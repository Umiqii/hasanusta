import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

// Backend'den gelen ApplicationRead şemasına uygun interface
interface Application {
    id: number;
    name: string;
    email: string;
    phone: string;
    birthdate: string; // Date string
    branch_key: string;
    department: string;
    experience_years: number;
    message?: string | null;
    privacy_policy_accepted: boolean;
    cv_file_path: string; // Backend dosya yolu
    submitted_at: string; // DateTime string
}

const Applications = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingCvId, setDownloadingCvId] = useState<number | null>(null);

  // --- Başvuruları Çekme ---
  const fetchApplications = useCallback(async () => {
      if (!token) {
          setError("Yetkilendirme token'ı bulunamadı.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
          // Use VITE_API_URL instead of VITE_API_BASE_URL
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/applications/`;

          const response = await fetch(apiUrl, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
          if (!response.ok) {
              let errorMsg = t('adminApplications.errors.fetchFailed', 'Başvurular yüklenemedi.');
              try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch (e) { /* ignore */ }
              throw new Error(errorMsg);
          }
          const data: Application[] = await response.json();
          // Tarihe göre sırala (en yeni başta)
          data.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
          setApplications(data);
      } catch (err: any) {
          console.error("Error fetching applications:", err);
          setError(err.message || t('adminApplications.errors.fetchFailed', 'Başvurular yüklenemedi.'));
      } finally {
          setLoading(false);
      }
  }, [token, t]);

  useEffect(() => {
      fetchApplications();
  }, [fetchApplications]);

  // --- CV İndirme --- 
  const handleDownloadCv = async (applicationId: number, cvPath: string) => {
      if (!token) return;
      setDownloadingCvId(applicationId); // İndirme state'ini ayarla
      setError(null);

      try {
          // Use VITE_API_URL instead of VITE_API_BASE_URL
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/applications/cv/${applicationId}`;

          const response = await fetch(apiUrl, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              let errorMsg = t('adminApplications.errors.downloadFailed', 'CV indirilemedi.');
              try {
                  const errorData = await response.json();
                  errorMsg = errorData.detail || errorMsg;
              } catch (e) { /* ignore */ }
              throw new Error(errorMsg);
          }

          const blob = await response.blob();
          const filename = cvPath.split('/').pop() || `cv_${applicationId}.unknown`; // Basit dosya adı çıkarma
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url); // URL'i serbest bırak

      } catch (err: any) {
          console.error("Error downloading CV:", err);
           toast({ // Hata mesajını toast ile göster
              variant: "destructive",
              title: t('common.error', 'Hata'),
              description: err.message || t('adminApplications.errors.downloadFailed', 'CV indirilemedi.'),
           });
          // setError(err.message || t('adminApplications.errors.downloadFailed', 'CV indirilemedi.'));
      } finally {
          setDownloadingCvId(null);
      }
  };

  const formatSubmittedDate = (dateString: string) => {
      try {
          return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
      } catch {
          return 'N/A';
      }
  };

  const getFileNameFromPath = (path: string) => {
      return path.split('/').pop() || path; // Basitçe son kısmı al
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t('adminApplications.title', 'İş Başvuruları')}</h1>

       {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
           <AlertCircle className="mr-2 h-5 w-5" />
           <span>{error}</span>
           <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Kapat</Button>
        </div>
      )}

       <div className="bg-white p-6 rounded-lg shadow-md">
        <Table>
          <TableCaption>{t('adminApplications.caption', 'Son iş başvuruları listesi.')}</TableCaption>
          <TableHeader>
            <TableRow className="bg-accent-beige hover:bg-accent-beige/90">
              <TableHead className="text-primary-red font-semibold">{t('adminApplications.name', 'Ad Soyad')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminApplications.contact', 'İletişim')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminApplications.branch', 'Şube')}</TableHead>
              <TableHead className="text-primary-red font-semibold">{t('adminApplications.department', 'Departman')}</TableHead>
              <TableHead className="text-right text-primary-red font-semibold">{t('adminApplications.experience', 'Deneyim (Yıl)')}</TableHead>
               <TableHead className="text-primary-red font-semibold">{t('adminApplications.submittedDate', 'Başvuru Tarihi')}</TableHead>
               <TableHead className="text-primary-red font-semibold">{t('adminApplications.cv', 'CV')}</TableHead>
               <TableHead className="text-primary-red font-semibold">{t('adminApplications.message', 'Mesaj')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading && (
                <TableRow><TableCell colSpan={8} className="text-center">{t('common.loading', 'Yükleniyor...')}</TableCell></TableRow>
             )}
             {!loading && applications.length === 0 && (
                 <TableRow><TableCell colSpan={8} className="text-center">{t('adminApplications.noApplications', 'Henüz iş başvurusu bulunmuyor.')}</TableCell></TableRow>
             )}
             {!loading && applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.name}</TableCell>
                 <TableCell>
                  <div>{app.email}</div>
                  <div>{app.phone}</div>
                </TableCell>
                 <TableCell>{app.branch_key}</TableCell>
                <TableCell>{app.department}</TableCell>
                <TableCell className="text-right">{app.experience_years}</TableCell>
                 <TableCell>{formatSubmittedDate(app.submitted_at)}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadCv(app.id, app.cv_file_path)}
                    disabled={downloadingCvId === app.id}
                   >
                    <Download className="mr-2 h-4 w-4" />
                    {downloadingCvId === app.id ? t('common.downloading', 'İndiriliyor...') : getFileNameFromPath(app.cv_file_path)}
                  </Button>
                </TableCell>
                <TableCell>
                  {app.message ? (
                    <Accordion type="single" collapsible className="w-full max-w-xs">
                      <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="p-0 hover:no-underline text-left text-sm font-normal">
                           {app.message.length > 30 ? app.message.substring(0, 30) + '...' : app.message}
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 text-sm">
                          {app.message}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Applications; 