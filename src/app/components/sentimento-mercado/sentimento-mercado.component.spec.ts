import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { SentimentoMercadoComponent } from './sentimento-mercado.component';
import { CurrencyService, MoedaExibicao } from '../../currency.service';

describe('SentimentoMercadoComponent', () => {
  let listaMoedasSignal: ReturnType<typeof signal<MoedaExibicao[]>>;
  let currencyServiceMock: Partial<CurrencyService>;

  function criarMoeda(overrides: Partial<MoedaExibicao> = {}): MoedaExibicao {
    return {
      sigla: 'USD',
      nome: 'Estados Unidos',
      valor: 5.0,
      anterior: 5.0,
      ...overrides
    } as MoedaExibicao;
  }

  async function configurarModulo() {
    listaMoedasSignal = signal<MoedaExibicao[]>([]);
    currencyServiceMock = { listaMoedas: listaMoedasSignal };

    await TestBed.configureTestingModule({
      imports: [SentimentoMercadoComponent],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceMock }
      ]
    }).compileComponents();
  }

  describe('criação do componente', () => {
    it('deve criar o componente com exibirExplicacao inicial como false', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;

      // Act
      fixture.detectChanges();

      // Assert
      expect(component).toBeTruthy();
      expect(component.exibirExplicacao()).toBeFalse();
    });
  });

  describe('valorSentimento', () => {
    it('deve retornar 50 quando a lista de moedas estiver vazia', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.valorSentimento();

      // Assert
      expect(resultado).toBe(50);
    });

    it('deve retornar 100 quando todas as moedas estiverem em alta (valor < anterior)', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.0, anterior: 5.5 }),
        criarMoeda({ sigla: 'EUR', valor: 0.9, anterior: 1.0 })
      ]);
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.valorSentimento();

      // Assert
      expect(resultado).toBe(100);
    });

    it('deve retornar 0 quando nenhuma moeda estiver em alta', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.5, anterior: 5.0 }),
        criarMoeda({ sigla: 'EUR', valor: 1.0, anterior: 0.9 })
      ]);
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.valorSentimento();

      // Assert
      expect(resultado).toBe(0);
    });

    it('deve calcular e arredondar corretamente o percentual quando parte das moedas estiver em alta', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.0, anterior: 5.5 }), // alta
        criarMoeda({ sigla: 'EUR', valor: 1.0, anterior: 0.9 }), // não alta
        criarMoeda({ sigla: 'JPY', valor: 150, anterior: 156 }) // alta
      ]);
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.valorSentimento();

      // Assert
      // 2 de 3 em alta = 66.66...% -> arredondado para 67
      expect(resultado).toBe(67);
    });

    it('deve reagir a mudanças no signal listaMoedas do serviço', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.valorSentimento()).toBe(50);

      // Act
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.0, anterior: 5.5 })
      ]);

      // Assert
      expect(component.valorSentimento()).toBe(100);
    });
  });

  describe('calcularOffset', () => {
    it('deve retornar 215 (offset máximo) quando o sentimento for 0', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.5, anterior: 5.0 })
      ]);
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.calcularOffset();

      // Assert
      expect(resultado).toBe(215);
    });

    it('deve retornar 0 (offset mínimo) quando o sentimento for 100', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.0, anterior: 5.5 })
      ]);
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.calcularOffset();

      // Assert
      expect(resultado).toBe(0);
    });

    it('deve calcular o offset proporcional para um sentimento de 50', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges(); // lista vazia -> valorSentimento = 50

      // Act
      const resultado = component.calcularOffset();

      // Assert
      expect(resultado).toBe(107.5);
    });
  });

  describe('obterCorStatus', () => {
    it('deve retornar branco translúcido quando o sentimento for exatamente 0', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.5, anterior: 5.0 })
      ]);
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.obterCorStatus();

      // Assert
      expect(resultado).toBe('rgba(255,255,255,0.2)');
    });

    it('deve retornar vermelho (#ff4444) quando o sentimento estiver abaixo de 35', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.5, anterior: 5.0 }),
        criarMoeda({ sigla: 'EUR', valor: 1.0, anterior: 0.9 }),
        criarMoeda({ sigla: 'JPY', valor: 156, anterior: 150 }),
        criarMoeda({ sigla: 'GBP', valor: 0.8, anterior: 0.75 })
      ]); // 0 de 4 em alta -> 0%
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.obterCorStatus();

      // Assert
      expect(resultado).toBe('#ff4444');
    });

    it('deve retornar amarelo (#ffff00) quando o sentimento estiver entre 35 e 64', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges(); // lista vazia -> 50 (neutro)

      // Act
      const resultado = component.obterCorStatus();

      // Assert
      expect(resultado).toBe('#ffff00');
    });

    it('deve retornar verde (#00ff88) quando o sentimento for 65 ou mais', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.0, anterior: 5.5 }),
        criarMoeda({ sigla: 'EUR', valor: 0.9, anterior: 1.0 }),
        criarMoeda({ sigla: 'JPY', valor: 150, anterior: 156 })
      ]); // 3 de 3 em alta -> 100%
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.obterCorStatus();

      // Assert
      expect(resultado).toBe('#00ff88');
    });
  });

  describe('obterStatusTexto', () => {
    it('deve retornar "Medo Extremo" quando o sentimento estiver abaixo de 20', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.5, anterior: 5.0 }),
        criarMoeda({ sigla: 'EUR', valor: 1.0, anterior: 0.9 }),
        criarMoeda({ sigla: 'JPY', valor: 156, anterior: 150 }),
        criarMoeda({ sigla: 'GBP', valor: 0.8, anterior: 0.75 })
      ]); // 0%
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.obterStatusTexto();

      // Assert
      expect(resultado).toBe('Medo Extremo');
    });

    it('deve retornar "Neutro" quando o sentimento for 50 (lista vazia)', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.obterStatusTexto();

      // Assert
      expect(resultado).toBe('Neutro');
    });

    it('deve retornar "Ganância Extrema" quando o sentimento for 80 ou mais', async () => {
      // Arrange
      await configurarModulo();
      listaMoedasSignal.set([
        criarMoeda({ sigla: 'BRL', valor: 5.0, anterior: 5.5 }),
        criarMoeda({ sigla: 'EUR', valor: 0.9, anterior: 1.0 }),
        criarMoeda({ sigla: 'JPY', valor: 150, anterior: 156 })
      ]); // 100%
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      const resultado = component.obterStatusTexto();

      // Assert
      expect(resultado).toBe('Ganância Extrema');
    });
  });

  describe('toggleExplicacao', () => {
    it('deve alternar exibirExplicacao de false para true', async () => {
      // Arrange
      await configurarModulo();
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
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
      const fixture = TestBed.createComponent(SentimentoMercadoComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      component.toggleExplicacao();

      // Act
      component.toggleExplicacao();

      // Assert
      expect(component.exibirExplicacao()).toBeFalse();
    });
  });
});