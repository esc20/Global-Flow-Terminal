import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { of, throwError } from 'rxjs';

import { CardComponent } from './card.component';
import { CurrencyService, ExchangeRateResponse } from '../../currency.service';

describe('CardComponent', () => {
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;

  const mockRates: ExchangeRateResponse = {
    result: 'success',
    base_code: 'USD',
    time_last_update_utc: new Date().toUTCString(),
    conversion_rates: {
      BRL: 5.42,
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.78,
      JPY: 156.0,
      CNY: 7.23
    }
  };

  async function configurarModulo(platform: 'browser' | 'server' = 'browser') {
    currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getRates'], {
      listaMoedas: { set: jasmine.createSpy('set') } as any
    });
    currencyServiceSpy.getRates.and.returnValue(of(mockRates));

    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [
        DecimalPipe,
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: PLATFORM_ID, useValue: platform }
      ]
    }).compileComponents();
  }

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'setItem').and.callThrough();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('criação do componente', () => {
    it('deve criar o componente com os valores iniciais esperados', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      expect(component).toBeTruthy();
      expect(component.listaMoedas()).toEqual([]);
      expect(component.ultimaAtualizacao()).toBe('---');
      expect(component.exibirExplicacao()).toBeFalse();
      expect(component.valorParaConverter()).toBe(1);
    });
  });

  describe('ngOnInit', () => {
    it('não deve iniciar o monitoramento quando executado no servidor (SSR)', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      expect(currencyServiceSpy.getRates).not.toHaveBeenCalled();
      expect(component.listaMoedas()).toEqual([]);
    });

    it('deve iniciar o monitoramento e popular a lista de moedas quando executado no navegador', fakeAsync(async () => {
      // Arrange
      await configurarModulo('browser');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();
      tick(0);

      // Assert
      expect(currencyServiceSpy.getRates).toHaveBeenCalled();
      expect(component.listaMoedas().length).toBe(6);
      expect(component.listaMoedas()[0].sigla).toBe('BRL');
      expect(component.ultimaAtualizacao()).not.toBe('---');

      discardPeriodicTasks();
    }));
  });

  describe('atualizarValorConversao', () => {
    it('deve atualizar o valor quando o input contém um número válido', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      const input = document.createElement('input');
      input.value = '250.75';
      const event = { target: input } as unknown as Event;

      // Act
      component.atualizarValorConversao(event);

      // Assert
      expect(component.valorParaConverter()).toBe(250.75);
    });

    it('deve definir o valor como 0 quando o input contém um valor inválido (NaN)', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      const input = document.createElement('input');
      input.value = 'abc';
      const event = { target: input } as unknown as Event;

      // Act
      component.atualizarValorConversao(event);

      // Assert
      expect(component.valorParaConverter()).toBe(0);
    });
  });

  describe('toggleExplicacao', () => {
    it('deve alternar o valor de exibirExplicacao de false para true', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      component.toggleExplicacao();

      // Assert
      expect(component.exibirExplicacao()).toBeTrue();
    });

    it('deve alternar o valor de exibirExplicacao de volta para false na segunda chamada', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      component.toggleExplicacao();

      // Act
      component.toggleExplicacao();

      // Assert
      expect(component.exibirExplicacao()).toBeFalse();
    });
  });

  describe('getFlagCode', () => {
    it('deve retornar o código de bandeira correto para uma sigla conhecida', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.getFlagCode('EUR');

      // Assert
      expect(resultado).toBe('eu');
    });

    it('deve retornar "un" para uma sigla desconhecida', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.getFlagCode('XXX');

      // Assert
      expect(resultado).toBe('un');
    });
  });

  describe('formatarValor', () => {
    it('deve formatar o número com 2 a 4 casas decimais usando o DecimalPipe', async () => {
      // Arrange
      await configurarModulo('server');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.formatarValor(1234.5);

      // Assert
      expect(resultado).toBe('1,234.5');
    });
  });

  describe('monitoramento de taxas - cenário de erro / fallback simulado', () => {
    it('deve usar dados simulados e marcar "(Live)" quando o serviço de taxas falhar', fakeAsync(async () => {
      // Arrange
      await configurarModulo('browser');
      currencyServiceSpy.getRates.and.returnValue(throwError(() => new Error('Falha na API')));
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();
      tick(0);

      // Assert
      expect(component.listaMoedas().length).toBe(6);
      expect(component.ultimaAtualizacao()).toContain('(Live)');
      expect(localStorage.setItem).not.toHaveBeenCalled();

      discardPeriodicTasks();
    }));
  });

  describe('processarDados - persistência em cache', () => {
    it('deve salvar as taxas recebidas no localStorage quando a chamada for bem-sucedida', fakeAsync(async () => {
      // Arrange
      await configurarModulo('browser');
      const fixture = TestBed.createComponent(CardComponent);

      // Act
      fixture.detectChanges();
      tick(0);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ultimas_taxas',
        JSON.stringify(mockRates.conversion_rates)
      );

      discardPeriodicTasks();
    }));

    it('deve reutilizar as taxas anteriores salvas no cache do localStorage', fakeAsync(async () => {
      // Arrange
      const taxasAnteriores = { BRL: 5.30, USD: 1.0, EUR: 0.90, GBP: 0.77, JPY: 150.0, CNY: 7.10 };
      localStorage.setItem('ultimas_taxas', JSON.stringify(taxasAnteriores));
      await configurarModulo('browser');
      const fixture = TestBed.createComponent(CardComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();
      tick(0);

      // Assert
      const brl = component.listaMoedas().find(m => m.sigla === 'BRL');
      expect(brl?.anterior).toBe(taxasAnteriores.BRL);

      discardPeriodicTasks();
    }));
  });
});