import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyService, TaxaSelicResponse } from '../../currency.service'; // Importamos a Interface
import { ChangeDetectionStrategy } from '@angular/core';

interface TaxaJuros {
  pais: string;
  sigla: string;
  valor: number;
  cor: string;
}

@Component({
  selector: 'app-ciclo-de-juros',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  templateUrl: './ciclo-de-juros.component.html',
  styleUrl: './ciclo-de-juros.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CicloDeJurosComponent implements OnInit {

  private readonly _currencyService = inject(CurrencyService);
  private readonly _decimalPipe = inject(DecimalPipe);

  exibirExplicacao = signal(false);


  taxas = signal<TaxaJuros[]>([
    { pais: 'Brasil', sigla: 'SELIC', valor: 0, cor: '#00ff88' },
    { pais: 'EUA', sigla: 'FED', valor: 5.50, cor: '#3b82f6' },
    { pais: 'Europa', sigla: 'BCE', valor: 4.50, cor: '#f59e0b' },
    { pais: 'China', sigla: 'LPR', valor: 3.45, cor: '#ff4444' }, 
    { pais: 'Japão', sigla: 'BoJ', valor: 0.10, cor: '#ffffff' }
  ]);

  ngOnInit() {
    this.carregarJurosReais();
  }

  toggleExplicacao() {
    this.exibirExplicacao.update(valor => !valor);
  }

  formatarTaxa(v: number): string {
    return this._decimalPipe.transform(v, '1.2-2') + '%';
  }

  private carregarJurosReais() {
    this._currencyService.getTaxasJuros().subscribe({
      next: (dados: TaxaSelicResponse | { valor: string }) => {
        if (dados && dados.valor) {
          const selicReal = parseFloat(dados.valor);
          this.atualizarValorBrasil(selicReal);
        }
      },
      error: (err: Error) => {
        console.error('Erro na API SELIC:', err.message);
        this.atualizarValorBrasil(10.75); 
      }
    });
  }

  private atualizarValorBrasil(valor: number) {
    this.taxas.update(lista => lista.map(t => 
      t.pais === 'Brasil' ? { ...t, valor: valor } : t
    ));
  }
}
