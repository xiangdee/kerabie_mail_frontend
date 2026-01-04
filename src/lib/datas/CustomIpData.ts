export type CustomIpDataTypeTimeZoneInfo = {
  name?: string | null;
  offset?: number | null;
  current_time?: string | null;
  abbreviation?: string | null;
  full_name?: string | null;
};

export type CustomIpDataTypeCurrencyInfo = {
  code?: string | null;
  name?: string | null;
  symbol?: string | null;
};

export type CustomIpDataType = {
  ip?: string | null;
  continent_code?: string | null;
  continent_name?: string | null;
  country_code2?: string | null;
  country_code3?: string | null;
  country_name?: string | null;
  country_flag?: string | null;
  country_emoji?: string | null;
  state_prov?: string | null;
  city?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  calling_code?: string | null;
  isp?: string | null;
  organization?: string | null;
  currency?: CustomIpDataTypeCurrencyInfo | null;
  time_zone?: CustomIpDataTypeTimeZoneInfo | null;
};

export const CustomIpData:CustomIpDataType = {
  "ip": "102.90.99.67",
  "country_code2": "NG",
  "country_name": "Nigeria",
  "state_prov": "Rivers",
  "city": "Port Harcourt",
  "latitude": "4.84722",
  "longitude": "6.97460",
  "calling_code": "+234",
  "isp": "MTN Nigeria",
  "organization": "MTN NIGERIA Communication limited",
  "currency": {
    "code": "NGN",
    "name": "Nigerian Naira",
    "symbol": "₦"
  },
  "time_zone": {
    "name": "Africa/Lagos",
    "offset": 1,
    "current_time": "2026-01-04 00:40:12.744+0100"
  }
}