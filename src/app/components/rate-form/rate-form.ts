import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RatesService, CropRate } from '../../services/rates.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-rate-form',
  imports: [FormsModule],
  templateUrl: './rate-form.html',
  styleUrl: './rate-form.scss',
})
export class RateForm implements OnInit {
  @Input() editRate: CropRate | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  crops = [
    { name: 'Onion', emoji: '🧅' },
    { name: 'Tomato', emoji: '🍅' },
    { name: 'Broccoli', emoji: '🍎' },
    { name: 'Potato', emoji: '🥔' },
    { name: 'Cauliflower', emoji: '🥦' },
    { name: 'Green Chilli', emoji: '🌶️' },
  ];

  mandis = ['Azadpur Mandi', 'Vashi Mandi', 'Lasalgaon Mandi'];

  selectedCrop = '';
  isCustomCrop = false;
  customCropName = '';
  customCropEmoji = '';
  selectedMandi = 'Azadpur Mandi';
  gradeAMin = 0;
  gradeAMax = 0;
  gradeBMin = 0;
  gradeBMax = 0;
  gradeCMin = 0;
  gradeCMax = 0;
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private ratesService: RatesService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    if (this.editRate) {
      const existingCrop = this.crops.find(c => c.name === this.editRate!.crop);
      if (existingCrop) {
        this.selectedCrop = this.editRate.crop;
      } else {
        this.selectedCrop = '__custom__';
        this.isCustomCrop = true;
        this.customCropName = this.editRate.crop;
        this.customCropEmoji = this.editRate.emoji;
      }
      this.selectedMandi = this.editRate.mandi;
      this.gradeAMin = this.editRate.gradeAMin;
      this.gradeAMax = this.editRate.gradeAMax;
      this.gradeBMin = this.editRate.gradeBMin;
      this.gradeBMax = this.editRate.gradeBMax;
      this.gradeCMin = this.editRate.gradeCMin;
      this.gradeCMax = this.editRate.gradeCMax;
    }
  }

  onCropChange() {
    this.isCustomCrop = this.selectedCrop === '__custom__';
    if (!this.isCustomCrop) {
      this.customCropName = '';
      this.customCropEmoji = '';
    }
  }

  getCropName(): string {
    if (this.isCustomCrop) {
      return this.customCropName;
    }
    return this.selectedCrop;
  }

  getEmoji(): string {
    if (this.isCustomCrop) {
      return this.customCropEmoji || '🌾';
    }
    return this.crops.find((c) => c.name === this.selectedCrop)?.emoji || '';
  }

  async onSubmit() {
    this.error = '';

    if (!this.selectedCrop) {
      this.error = 'Please select a crop';
      return;
    }

    if (this.isCustomCrop && !this.customCropName.trim()) {
      this.error = 'Please enter the crop name';
      return;
    }

    if (this.gradeAMin <= 0 || this.gradeAMax <= 0) {
      this.error = 'Please enter valid Grade A prices';
      return;
    }

    const user = this.authService.currentUser();
    if (!user) return;

    this.loading = true;

    try {
      const rateData = {
        merchantId: user.uid,
        merchantName: user.displayName || 'Unknown',
        mandi: this.selectedMandi,
        crop: this.getCropName(),
        emoji: this.getEmoji(),
        gradeAMin: this.gradeAMin,
        gradeAMax: this.gradeAMax,
        gradeBMin: this.gradeBMin,
        gradeBMax: this.gradeBMax,
        gradeCMin: this.gradeCMin,
        gradeCMax: this.gradeCMax,
      };

      if (this.editRate?.id) {
        await this.ratesService.updateRate(this.editRate.id, rateData);
      } else {
        await this.ratesService.addRate(rateData);
      }

      this.saved.emit();
    } catch (err) {
      this.error = 'Failed to save rate. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.cancelled.emit();
  }
}
