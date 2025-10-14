import { getAllComuni, getComuniByProvincia } from '..';
import type {
  Comune,
  Provincia,
  Regione,
  SearchOptions,
  SearchResult,
  SearchFilters,
} from '../types';
import { calculateRelevanceScore, normalizeString } from './normalize';

export function searchComuni(
  comuni: Comune[],
  query: string,
  options: SearchOptions = {}
): SearchResult<Comune>[] {
  const {
    caseSensitive = false,
    exactMatch = false,
    limit,
    soloCapoluoghi = false,
  } = options;

  if (!query.trim()) return [];

  const results: SearchResult<Comune>[] = [];
  const searchQuery = caseSensitive ? query : normalizeString(query);

  for (const comune of comuni) {
    if (soloCapoluoghi && !comune.isCapoluogo) continue;

    const nomeComune = caseSensitive
      ? comune.nome
      : normalizeString(comune.nome);
    const nomeAlternativo = comune.nomeAlternativo
      ? caseSensitive
        ? comune.nomeAlternativo
        : normalizeString(comune.nomeAlternativo)
      : null;

    // ⬅️ AGGIUNGI IL PARAMETRO caseSensitive
    const scoreNome = calculateRelevanceScore(
      searchQuery,
      nomeComune,
      exactMatch,
      caseSensitive // ⬅️ NUOVO PARAMETRO
    );
    const scoreAlternativo = nomeAlternativo
      ? calculateRelevanceScore(
          searchQuery,
          nomeAlternativo,
          exactMatch,
          caseSensitive // ⬅️ NUOVO PARAMETRO
        )
      : 0;

    const finalScore = Math.max(scoreNome, scoreAlternativo);

    if (finalScore > 0) {
      results.push({ item: comune, score: finalScore });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.nome.localeCompare(b.item.nome);
  });

  return limit ? results.slice(0, limit) : results;
}

/**
 * Cerca province per nome o sigla
 */
export function searchProvince(
  province: Provincia[],
  query: string,
  options: SearchOptions = {}
): SearchResult<Provincia>[] {
  const { caseSensitive = false, exactMatch = false, limit } = options;

  if (!query.trim()) return [];

  const results: SearchResult<Provincia>[] = [];
  const searchQuery = caseSensitive ? query : normalizeString(query);

  for (const provincia of province) {
    const nomeProvincia = caseSensitive
      ? provincia.nome
      : normalizeString(provincia.nome);
    const siglaProvincia = caseSensitive
      ? provincia.sigla
      : normalizeString(provincia.sigla);

    const scoreNome = calculateRelevanceScore(
      searchQuery,
      nomeProvincia,
      exactMatch
    );
    const scoreSigla = calculateRelevanceScore(
      searchQuery,
      siglaProvincia,
      exactMatch
    );

    const finalScore = Math.max(scoreNome, scoreSigla);

    if (finalScore > 0) {
      results.push({ item: provincia, score: finalScore });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.nome.localeCompare(b.item.nome);
  });

  return limit ? results.slice(0, limit) : results;
}

/**
 * Cerca regioni per nome
 */
export function searchRegioni(
  regioni: Regione[],
  query: string,
  options: SearchOptions = {}
): SearchResult<Regione>[] {
  const { caseSensitive = false, exactMatch = false, limit } = options;

  if (!query.trim()) return [];

  const results: SearchResult<Regione>[] = [];
  const searchQuery = caseSensitive ? query : normalizeString(query);

  for (const regione of regioni) {
    const nomeRegione = caseSensitive
      ? regione.nome
      : normalizeString(regione.nome);
    const score = calculateRelevanceScore(searchQuery, nomeRegione, exactMatch);

    if (score > 0) {
      results.push({ item: regione, score });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.nome.localeCompare(b.item.nome);
  });

  return limit ? results.slice(0, limit) : results;
}

/**
 * Cerca comuni con filtri avanzati
 */
export function searchComuniWithFilters(
  comuni: Comune[],
  query: string,
  filters: SearchFilters,
  options: SearchOptions = {}
): SearchResult<Comune>[] {
  let filteredComuni = [...comuni];

  if (filters.provincia) {
    const provinciaFilter = normalizeString(filters.provincia);
    filteredComuni = filteredComuni.filter(
      (comune) =>
        normalizeString(comune.nomeProvincia) === provinciaFilter ||
        normalizeString(comune.siglaProvincia) === provinciaFilter
    );
  }

  if (filters.regione) {
    const regioneFilter = normalizeString(filters.regione);
    filteredComuni = filteredComuni.filter(
      (comune) => normalizeString(comune.nomeRegione) === regioneFilter
    );
  }

  if (filters.ripartizione) {
    filteredComuni = filteredComuni.filter(
      (comune) => comune.ripartizioneGeografica === filters.ripartizione
    );
  }

  if (filters.soloCapoluoghi) {
    filteredComuni = filteredComuni.filter((comune) => comune.isCapoluogo);
  }

  return searchComuni(filteredComuni, query, options);
}

/**
 * Ottieni comuni per regione
 */
export function getComuniByRegione(
  comuni: Comune[],
  regione: string
): Comune[] {
  const regioneFilter = normalizeString(regione);
  return comuni.filter(
    (comune) => normalizeString(comune.nomeRegione) === regioneFilter
  );
}

