import { Component, signal, effect, OnDestroy } from '@angular/core';
import { RatesService, CropRate } from '../../services/rates.service';
import { LanguageService } from '../../services/language.service';

interface DisplayRate {
  name: string;
  emoji: string;
  gradeA: string;
  gradeB: string;
  gradeC: string;
}

@Component({
  selector: 'app-mandi-rates',
  imports: [],
  templateUrl: './mandi-rates.html',
  styleUrl: './mandi-rates.scss',
})
export class MandiRates implements OnDestroy {
  selectedMandi = signal('Azadpur Mandi');
  mandis = ['Azadpur Mandi', 'Vashi Mandi', 'Lasalgaon Mandi'];
  displayRates = signal<DisplayRate[]>([]);
  loading = signal(true);
  todayDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  private unsubscribe: (() => void) | null = null;
  private loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  private fallbackRatesMap: Record<string, DisplayRate[]> = {
    'Azadpur Mandi': [
      {
        name: 'Onion',
        emoji: '',
        gradeA: '₹ 2,300 - 2,500',
        gradeB: '₹ 2,000 - 2,300',
        gradeC: '₹ 1,700 - 1,900',
      },
      {
        name: 'Tomato',
        emoji: '',
        gradeA: '₹ 1,500 - 1,800',
        gradeB: '₹ 1,200 - 1,400',
        gradeC: '₹ 900 - 1,100',
      },
      {
        name: 'Broccoli',
        emoji: '',
        gradeA: '₹ 6,000 - 6,500',
        gradeB: '₹ 4,500 - 5,800',
        gradeC: '₹ 3,500 - 4,000',
      },
      {
        name: 'Potato',
        emoji: '',
        gradeA: '₹ 1,800 - 2,100',
        gradeB: '₹ 1,400 - 1,700',
        gradeC: '₹ 1,000 - 1,300',
      },
      {
        name: 'Cauliflower',
        emoji: '',
        gradeA: '₹ 2,500 - 3,000',
        gradeB: '₹ 2,000 - 2,400',
        gradeC: '₹ 1,500 - 1,900',
      },
      {
        name: 'Green Chilli',
        emoji: '',
        gradeA: '₹ 3,200 - 3,800',
        gradeB: '₹ 2,600 - 3,100',
        gradeC: '₹ 2,000 - 2,500',
      },
    ],
    'Vashi Mandi': [
      {
        name: 'Onion',
        emoji: '',
        gradeA: '₹ 2,100 - 2,400',
        gradeB: '₹ 1,800 - 2,100',
        gradeC: '₹ 1,500 - 1,700',
      },
      {
        name: 'Tomato',
        emoji: '',
        gradeA: '₹ 1,600 - 1,900',
        gradeB: '₹ 1,300 - 1,500',
        gradeC: '₹ 1,000 - 1,200',
      },
      {
        name: 'Broccoli',
        emoji: '',
        gradeA: '₹ 5,800 - 6,200',
        gradeB: '₹ 4,200 - 5,500',
        gradeC: '₹ 3,200 - 3,800',
      },
      {
        name: 'Potato',
        emoji: '',
        gradeA: '₹ 1,600 - 1,900',
        gradeB: '₹ 1,200 - 1,500',
        gradeC: '₹ 900 - 1,100',
      },
      {
        name: 'Cauliflower',
        emoji: '',
        gradeA: '₹ 2,200 - 2,700',
        gradeB: '₹ 1,800 - 2,100',
        gradeC: '₹ 1,300 - 1,700',
      },
      {
        name: 'Green Chilli',
        emoji: '',
        gradeA: '₹ 3,500 - 4,200',
        gradeB: '₹ 2,800 - 3,400',
        gradeC: '₹ 2,200 - 2,700',
      },
    ],
    'Lasalgaon Mandi': [
      {
        name: 'Onion',
        emoji: '',
        gradeA: '₹ 2,500 - 2,800',
        gradeB: '₹ 2,200 - 2,500',
        gradeC: '₹ 1,900 - 2,100',
      },
      {
        name: 'Tomato',
        emoji: '',
        gradeA: '₹ 1,400 - 1,700',
        gradeB: '₹ 1,100 - 1,300',
        gradeC: '₹ 800 - 1,000',
      },
      {
        name: 'Broccoli',
        emoji: '',
        gradeA: '₹ 6,200 - 6,800',
        gradeB: '₹ 4,800 - 6,000',
        gradeC: '₹ 3,800 - 4,200',
      },
      {
        name: 'Potato',
        emoji: '',
        gradeA: '₹ 2,000 - 2,300',
        gradeB: '₹ 1,600 - 1,900',
        gradeC: '₹ 1,200 - 1,500',
      },
      {
        name: 'Cauliflower',
        emoji: '',
        gradeA: '₹ 2,800 - 3,200',
        gradeB: '₹ 2,200 - 2,700',
        gradeC: '₹ 1,700 - 2,100',
      },
      {
        name: 'Green Chilli',
        emoji: '',
        gradeA: '₹ 2,900 - 3,500',
        gradeB: '₹ 2,400 - 2,800',
        gradeC: '₹ 1,800 - 2,300',
      },
    ],
  };

  constructor(
    public ratesService: RatesService,
    public lang: LanguageService,
  ) {
    // Set initial fallback
    this.displayRates.set(
      this.fallbackRatesMap[this.selectedMandi()] || this.fallbackRatesMap['Azadpur Mandi'],
    );

    // Start listening
    this.startListener();

    // Reactively update display when allRates signal changes
    effect(() => {
      const rates = this.ratesService.allRates();
      if (rates.length > 0) {
        this.updateDisplayRates(rates);
      } else {
        this.displayRates.set(
          this.fallbackRatesMap[this.selectedMandi()] || this.fallbackRatesMap['Azadpur Mandi'],
        );
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

    // Safety timeout: show fallback rates if Firestore doesn't respond within 5s
    this.loadingTimeout = setTimeout(() => {
      if (this.loading()) {
        this.displayRates.set(
          this.fallbackRatesMap[this.selectedMandi()] || this.fallbackRatesMap['Azadpur Mandi'],
        );
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
        gradeA: this.ratesService.formatPrice(rate.gradeAMin, rate.gradeAMax),
        gradeB: this.ratesService.formatPrice(rate.gradeBMin, rate.gradeBMax),
        gradeC: this.ratesService.formatPrice(rate.gradeCMin, rate.gradeCMax),
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
