import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, QrCode as QrCodeIcon, Edit, Trash2, PlusCircle, Eye, AlertCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from "@/components/ui/badge";

// Import the shared config from BranchSettings
import { linkSettingsConfig } from '@/pages/admin/BranchSettings';

// Backend'den gelen veri yapısına uygun interface
// (api.md'deki ManagedTableRead şemasına göre)
interface TableData {
  id: number;
  table_number: number; // Backend'den gelen alan adı
  link: string; // Ana QR linki (backend'den gelecek)
  overridden_links?: Record<string, string> | null; // JSON alanı için tip
  override_main_qr_link?: string | null; // Ana QR linkini override etmek için alan
  branch_id: number; // Şube ID'si
}

// Düzenleme için kullanılan state (Backend'e gönderilecek ManagedTableUpdate şemasına benzer)
interface EditingTableState {
    id: number;
    table_number: number; // Belki bu güncellenmez ama state'de tutulabilir
    override_main_qr_link?: string | null;
    overridden_links?: Record<string, string> | null;
}

// Link ayarları tipi (BranchSettings'den alınabilir veya burada tanımlanabilir)
// const linkSettingsConfig: Record<string, { label: string; icon: string }> = {
//   order: { label: 'Sipariş Ver', icon: 'shopping-cart' },
//   feedback: { label: 'Geri Bildirim', icon: 'message-circle' },
//   instagram: { label: 'Instagram', icon: 'instagram' },
// };

