import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "react-router-dom";
import { UploadCloud, AlertCircle } from "lucide-react";
import { useTranslation, Trans } from 'react-i18next';

// Re-using branch keys from ContactForm (consider moving to a shared location later)
const branchKeys = [
  "kurttepe",
  "barajyolu",
  "kosuyolu",
  "ankara"
];

const Careers = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    branch_key: "",
    department: "",
    experience_years: "",
    message: "",
    privacy_policy_accepted: false
  });
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    } else {
      setCvFile(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacy_policy_accepted) {
       setSubmitError(t('validation.consentRequired', 'Devam etmek için onay kutusunu işaretlemelisiniz.'));
       return;
    }
     if (!cvFile) {
       setSubmitError(t('validation.cvRequired', 'Lütfen CV dosyanızı seçin.'));
       return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('email', formData.email);
    dataToSend.append('phone', formData.phone);
    dataToSend.append('birthdate', formData.birthdate);
    dataToSend.append('branch_key', formData.branch_key);
    dataToSend.append('department', formData.department);
    dataToSend.append('experience_years', formData.experience_years || '0');
    dataToSend.append('message', formData.message);
    dataToSend.append('privacy_policy_accepted', String(formData.privacy_policy_accepted));
    dataToSend.append('cv_file', cvFile);



    try {
      // Prepend the VITE_API_URL
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/applications/`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: dataToSend, // FormData is sent directly, Content-Type is set by browser
      });

      if (!response.ok) {
        let errorMsg = t('careersPage.errors.submitFailed', 'Başvuru gönderilemedi.');
        try {
          const errorData = await response.json();
          if (errorData.detail) {
             if (Array.isArray(errorData.detail)) {
                errorMsg = errorData.detail.map((err: any) => `${err.loc.join(' -> ')}: ${err.msg}`).join(', ');
             } else {
                errorMsg = String(errorData.detail);
             }
          } 
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        throw new Error(errorMsg);
      }

      toast({
        title: t('careersPage.toastSuccessTitle', 'Başvurunuz Alındı'),
        description: t('careersPage.toastSuccessDescription', 'Başvurunuz başarıyla gönderildi. Değerlendirme sonrası sizinle iletişime geçeceğiz.'),
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        birthdate: "",
        branch_key: "",
        department: "",
        experience_years: "",
        message: "",
        privacy_policy_accepted: false
      });
      setCvFile(null);
      const fileInput = document.getElementById('cv') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = "";
      }

    } catch (err: any) {
      console.error("Error submitting application form:", err);
      setSubmitError(err.message || t('careersPage.errors.submitFailed', 'Başvuru gönderilemedi.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 py-12">
        <SectionTitle 
          title={t('careersPage.pageTitle')}
          subtitle={t('careersPage.pageSubtitle')}
        />

        <div className="max-w-3xl mx-auto bg-accent-beige rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-serif font-bold mb-6">
            {t('careersPage.formTitle')}
          </h3>
          
          {submitError && (
             <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center text-sm">
               <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
               <span>{submitError}</span>
                <Button variant="ghost" size="sm" onClick={() => setSubmitError(null)} className="ml-auto p-1 h-auto">x</Button>
             </div>
           )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 text-sm font-medium">
                    {t('careersPage.nameLabel')}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-light-gray"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-1 text-sm font-medium">
                    {t('careersPage.emailLabel')}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-light-gray"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block mb-1 text-sm font-medium">
                    {t('careersPage.phoneLabel')}
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="bg-light-gray"
                  />
                </div>
                
                <div>
                  <label htmlFor="birthdate" className="block mb-1 text-sm font-medium">
                    {t('careersPage.birthdateLabel')}
                  </label>
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleChange}
                    required
                    className="bg-light-gray"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="branch_key" className="block mb-1 text-sm font-medium">
                    {t('careersPage.branchLabel', 'Başvurulacak Şube')}
                  </label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('branch_key', value)} 
                    value={formData.branch_key} 
                    required
                  >
                    <SelectTrigger className="bg-light-gray">
                      <SelectValue placeholder={t('careersPage.branchPlaceholder', 'Şube Seçiniz')} />
                    </SelectTrigger>
                    <SelectContent>
                      {branchKeys.map(key => (
                        <SelectItem key={key} value={key}>
                          {t(`locationsSection.${key}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="department" className="block mb-1 text-sm font-medium">
                    {t('careersPage.departmentLabel')}
                  </label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('department', value)} 
                    value={formData.department}
                    required
                  >
                    <SelectTrigger className="bg-light-gray">
                      <SelectValue placeholder={t('careersPage.departmentPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kitchen">{t('careersPage.kitchenOption')}</SelectItem>
                      <SelectItem value="service">{t('careersPage.serviceOption')}</SelectItem>
                      <SelectItem value="management">{t('careersPage.managementOption')}</SelectItem>
                      <SelectItem value="cleaning">{t('careersPage.cleaningOption')}</SelectItem>
                      <SelectItem value="other">{t('careersPage.otherOption')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="experience_years" className="block mb-1 text-sm font-medium">
                    {t('careersPage.experienceLabel')}
                  </label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={handleChange}
                    min="0"
                    required
                    className="bg-light-gray"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-1 text-sm font-medium">
                    {t('careersPage.messageLabel')}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="h-24 bg-light-gray"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="cv" className="block mb-1 text-sm font-medium">
                {t('careersPage.cvLabel')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="cv"
                  name="cv_file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  required
                />
                <label htmlFor="cv" className="cursor-pointer flex flex-col items-center justify-center">
                  <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">
                    {cvFile ? cvFile.name : t('careersPage.cvUploadText')}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {cvFile ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : t('careersPage.cvUploadHelp')}
                  </span>
                  {!cvFile && (
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      {t('careersPage.cvUploadButton')}
                    </Button>
                  )}
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-start">
                <input 
                  id="privacyPolicy" 
                  name="privacy_policy_accepted"
                  type="checkbox"
                  checked={formData.privacy_policy_accepted}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary-red border-gray-300 rounded focus:ring-primary-red mt-0.5"
                  required
                />
                <label htmlFor="privacyPolicy" className="ml-2 block text-sm">
                  <Trans i18nKey="careersPage.consentLabel"
                         components={[
                           <NavLink key="privacy-link" to="/privacy-policy" className="underline text-primary-red hover:text-red-700" />
                         ]}
                  />
                </label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary-red hover:bg-red-700 text-white mt-6"
              disabled={isSubmitting || !formData.privacy_policy_accepted || !cvFile}
            >
              {isSubmitting ? t('common.submitting', 'Gönderiliyor...') : t('careersPage.submitButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Careers;
