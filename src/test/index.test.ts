import { describe, it, expect, beforeAll } from 'vitest';
import comuniItaliani, {
  searchComuni,
  searchProvince,
  searchRegioni,
  getComuneByIstat,
  getComuniByCAP,
  getComuniByProvincia,
  getComuniByRegione,
  getProvinciaBySigla,
  getRegioneByCode,
  getCapoluoghi,
  getAllRegioni,
  getAllProvince,
  getAllComuni,
  getSuggestions,
  isValidCAP,
  getStats,
  searchComuniWithFilters,
  getProvinceByRegione,
  getProvinceByCodeRegione,
} from '../index';

describe('ComuniItaliani - Test Suite Completa', () => {
  let stats: any;

  beforeAll(async () => {
    // Ottieni statistiche per validazioni
    stats = getStats();
  });

  describe('Statistiche e Inizializzazione', () => {
    it('dovrebbe caricare tutti i dati correttamente', () => {
      expect(stats.totaleRegioni).toBe(20); // 20 regioni italiane
      expect(stats.totaleProvince).toBeGreaterThan(100); // ~110 province
      expect(stats.totaleComuni).toBeGreaterThan(7000); // ~8000 comuni
      expect(stats.totaleCapoluoghi).toBeGreaterThan(100);
      expect(stats.totaleRipartizioni).toBe(5); // Nord-ovest, Nord-est, Centro, Sud, Isole
      expect(stats.superficieTotale).toBeGreaterThan(300000); // km² Italia
    });

    it('dovrebbe avere tutti i metodi principali disponibili', () => {
      expect(typeof searchComuni).toBe('function');
      expect(typeof getComuniByCAP).toBe('function');
      expect(typeof isValidCAP).toBe('function');
      expect(typeof getStats).toBe('function');
    });
  });

  describe('Ricerca Regioni', () => {
    it('dovrebbe trovare regioni per nome esatto', () => {
      const risultati = searchRegioni('Lombardia', { exactMatch: true });

      expect(risultati).toHaveLength(1);
      expect(risultati[0].item.nome).toBe('Lombardia');
      expect(risultati[0].score).toBe(1.0);
      expect(risultati[0].item.ripartizioneGeografica).toBe('Nord-ovest');
    });

    it('dovrebbe trovare regioni con ricerca parziale', () => {
      const risultati = searchRegioni('Sard', { limit: 5 });

      expect(risultati.length).toBeGreaterThan(0);
      expect(risultati[0].item.nome).toBe('Sardegna');
      expect(risultati[0].item.ripartizioneGeografica).toBe('Isole');
    });

    it('dovrebbe restituire array vuoto per query inesistente', () => {
      const risultati = searchRegioni('RegineInesistente');
      expect(risultati).toHaveLength(0);
    });
  });

  describe('Province per Regione', () => {
    it('dovrebbe trovare province per nome regione', () => {
      const province = getProvinceByRegione('Lombardia');

      expect(province.length).toBeGreaterThan(0);

      province.forEach((provincia) => {
        expect(provincia.codiceRegione).toBe('03'); // Codice Lombardia
      });

      // Verifica che Milano sia inclusa
      const milano = province.find((p) => p.sigla === 'MI');
      expect(milano).toBeDefined();
      expect(milano!.nome).toBe('Milano');
    });

    it('dovrebbe trovare province per codice regione', () => {
      const province = getProvinceByCodeRegione('03'); // Lombardia

      expect(province.length).toBeGreaterThan(0);
      province.forEach((provincia) => {
        expect(provincia.codiceRegione).toBe('03');
      });
    });

    it('dovrebbe restituire array vuoto per regione inesistente', () => {
      const province = getProvinceByRegione('RegioneInesistente');
      expect(province).toHaveLength(0);
    });

    it('dovrebbe gestire ricerca case-insensitive', () => {
      const province1 = getProvinceByRegione('lombardia');
      const province2 = getProvinceByRegione('LOMBARDIA');

      expect(province1.length).toBe(province2.length);
      expect(province1.length).toBeGreaterThan(0);
    });
  });

  describe('Ricerca Province', () => {
    it('dovrebbe trovare province per sigla', () => {
      const risultati = searchProvince('MI', { exactMatch: true });

      expect(risultati.length).toBeGreaterThan(0);
      expect(risultati[0].item.sigla).toBe('MI');
      expect(risultati[0].item.nome).toBe('Milano');
      expect(risultati[0].score).toBe(1.0);
    });

    it('dovrebbe trovare province per nome completo', () => {
      const risultati = searchProvince('Milano', { exactMatch: true });

      expect(risultati.length).toBeGreaterThan(0);
      expect(risultati[0].item.nome).toBe('Milano');
      expect(risultati[0].item.sigla).toBe('MI');
    });

    it('dovrebbe trovare province con ricerca parziale', () => {
      const risultati = searchProvince('Rom', { limit: 5 });

      expect(risultati.length).toBeGreaterThan(0);
      expect(risultati.some((r) => r.item.nome.includes('Roma'))).toBe(true);
    });
  });

  describe('Ricerca Comuni', () => {
    it('dovrebbe trovare comuni per nome esatto', () => {
      const risultati = searchComuni('Milano', { exactMatch: true, limit: 10 });

      expect(risultati.length).toBeGreaterThan(0);
      expect(risultati[0].item.nome).toBe('Milano');
      expect(risultati[0].score).toBe(1.0);
      expect(risultati[0].item.siglaProvincia).toBe('MI');
    });

    it('dovrebbe trovare comuni con ricerca parziale', () => {
      const risultati = searchComuni('San', { limit: 10 });

      expect(risultati.length).toBe(10); // Limitato a 10
      risultati.forEach((r) => {
        expect(r.item.nome.toLowerCase()).toContain('san');
        expect(r.score).toBeGreaterThan(0);
      });
    });

    it('dovrebbe ordinare risultati per rilevanza', () => {
      const risultati = searchComuni('Roma', { limit: 5 });

      expect(risultati.length).toBeGreaterThan(1);

      // Il primo risultato dovrebbe avere score più alto
      for (let i = 1; i < risultati.length; i++) {
        expect(risultati[i - 1].score).toBeGreaterThanOrEqual(
          risultati[i].score
        );
      }
    });

    it('dovrebbe trovare solo capoluoghi se richiesto', () => {
      const risultati = searchComuni('Milano', { soloCapoluoghi: true });

      risultati.forEach((r) => {
        expect(r.item.isCapoluogo).toBe(true);
      });
    });

    it('dovrebbe gestire ricerca case-insensitive di default', () => {
      const risultatiLower = searchComuni('milano', { limit: 3 });
      const risultatiUpper = searchComuni('MILANO', { limit: 3 });

      expect(risultatiLower.length).toBe(risultatiUpper.length);
      expect(risultatiLower[0].item.nome).toBe(risultatiUpper[0].item.nome);
    });
  });

  describe('Lookup Diretti', () => {
    it('dovrebbe trovare comune per codice ISTAT', () => {
      // Prima trova un comune qualsiasi per ottenere un codice valido
      const comuni = getAllComuni();
      const comuneCampione = comuni[0];

      const comune = getComuneByIstat(comuneCampione.codiceIstat);

      expect(comune).toBeDefined();
      expect(comune!.codiceIstat).toBe(comuneCampione.codiceIstat);
      expect(comune!.nome).toBe(comuneCampione.nome);
    });

    it('dovrebbe restituire undefined per codice ISTAT inesistente', () => {
      const comune = getComuneByIstat('999999');
      expect(comune).toBeUndefined();
    });

    it('dovrebbe trovare provincia per sigla', () => {
      const provincia = getProvinciaBySigla('MI');

      expect(provincia).toBeDefined();
      expect(provincia!.sigla).toBe('MI');
      expect(provincia!.nome).toBe('Milano');
    });

    it('dovrebbe gestire sigla provincia case-insensitive', () => {
      const provincia1 = getProvinciaBySigla('mi');
      const provincia2 = getProvinciaBySigla('MI');

      expect(provincia1).toEqual(provincia2);
    });

    it('dovrebbe trovare regione per codice', () => {
      const regione = getRegioneByCode('03'); // Lombardia

      expect(regione).toBeDefined();
      expect(regione!.codiceRegione).toBe('03');
      expect(regione!.nome).toBe('Lombardia');
    });
  });

  describe('Ricerca per CAP', () => {
    it('dovrebbe trovare comuni per CAP valido', () => {
      // Usa un CAP reale dai dati caricati
      const tuttiComuni = getAllComuni();
      expect(tuttiComuni.length).toBeGreaterThan(0); // Assicurati che i dati siano caricati

      // Prendi il CAP del primo comune
      const capDiTest = tuttiComuni[0].cap;
      const comuni = getComuniByCAP(capDiTest);

      expect(comuni.length).toBeGreaterThan(0);
      comuni.forEach((comune) => {
        expect(comune.cap).toBe(capDiTest);
      });
    });

    it('dovrebbe restituire array vuoto per CAP inesistente', () => {
      const comuni = getComuniByCAP('99999');
      expect(comuni).toHaveLength(0);
    });

    it('dovrebbe gestire CAP con spazi', () => {
      const comuni1 = getComuniByCAP('20100');
      const comuni2 = getComuniByCAP(' 20100 ');

      expect(comuni1).toEqual(comuni2);
    });
  });

  describe('Raggruppamenti Geografici', () => {
    it('dovrebbe trovare comuni per provincia (sigla)', () => {
      const comuni = getComuniByProvincia('MI');

      expect(comuni.length).toBeGreaterThan(0);
      comuni.forEach((comune) => {
        expect(comune.siglaProvincia).toBe('MI');
        expect(comune.nomeProvincia).toBe('Milano');
      });
    });

    it('dovrebbe trovare comuni per provincia (nome)', () => {
      const comuni = getComuniByProvincia('Milano');

      expect(comuni.length).toBeGreaterThan(0);
      comuni.forEach((comune) => {
        expect(comune.nomeProvincia).toBe('Milano');
      });
    });

    it('dovrebbe trovare comuni per regione', () => {
      const comuni = getComuniByRegione('Lombardia');

      expect(comuni.length).toBeGreaterThan(0);
      comuni.forEach((comune) => {
        expect(comune.nomeRegione).toBe('Lombardia');
      });
    });

    it('dovrebbe restituire solo capoluoghi', () => {
      const capoluoghi = getCapoluoghi();

      expect(capoluoghi.length).toBeGreaterThan(100); // Almeno 100 capoluoghi
      capoluoghi.forEach((comune) => {
        expect(comune.isCapoluogo).toBe(true);
      });
    });
  });

  describe('Autocomplete e Suggerimenti', () => {
    it('dovrebbe fornire suggerimenti per query valida', () => {
      const suggestions = getSuggestions('Mil', 5);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
      expect(suggestions.includes('Milano')).toBe(true);
    });

    it('dovrebbe restituire array vuoto per query troppo corta', () => {
      const suggestions = getSuggestions('M');
      expect(suggestions).toHaveLength(0);
    });

    it('dovrebbe limitare il numero di suggerimenti', () => {
      const suggestions = getSuggestions('San', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('dovrebbe restituire nomi univoci', () => {
      const suggestions = getSuggestions('Roma', 10);
      const uniqueSuggestions = [...new Set(suggestions)];

      expect(suggestions).toEqual(uniqueSuggestions);
    });
  });

  describe('Validazione CAP', () => {
    it('dovrebbe validare CAP italiani corretti', () => {
      expect(isValidCAP('20100')).toBe(true); // Milano
      expect(isValidCAP('00118')).toBe(true); // Roma
      expect(isValidCAP('80100')).toBe(true); // Napoli
      expect(isValidCAP('50100')).toBe(true); // Firenze
    });

    it('dovrebbe respingere CAP non validi', () => {
      expect(isValidCAP('1234')).toBe(false); // Troppo corto
      expect(isValidCAP('123456')).toBe(false); // Troppo lungo
      expect(isValidCAP('abcde')).toBe(false); // Non numerico
      expect(isValidCAP('00000')).toBe(false); // Fuori range italiano
      expect(isValidCAP('99999')).toBe(false); // Fuori range italiano
      expect(isValidCAP('')).toBe(false); // Vuoto
    });

    it('dovrebbe gestire spazi nei CAP', () => {
      expect(isValidCAP(' 20100 ')).toBe(true);
    });
  });

  describe('Filtri Avanzati', () => {
    it('dovrebbe filtrare comuni per regione', () => {
      const risultati = searchComuniWithFilters(
        'San',
        {
          regione: 'Lombardia',
        },
        { limit: 10 }
      );

      risultati.forEach((r) => {
        expect(r.item.nomeRegione).toBe('Lombardia');
        expect(r.item.nome.toLowerCase()).toContain('san');
      });
    });

    it('dovrebbe filtrare comuni per provincia', () => {
      const risultati = searchComuniWithFilters(
        'Villa',
        {
          provincia: 'MI',
        },
        { limit: 5 }
      );

      risultati.forEach((r) => {
        expect(r.item.siglaProvincia).toBe('MI');
        expect(r.item.nome.toLowerCase()).toContain('villa');
      });
    });

    it('dovrebbe filtrare solo capoluoghi', () => {
      const risultati = searchComuniWithFilters(
        '',
        {
          soloCapoluoghi: true,
        },
        { limit: 10 }
      );

      risultati.forEach((r) => {
        expect(r.item.isCapoluogo).toBe(true);
      });
    });

    it('dovrebbe combinare più filtri', () => {
      const risultati = searchComuniWithFilters(
        '',
        {
          regione: 'Lombardia',
          soloCapoluoghi: true,
        },
        { limit: 5 }
      );

      risultati.forEach((r) => {
        expect(r.item.nomeRegione).toBe('Lombardia');
        expect(r.item.isCapoluogo).toBe(true);
      });
    });
  });

  describe('Dati Completi', () => {
    it('dovrebbe restituire tutte le regioni', () => {
      const regioni = getAllRegioni();

      expect(regioni).toHaveLength(20);
      expect(regioni.some((r) => r.nome === 'Lombardia')).toBe(true);
      expect(regioni.some((r) => r.nome === 'Sicilia')).toBe(true);
    });

    it('dovrebbe restituire tutte le province', () => {
      const province = getAllProvince();

      expect(province.length).toBeGreaterThan(100);
      expect(province.some((p) => p.sigla === 'MI')).toBe(true);
      expect(province.some((p) => p.sigla === 'RM')).toBe(true);
    });

    it('dovrebbe restituire tutte le regioni ordinate alfabeticamente', () => {
      const regioni = getAllRegioni();

      expect(regioni).toHaveLength(20);

      // Verifica ordine alfabetico
      for (let i = 1; i < regioni.length; i++) {
        expect(
          regioni[i - 1].nome.localeCompare(regioni[i].nome)
        ).toBeLessThanOrEqual(0);
      }

      // Prima regione dovrebbe essere "Abruzzo"
      expect(regioni[0].nome).toBe('Abruzzo');

      // Verifica presenza di regioni specifiche
      expect(regioni.some((r) => r.nome === 'Lombardia')).toBe(true);
      expect(regioni.some((r) => r.nome === 'Sicilia')).toBe(true);
    });

    it('dovrebbe restituire tutti i comuni', () => {
      const comuni = getAllComuni();

      expect(comuni.length).toBeGreaterThan(7000);
      expect(comuni.some((c) => c.nome === 'Milano')).toBe(true);
      expect(comuni.some((c) => c.nome === 'Roma')).toBe(true);
    });
  });
});
