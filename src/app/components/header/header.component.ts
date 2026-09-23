import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CurrencyService } from '../../currency.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private currencyService = inject(CurrencyService);

  exibirBusca = signal(false);

  private readonly playlistImagens: string[] = [
    'federico-velazco-MZ8xoIQU4WQ-unsplash.jpg',
    'matt-nelson-z4X3yABcf5g-unsplash.jpg',
    'takashi-miyazaki-64ajtpEzlYc-unsplash.jpg'
  ];

  imagemAtual = signal<string>(this.playlistImagens[0]);
  private index = 0;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        this.index = (this.index + 1) % this.playlistImagens.length;
        this.imagemAtual.set(this.playlistImagens[this.index]);
      }, 10000);
    }
  }

  alternarBusca(): void {
    this.exibirBusca.update(v => !v);
  }

 
  dispararBusca(event: Event): void {
    const input = event.target as HTMLInputElement;
    const termo = input.value.trim();

    if (termo) {
      this.currencyService.termoBusca.set(termo);
      this.currencyService.triggerBusca.set(Date.now()); 
      this.scrollParaElemento(termo.toLowerCase());
      input.value = '';
    }
  }

  private scrollParaElemento(termo: string): void {
    const dicionarioScroll: Record<string, string> = {
      'mapa': '.map-row',
      'noticias': '.col-noticias',
      'noticia': '.col-noticias',
      'juros': 'app-ciclo-de-juros',
      'fluxo': 'app-fluxo-ativos',
      'geopolitico': 'app-monitor-geopolitico',
      'guerra': 'app-monitor-geopolitico',
      'relatorio': 'app-relatorio-fechamento',
      'fechamento': 'app-relatorio-fechamento',
      'cambio': 'app-card',
      'moedas': 'app-card',
      'sentimento': 'app-sentimento-mercado'
    };

    const seletor = dicionarioScroll[termo];
    
    if (seletor && isPlatformBrowser(this.platformId)) {
      const elemento = document.querySelector(seletor);
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        elemento.classList.add('highlight-search');
        setTimeout(() => elemento.classList.remove('highlight-search'), 2000);
      }
    }
  }
}
