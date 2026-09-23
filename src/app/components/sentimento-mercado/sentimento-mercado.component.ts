import { Component, signal, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../currency.service';

@Component({
  selector: 'app-sentimento-mercado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentimento-mercado.component.html',
  styleUrl: './sentimento-mercado.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentimentoMercadoComponent {
  private readonly _currencyService = inject(CurrencyService);

  exibirExplicacao = signal<boolean>(false);
  valorSentimento = computed<number>(() => {
    const moedas = this._currencyService.listaMoedas();
    if (moedas.length === 0) return 50; 

    const moedasEmAlta = moedas.filter(m => m.valor < m.anterior).length;
    
    const percentualAlta = (moedasEmAlta / moedas.length) * 100;
    
    return Math.round(percentualAlta);
  });

  toggleExplicacao(): void {
    this.exibirExplicacao.update(v => !v);
  }

  calcularOffset(): number {
    const valor = this.valorSentimento(); 
    const maxDash = 215;
    return maxDash - (valor / 100) * maxDash;
  }

  obterCorStatus(): string {
    const v = this.valorSentimento();
    if (v === 0) return 'rgba(255,255,255,0.2)';
    if (v < 35) return '#ff4444'; // Medo
    if (v < 65) return '#ffff00'; // Neutro
    return '#00ff88'; // Ganância
  }

  obterStatusTexto(): string {
    const v = this.valorSentimento();
    if (v < 20) return 'Medo Extremo';
    if (v < 45) return 'Medo';
    if (v < 55) return 'Neutro';
    if (v < 80) return 'Ganância';
    return 'Ganância Extrema';
  }
}
