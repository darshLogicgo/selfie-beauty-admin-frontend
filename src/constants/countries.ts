// Countries list with full name and short name (ISO 3166-1 alpha-2 codes)
export interface Country {
  fullName: string;
  shortName: string;
}

export const COUNTRIES: Country[] = [
  { fullName: "All Countries", shortName: "allCountry" },
  { fullName: "Afghanistan", shortName: "AF" },
  { fullName: "Åland Islands", shortName: "AX" },
  { fullName: "Albania", shortName: "AL" },
  { fullName: "Algeria", shortName: "DZ" },
  { fullName: "American Samoa", shortName: "AS" },
  { fullName: "Andorra", shortName: "AD" },
  { fullName: "Angola", shortName: "AO" },
  { fullName: "Anguilla", shortName: "AI" },
  { fullName: "Antarctica", shortName: "AQ" },
  { fullName: "Antigua and Barbuda", shortName: "AG" },
  { fullName: "Argentina", shortName: "AR" },
  { fullName: "Armenia", shortName: "AM" },
  { fullName: "Aruba", shortName: "AW" },
  { fullName: "Australia", shortName: "AU" },
  { fullName: "Austria", shortName: "AT" },
  { fullName: "Azerbaijan", shortName: "AZ" },
  { fullName: "Bahamas", shortName: "BS" },
  { fullName: "Bahrain", shortName: "BH" },
  { fullName: "Bangladesh", shortName: "BD" },
  { fullName: "Barbados", shortName: "BB" },
  { fullName: "Belarus", shortName: "BY" },
  { fullName: "Belgium", shortName: "BE" },
  { fullName: "Belize", shortName: "BZ" },
  { fullName: "Benin", shortName: "BJ" },
  { fullName: "Bermuda", shortName: "BM" },
  { fullName: "Bhutan", shortName: "BT" },
  { fullName: "Bolivia", shortName: "BO" },
  { fullName: "Bonaire, Sint Eustatius and Saba", shortName: "BQ" },
  { fullName: "Bosnia and Herzegovina", shortName: "BA" },
  { fullName: "Botswana", shortName: "BW" },
  { fullName: "Bouvet Island", shortName: "BV" },
  { fullName: "Brazil", shortName: "BR" },
  { fullName: "British Indian Ocean Territory", shortName: "IO" },
  { fullName: "Brunei Darussalam", shortName: "BN" },
  { fullName: "Bulgaria", shortName: "BG" },
  { fullName: "Burkina Faso", shortName: "BF" },
  { fullName: "Burundi", shortName: "BI" },
  { fullName: "Cabo Verde", shortName: "CV" },
  { fullName: "Cambodia", shortName: "KH" },
  { fullName: "Cameroon", shortName: "CM" },
  { fullName: "Canada", shortName: "CA" },
  { fullName: "Cayman Islands", shortName: "KY" },
  { fullName: "Central African Republic", shortName: "CF" },
  { fullName: "Chad", shortName: "TD" },
  { fullName: "Chile", shortName: "CL" },
  { fullName: "China", shortName: "CN" },
  { fullName: "Christmas Island", shortName: "CX" },
  { fullName: "Cocos (Keeling) Islands", shortName: "CC" },
  { fullName: "Colombia", shortName: "CO" },
  { fullName: "Comoros", shortName: "KM" },
  { fullName: "Congo", shortName: "CG" },
  { fullName: "Congo, Democratic Republic of the", shortName: "CD" },
  { fullName: "Cook Islands", shortName: "CK" },
  { fullName: "Costa Rica", shortName: "CR" },
  { fullName: "Côte d'Ivoire", shortName: "CI" },
  { fullName: "Croatia", shortName: "HR" },
  { fullName: "Cuba", shortName: "CU" },
  { fullName: "Curaçao", shortName: "CW" },
  { fullName: "Cyprus", shortName: "CY" },
  { fullName: "Czechia", shortName: "CZ" },
  { fullName: "Denmark", shortName: "DK" },
  { fullName: "Djibouti", shortName: "DJ" },
  { fullName: "Dominica", shortName: "DM" },
  { fullName: "Dominican Republic", shortName: "DO" },
  { fullName: "Ecuador", shortName: "EC" },
  { fullName: "Egypt", shortName: "EG" },
  { fullName: "El Salvador", shortName: "SV" },
  { fullName: "Equatorial Guinea", shortName: "GQ" },
  { fullName: "Eritrea", shortName: "ER" },
  { fullName: "Estonia", shortName: "EE" },
  { fullName: "Eswatini", shortName: "SZ" },
  { fullName: "Ethiopia", shortName: "ET" },
  { fullName: "Falkland Islands (Malvinas)", shortName: "FK" },
  { fullName: "Faroe Islands", shortName: "FO" },
  { fullName: "Fiji", shortName: "FJ" },
  { fullName: "Finland", shortName: "FI" },
  { fullName: "France", shortName: "FR" },
  { fullName: "French Guiana", shortName: "GF" },
  { fullName: "French Polynesia", shortName: "PF" },
  { fullName: "French Southern Territories", shortName: "TF" },
  { fullName: "Gabon", shortName: "GA" },
  { fullName: "Gambia", shortName: "GM" },
  { fullName: "Georgia", shortName: "GE" },
  { fullName: "Germany", shortName: "DE" },
  { fullName: "Ghana", shortName: "GH" },
  { fullName: "Gibraltar", shortName: "GI" },
  { fullName: "Greece", shortName: "GR" },
  { fullName: "Greenland", shortName: "GL" },
  { fullName: "Grenada", shortName: "GD" },
  { fullName: "Guadeloupe", shortName: "GP" },
  { fullName: "Guam", shortName: "GU" },
  { fullName: "Guatemala", shortName: "GT" },
  { fullName: "Guernsey", shortName: "GG" },
  { fullName: "Guinea", shortName: "GN" },
  { fullName: "Guinea-Bissau", shortName: "GW" },
  { fullName: "Guyana", shortName: "GY" },
  { fullName: "Haiti", shortName: "HT" },
  { fullName: "Heard Island and McDonald Islands", shortName: "HM" },
  { fullName: "Holy See", shortName: "VA" },
  { fullName: "Honduras", shortName: "HN" },
  { fullName: "Hong Kong", shortName: "HK" },
  { fullName: "Hungary", shortName: "HU" },
  { fullName: "Iceland", shortName: "IS" },
  { fullName: "India", shortName: "IN" },
  { fullName: "Indonesia", shortName: "ID" },
  { fullName: "Iran", shortName: "IR" },
  { fullName: "Iraq", shortName: "IQ" },
  { fullName: "Ireland", shortName: "IE" },
  { fullName: "Isle of Man", shortName: "IM" },
  { fullName: "Israel", shortName: "IL" },
  { fullName: "Italy", shortName: "IT" },
  { fullName: "Jamaica", shortName: "JM" },
  { fullName: "Japan", shortName: "JP" },
  { fullName: "Jersey", shortName: "JE" },
  { fullName: "Jordan", shortName: "JO" },
  { fullName: "Kazakhstan", shortName: "KZ" },
  { fullName: "Kenya", shortName: "KE" },
  { fullName: "Kiribati", shortName: "KI" },
  { fullName: "Korea, Democratic People's Republic of", shortName: "KP" },
  { fullName: "Korea, Republic of", shortName: "KR" },
  { fullName: "Kuwait", shortName: "KW" },
  { fullName: "Kyrgyzstan", shortName: "KG" },
  { fullName: "Lao People's Democratic Republic", shortName: "LA" },
  { fullName: "Latvia", shortName: "LV" },
  { fullName: "Lebanon", shortName: "LB" },
  { fullName: "Lesotho", shortName: "LS" },
  { fullName: "Liberia", shortName: "LR" },
  { fullName: "Libya", shortName: "LY" },
  { fullName: "Liechtenstein", shortName: "LI" },
  { fullName: "Lithuania", shortName: "LT" },
  { fullName: "Luxembourg", shortName: "LU" },
  { fullName: "Macao", shortName: "MO" },
  { fullName: "Madagascar", shortName: "MG" },
  { fullName: "Malawi", shortName: "MW" },
  { fullName: "Malaysia", shortName: "MY" },
  { fullName: "Maldives", shortName: "MV" },
  { fullName: "Mali", shortName: "ML" },
  { fullName: "Malta", shortName: "MT" },
  { fullName: "Marshall Islands", shortName: "MH" },
  { fullName: "Martinique", shortName: "MQ" },
  { fullName: "Mauritania", shortName: "MR" },
  { fullName: "Mauritius", shortName: "MU" },
  { fullName: "Mayotte", shortName: "YT" },
  { fullName: "Mexico", shortName: "MX" },
  { fullName: "Micronesia", shortName: "FM" },
  { fullName: "Moldova", shortName: "MD" },
  { fullName: "Monaco", shortName: "MC" },
  { fullName: "Mongolia", shortName: "MN" },
  { fullName: "Montenegro", shortName: "ME" },
  { fullName: "Montserrat", shortName: "MS" },
  { fullName: "Morocco", shortName: "MA" },
  { fullName: "Mozambique", shortName: "MZ" },
  { fullName: "Myanmar", shortName: "MM" },
  { fullName: "Namibia", shortName: "NA" },
  { fullName: "Nauru", shortName: "NR" },
  { fullName: "Nepal", shortName: "NP" },
  { fullName: "Netherlands", shortName: "NL" },
  { fullName: "New Caledonia", shortName: "NC" },
  { fullName: "New Zealand", shortName: "NZ" },
  { fullName: "Nicaragua", shortName: "NI" },
  { fullName: "Niger", shortName: "NE" },
  { fullName: "Nigeria", shortName: "NG" },
  { fullName: "Niue", shortName: "NU" },
  { fullName: "Norfolk Island", shortName: "NF" },
  { fullName: "North Macedonia", shortName: "MK" },
  { fullName: "Northern Mariana Islands", shortName: "MP" },
  { fullName: "Norway", shortName: "NO" },
  { fullName: "Oman", shortName: "OM" },
  { fullName: "Pakistan", shortName: "PK" },
  { fullName: "Palau", shortName: "PW" },
  { fullName: "Palestine, State of", shortName: "PS" },
  { fullName: "Panama", shortName: "PA" },
  { fullName: "Papua New Guinea", shortName: "PG" },
  { fullName: "Paraguay", shortName: "PY" },
  { fullName: "Peru", shortName: "PE" },
  { fullName: "Philippines", shortName: "PH" },
  { fullName: "Pitcairn", shortName: "PN" },
  { fullName: "Poland", shortName: "PL" },
  { fullName: "Portugal", shortName: "PT" },
  { fullName: "Puerto Rico", shortName: "PR" },
  { fullName: "Qatar", shortName: "QA" },
  { fullName: "Réunion", shortName: "RE" },
  { fullName: "Romania", shortName: "RO" },
  { fullName: "Russian Federation", shortName: "RU" },
  { fullName: "Rwanda", shortName: "RW" },
  { fullName: "Saint Barthélemy", shortName: "BL" },
  { fullName: "Saint Helena, Ascension and Tristan da Cunha", shortName: "SH" },
  { fullName: "Saint Kitts and Nevis", shortName: "KN" },
  { fullName: "Saint Lucia", shortName: "LC" },
  { fullName: "Saint Martin (French part)", shortName: "MF" },
  { fullName: "Saint Pierre and Miquelon", shortName: "PM" },
  { fullName: "Saint Vincent and the Grenadines", shortName: "VC" },
  { fullName: "Samoa", shortName: "WS" },
  { fullName: "San Marino", shortName: "SM" },
  { fullName: "Sao Tome and Principe", shortName: "ST" },
  { fullName: "Saudi Arabia", shortName: "SA" },
  { fullName: "Senegal", shortName: "SN" },
  { fullName: "Serbia", shortName: "RS" },
  { fullName: "Seychelles", shortName: "SC" },
  { fullName: "Sierra Leone", shortName: "SL" },
  { fullName: "Singapore", shortName: "SG" },
  { fullName: "Sint Maarten (Dutch part)", shortName: "SX" },
  { fullName: "Slovakia", shortName: "SK" },
  { fullName: "Slovenia", shortName: "SI" },
  { fullName: "Solomon Islands", shortName: "SB" },
  { fullName: "Somalia", shortName: "SO" },
  { fullName: "South Africa", shortName: "ZA" },
  { fullName: "South Georgia and the South Sandwich Islands", shortName: "GS" },
  { fullName: "South Sudan", shortName: "SS" },
  { fullName: "Spain", shortName: "ES" },
  { fullName: "Sri Lanka", shortName: "LK" },
  { fullName: "Sudan", shortName: "SD" },
  { fullName: "Suriname", shortName: "SR" },
  { fullName: "Svalbard and Jan Mayen", shortName: "SJ" },
  { fullName: "Sweden", shortName: "SE" },
  { fullName: "Switzerland", shortName: "CH" },
  { fullName: "Syrian Arab Republic", shortName: "SY" },
  { fullName: "Taiwan", shortName: "TW" },
  { fullName: "Tajikistan", shortName: "TJ" },
  { fullName: "Tanzania", shortName: "TZ" },
  { fullName: "Thailand", shortName: "TH" },
  { fullName: "Timor-Leste", shortName: "TL" },
  { fullName: "Togo", shortName: "TG" },
  { fullName: "Tokelau", shortName: "TK" },
  { fullName: "Tonga", shortName: "TO" },
  { fullName: "Trinidad and Tobago", shortName: "TT" },
  { fullName: "Tunisia", shortName: "TN" },
  { fullName: "Turkey", shortName: "TR" },
  { fullName: "Turkmenistan", shortName: "TM" },
  { fullName: "Turks and Caicos Islands", shortName: "TC" },
  { fullName: "Tuvalu", shortName: "TV" },
  { fullName: "Uganda", shortName: "UG" },
  { fullName: "Ukraine", shortName: "UA" },
  { fullName: "United Arab Emirates", shortName: "AE" },
  { fullName: "United Kingdom", shortName: "GB" },
  { fullName: "United States of America", shortName: "US" },
  { fullName: "United States Minor Outlying Islands", shortName: "UM" },
  { fullName: "Uruguay", shortName: "UY" },
  { fullName: "Uzbekistan", shortName: "UZ" },
  { fullName: "Vanuatu", shortName: "VU" },
  { fullName: "Venezuela", shortName: "VE" },
  { fullName: "Viet Nam", shortName: "VN" },
  { fullName: "Virgin Islands, British", shortName: "VG" },
  { fullName: "Virgin Islands, U.S.", shortName: "VI" },
  { fullName: "Wallis and Futuna", shortName: "WF" },
  { fullName: "Western Sahara", shortName: "EH" },
  { fullName: "Yemen", shortName: "YE" },
  { fullName: "Zambia", shortName: "ZM" },
  { fullName: "Zimbabwe", shortName: "ZW" },
];

