import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "nav.home": "Home",
    "nav.menu": "Menu",
    "nav.cart": "Cart",
    "nav.dashboard": "Dashboard",
    "nav.login": "Login",
    "nav.logout": "Log out",
    "nav.profile": "Profile",
    "nav.orders": "Orders",
    "footer.about": "About Us",
    "footer.contact": "Contact Us",
    "footer.careers": "Careers",
    "footer.security": "Security",
    "footer.terms": "Terms & Conditions",
    "footer.hours": "Hours",
    "footer.support": "Support",
    "footer.social": "Social",
    "footer.quicklinks": "Quick Links",
    "footer.rights": "All rights reserved.",
    "footer.tagline": "Brewing moments of joy, one cup at a time. Authentic flavors, premium ingredients.",
    "cart.add": "Add",
    "cart.items": "items",
    "cart.bestseller": "Best Seller",
    "contact.title": "Contact Us",
    "contact.desc": "Send us a message and we'll respond shortly.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.sending": "Sending...",
    "security.title": "Security First",
    "terms.title": "Terms & Conditions"
  },
  hi: {
    "nav.home": "मुख्य पृष्ठ",
    "nav.menu": "मेन्यू",
    "nav.cart": "कार्ट",
    "nav.dashboard": "डैशबोर्ड",
    "nav.login": "लॉगिन",
    "nav.logout": "लॉग आउट",
    "nav.profile": "प्रोफाइल",
    "nav.orders": "ऑर्डर",
    "footer.about": "हमारे बारे में",
    "footer.contact": "संपर्क करें",
    "footer.careers": "करियर",
    "footer.security": "सुरक्षा",
    "footer.terms": "नियम और शर्तें",
    "footer.hours": "समय",
    "footer.support": "सहायता",
    "footer.social": "सोशल",
    "footer.quicklinks": "त्वरित लिंक",
    "footer.rights": "सर्वाधिकार सुरक्षित।",
    "footer.tagline": "खुशी के पल बुनना, एक समय में एक कप। प्रामाणिक स्वाद, प्रीमियम सामग्री।",
    "cart.add": "जोड़ें",
    "cart.items": "आइटम",
    "cart.bestseller": "बेस्ट सेलर",
    "contact.title": "संपर्क करें",
    "contact.desc": "हमें एक संदेश भेजें और हम जल्द ही जवाब देंगे।",
    "contact.name": "नाम",
    "contact.email": "ईमेल",
    "contact.message": "संदेश",
    "contact.send": "संदेश भेजें",
    "contact.sending": "भेज रहा है...",
    "security.title": "सुरक्षा पहले",
    "terms.title": "नियम और शर्तें"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
