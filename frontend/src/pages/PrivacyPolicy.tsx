import React from "react";
import SectionTitle from "@/components/SectionTitle";
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const currentDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'en' ? 'en-US' : 'tr-TR');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl pt-32">
      <SectionTitle 
        title={t('privacyPage.pageTitle')}
        subtitle={t('privacyPage.pageSubtitle')}
      />
      
      <div className="prose prose-lg mt-8">
        <p>{t('privacyPage.introP1')}</p>
        <p>{t('privacyPage.introP2')}</p>
        
        <h2>{t('privacyPage.h2')}</h2>
        
        <ol className="list-decimal space-y-4">
          <li>{t('privacyPage.listItem1')}</li>
          <li>{t('privacyPage.listItem2')}</li>
          <li>{t('privacyPage.listItem3')}</li>
          <li>{t('privacyPage.listItem4')}</li>
          <li>{t('privacyPage.listItem5')}</li>
          <li>{t('privacyPage.listItem6')}</li>
          <li>{t('privacyPage.listItem7')}</li>
          <li>{t('privacyPage.listItem8')}</li>
          <li>{t('privacyPage.listItem9')}</li>
          <li>{t('privacyPage.listItem10')}</li>
          <li>{t('privacyPage.listItem11')}</li>
          <li>{t('privacyPage.listItem12')}</li>
          <li>{t('privacyPage.listItem13')}</li>
          <li>{t('privacyPage.listItem14')}</li>
          <li>{t('privacyPage.listItem15')}</li>
        </ol>
        
        <p className="mt-8 text-sm text-gray-500">
          {t('privacyPage.lastUpdated', { date: currentDate })}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 