/**
 * Helper function to get country shortName from database value
 * Handles both shortName (e.g., "SA", "IN", "US") and fullName (backward compatibility)
 * Also handles common abbreviations like "UAE", "USA", etc.
 */
export const getCountryShortName = (countryValue: string | undefined | null): string => {
  if (!countryValue || !countryValue.trim()) return "";
  
  const trimmedValue = countryValue.trim().toUpperCase();
  
  // Map common abbreviations to ISO codes
  const abbreviationMap: Record<string, string> = {
    "UAE": "AE", // United Arab Emirates
    "USA": "US", // United States of America
    "UK": "GB",  // United Kingdom
    "PAK": "PK", // Pakistan (common abbreviation)
    "PR": "PR",  // Puerto Rico (already ISO)
  };
  
  // Check if it's a common abbreviation
  if (abbreviationMap[trimmedValue]) {
    return abbreviationMap[trimmedValue];
  }
  
  // Check if it's already a shortName (ISO code)
  const country = COUNTRIES.find(
    (c) => c.shortName.toUpperCase() === trimmedValue
  );
  if (country) return country.shortName;
  
  // Check if it's a fullName (backward compatibility)
  const countryByFullName = COUNTRIES.find(
    (c) => c.fullName.toLowerCase() === countryValue.trim().toLowerCase()
  );
  if (countryByFullName) return countryByFullName.shortName;
  
  // If not found, return the original value (might be a custom value)
  return countryValue.trim();
};

/**
 * Helper function to get country full name from shortName
 */
export const getCountryFullName = (shortName: string | undefined | null): string => {
  if (!shortName || !shortName.trim()) return "";
  
  // Handle special case for "allCountry"
  if (shortName.trim() === "allCountry") {
    return "All Countries";
  }
  
  const country = COUNTRIES.find(
    (c) => c.shortName.toUpperCase() === shortName.trim().toUpperCase()
  );
  return country ? country.fullName : shortName.trim();
};

