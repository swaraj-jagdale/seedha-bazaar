import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RatesService, CropRate, Grade } from '../../services/rates.service';
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
    { name: 'Onion' },
    { name: 'Tomato' },
    { name: 'Broccoli' },
    { name: 'Potato' },
    { name: 'Cauliflower' },
    { name: 'Green Chilli' },
  ];

  mandis = ['Azadpur Mandi', 'Vashi Mandi', 'Lasalgaon Mandi'];

  selectedCrop = '';
  isCustomCrop = false;
  customCropName = '';
  selectedMandi = 'Azadpur Mandi';
  isCustomMandi = false;
  customMandiName = '';
  photo = '';
  photoPreview = '';
  grades: Grade[] = [{ name: 'Grade A', price: 0 }];
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private ratesService: RatesService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.editRate) {
      const existingCrop = this.crops.find((c) => c.name === this.editRate!.crop);
      if (existingCrop) {
        this.selectedCrop = this.editRate.crop;
      } else {
        this.selectedCrop = '__custom__';
        this.isCustomCrop = true;
        this.customCropName = this.editRate.crop;
      }
      const existingMandi = this.mandis.find((m) => m === this.editRate!.mandi);
      if (existingMandi) {
        this.selectedMandi = this.editRate.mandi;
      } else {
        this.selectedMandi = '__custom__';
        this.isCustomMandi = true;
        this.customMandiName = this.editRate.mandi;
      }
      this.photo = this.editRate.photo || '';
      this.photoPreview = this.editRate.photo || '';
      this.grades = this.editRate.grades || [{ name: 'Grade A', price: 0 }];
    }
  }

  onCropChange() {
    this.isCustomCrop = this.selectedCrop === '__custom__';
    if (!this.isCustomCrop) {
      this.customCropName = '';
    }
  }

  onMandiChange() {
    this.isCustomMandi = this.selectedMandi === '__custom__';
    if (!this.isCustomMandi) {
      this.customMandiName = '';
    }
  }

  getCropName(): string {
    if (this.isCustomCrop) {
      return this.customCropName;
    }
    return this.selectedCrop;
  }

  getMandiName(): string {
    if (this.isCustomMandi) {
      return this.customMandiName;
    }
    return this.selectedMandi;
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

    if (this.isCustomMandi && !this.customMandiName.trim()) {
      this.error = 'Please enter the mandi name';
      return;
    }

    if (this.grades.length === 0) {
      this.error = 'Please add at least one grade';
      return;
    }

    if (this.grades.some((g) => g.price <= 0)) {
      this.error = 'Please enter valid prices for all grades';
      return;
    }

    const user = this.authService.currentUser();
    if (!user) return;

    this.loading = true;

    try {
      const rateData: any = {
        merchantId: user.uid,
        merchantName: user.displayName || 'Unknown',
        mandi: this.getMandiName(),
        crop: this.getCropName(),
        grades: this.grades,
        platformFee: 0,
        status: 'pending' as const,
      };

      if (this.photo) {
        rateData.photo = this.photo;
      }

      if (this.editRate?.id) {
        await this.ratesService.updateRate(this.editRate.id, rateData);
      } else {
        await this.ratesService.addRate(rateData);
      }

      this.saved.emit();
    } catch (err) {
      console.error('Failed to save rate:', err);
      this.error = 'Failed to save rate. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.cancelled.emit();
  }

  onPhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image size must be less than 5MB';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
      this.photo = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.photo = '';
    this.photoPreview = '';
  }

  addGrade() {
    if (this.grades.length >= 3) {
      this.error = 'Maximum 3 grades allowed';
      return;
    }
    const defaultNames = ['Grade A', 'Grade B', 'Grade C'];
    const nextIndex = this.grades.length;
    this.grades.push({ name: defaultNames[nextIndex] || `Grade ${nextIndex + 1}`, price: 0 });
  }

  removeGrade(index: number) {
    if (this.grades.length <= 1) {
      this.error = 'At least one grade is required';
      return;
    }
    this.grades.splice(index, 1);
  }
}
