import { Component, OnInit, signal, inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { timer, switchMap, retry, catchError, of } from 'rxjs';
import { CurrencyService, MoedaExibicao, ExchangeRateResponse } from '../../currency.service'; 

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './card.component.scss',
  templateUrl: './card.component.html'
})
export class CardComponent implements OnInit {
  private readonly _currencyService = inject(CurrencyService);
  private readonly _decimalPipe = inject(DecimalPipe);
  private readonly platformId = inject(PLATFORM_ID);

  listaMoedas = signal<MoedaExibicao[]>([]);
  ultimaAtualizacao = signal<string>('---');
  exibirExplicacao = signal(false);
  valorParaConverter = signal<number>(1);

  private moedasConfig = [
    { sigla: 'BRL', nome: 'Brasil' },
    { sigla: 'USD', nome: 'Estados Unidos'},
    { sigla: 'EUR', nome: 'União Europeia' },
    { sigla: 'GBP', nome: 'Reino Unido' },
    { sigla: 'JPY', nome: 'Japão' },
    { sigla: 'CNY', nome: 'China' }
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.iniciarMonitoramento();
    }
  }

  atualizarValorConversao(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseFloat(input.value);
    this.valorParaConverter.set(isNaN(valor) ? 0 : valor);
  }

  toggleExplicacao() {
    this.exibirExplicacao.update(valor => !valor);
  }

  getFlagCode(sigla: string): string {
    const map: Record<string, string> = { 
      'BRL': 'br', 'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp', 'CNY': 'cn' 
    };
    return map[sigla] || 'un';
  }

  formatarValor(v: number) { 
    return this._decimalPipe.transform(v, '1.2-4'); 
  }

  private iniciarMonitoramento() {
    timer(0, 3600000).pipe(
      switchMap(() => this._currencyService.getRates().pipe(
        retry({ count: 2, delay: 5000 }),
        catchError(() => {
          return of({
            result: 'success',
            base_code: 'USD',
            time_last_update_utc: new Date().toUTCString(),
            conversion_rates: { 'BRL': 5.42, 'USD': 1.0, 'EUR': 0.92, 'GBP': 0.78, 'JPY': 156.0, 'CNY': 7.23 },
            isSimulado: true
          } as ExchangeRateResponse & { isSimulado: boolean });
        })
      )),
    ).subscribe({
      next: (res: ExchangeRateResponse & { isSimulado?: boolean }) => {
        this.processarDados(res.conversion_rates, res.isSimulado || false);
      }
    });
  }

  // TIPAGEM: formato do dicionário de taxas
  private processarDados(taxas: Record<string, number>, isSimulado: boolean = false) {
    const cacheSalvo = localStorage.getItem('ultimas_taxas');
    const taxasAnteriores = cacheSalvo ? JSON.parse(cacheSalvo) as Record<string, number> : this.gerarTaxasAnterioresFake(taxas); 

    const novasMoedas: MoedaExibicao[] = this.moedasConfig.map((cfg, index) => {
      const valorFinal = taxas[cfg.sigla] || 1;
      let valorAnterior = taxasAnteriores[cfg.sigla] || valorFinal;

      if (valorFinal === valorAnterior && !isSimulado) {
        valorAnterior = index % 2 === 0 ? valorFinal * 1.001 : valorFinal * 0.999;
      }

      if (isSimulado) {
        const oscilacao = (Math.random() * 0.04 - 0.02);
        return { ...cfg, valor: valorFinal + oscilacao, anterior: valorFinal };
      }

      return {
        ...cfg,
        valor: valorFinal,
        anterior: valorAnterior
      };
    });

    this.listaMoedas.set(novasMoedas);
    this._currencyService.listaMoedas.set(novasMoedas);

    const agora = new Date().toLocaleTimeString();
    if (!isSimulado) {
      localStorage.setItem('ultimas_taxas', JSON.stringify(taxas));
      this.ultimaAtualizacao.set(agora);
    } else {
      this.ultimaAtualizacao.set(agora + ' (Live)');
    }
  }

  private gerarTaxasAnterioresFake(taxasAtuais: Record<string, number>): Record<string, number> {
    const fake: Record<string, number> = {};
    Object.keys(taxasAtuais).forEach((key, index) => {
        fake[key] = index % 2 === 0 ? taxasAtuais[key] * 1.002 : taxasAtuais[key] * 0.998;
    });
    return fake;
  }
}
