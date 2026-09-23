import { Component, OnInit, inject, signal, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CurrencyService, Noticia } from '../../currency.service'; // Importamos a Interface

@Component({
  selector: 'app-noticias-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias-noticias.component.html',
  styleUrl: './noticias-noticias.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticiasNoticiasComponent implements OnInit {
  private readonly newsService = inject(CurrencyService);
  private readonly platformId = inject(PLATFORM_ID);


  noticias = signal<Noticia[]>([]);
  carregando = signal<boolean>(true);
  exibirExplicacao = signal<boolean>(false);

  
  private readonly fallbackImg = 'https://unsplash.com';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarNoticias();
    }
  }

  toggleExplicacao(): void {
    this.exibirExplicacao.update(v => !v);
  }

  private carregarNoticias(): void {
    this.newsService.getUltimasNoticias().subscribe({
      next: (data: Noticia[]) => {
        this.noticias.set(data);
        this.carregando.set(false);
      },
      error: (err: Error) => {
        console.error('Falha ao carregar notícias:', err.message);
        this.carregando.set(false);
      }
    });
  }

  substituirImagemErro(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallbackImg) {
      img.src = this.fallbackImg;
    }
  }
}
