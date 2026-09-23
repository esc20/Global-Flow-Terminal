import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importação recomendada
import { HeaderComponent } from './components/header/header.component';
import { CardComponent } from './components/card/card.component';
import { SentimentoMercadoComponent } from './components/sentimento-mercado/sentimento-mercado.component';
import { CicloDeJurosComponent } from './components/ciclo-de-juros/ciclo-de-juros.component';
import { MapaMundiComponent } from './components/mapa-mundi/mapa-mundi.component';
import { FluxoAtivosComponent } from './components/fluxo-ativos/fluxo-ativos.component';
import { RelatorioFechamentoComponent } from './components/relatorio-fechamento/relatorio-fechamento.component';
import { NoticiasNoticiasComponent } from './components/noticias-noticias/noticias-noticias.component';
import { MonitorGeopoliticoComponent } from './components/monitor-geopolitico/monitor-geopolitico.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent,
    CardComponent, 
    SentimentoMercadoComponent, 
    CicloDeJurosComponent, 
    MapaMundiComponent, 
    FluxoAtivosComponent, 
    RelatorioFechamentoComponent, 
    NoticiasNoticiasComponent,
    MonitorGeopoliticoComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Global Flow Terminal';
}
