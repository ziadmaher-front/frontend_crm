import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { countries, extractCountryFromPhone, removeCountryCode, formatPhoneNumber, getFlagImageUrl } from "@/utils/countries";
import { egyptAreaCodes, extractAreaCodeFromPhone, removeAreaCodeFromPhone, formatEgyptianPhone } from "@/utils/egyptAreaCodes";

const PhoneInput = ({
  value = "",
  onChange,
  countryCode: initialCountryCode = "EG",
  onCountryChange,
  required = false,
  label,
  placeholder = "Enter phone number",
  className = "",
  id,
  name,
  useEgyptianAreaCodes = false,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState(initialCountryCode);
  const [selectedAreaCode, setSelectedAreaCode] = useState("02"); // Default to Cairo
  const [phoneNumber, setPhoneNumber] = useState("");

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      if (useEgyptianAreaCodes) {
        // Check if value already contains area code
        const area = extractAreaCodeFromPhone(value);
        if (area) {
          setSelectedAreaCode(area.code);
          setPhoneNumber(removeAreaCodeFromPhone(value));
        } else {
          // Value doesn't have area code, use current selected area
          setPhoneNumber(value);
        }
      } else {
        // Check if value already contains country code
        const country = extractCountryFromPhone(value);
        if (country) {
          setSelectedCountryCode(country.code);
          setPhoneNumber(removeCountryCode(value));
        } else {
          // Value doesn't have country code, use current selected country
          setPhoneNumber(value);
        }
      }
    } else {
      setPhoneNumber("");
    }
  }, [value, useEgyptianAreaCodes]);

  // Update selected country code when prop changes
  useEffect(() => {
    if (initialCountryCode) {
      setSelectedCountryCode(initialCountryCode);
    }
  }, [initialCountryCode]);

  const handleCountryChange = (newCountryCode) => {
    setSelectedCountryCode(newCountryCode);
    const selectedCountry = countries.find((c) => c.code === newCountryCode);
    
    if (onCountryChange) {
      onCountryChange(newCountryCode, selectedCountry);
    }
    
    // Update parent with new full phone number
    if (onChange && phoneNumber) {
      const fullNumber = formatPhoneNumber(phoneNumber, selectedCountry);
      onChange(fullNumber);
    }
  };

  const handleAreaCodeChange = (newAreaCode) => {
    setSelectedAreaCode(newAreaCode);
    
    // Update parent with new full phone number
    if (onChange && phoneNumber) {
      const fullNumber = formatEgyptianPhone(phoneNumber, newAreaCode);
      onChange(fullNumber);
    }
  };

  const handlePhoneChange = (e) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    
    // Update parent with full phone number
    if (onChange) {
      if (useEgyptianAreaCodes) {
        const fullNumber = formatEgyptianPhone(newPhoneNumber, selectedAreaCode);
        onChange(fullNumber);
      } else {
        const selectedCountry = countries.find((c) => c.code === selectedCountryCode);
        const fullNumber = formatPhoneNumber(newPhoneNumber, selectedCountry);
        onChange(fullNumber);
      }
    }
  };

  const selectedCountry = countries.find((c) => c.code === selectedCountryCode) || countries[0];
  const selectedArea = egyptAreaCodes.find((a) => a.code === selectedAreaCode) || egyptAreaCodes[0];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id || name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        {useEgyptianAreaCodes ? (
          /* Egyptian Area Code Selector */
          <Select value={selectedAreaCode} onValueChange={handleAreaCodeChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedArea.code}</span>
                  <span className="text-xs text-gray-500">({selectedArea.area})</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {egyptAreaCodes.map((area) => (
                <SelectItem key={area.code} value={area.code}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{area.code}</span>
                      <span className="text-xs text-gray-500">{area.area}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-4">{area.exampleIntl}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          /* Country Code Selector */
          <Select value={selectedCountryCode} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <img 
                    src={getFlagImageUrl(selectedCountry.code, 20)} 
                    alt={selectedCountry.name}
                    className="w-5 h-4 object-cover rounded"
                    onError={(e) => {
                      // Fallback to a default flag or hide on error
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-sm">{selectedCountry.dialCode}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-2">
                    <img 
                      src={getFlagImageUrl(country.code, 20)} 
                      alt={country.name}
                      className="w-5 h-4 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-sm">{country.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{country.dialCode}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Phone Number Input */}
        <Input
          id={id}
          name={name}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default PhoneInput;

