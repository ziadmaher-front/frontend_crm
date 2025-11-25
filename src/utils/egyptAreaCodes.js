// Egyptian area/city codes for phone numbers
export const egyptAreaCodes = [
  { area: "Cairo / Giza / Qalyubia", code: "02", example: "02-xxxx-xxxx", exampleIntl: "+20-2-xxxx-xxxx" },
  { area: "Alexandria", code: "03", example: "03-xxx-xxxx", exampleIntl: "+20-3-xxx-xxxx" },
  { area: "Port Said", code: "066", example: "066-xxx-xxxx", exampleIntl: "+20-66-xxx-xxxx" },
  { area: "Suez", code: "062", example: "062-xxx-xxxx", exampleIntl: "+20-62-xxx-xxxx" },
  { area: "Ismailia", code: "064", example: "064-xxx-xxxx", exampleIntl: "+20-64-xxx-xxxx" },
  { area: "Damietta", code: "057", example: "057-xxx-xxxx", exampleIntl: "+20-57-xxx-xxxx" },
  { area: "Zagazig", code: "055", example: "055-xxx-xxxx", exampleIntl: "+20-55-xxx-xxxx" },
  { area: "Tanta", code: "040", example: "040-xxx-xxxx", exampleIntl: "+20-40-xxx-xxxx" },
  { area: "Mansoura", code: "050", example: "050-xxx-xxxx", exampleIntl: "+20-50-xxx-xxxx" },
  { area: "Damanhur", code: "045", example: "045-xxx-xxxx", exampleIntl: "+20-45-xxx-xxxx" },
  { area: "Kafr El Sheikh", code: "047", example: "047-xxx-xxxx", exampleIntl: "+20-47-xxx-xxxx" },
  { area: "Beni Suef", code: "082", example: "082-xxx-xxxx", exampleIntl: "+20-82-xxx-xxxx" },
  { area: "Faiyum", code: "084", example: "084-xxx-xxxx", exampleIntl: "+20-84-xxx-xxxx" },
  { area: "Minya", code: "086", example: "086-xxx-xxxx", exampleIntl: "+20-86-xxx-xxxx" },
  { area: "Asyut", code: "088", example: "088-xxx-xxxx", exampleIntl: "+20-88-xxx-xxxx" },
  { area: "Sohag", code: "093", example: "093-xxx-xxxx", exampleIntl: "+20-93-xxx-xxxx" },
  { area: "Qena", code: "096", example: "096-xxx-xxxx", exampleIntl: "+20-96-xxx-xxxx" },
  { area: "Luxor", code: "095", example: "095-xxx-xxxx", exampleIntl: "+20-95-xxx-xxxx" },
  { area: "Aswan", code: "097", example: "097-xxx-xxxx", exampleIntl: "+20-97-xxx-xxxx" },
  { area: "Hurghada", code: "065", example: "065-xxx-xxxx", exampleIntl: "+20-65-xxx-xxxx" },
  { area: "Sharm El Sheikh", code: "069", example: "069-xxx-xxxx", exampleIntl: "+20-69-xxx-xxxx" },
  { area: "Marsa Matruh", code: "046", example: "046-xxx-xxxx", exampleIntl: "+20-46-xxx-xxxx" },
];

// Helper function to format Egyptian phone number
export const formatEgyptianPhone = (phoneNumber, areaCode) => {
  if (!phoneNumber) return "";
  
  // Remove any existing formatting
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");
  
  // If phone already starts with +20, return as is
  if (cleaned.startsWith("+20")) {
    return cleaned;
  }
  
  // If area code provided, format as +20-[area code]-[number]
  if (areaCode) {
    const area = areaCode.replace(/^0/, ""); // Remove leading 0 if present
    return `+20-${area}-${cleaned}`;
  }
  
  return phoneNumber;
};

// Extract area code from Egyptian phone number
export const extractAreaCodeFromPhone = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Check if it's in format +20-[area code]-[number]
  const match = phoneNumber.match(/^\+20-?(\d{1,3})/);
  if (match) {
    const areaCode = match[1];
    return egyptAreaCodes.find(area => area.code === `0${areaCode}` || area.code === areaCode);
  }
  
  // Check if it starts with 0[area code]
  const match2 = phoneNumber.match(/^0(\d{1,3})/);
  if (match2) {
    const areaCode = `0${match2[1]}`;
    return egyptAreaCodes.find(area => area.code === areaCode);
  }
  
  return null;
};

// Remove area code from phone number
export const removeAreaCodeFromPhone = (phoneNumber) => {
  if (!phoneNumber) return "";
  
  const area = extractAreaCodeFromPhone(phoneNumber);
  if (area) {
    // Remove +20-[area code]- or 0[area code]
    const cleaned = phoneNumber.replace(/^\+20-?\d{1,3}-?/, "").replace(/^0\d{1,3}-?/, "");
    return cleaned;
  }
  
  return phoneNumber;
};

