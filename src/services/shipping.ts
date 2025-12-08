import axios from "axios";
import { logger } from "@/lib/logger";

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface ShippingCalculation {
  cost: number;
  days: number;
  city?: string;
  state?: string;
}

// Define shipping zones based on state
const SHIPPING_ZONES = {
  // Zone 1: Southeast (closest)
  zone1: ["SP", "RJ", "MG", "ES"],
  // Zone 2: South and Central-West
  zone2: ["PR", "SC", "RS", "GO", "DF", "MT", "MS"],
  // Zone 3: Northeast
  zone3: ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"],
  // Zone 4: North (farthest)
  zone4: ["AM", "RR", "AP", "PA", "TO", "RO", "AC"],
};

// Define shipping rates per zone
const SHIPPING_RATES = {
  zone1: { cost: 7, days: 3 },
  zone2: { cost: 12, days: 5 },
  zone3: { cost: 15, days: 7 },
  zone4: { cost: 20, days: 10 },
  default: { cost: 10, days: 5 },
};

/**
 * Validates and formats Brazilian zipcode
 */
export const formatZipcode = (zipcode: string): string => {
  return zipcode.replace(/\D/g, "");
};

/**
 * Get address information from ViaCEP
 */
export const getAddressFromZipcode = async (zipcode: string): Promise<ViaCEPResponse | null> => {
  try {
    const formattedZipcode = formatZipcode(zipcode);

    if (formattedZipcode.length !== 8) {
      logger.warn({ zipcode }, "Invalid zipcode length");
      return null;
    }

    const response = await axios.get<ViaCEPResponse>(
      `https://viacep.com.br/ws/${formattedZipcode}/json/`,
      { timeout: 5000 }
    );

    if (response.data.erro) {
      logger.warn({ zipcode }, "Zipcode not found in ViaCEP");
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error({ error, zipcode }, "Error fetching address from ViaCEP");
    return null;
  }
};

/**
 * Determine shipping zone based on state
 */
const getShippingZone = (state: string): keyof typeof SHIPPING_RATES => {
  const stateUpper = state.toUpperCase();

  if (SHIPPING_ZONES.zone1.includes(stateUpper)) return "zone1";
  if (SHIPPING_ZONES.zone2.includes(stateUpper)) return "zone2";
  if (SHIPPING_ZONES.zone3.includes(stateUpper)) return "zone3";
  if (SHIPPING_ZONES.zone4.includes(stateUpper)) return "zone4";

  return "default";
};

/**
 * Calculate shipping cost and delivery time based on zipcode
 */
export const calculateShipping = async (zipcode: string): Promise<ShippingCalculation | null> => {
  try {
    const addressData = await getAddressFromZipcode(zipcode);

    if (!addressData) {
      return null;
    }

    const zone = getShippingZone(addressData.uf);
    const rates = SHIPPING_RATES[zone];

    return {
      cost: rates.cost,
      days: rates.days,
      city: addressData.localidade,
      state: addressData.uf,
    };
  } catch (error) {
    logger.error({ error, zipcode }, "Error calculating shipping");
    return null;
  }
};
