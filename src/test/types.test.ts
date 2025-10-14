import { describe, it, expect } from 'vitest'
import type { 
  RegioneRaw,
  ProvinciaRaw, 
  ComuneRaw,
  Regione,
  Provincia,
  Comune,
  SearchOptions,
  SearchResult,
  SearchFilters,
  RipartizioneGeografica,
  FlagCapoluogo,
  Coordinate,
  StatsCompleto,
  TipologiaRegione,
  TipologiaProvincia
} from '../types'
import { RIPARTIZIONI_MAP } from '../types'

describe('Types and Interfaces', () => {
  describe('Raw Data Interfaces', () => {
    it('dovrebbe accettare dati grezzi regione validi', () => {
      const regioneRaw: RegioneRaw = {
        ripartizione_geografica: 'Nord-ovest',
        codice_regione: '03',
        denominazione_regione: 'Lombardia',
        tipologia_regione: 'statuto ordinario',
        numero_province: '12',
        numero_comuni: '1506',
        superficie_kmq: '23863.6498'
      }

      expect(regioneRaw.ripartizione_geografica).toBe('Nord-ovest')
      expect(regioneRaw.codice_regione).toBe('03')
      expect(typeof regioneRaw.numero_province).toBe('string')
      expect(typeof regioneRaw.superficie_kmq).toBe('string')
    })

    it('dovrebbe accettare dati grezzi provincia validi', () => {
      const provinciaRaw: ProvinciaRaw = {
        codice_regione: '03',
        sigla_provincia: 'MI',
        denominazione_provincia: 'Milano',
        tipologia_provincia: 'Città metropolitana',
        numero_comuni: '133',
        superficie_kmq: '1575.2650',
        codice_sovracomunale: '201'
      }

      expect(provinciaRaw.sigla_provincia).toBe('MI')
      expect(provinciaRaw.tipologia_provincia).toBe('Città metropolitana')
      expect(typeof provinciaRaw.numero_comuni).toBe('string')
    })

    it('dovrebbe accettare dati grezzi comune validi', () => {
      const comuneRaw: ComuneRaw = {
        codice_istat: '015146',
        denominazione_ita_altra: 'Milan',
        denominazione_ita: 'Milano',
        denominazione_altra: '',
        cap: '20100',
        sigla_provincia: 'MI',
        denominazione_provincia: 'Milano',
        tipologia_provincia: 'Città metropolitana',
        codice_regione: '03',
        denominazione_regione: 'Lombardia',
        tipologia_regione: 'statuto ordinario',
        ripartizione_geografica: 'Nord-ovest',
        flag_capoluogo: 'SI',
        codice_belfiore: 'F205',
        lat: '45.4642700',
        lon: '9.1899800',
        superficie_kmq: '181.6677'
      }

      expect(comuneRaw.flag_capoluogo).toBe('SI')
      expect(comuneRaw.flag_capoluogo).toSatisfy((flag: string) => 
        flag === 'SI' || flag === 'NO'
      )
      expect(typeof comuneRaw.lat).toBe('string')
      expect(typeof comuneRaw.lon).toBe('string')
    })
  })

  describe('Normalized Data Interfaces', () => {
    it('dovrebbe accettare regione normalizzata valida', () => {
      const regione: Regione = {
        codiceRegione: '03',
        nome: 'Lombardia',
        tipologia: 'statuto ordinario',
        ripartizioneGeografica: 'Nord-ovest',
        numeroProvince: 12,
        numeroComuni: 1506,
        superficie: 23863.6498
      }

      expect(regione.codiceRegione).toBe('03')
      expect(typeof regione.numeroProvince).toBe('number')
      expect(typeof regione.superficie).toBe('number')
      expect(regione.numeroProvince).toBeGreaterThan(0)
    })

    it('dovrebbe accettare provincia normalizzata valida', () => {
      const provincia: Provincia = {
        codiceRegione: '03',
        sigla: 'MI',
        nome: 'Milano',
        tipologia: 'Città metropolitana',
        numeroComuni: 133,
        superficie: 1575.2650,
        codiceSovracomunale: '201'
      }

      expect(provincia.sigla).toBe('MI')
      expect(typeof provincia.numeroComuni).toBe('number')
      expect(provincia.numeroComuni).toBeGreaterThan(0)
      expect(typeof provincia.superficie).toBe('number')
    })

    it('dovrebbe accettare comune normalizzato valido', () => {
      const comune: Comune = {
        codiceIstat: '015146',
        nome: 'Milano',
        nomeAlternativo: 'Milan',
        cap: '20100',
        siglaProvincia: 'MI',
        nomeProvincia: 'Milano',
        tipologiaProvincia: 'Città metropolitana',
        codiceRegione: '03',
        nomeRegione: 'Lombardia',
        tipologiaRegione: 'statuto ordinario',
        ripartizioneGeografica: 'Nord-ovest',
        isCapoluogo: true,
        codiceBelfiore: 'F205',
        coordinate: {
          lat: 45.4642700,
          lng: 9.1899800
        },
        superficie: 181.6677
      }

      expect(comune.nome).toBe('Milano')
      expect(comune.nomeAlternativo).toBe('Milan')
      expect(typeof comune.isCapoluogo).toBe('boolean')
      expect(typeof comune.coordinate.lat).toBe('number')
      expect(typeof comune.coordinate.lng).toBe('number')
      expect(comune.superficie).toBeGreaterThan(0)
    })

    it('dovrebbe accettare comune senza nome alternativo', () => {
      const comune: Comune = {
        codiceIstat: '015014',
        nome: 'Bergamo',
        // nomeAlternativo è opzionale
        cap: '24100',
        siglaProvincia: 'BG',
        nomeProvincia: 'Bergamo',
        tipologiaProvincia: 'Provincia',
        codiceRegione: '03',
        nomeRegione: 'Lombardia',
        tipologiaRegione: 'statuto ordinario',
        ripartizioneGeografica: 'Nord-ovest',
        isCapoluogo: true,
        codiceBelfiore: 'A794',
        coordinate: {
          lat: 45.6982642,
          lng: 9.6772698
        },
        superficie: 39.6026
      }

      expect(comune.nomeAlternativo).toBeUndefined()
      expect(comune.nome).toBe('Bergamo')
    })
  })

  describe('Search Types', () => {
    it('dovrebbe accettare SearchOptions valide', () => {
      const options: SearchOptions = {
        caseSensitive: true,
        exactMatch: false,
        limit: 10,
        soloCapoluoghi: true
      }

      expect(typeof options.caseSensitive).toBe('boolean')
      expect(typeof options.exactMatch).toBe('boolean')
      expect(typeof options.limit).toBe('number')
      expect(typeof options.soloCapoluoghi).toBe('boolean')
    })

    it('dovrebbe accettare SearchOptions parziali', () => {
      const options1: SearchOptions = {}
      const options2: SearchOptions = { limit: 5 }
      const options3: SearchOptions = { exactMatch: true, soloCapoluoghi: false }

      expect(options1).toBeDefined()
      expect(options2.limit).toBe(5)
      expect(options3.exactMatch).toBe(true)
    })

    it('dovrebbe accettare SearchResult generici', () => {
      const comuneResult: SearchResult<Comune> = {
        item: {
          codiceIstat: '015146',
          nome: 'Milano',
          cap: '20100',
          siglaProvincia: 'MI',
          nomeProvincia: 'Milano',
          tipologiaProvincia: 'Città metropolitana',
          codiceRegione: '03',
          nomeRegione: 'Lombardia',
          tipologiaRegione: 'statuto ordinario',
          ripartizioneGeografica: 'Nord-ovest',
          isCapoluogo: true,
          codiceBelfiore: 'F205',
          coordinate: { lat: 45.46, lng: 9.19 },
          superficie: 181.67
        },
        score: 0.95
      }

      const regioneResult: SearchResult<Regione> = {
        item: {
          codiceRegione: '03',
          nome: 'Lombardia',
          tipologia: 'statuto ordinario',
          ripartizioneGeografica: 'Nord-ovest',
          numeroProvince: 12,
          numeroComuni: 1506,
          superficie: 23863.65
        },
        score: 1.0
      }

      expect(comuneResult.score).toBe(0.95)
      expect(comuneResult.item.nome).toBe('Milano')
      expect(regioneResult.score).toBe(1.0)
      expect(regioneResult.item.nome).toBe('Lombardia')
    })

    it('dovrebbe accettare SearchFilters validi', () => {
      const filters: SearchFilters = {
        provincia: 'Milano',
        regione: 'Lombardia',
        ripartizione: 'Nord-ovest',
        soloCapoluoghi: true
      }

      expect(filters.provincia).toBe('Milano')
      expect(filters.regione).toBe('Lombardia')
      expect(filters.ripartizione).toBe('Nord-ovest')
      expect(filters.soloCapoluoghi).toBe(true)
    })

    it('dovrebbe accettare SearchFilters parziali', () => {
      const filters1: SearchFilters = {}
      const filters2: SearchFilters = { regione: 'Lazio' }
      const filters3: SearchFilters = { provincia: 'MI', soloCapoluoghi: false }

      expect(filters1).toBeDefined()
      expect(filters2.regione).toBe('Lazio')
      expect(filters3.provincia).toBe('MI')
    })
  })

  describe('Constants and Union Types', () => {
    it('dovrebbe avere RIPARTIZIONI_MAP corretto', () => {
      expect(RIPARTIZIONI_MAP).toEqual({
        "Nord-ovest": "Nord-ovest",
        "Nord-est": "Nord-est",
        "Centro": "Centro", 
        "Sud": "Sud",
        "Isole": "Isole"
      })

      expect(Object.keys(RIPARTIZIONI_MAP)).toHaveLength(5)
    })

    it('dovrebbe rispettare il tipo RipartizioneGeografica', () => {
      const ripartizioni: RipartizioneGeografica[] = [
        'Nord-ovest',
        'Nord-est', 
        'Centro',
        'Sud',
        'Isole'
      ]

      ripartizioni.forEach(ripartizione => {
        expect(ripartizione).toSatisfy((r: string) => 
          r in RIPARTIZIONI_MAP
        )
      })
    })

    it('dovrebbe rispettare il tipo FlagCapoluogo', () => {
      const flagSI: FlagCapoluogo = 'SI'
      const flagNO: FlagCapoluogo = 'NO'

      expect(flagSI).toBe('SI')
      expect(flagNO).toBe('NO')

      // Test che non accetti altri valori
      const validFlags: FlagCapoluogo[] = ['SI', 'NO']
      expect(validFlags).toHaveLength(2)
    })

    it('dovrebbe rispettare il tipo TipologiaRegione', () => {
      const ordinaria: TipologiaRegione = 'statuto ordinario'
      const speciale: TipologiaRegione = 'statuto speciale'

      expect(ordinaria).toBe('statuto ordinario')
      expect(speciale).toBe('statuto speciale')

      const tipologie: TipologiaRegione[] = ['statuto ordinario', 'statuto speciale']
      expect(tipologie).toHaveLength(2)
    })

    it('dovrebbe rispettare il tipo TipologiaProvincia', () => {
      const provincia: TipologiaProvincia = 'Provincia'
      const citta: TipologiaProvincia = 'Città metropolitana'
      const consorzio: TipologiaProvincia = 'Libero consorzio comunale'

      expect(provincia).toBe('Provincia')
      expect(citta).toBe('Città metropolitana')
      expect(consorzio).toBe('Libero consorzio comunale')

      const tipologie: TipologiaProvincia[] = [
        'Provincia',
        'Città metropolitana', 
        'Libero consorzio comunale'
      ]
      expect(tipologie).toHaveLength(3)
    })

    it('dovrebbe accettare tipo Coordinate', () => {
      const coordinate: Coordinate = {
        lat: 45.4642700,
        lng: 9.1899800
      }

      expect(typeof coordinate.lat).toBe('number')
      expect(typeof coordinate.lng).toBe('number')
      expect(coordinate.lat).toBeCloseTo(45.46, 2)
      expect(coordinate.lng).toBeCloseTo(9.19, 2)
    })
  })

  describe('Stats Interface', () => {
    it('dovrebbe accettare StatsCompleto valido', () => {
      const stats: StatsCompleto = {
        totaleRegioni: 20,
        totaleProvince: 107,
        totaleComuni: 7904,
        totaleCapoluoghi: 107,
        totaleRipartizioni: 5,
        superficieTotale: 301336.72
      }

      expect(typeof stats.totaleRegioni).toBe('number')
      expect(typeof stats.totaleProvince).toBe('number')
      expect(typeof stats.totaleComuni).toBe('number')
      expect(typeof stats.totaleCapoluoghi).toBe('number')
      expect(typeof stats.totaleRipartizioni).toBe('number')
      expect(typeof stats.superficieTotale).toBe('number')

      expect(stats.totaleRegioni).toBeGreaterThan(0)
      expect(stats.totaleComuni).toBeGreaterThan(stats.totaleProvince)
      expect(stats.totaleRipartizioni).toBe(5)
    })
  })

  describe('Type Validation Edge Cases', () => {
    it('dovrebbe gestire valori numerici in coordinate', () => {
      const coordinate: Coordinate = {
        lat: 0,
        lng: -180
      }

      expect(coordinate.lat).toBe(0)
      expect(coordinate.lng).toBe(-180)

      // Test range tipici italiani
      const italianCoords: Coordinate = {
        lat: 42.5, // Latitudine tipica italiana
        lng: 12.5  // Longitudine tipica italiana  
      }

      expect(italianCoords.lat).toBeGreaterThan(35) // Sud Italia
      expect(italianCoords.lat).toBeLessThan(47)    // Nord Italia
      expect(italianCoords.lng).toBeGreaterThan(6)  // Ovest Italia
      expect(italianCoords.lng).toBeLessThan(19)    // Est Italia
    })

    it('dovrebbe validare stringhe non vuote per campi obbligatori', () => {
      const comune: Comune = {
        codiceIstat: '001001',
        nome: 'Test',
        cap: '00100',
        siglaProvincia: 'XX',
        nomeProvincia: 'Test Provincia',
        tipologiaProvincia: 'Provincia',
        codiceRegione: '01',
        nomeRegione: 'Test Regione',
        tipologiaRegione: 'statuto ordinario',
        ripartizioneGeografica: 'Centro',
        isCapoluogo: false,
        codiceBelfiore: 'A000',
        coordinate: { lat: 41.0, lng: 12.0 },
        superficie: 10.5
      }

      expect(comune.nome.length).toBeGreaterThan(0)
      expect(comune.cap.length).toBe(5)
      expect(comune.siglaProvincia.length).toBeGreaterThan(0)
      expect(comune.codiceIstat.length).toBeGreaterThan(0)
    })
  })
})
