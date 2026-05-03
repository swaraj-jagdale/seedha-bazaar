import { Component, signal, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatesService, CropRate, Grade } from '../../services/rates.service';
import { LanguageService } from '../../services/language.service';
import { AppSettingsService } from '../../services/app-settings.service';

interface DisplayRate {
  name: string;
  emoji: string;
  grades: Grade[];
}

@Component({
  selector: 'app-mandi-rates',
  imports: [FormsModule],
  templateUrl: './mandi-rates.html',
  styleUrl: './mandi-rates.scss',
})
export class MandiRates implements OnDestroy {
  selectedMandi = signal('');
  mandis = signal<string[]>([]);
  displayRates = signal<DisplayRate[]>([]);
  loading = signal(true);
  todayDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  private unsubscribe: (() => void) | null = null;
  private loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public ratesService: RatesService,
    public lang: LanguageService,
    private appSettingsService: AppSettingsService,
  ) {
    // Initialize from app settings
    this.selectedMandi.set(this.appSettingsService.getDefaultMandi());
    this.mandis.set(this.appSettingsService.getMandiList());

    // Start listening
    this.startListener();

    // Reactively update display when allRates signal changes
    effect(() => {
      const rates = this.ratesService.allRates();
      if (rates.length > 0) {
        this.updateDisplayRates(rates);
      } else {
        this.displayRates.set([]);
      }
      this.loading.set(false);
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  private startListener() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loading.set(true);
    this.unsubscribe = this.ratesService.listenToAllRates(this.selectedMandi());

    // Safety timeout: show empty state if Firestore doesn't respond within 5s
    this.loadingTimeout = setTimeout(() => {
      if (this.loading()) {
        this.displayRates.set([]);
        this.loading.set(false);
      }
    }, 5000);
  }

  private updateDisplayRates(rates: CropRate[]) {
    const cropMap = new Map<string, CropRate>();
    for (const rate of rates) {
      if (!cropMap.has(rate.crop)) {
        cropMap.set(rate.crop, rate);
      }
    }

    const display: DisplayRate[] = [];
    cropMap.forEach((rate) => {
      display.push({
        name: rate.crop,
        emoji: rate.emoji,
        grades: rate.grades,
      });
    });

    if (display.length > 0) {
      this.displayRates.set(display);
    }
  }

  onMandiChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedMandi.set(select.value);
    this.startListener();
  }
}
