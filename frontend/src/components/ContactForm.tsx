import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";

const branchKeys = [
  "kurttepe",
  "barajyolu",
  "kosuyolu",
  "ankara"
];

const ContactForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    time: "",
    guests: "",
    message: "",
    consent: false
  });
  const [selectedBranchKey, setSelectedBranchKey] = useState(branchKeys[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
       setSubmitError(t('validation.dateRequired', 'Lütfen bir tarih seçin.'));
       return;
    }
     if (!formData.consent) {
       setSubmitError(t('validation.consentRequired', 'Devam etmek için onay kutusunu işaretlemelisiniz.'));
       return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      reservation_date: format(date, 'yyyy-MM-dd'),
      reservation_time: formData.time,
      guest_count: parseInt(formData.guests, 10),
      branch_key: selectedBranchKey,
      message: formData.message,
      consent: formData.consent,
    };



     try {
        // Prepend the VITE_API_URL and ensure correct API path
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/reservations/`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
             let errorMsg = t('contactForm.errors.submitFailed', 'Rezervasyon gönderilemedi.');
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

        toast({
            title: t('contactForm.successTitle', 'Rezervasyon Talebiniz Alındı'),
            description: t('contactForm.successMessage', 'Rezervasyon talebiniz başarıyla alındı. Onay için sizinle iletişime geçeceğiz.'),
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          time: "",
          guests: "",
          message: "",
          consent: false
        });
        setDate(undefined);
        setSelectedBranchKey(branchKeys[0]);

    } catch (err: any) {
        console.error("Error submitting reservation form:", err);
        setSubmitError(err.message || t('contactForm.errors.submitFailed', 'Rezervasyon gönderilemedi.'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-accent-beige rounded-lg shadow-lg p-8">
           {submitError && (
             <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center text-sm">
               <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
               <span>{submitError}</span>
                <Button variant="ghost" size="sm" onClick={() => setSubmitError(null)} className="ml-auto p-1 h-auto">x</Button>
             </div>
           )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="branch" className="block mb-2 text-sm font-medium">
                {t('contactForm.branchLabel')}
              </label>
              <select
                id="branch"
                name="branch"
                value={selectedBranchKey}
                onChange={e => setSelectedBranchKey(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red bg-light-gray"
                required
              >
                {branchKeys.map(key => (
                  <option key={key} value={key}>
                    {t(`locationsSection.${key}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium">
                  {t('contactForm.nameLabel')}
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('contactForm.namePlaceholder')}
                  className="bg-light-gray"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium">
                  {t('contactForm.emailLabel')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('contactForm.emailPlaceholder')}
                  className="bg-light-gray"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium">
                  {t('contactForm.phoneLabel')}
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('contactForm.phonePlaceholder')}
                  className="bg-light-gray"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block mb-2 text-sm font-medium">
                  {t('contactForm.dateLabel')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-light-gray",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : t('contactForm.datePlaceholder')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label htmlFor="time" className="block mb-2 text-sm font-medium">
                  {t('contactForm.timeLabel')}
                </label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder={t('contactForm.timePlaceholder')}
                  className="bg-light-gray"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="guests" className="block mb-2 text-sm font-medium">
                  {t('contactForm.guestsLabel')}
                </label>
                <Input
                  id="guests"
                  name="guests"
                  type="number"
                  value={formData.guests}
                  onChange={handleChange}
                  placeholder={t('contactForm.guestsPlaceholder')}
                  min="1"
                  className="bg-light-gray"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block mb-2 text-sm font-medium">
                {t('contactForm.messageLabel')}
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contactForm.messagePlaceholder')}
                className="h-32 bg-light-gray"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-start">
                <input 
                  id="consent" 
                  name="consent" 
                  type="checkbox" 
                  checked={formData.consent}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary-red border-gray-300 rounded focus:ring-primary-red mt-0.5"
                  required
                />
                <label htmlFor="consent" className="ml-2 block text-sm">
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
              disabled={isSubmitting || !formData.consent || !date}
            >
              {isSubmitting ? t('common.submitting', 'Gönderiliyor...') : t('contactForm.submitButton')}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
