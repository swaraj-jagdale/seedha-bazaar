import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { MandiRates } from '../mandi-rates/mandi-rates';
import { HowItWorks } from '../how-it-works/how-it-works';
import { Faq } from '../faq/faq';

@Component({
  selector: 'app-home',
  imports: [Hero, MandiRates, HowItWorks, Faq],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
