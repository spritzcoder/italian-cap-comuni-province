/**
 * Interfaccia per i dati grezzi delle regioni (come arrivano dal dataset gi_regioni.json)
 */
export interface RegioneRaw {
  ripartizione_geografica: string
  codice_regione: string
  denominazione_regione: string
  tipologia_regione: string
  numero_province: string
  numero_comuni: string
  superficie_kmq: string
}

/**
 * Interfaccia per i dati grezzi delle province (come arrivano dal dataset gi_province.json)
 */
export interface ProvinciaRaw {
  codice_regione: string
  sigla_provincia: string
  denominazione_provincia: string
  tipologia_provincia: string
  numero_comuni: string
  superficie_kmq: string
  codice_sovracomunale: string
}

/**
 * Interfaccia per i dati grezzi dei comuni (come arrivano dal dataset gi_comuni_cap.json)
 */
export interface ComuneRaw {
  codice_istat: string
  denominazione_ita_altra: string
  denominazione_ita: string
  denominazione_altra: string
  cap: string
  sigla_provincia: string
  denominazione_provincia: string
  tipologia_provincia: string
  codice_regione: string
  denominazione_regione: string
  tipologia_regione: string
  ripartizione_geografica: string
  flag_capoluogo: "SI" | "NO"
  codice_belfiore: string
  lat: string
  lon: string
  superficie_kmq: string
}

/**
 * Interfaccia normalizzata per le regioni (con tipi corretti)
 */
export interface Regione {
  codiceRegione: string
  nome: string
  tipologia: string
  ripartizioneGeografica: string
  numeroProvince: number
  numeroComuni: number
  superficie: number // in km²
}

/**
 * Interfaccia normalizzata per le province (con tipi corretti)
 */
export interface Provincia {
  codiceRegione: string
  sigla: string
  nome: string
  tipologia: string
  numeroComuni: number
  superficie: number // in km²
  codiceSovracomunale: string
}

/**
 * Interfaccia normalizzata per i comuni (con tipi corretti)
 */
export interface Comune {
  codiceIstat: string
  nome: string
  nomeAlternativo?: string // denominazione_ita_altra se diverso da denominazione_ita
  cap: string
  siglaProvincia: string
  nomeProvincia: string
  tipologiaProvincia: string
  codiceRegione: string
  nomeRegione: string
  tipologiaRegione: string
  ripartizioneGeografica: string
  isCapoluogo: boolean
  codiceBelfiore: string
  coordinate: {
    lat: number
    lng: number
  }
  superficie: number // in km²
}

/**
 * Opzioni per la ricerca
 */
export interface SearchOptions {
  caseSensitive?: boolean
  exactMatch?: boolean
  limit?: number
  soloCapoluoghi?: boolean
}

/**
 * Risultato della ricerca con score di rilevanza
 */
export interface SearchResult<T> {
  item: T
  score: number
}

/**
 * Filtri per la ricerca avanzata
 */
export interface SearchFilters {
  provincia?: string
  regione?: string
  ripartizione?: string
  soloCapoluoghi?: boolean
}

/**
 * Mappa delle ripartizioni geografiche per normalizzazione
 */
export const RIPARTIZIONI_MAP = {
  "Nord-ovest": "Nord-ovest",
  "Nord-est": "Nord-est", 
  "Centro": "Centro",
  "Sud": "Sud",
  "Isole": "Isole"
} as const

/**
 * Tipo union per le ripartizioni geografiche
 */
export type RipartizioneGeografica = keyof typeof RIPARTIZIONI_MAP

/**
 * Tipo per i valori boolean del flag capoluogo
 */
export type FlagCapoluogo = "SI" | "NO"

/**
 * Tipo per le coordinate geografiche
 */
export type Coordinate = {
  lat: number
  lng: number
}

/**
 * Statistiche complete sui dati caricati
 */
export interface StatsCompleto {
  totaleRegioni: number
  totaleProvince: number
  totaleComuni: number
  totaleCapoluoghi: number
  totaleRipartizioni: number
  superficieTotale: number // km²
}

/**
 * Tipologie di regioni italiane
 */
export type TipologiaRegione = "statuto ordinario" | "statuto speciale"

/**
 * Tipologie di province italiane
 */
export type TipologiaProvincia = "Provincia" | "Città metropolitana" | "Libero consorzio comunale"
