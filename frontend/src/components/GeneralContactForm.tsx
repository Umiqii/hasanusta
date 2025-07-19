import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavLink } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

// Re-using branch keys from ContactForm (consider moving to a shared location later)
const branchKeys = [
  "kurttepe",
  "barajyolu",
  "kosuyolu",
  "ankara"
];

const GeneralContactForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", // Telefon opsiyonel olabilir, şimdilik ekliyoruz
    topic: "", 
    message: "",
    consent: false
  });
  const [selectedBranchKey, setSelectedBranchKey] = useState(branchKeys[0]); // State for selected branch
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTopicSelectChange = (value: string) => { // Renamed for clarity
    setFormData(prev => ({ ...prev, topic: value }));
  };

  const handleBranchSelectChange = (value: string) => { // Handler for branch select
    setSelectedBranchKey(value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
        setSubmitError(t('validation.consentRequired', 'Devam etmek için onay kutusunu işaretlemelisiniz.'));
        return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    // Backend'e gönderilecek payload (MessageCreate şemasına uygun)
    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.topic, // topic -> subject
      message: formData.message,
      branch_key: selectedBranchKey, // Added branch_key
    };


    try {
        // Prepend the VITE_API_BASE_URL (ensure this var is correct, might be VITE_API_URL)
        const apiUrl = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/v1/messages/`; 

        const response = await fetch(apiUrl, { // Public endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
             let errorMsg = t('generalContactForm.errors.submitFailed', 'Mesaj gönderilemedi.');
              try {
                  const errorData = await response.json();
                   if (errorData.detail) {
                       if (Array.isArray(errorData.detail)) {
                          errorMsg = errorData.detail.map((err: any) => `${err.loc.join(' -> ')}: ${err.msg}`).join(', ');
                       } else {
                          errorMsg = String(errorData.detail);
                       }
                   } 
              } catch (e) { console.error("Could not parse error response:", e); }
             throw new Error(errorMsg);
        }

        // Başarılı gönderim
        toast({
            title: t('generalContactForm.successTitle', 'Mesajınız Gönderildi'),
            description: t('generalContactForm.successMessage', 'Mesajınız başarıyla bize ulaştı. En kısa sürede geri dönüş yapacağız.'),
        });

        // Formu sıfırla
        setFormData({
          name: "",
          email: "",
          phone: "",
          topic: "", 
          message: "",
          consent: false
        });
        setSelectedBranchKey(branchKeys[0]); // Reset branch selection

    } catch (err: any) {
        console.error("Error submitting contact form:", err);
        setSubmitError(err.message || t('generalContactForm.errors.submitFailed', 'Mesaj gönderilemedi.'));
    } finally {
        setIsSubmitting(false);
    }

  };

  return (
    // section padding yok, Contact.tsx içinde yönetilecek
    <div className="w-full"> 
      <div className="w-full bg-accent-beige rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit}>
          {submitError && (
             <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center text-sm">
               <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
               <span>{submitError}</span>
               <Button variant="ghost" size="sm" onClick={() => setSubmitError(null)} className="ml-auto p-1 h-auto">x</Button>
             </div>
           )}
          
          {/* Şube Seçimi Eklendi */}
          <div className="mb-6">
            <label htmlFor="general-branch" className="block mb-2 text-sm font-medium">
              {t('contactForm.branchLabel', 'Şube Seçin')} {/* Reuse translation key */}
            </label>
            <Select onValueChange={handleBranchSelectChange} value={selectedBranchKey} required>
              <SelectTrigger id="general-branch" className="bg-light-gray">
                <SelectValue placeholder={t('careersPage.branchPlaceholder', 'Şube Seçiniz')} /> 
              </SelectTrigger>
              <SelectContent className="bg-white">
                {branchKeys.map(key => (
                  <SelectItem key={key} value={key}>
                    {t(`locationsSection.${key}`)} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="general-name" className="block mb-2 text-sm font-medium">
                {t('generalContactForm.nameLabel')}
              </label>
              <Input
                id="general-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('generalContactForm.namePlaceholder')}
                className="bg-light-gray"
                required
              />
            </div>
            
            <div>
              <label htmlFor="general-email" className="block mb-2 text-sm font-medium">
                {t('generalContactForm.emailLabel')}
              </label>
              <Input
                id="general-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('generalContactForm.emailPlaceholder')}
                className="bg-light-gray"
                required
              />
            </div>
            
            <div>
              <label htmlFor="general-phone" className="block mb-2 text-sm font-medium">
                {t('generalContactForm.phoneLabel')}
              </label>
              <Input
                id="general-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('generalContactForm.phonePlaceholder')}
                className="bg-light-gray"
              />
            </div>
            
            <div>
              <label htmlFor="general-topic" className="block mb-2 text-sm font-medium">
                {t('generalContactForm.topicLabel')}
              </label>
              <Select onValueChange={handleTopicSelectChange} value={formData.topic} required> {/* Changed handler */}
                <SelectTrigger id="general-topic" className="bg-light-gray">
                  <SelectValue placeholder={t('generalContactForm.topicPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="general">{t('generalContactForm.topicOptionGeneral')}</SelectItem>
                  <SelectItem value="suggestion">{t('generalContactForm.topicOptionSuggestion')}</SelectItem>
                  <SelectItem value="complaint">{t('generalContactForm.topicOptionComplaint')}</SelectItem>
                  <SelectItem value="other">{t('generalContactForm.topicOptionOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="general-message" className="block mb-2 text-sm font-medium">
              {t('generalContactForm.messageLabel')}
            </label>
            <Textarea
              id="general-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('generalContactForm.messagePlaceholder')}
              className="h-32 bg-light-gray"
              required 
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-start">
              <input 
                id="general-consent" 
                name="consent" 
                type="checkbox" 
                checked={formData.consent}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-red border-gray-300 rounded focus:ring-primary-red mt-0.5"
                required
              />
              <label htmlFor="general-consent" className="ml-2 block text-sm">
                <Trans i18nKey="contactForm.consentLabel" 
                       components={[
                         <NavLink key="privacy-link" to="/privacy-policy" className="underline text-primary-red hover:text-red-700" />
                       ]}
                />
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-red hover:bg-red-700 text-white"
            disabled={isSubmitting || !formData.consent}
          >
            {isSubmitting ? t('common.submitting', 'Gönderiliyor...') : t('generalContactForm.submitButton')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GeneralContactForm; 