const TableManagement = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth(); // Auth context'ten token ve kullanıcı alındı
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set());
  const [editingTable, setEditingTable] = useState<EditingTableState | null>(null);
  const [qrCodeTable, setQrCodeTable] = useState<TableData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Ekleme modalı state'i

  // --- API Çağrısı Fonksiyonu ---
  const fetchTablesData = useCallback(async () => {
    if (!token) {
        setError("Yetkilendirme token'ı bulunamadı.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Prepend VITE_API_URL and add /v1
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/tables/`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMsg = t('adminTables.errors.fetchFailed', 'Masalar yüklenemedi.');
        try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorMsg;
        } catch(e) { /* JSON parse hatası ignore edilir */ }
        throw new Error(errorMsg);
      }
      const data: TableData[] = await response.json();
      // Gelen veriyi sırala (isteğe bağlı)
      data.sort((a, b) => a.table_number - b.table_number);
      setTables(data);
    } catch (err: any) {
      console.error("Error fetching tables:", err);
      setError(err.message || t('adminTables.errors.fetchFailed', 'Masalar yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, [token, t]); // useCallback bağımlılıkları

  // Verileri ilk yükleme
  useEffect(() => {
    fetchTablesData();
  }, [fetchTablesData]); // useEffect bağımlılığı

  // Arama işlemi (frontend tarafında filtreleme)
  const filteredTables = tables.filter(table =>
    table.table_number.toString().includes(searchTerm)
  );

  // Seçim işlemleri (değişiklik yok)
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedTables(new Set(filteredTables.map(t => t.id)));
    } else {
      setSelectedTables(new Set());
    }
  };

  const handleSelectRow = (tableId: number, checked: boolean) => {
    setSelectedTables(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(tableId);
      } else {
        newSet.delete(tableId);
      }
      return newSet;
    });
  };

  // --- Masa Güncelleme ---
  const handleUpdateTableSettings = async () => {
    if (!editingTable || !token) return;
    setError(null);

    // Backend'e gönderilecek veri (ManagedTableUpdate şemasına uygun)
    const updatePayload = {
        override_main_qr_link: editingTable.override_main_qr_link,
        overridden_links: editingTable.overridden_links,
        // table_number backend'de güncellenmiyor, göndermeye gerek yok
    };

    try {
        // Prepend VITE_API_URL and add /v1
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/tables/${editingTable.id}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ detail: t('adminTables.errors.updateFailed', 'Masa güncellenemedi.') }));
            throw new Error(errorData.detail || t('adminTables.errors.updateFailed', 'Masa güncellenemedi.'));
        }

        const updatedTable: TableData = await response.json();

        // State'i güncelle
        setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
        setEditingTable(null); // Modalı kapatmak için
        // Başarı mesajı gösterilebilir (örn: toast notification)


    } catch (err: any) {
        console.error("Error updating table:", err);
        setError(err.message || t('adminTables.errors.updateFailed', 'Masa güncellenemedi.'));
    }
  };

   // Link override state güncellemeleri
  const handleOverrideLinkChange = (key: string, value: string) => {
     if (!editingTable) return;
     setEditingTable(prev => {
         if (!prev) return null; // Type safety
         const newOverriddenLinks = { ...(prev.overridden_links || {}) };
         if (value) {
             newOverriddenLinks[key] = value;
         } else {
             delete newOverriddenLinks[key]; // Boşsa override'ı kaldır
         }
         return {
             ...prev,
             overridden_links: newOverriddenLinks,
         };
     });
  };

  const handleMainQrLinkOverrideChange = (value: string) => {
     if (!editingTable) return;
     setEditingTable(prev => (prev ? {
        ...prev,
        override_main_qr_link: value || null, // Boşsa null yap
     } : null));
  };

  // --- Toplu Silme ---
  const handleBulkDelete = async () => {
    if (selectedTables.size === 0 || !token) return;
    setError(null);
    const idsToDelete = Array.from(selectedTables);

    try {
        // Prepend VITE_API_URL and add /v1
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/tables/bulk`;

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table_ids: idsToDelete }),
        });

         if (!response.ok) {
             const errorData = await response.json().catch(() => ({ detail: t('adminTables.errors.deleteFailed', 'Masalar silinemedi.') }));
            throw new Error(errorData.detail || t('adminTables.errors.deleteFailed', 'Masalar silinemedi.'));
        }

        // Başarılı silme sonrası state'i güncelle
        setTables(prev => prev.filter(t => !idsToDelete.includes(t.id)));
    setSelectedTables(new Set());
    // Başarı mesajı gösterilebilir

    } catch (err: any) {
        console.error("Error deleting tables:", err);
        setError(err.message || t('adminTables.errors.deleteFailed', 'Masalar silinemedi.'));
    }
  };

  // --- Toplu Ekleme ---
  const handleBulkAdd = async (start: number, end: number) => {
      if (!token || start <= 0 || end < start) {
          setError(t('adminTables.errors.invalidRange', 'Geçersiz masa numarası aralığı.'));
          return;
      }
      setError(null);
      setIsAddModalOpen(false); // Modalı kapat

      try {
          // Prepend VITE_API_URL and add /v1
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/admin/tables/bulk`;

          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ start_number: start, end_number: end }),
          });

          if (!response.ok) {
             const errorData = await response.json().catch(() => ({ detail: t('adminTables.errors.addFailed', 'Masalar eklenemedi.') }));
            // Belki var olan masalar için özel bir hata mesajı vardır?
            if (response.status === 409) { // Conflict (örnek durum)
                 throw new Error(errorData.detail || t('adminTables.errors.addConflict', 'Bazı masa numaraları zaten mevcut.'));
            }
            throw new Error(errorData.detail || t('adminTables.errors.addFailed', 'Masalar eklenemedi.'));
          }

          // Başarılı ekleme sonrası state'i güncelle (veya hepsini tekrar fetch et)
          await fetchTablesData();
          // Başarı mesajı gösterilebilir

      } catch (err: any) {
        console.error("Error adding tables:", err);
        setError(err.message || t('adminTables.errors.addFailed', 'Masalar eklenemedi.'));
  }
  };

  // --- QR Kod Gösterme ---
  const handleViewQrClick = (table: TableData) => {
    setQrCodeTable(table);
  }

  const handleQrModalOpenChange = (open: boolean) => {
     if (!open) {
         setQrCodeTable(null);
     }
  }

  // --- Düzenleme Modalı İçin Veri Hazırlama ---
  const openEditModal = (table: TableData) => {
      setEditingTable({
          id: table.id,
          table_number: table.table_number,
          override_main_qr_link: table.override_main_qr_link,
          overridden_links: table.overridden_links
      });
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t('adminTables.title', 'Masa Yönetimi')}</h1>

      {/* Hata Gösterimi */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
           <AlertCircle className="mr-2 h-5 w-5" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Kapat</Button>
        </div>
      )}

      {/* Masa Yönetimi */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{t('adminTables.manageTables', 'Masaları Yönet')}</h2>
        <div className="flex flex-wrap gap-4 mb-4">
           {/* Arama */}
           <div className="relative flex-grow max-w-xs">
             <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input
               placeholder={t('adminTables.searchPlaceholder', 'Masa No Ara...')}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-8"
               disabled={loading} // Yüklenirken arama pasif
             />
           </div>

           {/* Toplu İşlemler */}
           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}> {/* Toplu Ekleme Modalı */}
             <DialogTrigger asChild>
               <Button variant="outline" disabled={loading}><PlusCircle className="mr-2 h-4 w-4" /> {t('adminTables.bulkAdd', 'Toplu Ekle')}</Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>{t('adminTables.bulkAddTitle', 'Toplu Masa Ekle')}</DialogTitle>
                 <DialogDescription>
                   {t('adminTables.bulkAddDesc', 'Eklenecek masa numarası aralığını girin.')}
                 </DialogDescription>
               </DialogHeader>
               {/* Form içeriği onSubmit ile yönetilebilir */}
               <form onSubmit={(e) => {
                   e.preventDefault();
                   const startInput = e.currentTarget.elements.namedItem('startNum') as HTMLInputElement;
                   const endInput = e.currentTarget.elements.namedItem('endNum') as HTMLInputElement;
                   const start = parseInt(startInput?.value || '0');
                   const end = parseInt(endInput?.value || '0');
                   handleBulkAdd(start, end);
               }}>
               <div className="grid grid-cols-2 gap-4 py-4">
                   <Input id="startNum" name="startNum" type="number" placeholder={t('adminTables.startNum', 'Başlangıç No')} min="1" required />
                   <Input id="endNum" name="endNum" type="number" placeholder={t('adminTables.endNum', 'Bitiş No')} min="1" required />
               </div>
               <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">{t('common.cancel','İptal')}</Button>
                 </DialogClose>
                   <Button type="submit" disabled={loading}>{loading ? t('common.adding', 'Ekleniyor...') : t('common.add', 'Ekle')}</Button>
               </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>

            {/* Toplu Silme Onay Modalı (DÜZELTİLDİ) */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button
                   variant="destructive"
                   disabled={selectedTables.size === 0 || loading}
                 >
                   <Trash2 className="mr-2 h-4 w-4" />
                   {t('adminTables.bulkDelete', 'Seçili ({count}) Masayı Sil', { count: selectedTables.size })}
                 </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('common.confirmationTitle', 'Emin misiniz?')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('adminTables.deleteConfirmMsg', '{count} adet masayı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.', { count: selectedTables.size })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', 'İptal')}</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button onClick={handleBulkDelete} disabled={loading}>
                      {loading ? t('common.deleting', 'Siliniyor...') : t('common.deleteConfirm', 'Evet, Sil')}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

        </div>

        {/* Masa Listesi */}
        {loading && !error && <p>{t('common.loading', 'Yükleniyor...')}</p>}
        {!loading && !error && tables.length === 0 && <p>{t('adminTables.noTables', 'Henüz yönetilecek masa bulunmuyor.')}</p>}
        {!loading && !error && tables.length > 0 && (
          <Table>
            <TableCaption>{t('adminTables.tableCaption', 'Yönetilen masaların listesi.')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTables.size === filteredTables.length && filteredTables.length > 0}
                    onCheckedChange={handleSelectAll}
                     aria-label="Tümünü Seç"
                  />
                </TableHead>
                <TableHead className="w-[100px]">{t('adminTables.tableNumber', 'Masa No')}</TableHead>
                <TableHead>{t('adminTables.qrCodeLink', 'QR Kod Linki')}</TableHead>
                <TableHead>{t('adminTables.customLinks', 'Özelleştirilmiş Linkler')}</TableHead>
                <TableHead className="text-right">{t('adminTables.actions', 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => (
                <TableRow key={table.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTables.has(table.id)}
                     onCheckedChange={(checked) => handleSelectRow(table.id, !!checked)}
                     aria-label={`Masa ${table.table_number} Seç`}
                      />
                    </TableCell>
                  <TableCell className="font-medium">{table.table_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                      <a href={table.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {table.link}
                       </a>
                        {table.override_main_qr_link && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('adminTables.overridden','Özel')}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {table.overridden_links && Object.keys(table.overridden_links).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(table.overridden_links).map(key => {
                            const config = linkSettingsConfig.find(c => c.key === key);
                            return config ? (
                              <Badge key={key} variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                <img src={`/lovable-uploads/${config.icon}`} alt="" className="w-3 h-3" />
                                <span>{config.label}</span>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">{t('adminTables.noCustomLinks', 'Yok')}</span>
                      )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                     {/* QR Kod Gösterme */}
                     <Dialog open={qrCodeTable?.id === table.id} onOpenChange={handleQrModalOpenChange}>
                        <DialogTrigger asChild>
                         <Button variant="outline" size="icon" onClick={() => handleViewQrClick(table)}>
                           <QrCodeIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                           <DialogTitle>{t('adminTables.qrCodeTitle', 'Masa {number} QR Kodu', { number: qrCodeTable?.table_number })}</DialogTitle>
                            </DialogHeader>
                         {qrCodeTable && (
                            <div className="py-4 flex flex-col items-center justify-center">
                              {qrCodeTable.link ? (
                                <>
                                  <QRCodeSVG value={qrCodeTable.link} size={256} includeMargin={true}/>
                                  <div className="mt-4 text-center">
                                    <a 
                                      href={qrCodeTable.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span>Linki Açmak İçin Tıklayın</span>
                                    </a>
                                  </div>
                                </>
                              ) : <p className='text-red-500'>{t('adminTables.noLinkForQr', 'Bu masa için link tanımlanmamış.')}</p>}
                            </div>
                          )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="secondary">{t('common.close', 'Kapat')}</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                      </Dialog>

                    {/* Düzenleme Modalı */}
                      <Dialog open={editingTable?.id === table.id} onOpenChange={(open) => !open && setEditingTable(null)}>
                         <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={() => openEditModal(table)}>
                           <Edit className="h-4 w-4" />
                         </Button>
                         </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                           <DialogTitle>{t('adminTables.editTitle', 'Masa {number} Ayarlarını Düzenle', { number: editingTable?.table_number })}</DialogTitle>
                                  <DialogDescription>
                                {t('adminTables.editDesc', 'Masa için varsayılan linkleri veya ana QR kod linkini geçersiz kılın.')}
                                  </DialogDescription>
                              </DialogHeader>
                         <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                             {/* Ana QR Link Override */}
                             <div>
                                 <Label htmlFor="overrideMainLink">{t('adminTables.overrideMainQrLink', 'Ana QR Linkini Geçersiz Kıl')}</Label>
                                 <Input
                                     id="overrideMainLink"
                                     value={editingTable?.override_main_qr_link || ''}
                                     onChange={(e) => handleMainQrLinkOverrideChange(e.target.value)}
                                     placeholder={t('adminTables.overrideMainQrPlaceholder', 'Örn: https://ozelmenu.com/masa{no}', { no: editingTable?.table_number })}
                                 />
                                  <p className="text-xs text-gray-500">{t('adminTables.overrideMainQrHint', 'Boş bırakırsanız varsayılan link kullanılır.')}</p>
                             </div>
                             <hr/>
                             {/* Diğer Link Override'ları (Uses imported config now) */}
                             <h3 className="text-lg font-semibold">{t('adminTables.overrideOtherLinks', 'Diğer Linkleri Geçersiz Kıl')}</h3>
                             {linkSettingsConfig.map(({ key, label, icon }) => (
                                 <div key={key} className="flex items-center gap-2">
                                     <div className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm">
                                         <img src={`/lovable-uploads/${icon}`} alt="" className="w-5 h-5" />
                                     </div>
                                     <Label htmlFor={`override-${key}`} className="w-40 flex-shrink-0">{label}</Label>
                                     <Input
                                         id={`override-${key}`}
                                         value={editingTable?.overridden_links?.[key] || ''}
                                         onChange={(e) => handleOverrideLinkChange(key, e.target.value)}
                                         placeholder={t('adminTables.overrideOtherPlaceholder', 'Varsayılanı kullanmak için boş bırakın')}
                                         />
                                         {editingTable?.overridden_links?.[key] && (
                                           <a href={editingTable.overridden_links[key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                             <Eye className="h-4 w-4" />
                                           </a>
                                         )}
                                      </div>
                                   ))}
                               </div>
                              <DialogFooter>
                                 <DialogClose asChild>
                                     <Button type="button" variant="secondary">{t('common.cancel', 'İptal')}</Button>
                                 </DialogClose>
                            {/* handleUpdateTableSettings çağrısı */}
                           <Button onClick={handleUpdateTableSettings} disabled={loading}>
                               {loading ? t('common.saving', 'Kaydediliyor...') : t('common.saveChanges', 'Değişiklikleri Kaydet')}
                            </Button>
                              </DialogFooter>
                         </DialogContent>
                      </Dialog>

                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
};

export default TableManagement; 