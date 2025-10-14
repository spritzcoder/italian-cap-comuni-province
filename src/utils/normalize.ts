import type { ComuneRaw, ProvinciaRaw, RegioneRaw, Comune, Provincia, Regione } from '../types'

/**
 * Normalizza una stringa per la ricerca (rimuove accenti, lowercase, etc.)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Converte i dati grezzi della regione in formato normalizzato
 * Mappa: gi_regioni.json → Regione
 */
export function normalizeRegioneData(raw: RegioneRaw): Regione {
  return {
    codiceRegione: raw.codice_regione,
    nome: raw.denominazione_regione,
    tipologia: raw.tipologia_regione,
    ripartizioneGeografica: raw.ripartizione_geografica,
    numeroProvince: parseInt(raw.numero_province, 10),
    numeroComuni: parseInt(raw.numero_comuni, 10),
    superficie: parseFloat(raw.superficie_kmq)
  }
}

/**
 * Converte i dati grezzi della provincia in formato normalizzato
 * Mappa: gi_province.json → Provincia
 */
export function normalizeProvinciaData(raw: ProvinciaRaw): Provincia {
  return {
    codiceRegione: raw.codice_regione,
    sigla: raw.sigla_provincia,
    nome: raw.denominazione_provincia,
    tipologia: raw.tipologia_provincia,
    numeroComuni: parseInt(raw.numero_comuni, 10),
    superficie: parseFloat(raw.superficie_kmq),
    codiceSovracomunale: raw.codice_sovracomunale
  }
}

/**
 * Converte i dati grezzi del comune in formato normalizzato
 * Mappa: gi_comuni_cap.json → Comune
 */
export function normalizeComuneData(raw: ComuneRaw): Comune {
  // Determina se denominazione_ita_altra è diversa da denominazione_ita
  const nomeAlternativo = raw.denominazione_ita_altra !== raw.denominazione_ita 
    && raw.denominazione_ita_altra.trim() !== ""
    ? raw.denominazione_ita_altra
    : undefined

  return {
    codiceIstat: raw.codice_istat,
    nome: raw.denominazione_ita,
    nomeAlternativo,
    cap: raw.cap,
    siglaProvincia: raw.sigla_provincia,
    nomeProvincia: raw.denominazione_provincia,
    tipologiaProvincia: raw.tipologia_provincia,
    codiceRegione: raw.codice_regione,
    nomeRegione: raw.denominazione_regione,
    tipologiaRegione: raw.tipologia_regione,
    ripartizioneGeografica: raw.ripartizione_geografica,
    isCapoluogo: raw.flag_capoluogo === "SI",
    codiceBelfiore: raw.codice_belfiore,
    coordinate: {
      lat: parseFloat(raw.lat),
      lng: parseFloat(raw.lon)
    },
    superficie: parseFloat(raw.superficie_kmq)
  }
}

/**
 * Calcola score di similitudine tra query e testo
 * Utilizzato nelle funzioni di ricerca per ranking dei risultati
 */
export function calculateRelevanceScore(
  query: string, 
  text: string, 
  exactMatch = false, 
  caseSensitive = false  // ⬅️ NUOVO PARAMETRO
): number {
  // ✅ CORRETTO: normalizza solo se non case-sensitive
  const normalizedQuery = caseSensitive ? query : normalizeString(query)
  const normalizedText = caseSensitive ? text : normalizeString(text)
  
  if (exactMatch) {
    return normalizedQuery === normalizedText ? 1.0 : 0.0
  }
  
  // Match esatto - score massimo
  if (normalizedText === normalizedQuery) return 1.0
  
  // Inizia con la query - score alto
  if (normalizedText.startsWith(normalizedQuery)) return 0.9
  
  // Contiene la query - score medio pesato per lunghezza
  if (normalizedText.includes(normalizedQuery)) {
    return 0.7 * (normalizedQuery.length / normalizedText.length)
  }
  
  // Similarità approssimativa con Jaro-Winkler (solo per query lunghe)
  if (normalizedQuery.length >= 3 && !caseSensitive) { // ⬅️ Solo se non case-sensitive
    const similarity = jaroWinklerSimilarity(normalizedQuery, normalizedText)
    return similarity > 0.8 ? similarity * 0.5 : 0
  }
  
  return 0
}

/**
 * Algoritmo Jaro-Winkler per calcolare similarità tra stringhe
 * Utile per trovare nomi simili con piccoli errori di battitura
 */
function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1
  
  const len1 = s1.length
  const len2 = s2.length
  
  if (len1 === 0 || len2 === 0) return 0
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1
  const s1Matches = new Array(len1).fill(false)
  const s2Matches = new Array(len2).fill(false)
  
  let matches = 0
  let transpositions = 0
  
  // Identifica caratteri che corrispondono
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, len2)
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = s2Matches[j] = true
      matches++
      break
    }
  }
  
  if (matches === 0) return 0
  
  // Calcola trasposizioni
  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }
  
  // Calcola distanza Jaro
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3
  
  // Applica bonus Winkler per prefissi comuni (max 4 caratteri)
  let prefixLength = 0
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (s1[i] === s2[i]) prefixLength++
    else break
  }
  
  return jaro + (0.1 * prefixLength * (1 - jaro))
}

/**
 * Funzione di utilità per convertire string a number con fallback
 */
export function safeParseFloat(value: string, defaultValue: number = 0): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Funzione di utilità per convertire string a int con fallback
 */
export function safeParseInt(value: string, defaultValue: number = 0): number {
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Valida se una stringa rappresenta un codice regione valido (2 cifre)
 */
export function isValidCodiceRegione(codice: string): boolean {
  return /^\d{2}$/.test(codice) && parseInt(codice) >= 1 && parseInt(codice) <= 20
}

/**
 * Valida se una stringa rappresenta un codice ISTAT comune valido (6 cifre)
 */
export function isValidCodiceIstat(codice: string): boolean {
  return /^\d{6}$/.test(codice)
}

/**
 * Valida se una stringa rappresenta una sigla provincia valida (2 lettere)
 */
export function isValidSiglaProvincia(sigla: string): boolean {
  return /^[A-Z]{2}$/.test(sigla.toUpperCase())
}
