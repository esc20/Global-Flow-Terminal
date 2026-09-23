import { TestBed } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import { of, throwError } from 'rxjs';

import { CicloDeJurosComponent } from './ciclo-de-juros.component';
import { CurrencyService, TaxaSelicResponse } from '../../currency.service';

describe('CicloDeJurosComponent', () => {
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;

  async function configurarModulo() {
    currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getTaxasJuros']);

    await TestBed.configureTestingModule({
      imports: [CicloDeJurosComponent],
      providers: [
        DecimalPipe,
        { provide: CurrencyService, useValue: currencyServiceSpy }
      ]
    }).compileComponents();
  }

  describe('criação do componente', () => {
    it('deve criar o componente com a lista inicial padrão de taxas', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;

      // Act
      // (nenhuma ação extra: apenas verificamos o estado do signal antes do detectChanges)

      // Assert
      expect(component).toBeTruthy();
      expect(component.taxas().length).toBe(5);
      expect(component.taxas().find(t => t.pais === 'Brasil')?.valor).toBe(0);
      expect(component.exibirExplicacao()).toBeFalse();
    });
  });

  describe('ngOnInit - carregamento da taxa SELIC', () => {
    it('deve atualizar o valor do Brasil com a taxa SELIC retornada pela API', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      const brasil = component.taxas().find(t => t.pais === 'Brasil');
      expect(currencyServiceSpy.getTaxasJuros).toHaveBeenCalled();
      expect(brasil?.valor).toBe(10.75);
    });

    it('não deve alterar os valores das outras taxas ao atualizar a taxa do Brasil', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      const lista = component.taxas();
      expect(lista.find(t => t.pais === 'EUA')?.valor).toBe(5.50);
      expect(lista.find(t => t.pais === 'Europa')?.valor).toBe(4.50);
      expect(lista.find(t => t.pais === 'China')?.valor).toBe(3.45);
      expect(lista.find(t => t.pais === 'Japão')?.valor).toBe(0.10);
    });

    it('não deve atualizar o valor do Brasil quando a resposta não possui a propriedade "valor"', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({} as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      const brasil = component.taxas().find(t => t.pais === 'Brasil');
      expect(brasil?.valor).toBe(0);
    });

    it('deve usar o valor de fallback (10.75) e registrar o erro quando a API falhar', async () => {
      // Arrange
      await configurarModulo();
      const erroSimulado = new Error('Falha na API SELIC');
      currencyServiceSpy.getTaxasJuros.and.returnValue(throwError(() => erroSimulado));
      spyOn(console, 'error');
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      const brasil = component.taxas().find(t => t.pais === 'Brasil');
      expect(brasil?.valor).toBe(10.75);
      expect(console.error).toHaveBeenCalledWith('Erro na API SELIC:', erroSimulado.message);
    });
  });

  describe('toggleExplicacao', () => {
    it('deve alternar exibirExplicacao de false para true', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      component.toggleExplicacao();

      // Assert
      expect(component.exibirExplicacao()).toBeTrue();
    });

    it('deve alternar exibirExplicacao de volta para false na segunda chamada', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      component.toggleExplicacao();

      // Act
      component.toggleExplicacao();

      // Assert
      expect(component.exibirExplicacao()).toBeFalse();
    });
  });

  describe('formatarTaxa', () => {
    it('deve formatar o número com 2 casas decimais e adicionar o símbolo de porcentagem', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.formatarTaxa(5.5);

      // Assert
      expect(resultado).toBe('5.50%');
    });

    it('deve arredondar corretamente valores com mais de duas casas decimais', async () => {
      // Arrange
      await configurarModulo();
      currencyServiceSpy.getTaxasJuros.and.returnValue(of({ valor: '10.75' } as TaxaSelicResponse));
      const fixture = TestBed.createComponent(CicloDeJurosComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.formatarTaxa(3.456);

      // Assert
      expect(resultado).toBe('3.46%');
    });
  });
});