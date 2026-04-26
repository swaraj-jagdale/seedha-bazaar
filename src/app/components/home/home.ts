import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { MandiRates } from '../mandi-rates/mandi-rates';
import { HowItWorks } from '../how-it-works/how-it-works';

@Component({
  selector: 'app-home',
  imports: [Hero, MandiRates, HowItWorks],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
