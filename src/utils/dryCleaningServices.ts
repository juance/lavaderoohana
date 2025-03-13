
interface PriceRange {
  desde: number | null;
  hasta: number;
}

export interface DryCleaningService {
  name: string;
  price: PriceRange;
  priceType?: 'fixed' | 'range' | 'perUnit' | 'fromPrice';
  unit?: string;
}

export const dryCleaningServices: DryCleaningService[] = [
  { name: "Lavado (valet)", price: { desde: null, hasta: 5000 } },
  { name: "Secado", price: { desde: null, hasta: 4000 } },
  { name: "Lavado a mano (por 3 prendas)", price: { desde: null, hasta: 5000 } },
  { name: "Lavado de zapatillas (por par)", price: { desde: null, hasta: 10000 } },
  { name: "Lavado de mantas, cortinas y colchas (doble secado)", price: { desde: null, hasta: 8000 } },
  { name: "Ambo común / Ambo lino", price: { desde: 19000, hasta: 22000 }, priceType: 'range' },
  { name: "Blusa / Buzo", price: { desde: 8600, hasta: 9800 }, priceType: 'range' },
  { name: "Traje", price: { desde: 29000, hasta: 34000 }, priceType: 'range' },
  { name: "Saco", price: { desde: 12000, hasta: 14000 }, priceType: 'range' },
  { name: "Sacón", price: { desde: 13000, hasta: 13000 }, priceType: 'fixed' },
  { name: "Pantalón vestir / lino", price: { desde: 8000, hasta: 9200 }, priceType: 'range' },
  { name: "Pantalón Sky", price: { desde: 14000, hasta: 14000 }, priceType: 'fixed' },
  { name: "Campera Sky", price: { desde: 18000, hasta: 18000 }, priceType: 'fixed' },
  { name: "Pollera", price: { desde: 9000, hasta: 14400 }, priceType: 'range' },
  { name: "Pollera tableada", price: { desde: 11000, hasta: 16000 }, priceType: 'range' },
  { name: "Pullover", price: { desde: 9600, hasta: 13000 }, priceType: 'range' },
  { name: "Saco de lana", price: { desde: 10600, hasta: 15600 }, priceType: 'range' },
  { name: "Camisa / Remera", price: { desde: 8000, hasta: 9200 }, priceType: 'range' },
  { name: "Corbata", price: { desde: 7000, hasta: 7000 }, priceType: 'fixed' },
  { name: "Chaleco / Chaqueta", price: { desde: 10000, hasta: 13000 }, priceType: 'range' },
  { name: "Campera", price: { desde: 13000, hasta: 13000 }, priceType: 'fixed' },
  { name: "Camperón", price: { desde: 14600, hasta: 14600 }, priceType: 'fixed' },
  { name: "Campera desmontable", price: { desde: 15600, hasta: 18000 }, priceType: 'range' },
  { name: "Campera inflable /plumas", price: { desde: 14600, hasta: 14600 }, priceType: 'fixed' },
  { name: "Tapado / Sobretodo", price: { desde: 14600, hasta: 16400 }, priceType: 'range' },
  { name: "Camperón inflable o plumas / Tapado", price: { desde: 16400, hasta: 18000 }, priceType: 'range' },
  { name: "Piloto simple", price: { desde: 14000, hasta: 19000 }, priceType: 'range' },
  { name: "Piloto desmontable", price: { desde: 18000, hasta: 18000 }, priceType: 'fixed' },
  { name: "Vestido común", price: { desde: 14000, hasta: 19000 }, priceType: 'range' },
  { name: "Vestido de fiesta desde", price: { desde: null, hasta: 22000 }, priceType: 'fromPrice' },
  { name: "Vestido de 15 años desde", price: { desde: null, hasta: 34000 }, priceType: 'fromPrice' },
  { name: "Vestido de novia desde", price: { desde: null, hasta: 40000 }, priceType: 'fromPrice' },
  { name: "Frazada", price: { desde: 14000, hasta: 18000 }, priceType: 'range' },
  { name: "Acolchado", price: { desde: 16000, hasta: 20000 }, priceType: 'range' },
  { name: "Acolchado de plumas", price: { desde: 16000, hasta: 22000 }, priceType: 'range' },
  { name: "Funda de colchón", price: { desde: 19000, hasta: 28000 }, priceType: 'range' },
  { name: "Cortina liviana x mt2", price: { desde: null, hasta: 7600 }, priceType: 'perUnit', unit: 'm²' },
  { name: "Cortina pesada xmt2", price: { desde: null, hasta: 8400 }, priceType: 'perUnit', unit: 'm²' },
  { name: "Cortina forrada x mt2", price: { desde: null, hasta: 9200 }, priceType: 'perUnit', unit: 'm²' },
  { name: "Alfombra x mt2", price: { desde: null, hasta: 18000 }, priceType: 'perUnit', unit: 'm²' },
  { name: "Funda de acolchado", price: { desde: 14000, hasta: 19000 }, priceType: 'range' },
  { name: "Almohada / almohada plumas", price: { desde: 12000, hasta: 16000 }, priceType: 'range' }
];
