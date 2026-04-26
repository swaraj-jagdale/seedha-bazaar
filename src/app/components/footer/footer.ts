import { Component, signal, computed } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { Stats } from '../stats/stats';

@Component({
  selector: 'app-footer',
  imports: [Stats],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();
  testimonials = computed(() => this.appSettingsService.getTestimonials());
  faqs = computed(() => this.appSettingsService.getFAQs());

  constructor(
    public lang: LanguageService,
    private appSettingsService: AppSettingsService,
  ) {}
}
