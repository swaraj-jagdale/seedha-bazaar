import { Component, computed } from '@angular/core';
import { AppSettingsService } from '../../services/app-settings.service';

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats {
  stats = computed(() => this.appSettingsService.getStats());

  constructor(private appSettingsService: AppSettingsService) {}
}
