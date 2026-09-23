import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService, MoedaExibicao } from '../../currency.service';

interface RelatorioMercado {
  topGanho: MoedaExibicao;
  topPerda: MoedaExibicao;
  totalAtivos: number;
  climaMercado: 'Otimista' | 'Cauteloso';
}

@Component({
  selector: 'app-relatorio-fechamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio-fechamento.component.html',
  styleUrl: './relatorio-fechamento.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatorioFechamentoComponent {
  private readonly currencyService = inject(CurrencyService);

  readonly today: Date = new Date(); 
  exibirExplicacao = signal<boolean>(false);

  relatorio = computed<RelatorioMercado | null>(() => {
    const moedas = this.currencyService.listaMoedas();
    if (moedas.length === 0) return null;

    const ordenadas = [...moedas].sort((a, b) => 
      (a.valor / a.anterior) - (b.valor / b.anterior)
    );

    return {
      topGanho: ordenadas[0],
      topPerda: ordenadas[ordenadas.length - 1],
      totalAtivos: moedas.length,
      climaMercado: ordenadas.filter(m => m.valor < m.anterior).length > moedas.length / 2 
        ? 'Otimista' 
        : 'Cauteloso'
    };
  });

  toggleExplicacao(): void {
    this.exibirExplicacao.update(v => !v);
  }
}