/**
 * Ottieni solo i capoluoghi
 */
export function getCapoluoghi(comuni: Comune[]): Comune[] {
  return comuni.filter((comune) => comune.isCapoluogo);
}

/**
 * Validazione CAP italiano corretta
 */
export function isValidCAP(cap: string): boolean {
  const cleanCAP = cap.trim();

  // Deve essere esattamente 5 cifre
  if (!/^\d{5}$/.test(cleanCAP)) return false;

  const capNumber = parseInt(cleanCAP, 10);

  // Range corretto CAP italiani: 00010 (10 come numero) - 98168
  return capNumber >= 10 && capNumber <= 98168;
}

/**
 * Suggerimenti automatici per comuni (autocomplete)
 */
export function getSuggestionsComuni(
  comuni: Comune[],
  query: string,
  limit: number = 10
): string[] {
  if (query.length < 2) return [];

  const normalizedQuery = normalizeString(query);
  const suggestions = new Set<string>();

  for (const comune of comuni) {
    const nomeNormalized = normalizeString(comune.nome);

    if (nomeNormalized.startsWith(normalizedQuery)) {
      suggestions.add(comune.nome);
      if (suggestions.size >= limit) break;
    }
  }

  if (suggestions.size < limit) {
    for (const comune of comuni) {
      if (suggestions.size >= limit) break;

      const nomeNormalized = normalizeString(comune.nome);

      if (
        nomeNormalized.includes(normalizedQuery) &&
        !suggestions.has(comune.nome)
      ) {
        suggestions.add(comune.nome);
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

export function getProvinceByRegione(
  province: Provincia[],
  comuni: Comune[],
  regione: string
): Provincia[] {
  const regioneFilter = normalizeString(regione.trim());

  if (!regioneFilter) return [];

  // Trova il codice regione dal nome usando i comuni
  const comuneRegione = comuni.find(
    (comune) => normalizeString(comune.nomeRegione) === regioneFilter
  );

  if (!comuneRegione) return [];

  const codiceRegione = comuneRegione.codiceRegione;

  // Restituisci tutte le province di quella regione
  return province.filter(
    (provincia) => provincia.codiceRegione === codiceRegione
  );
}

/**
 * Ottieni province per regione (usando le regioni per il mapping) - ordinate alfabeticamente
 */
export function getProvinceByRegioneWithRegioni(
  province: Provincia[],
  regioni: Regione[],
  regione: string
): Provincia[] {
  const regioneFilter = normalizeString(regione.trim());

  if (!regioneFilter) return [];

  // Trova il codice regione dal nome usando i dati regioni
  const regioneObj = regioni.find(
    (r) => normalizeString(r.nome) === regioneFilter
  );

  if (!regioneObj) return [];

  // Restituisci tutte le province di quella regione ORDINATE ALFABETICAMENTE
  return province
    .filter((provincia) => provincia.codiceRegione === regioneObj.codiceRegione)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Ottieni comuni unici per provincia (senza duplicati CAP) - ideale per dropdown
 */
export function getComuniUniqueByProvincia(provincia: string): Comune[] {
  const comuni = getComuniByProvincia(provincia);

  // Deduplicazione per codiceIstat (ogni comune ha un codice unico)
  const uniqueMap = new Map<string, Comune>();

  comuni.forEach((comune) => {
    if (!uniqueMap.has(comune.codiceIstat)) {
      uniqueMap.set(comune.codiceIstat, comune);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );
}

/**
 * Ottieni tutti i CAP per un comune specifico
 */
export function getCapsByComune(codiceIstat: string): string[] {
  const comuniWithSameName = getAllComuni().filter(
    (c) => c.codiceIstat === codiceIstat
  );
  const caps = [...new Set(comuniWithSameName.map((c) => c.cap))];
  return caps.sort();
}

/**
 * Ottieni tutti i CAP per un comune per nome (può restituire più comuni se ci sono omonimi)
 */
export function getCapsByComuneNome(
  nomeComune: string
): { comune: Comune; caps: string[] }[] {
  const comuni = getAllComuni().filter((c) => c.nome === nomeComune);

  // Raggruppa per codiceIstat
  const groupedByCodice = new Map<string, Comune[]>();

  comuni.forEach((comune) => {
    if (!groupedByCodice.has(comune.codiceIstat)) {
      groupedByCodice.set(comune.codiceIstat, []);
    }
    groupedByCodice.get(comune.codiceIstat)!.push(comune);
  });

  // ✅ Usa solo .values() invece di .entries()
  return Array.from(groupedByCodice.values()).map((comuniList) => ({
    comune: comuniList[0], // Prendi il primo come rappresentativo
    caps: [...new Set(comuniList.map((c) => c.cap))].sort(),
  }));
}

/**
 * Ottieni il comune completo con tutti i suoi CAP
 */
export function getComuneWithAllCaps(
  codiceIstat: string
): { comune: Comune; caps: string[] } | null {
  const comuniRecords = getAllComuni().filter(
    (c) => c.codiceIstat === codiceIstat
  );

  if (comuniRecords.length === 0) return null;

  return {
    comune: comuniRecords[0], // Dati del comune
    caps: [...new Set(comuniRecords.map((c) => c.cap))].sort(),
  };
}
