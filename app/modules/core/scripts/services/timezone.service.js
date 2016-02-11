(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('TimezoneService', TimezoneService);

  /* @ngInject */
  function TimezoneService() {
    var service = {
      getCountryMapping: getCountryMapping
    };

    return service;

    ///////////////

    function getCountryMapping() {
      return {
        'Europe/Andorra': 'Andorra',
        'Asia/Dubai': 'United Arab Emirates',
        'Asia/Kabul': 'Afghanistan',
        'America/Antigua': 'Antigua and Barbuda',
        'America/Anguilla': 'Anguilla',
        'Europe/Tirane': 'Albania',
        'Asia/Yerevan': 'Armenia',
        'Africa/Luanda': 'Angola',
        'Antarctica/McMurdo': 'Antarctica',
        'Antarctica/Rothera': 'Antarctica',
        'Antarctica/Palmer': 'Antarctica',
        'Antarctica/Mawson': 'Antarctica',
        'Antarctica/Davis': 'Antarctica',
        'Antarctica/Casey': 'Antarctica',
        'Antarctica/Vostok': 'Antarctica',
        'Antarctica/DumontDUrville': 'Antarctica',
        'Antarctica/Syowa': 'Antarctica',
        'Antarctica/Troll': 'Antarctica',
        'America/Argentina/Buenos_Aires': 'Argentina',
        'America/Argentina/Cordoba': 'Argentina',
        'America/Argentina/Salta': 'Argentina',
        'America/Argentina/Jujuy': 'Argentina',
        'America/Argentina/Tucuman': 'Argentina',
        'America/Argentina/Catamarca': 'Argentina',
        'America/Argentina/La_Rioja': 'Argentina',
        'America/Argentina/San_Juan': 'Argentina',
        'America/Argentina/Mendoza': 'Argentina',
        'America/Argentina/San_Luis': 'Argentina',
        'America/Argentina/Rio_Gallegos': 'Argentina',
        'America/Argentina/Ushuaia': 'Argentina',
        'Pacific/Pago_Pago': 'American Samoa',
        'Europe/Vienna': 'Austria',
        'Australia/Lord_Howe': 'Australia',
        'Antarctica/Macquarie': 'Australia',
        'Australia/Hobart': 'Australia',
        'Australia/Currie': 'Australia',
        'Australia/Melbourne': 'Australia',
        'Australia/Sydney': 'Australia',
        'Australia/Broken_Hill': 'Australia',
        'Australia/Brisbane': 'Australia',
        'Australia/Lindeman': 'Australia',
        'Australia/Adelaide': 'Australia',
        'Australia/Darwin': 'Australia',
        'Australia/Perth': 'Australia',
        'Australia/Eucla': 'Australia',
        'America/Aruba': 'Aruba',
        'Europe/Mariehamn': 'Aland Islands',
        'Asia/Baku': 'Azerbaijan',
        'Europe/Sarajevo': 'Bosnia and Herzegovina',
        'America/Barbados': 'Barbados',
        'Asia/Dhaka': 'Bangladesh',
        'Europe/Brussels': 'Belgium',
        'Africa/Ouagadougou': 'Burkina Faso',
        'Europe/Sofia': 'Bulgaria',
        'Asia/Bahrain': 'Bahrain',
        'Africa/Bujumbura': 'Burundi',
        'Africa/Porto-Novo': 'Benin',
        'America/St_Barthelemy': 'Saint Barthélemy',
        'Atlantic/Bermuda': 'Bermuda',
        'Asia/Brunei': 'Brunei',
        'America/La_Paz': 'Bolivia',
        'America/Kralendijk': 'Bonaire, Saint Eustatius and Saba',
        'America/Noronha': 'Brazil',
        'America/Belem': 'Brazil',
        'America/Fortaleza': 'Brazil',
        'America/Recife': 'Brazil',
        'America/Araguaina': 'Brazil',
        'America/Maceio': 'Brazil',
        'America/Bahia': 'Brazil',
        'America/Sao_Paulo': 'Brazil',
        'America/Campo_Grande': 'Brazil',
        'America/Cuiaba': 'Brazil',
        'America/Santarem': 'Brazil',
        'America/Porto_Velho': 'Brazil',
        'America/Boa_Vista': 'Brazil',
        'America/Manaus': 'Brazil',
        'America/Eirunepe': 'Brazil',
        'America/Rio_Branco': 'Brazil',
        'America/Nassau': 'Bahamas',
        'Asia/Thimphu': 'Bhutan',
        'Africa/Gaborone': 'Botswana',
        'Europe/Minsk': 'Belarus',
        'America/Belize': 'Belize',
        'America/St_Johns': 'Canada',
        'America/Halifax': 'Canada',
        'America/Glace_Bay': 'Canada',
        'America/Moncton': 'Canada',
        'America/Goose_Bay': 'Canada',
        'America/Blanc-Sablon': 'Canada',
        'America/Toronto': 'Canada',
        'America/Nipigon': 'Canada',
        'America/Thunder_Bay': 'Canada',
        'America/Iqaluit': 'Canada',
        'America/Pangnirtung': 'Canada',
        'America/Resolute': 'Canada',
        'America/Atikokan': 'Canada',
        'America/Rankin_Inlet': 'Canada',
        'America/Winnipeg': 'Canada',
        'America/Rainy_River': 'Canada',
        'America/Regina': 'Canada',
        'America/Swift_Current': 'Canada',
        'America/Edmonton': 'Canada',
        'America/Cambridge_Bay': 'Canada',
        'America/Yellowknife': 'Canada',
        'America/Inuvik': 'Canada',
        'America/Creston': 'Canada',
        'America/Dawson_Creek': 'Canada',
        'America/Fort_Nelson': 'Canada',
        'America/Vancouver': 'Canada',
        'America/Whitehorse': 'Canada',
        'America/Dawson': 'Canada',
        'Indian/Cocos': 'Cocos Islands',
        'Africa/Kinshasa': 'Democratic Republic of the Congo',
        'Africa/Lubumbashi': 'Democratic Republic of the Congo',
        'Africa/Bangui': 'Central African Republic',
        'Africa/Brazzaville': 'Republic of the Congo',
        'Europe/Zurich': 'Switzerland',
        'Africa/Abidjan': 'Ivory Coast',
        'Pacific/Rarotonga': 'Cook Islands',
        'America/Santiago': 'Chile',
        'Pacific/Easter': 'Chile',
        'Africa/Douala': 'Cameroon',
        'Asia/Shanghai': 'China',
        'Asia/Urumqi': 'China',
        'America/Bogota': 'Colombia',
        'America/Costa_Rica': 'Costa Rica',
        'America/Havana': 'Cuba',
        'Atlantic/Cape_Verde': 'Cape Verde',
        'America/Curacao': 'Curaçao',
        'Indian/Christmas': 'Christmas Island',
        'Asia/Nicosia': 'Cyprus',
        'Europe/Prague': 'Czech Republic',
        'Europe/Berlin': 'Germany',
        'Europe/Busingen': 'Germany',
        'Africa/Djibouti': 'Djibouti',
        'Europe/Copenhagen': 'Denmark',
        'America/Dominica': 'Dominica',
        'America/Santo_Domingo': 'Dominican Republic',
        'Africa/Algiers': 'Algeria',
        'America/Guayaquil': 'Ecuador',
        'Pacific/Galapagos': 'Ecuador',
        'Europe/Tallinn': 'Estonia',
        'Africa/Cairo': 'Egypt',
        'Africa/El_Aaiun': 'Western Sahara',
        'Africa/Asmara': 'Eritrea',
        'Europe/Madrid': 'Spain',
        'Africa/Ceuta': 'Spain',
        'Atlantic/Canary': 'Spain',
        'Africa/Addis_Ababa': 'Ethiopia',
        'Europe/Helsinki': 'Finland',
        'Pacific/Fiji': 'Fiji',
        'Atlantic/Stanley': 'Falkland Islands',
        'Pacific/Chuuk': 'Micronesia',
        'Pacific/Pohnpei': 'Micronesia',
        'Pacific/Kosrae': 'Micronesia',
        'Atlantic/Faroe': 'Faroe Islands',
        'Europe/Paris': 'France',
        'Africa/Libreville': 'Gabon',
        'Europe/London': 'United Kingdom',
        'America/Grenada': 'Grenada',
        'Asia/Tbilisi': 'Georgia',
        'America/Cayenne': 'French Guiana',
        'Europe/Guernsey': 'Guernsey',
        'Africa/Accra': 'Ghana',
        'Europe/Gibraltar': 'Gibraltar',
        'America/Godthab': 'Greenland',
        'America/Danmarkshavn': 'Greenland',
        'America/Scoresbysund': 'Greenland',
        'America/Thule': 'Greenland',
        'Africa/Banjul': 'Gambia',
        'Africa/Conakry': 'Guinea',
        'America/Guadeloupe': 'Guadeloupe',
        'Africa/Malabo': 'Equatorial Guinea',
        'Europe/Athens': 'Greece',
        'Atlantic/South_Georgia': 'South Georgia and the South Sandwich Islands',
        'America/Guatemala': 'Guatemala',
        'Pacific/Guam': 'Guam',
        'Africa/Bissau': 'Guinea-Bissau',
        'America/Guyana': 'Guyana',
        'Asia/Hong_Kong': 'Hong Kong',
        'America/Tegucigalpa': 'Honduras',
        'Europe/Zagreb': 'Croatia',
        'America/Port-au-Prince': 'Haiti',
        'Europe/Budapest': 'Hungary',
        'Asia/Jakarta': 'Indonesia',
        'Asia/Pontianak': 'Indonesia',
        'Asia/Makassar': 'Indonesia',
        'Asia/Jayapura': 'Indonesia',
        'Europe/Dublin': 'Ireland',
        'Asia/Jerusalem': 'Israel',
        'Europe/Isle_of_Man': 'Isle of Man',
        'Asia/Kolkata': 'India',
        'Indian/Chagos': 'British Indian Ocean Territory',
        'Asia/Baghdad': 'Iraq',
        'Asia/Tehran': 'Iran',
        'Atlantic/Reykjavik': 'Iceland',
        'Europe/Rome': 'Italy',
        'Europe/Jersey': 'Jersey',
        'America/Jamaica': 'Jamaica',
        'Asia/Amman': 'Jordan',
        'Asia/Tokyo': 'Japan',
        'Africa/Nairobi': 'Kenya',
        'Asia/Bishkek': 'Kyrgyzstan',
        'Asia/Phnom_Penh': 'Cambodia',
        'Pacific/Tarawa': 'Kiribati',
        'Pacific/Enderbury': 'Kiribati',
        'Pacific/Kiritimati': 'Kiribati',
        'Indian/Comoro': 'Comoros',
        'America/St_Kitts': 'Saint Kitts and Nevis',
        'Asia/Pyongyang': 'North Korea',
        'Asia/Seoul': 'South Korea',
        'Asia/Kuwait': 'Kuwait',
        'America/Cayman': 'Cayman Islands',
        'Asia/Almaty': 'Kazakhstan',
        'Asia/Qyzylorda': 'Kazakhstan',
        'Asia/Aqtobe': 'Kazakhstan',
        'Asia/Aqtau': 'Kazakhstan',
        'Asia/Oral': 'Kazakhstan',
        'Asia/Vientiane': 'Laos',
        'Asia/Beirut': 'Lebanon',
        'America/St_Lucia': 'Saint Lucia',
        'Europe/Vaduz': 'Liechtenstein',
        'Asia/Colombo': 'Sri Lanka',
        'Africa/Monrovia': 'Liberia',
        'Africa/Maseru': 'Lesotho',
        'Europe/Vilnius': 'Lithuania',
        'Europe/Luxembourg': 'Luxembourg',
        'Europe/Riga': 'Latvia',
        'Africa/Tripoli': 'Libya',
        'Africa/Casablanca': 'Morocco',
        'Europe/Monaco': 'Monaco',
        'Europe/Chisinau': 'Moldova',
        'Europe/Podgorica': 'Montenegro',
        'America/Marigot': 'Saint Martin',
        'Indian/Antananarivo': 'Madagascar',
        'Pacific/Majuro': 'Marshall Islands',
        'Pacific/Kwajalein': 'Marshall Islands',
        'Europe/Skopje': 'Macedonia',
        'Africa/Bamako': 'Mali',
        'Asia/Rangoon': 'Myanmar',
        'Asia/Ulaanbaatar': 'Mongolia',
        'Asia/Hovd': 'Mongolia',
        'Asia/Choibalsan': 'Mongolia',
        'Asia/Macau': 'Macao',
        'Pacific/Saipan': 'Northern Mariana Islands',
        'America/Martinique': 'Martinique',
        'Africa/Nouakchott': 'Mauritania',
        'America/Montserrat': 'Montserrat',
        'Europe/Malta': 'Malta',
        'Indian/Mauritius': 'Mauritius',
        'Indian/Maldives': 'Maldives',
        'Africa/Blantyre': 'Malawi',
        'America/Mexico_City': 'Mexico',
        'America/Cancun': 'Mexico',
        'America/Merida': 'Mexico',
        'America/Monterrey': 'Mexico',
        'America/Matamoros': 'Mexico',
        'America/Mazatlan': 'Mexico',
        'America/Chihuahua': 'Mexico',
        'America/Ojinaga': 'Mexico',
        'America/Hermosillo': 'Mexico',
        'America/Tijuana': 'Mexico',
        'America/Santa_Isabel': 'Mexico',
        'America/Bahia_Banderas': 'Mexico',
        'Asia/Kuala_Lumpur': 'Malaysia',
        'Asia/Kuching': 'Malaysia',
        'Africa/Maputo': 'Mozambique',
        'Africa/Windhoek': 'Namibia',
        'Pacific/Noumea': 'New Caledonia',
        'Africa/Niamey': 'Niger',
        'Pacific/Norfolk': 'Norfolk Island',
        'Africa/Lagos': 'Nigeria',
        'America/Managua': 'Nicaragua',
        'Europe/Amsterdam': 'Netherlands',
        'Europe/Oslo': 'Norway',
        'Asia/Kathmandu': 'Nepal',
        'Pacific/Nauru': 'Nauru',
        'Pacific/Niue': 'Niue',
        'Pacific/Auckland': 'New Zealand',
        'Pacific/Chatham': 'New Zealand',
        'Asia/Muscat': 'Oman',
        'America/Panama': 'Panama',
        'America/Lima': 'Peru',
        'Pacific/Tahiti': 'French Polynesia',
        'Pacific/Marquesas': 'French Polynesia',
        'Pacific/Gambier': 'French Polynesia',
        'Pacific/Port_Moresby': 'Papua New Guinea',
        'Pacific/Bougainville': 'Papua New Guinea',
        'Asia/Manila': 'Philippines',
        'Asia/Karachi': 'Pakistan',
        'Europe/Warsaw': 'Poland',
        'America/Miquelon': 'Saint Pierre and Miquelon',
        'Pacific/Pitcairn': 'Pitcairn',
        'America/Puerto_Rico': 'Puerto Rico',
        'Asia/Gaza': 'Palestinian Territory',
        'Asia/Hebron': 'Palestinian Territory',
        'Europe/Lisbon': 'Portugal',
        'Atlantic/Madeira': 'Portugal',
        'Atlantic/Azores': 'Portugal',
        'Pacific/Palau': 'Palau',
        'America/Asuncion': 'Paraguay',
        'Asia/Qatar': 'Qatar',
        'Indian/Reunion': 'Reunion',
        'Europe/Bucharest': 'Romania',
        'Europe/Belgrade': 'Serbia',
        'Europe/Kaliningrad': 'Russia',
        'Europe/Moscow': 'Russia',
        'Europe/Simferopol': 'Russia',
        'Europe/Volgograd': 'Russia',
        'Europe/Samara': 'Russia',
        'Asia/Yekaterinburg': 'Russia',
        'Asia/Omsk': 'Russia',
        'Asia/Novosibirsk': 'Russia',
        'Asia/Novokuznetsk': 'Russia',
        'Asia/Krasnoyarsk': 'Russia',
        'Asia/Irkutsk': 'Russia',
        'Asia/Chita': 'Russia',
        'Asia/Yakutsk': 'Russia',
        'Asia/Khandyga': 'Russia',
        'Asia/Vladivostok': 'Russia',
        'Asia/Sakhalin': 'Russia',
        'Asia/Ust-Nera': 'Russia',
        'Asia/Magadan': 'Russia',
        'Asia/Srednekolymsk': 'Russia',
        'Asia/Kamchatka': 'Russia',
        'Asia/Anadyr': 'Russia',
        'Africa/Kigali': 'Rwanda',
        'Asia/Riyadh': 'Saudi Arabia',
        'Pacific/Guadalcanal': 'Solomon Islands',
        'Indian/Mahe': 'Seychelles',
        'Africa/Khartoum': 'Sudan',
        'Europe/Stockholm': 'Sweden',
        'Asia/Singapore': 'Singapore',
        'Atlantic/St_Helena': 'Saint Helena',
        'Europe/Ljubljana': 'Slovenia',
        'Arctic/Longyearbyen': 'Svalbard and Jan Mayen',
        'Europe/Bratislava': 'Slovakia',
        'Africa/Freetown': 'Sierra Leone',
        'Europe/San_Marino': 'San Marino',
        'Africa/Dakar': 'Senegal',
        'Africa/Mogadishu': 'Somalia',
        'America/Paramaribo': 'Suriname',
        'Africa/Juba': 'South Sudan',
        'Africa/Sao_Tome': 'Sao Tome and Principe',
        'America/El_Salvador': 'El Salvador',
        'America/Lower_Princes': 'Sint Maarten',
        'Asia/Damascus': 'Syria',
        'Africa/Mbabane': 'Swaziland',
        'America/Grand_Turk': 'Turks and Caicos Islands',
        'Africa/Ndjamena': 'Chad',
        'Indian/Kerguelen': 'French Southern Territories',
        'Africa/Lome': 'Togo',
        'Asia/Bangkok': 'Thailand',
        'Asia/Dushanbe': 'Tajikistan',
        'Pacific/Fakaofo': 'Tokelau',
        'Asia/Dili': 'East Timor',
        'Asia/Ashgabat': 'Turkmenistan',
        'Africa/Tunis': 'Tunisia',
        'Pacific/Tongatapu': 'Tonga',
        'Europe/Istanbul': 'Turkey',
        'America/Port_of_Spain': 'Trinidad and Tobago',
        'Pacific/Funafuti': 'Tuvalu',
        'Asia/Taipei': 'Taiwan',
        'Africa/Dar_es_Salaam': 'Tanzania',
        'Europe/Kiev': 'Ukraine',
        'Europe/Uzhgorod': 'Ukraine',
        'Europe/Zaporozhye': 'Ukraine',
        'Africa/Kampala': 'Uganda',
        'Pacific/Johnston': 'United States Minor Outlying Islands',
        'Pacific/Midway': 'United States Minor Outlying Islands',
        'Pacific/Wake': 'United States Minor Outlying Islands',
        'America/New_York': 'United States',
        'America/Detroit': 'United States',
        'America/Kentucky/Louisville': 'United States',
        'America/Kentucky/Monticello': 'United States',
        'America/Indiana/Indianapolis': 'United States',
        'America/Indiana/Vincennes': 'United States',
        'America/Indiana/Winamac': 'United States',
        'America/Indiana/Marengo': 'United States',
        'America/Indiana/Petersburg': 'United States',
        'America/Indiana/Vevay': 'United States',
        'America/Chicago': 'United States',
        'America/Indiana/Tell_City': 'United States',
        'America/Indiana/Knox': 'United States',
        'America/Menominee': 'United States',
        'America/North_Dakota/Center': 'United States',
        'America/North_Dakota/New_Salem': 'United States',
        'America/North_Dakota/Beulah': 'United States',
        'America/Denver': 'United States',
        'America/Boise': 'United States',
        'America/Phoenix': 'United States',
        'America/Los_Angeles': 'United States',
        'America/Metlakatla': 'United States',
        'America/Anchorage': 'United States',
        'America/Juneau': 'United States',
        'America/Sitka': 'United States',
        'America/Yakutat': 'United States',
        'America/Nome': 'United States',
        'America/Adak': 'United States',
        'Pacific/Honolulu': 'United States',
        'America/Montevideo': 'Uruguay',
        'Asia/Samarkand': 'Uzbekistan',
        'Asia/Tashkent': 'Uzbekistan',
        'Europe/Vatican': 'Vatican',
        'America/St_Vincent': 'Saint Vincent and the Grenadines',
        'America/Caracas': 'Venezuela',
        'America/Tortola': 'British Virgin Islands',
        'America/St_Thomas': 'U.S. Virgin Islands',
        'Asia/Ho_Chi_Minh': 'Vietnam',
        'Pacific/Efate': 'Vanuatu',
        'Pacific/Wallis': 'Wallis and Futuna',
        'Pacific/Apia': 'Samoa',
        'Asia/Aden': 'Yemen',
        'Indian/Mayotte': 'Mayotte',
        'Africa/Johannesburg': 'South Africa',
        'Africa/Lusaka': 'Zambia',
        'Africa/Harare': 'Zimbabwe'
      };
    }
  }
}());
