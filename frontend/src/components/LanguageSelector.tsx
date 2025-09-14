import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

interface LanguageSelectorProps { value: string; onChange: (value: string) => void; languages?: string[]; placeholder?: string; className?: string;}

const languageData = [
  { value: "English", label: "🇺🇸 English", flag: "🇺🇸" },
  { value: "Hindi", label: "🇮🇳 Hindi", flag: "🇮🇳" },
  { value: "Sanskrit", label: "🕉️ Sanskrit", flag: "🕉️" },
];

export default function LanguageSelector({ 
  value, 
  onChange, 
  languages = ['English', 'Hindi', 'Sanskrit'],
  placeholder = "Select language",
  className = "" 
}: LanguageSelectorProps) {
  const availableLanguages = languageData.filter(lang => languages.includes(lang.value));

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value} className="py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.value}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}