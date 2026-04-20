import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuOpen = signal(false);

  constructor(public authService: AuthService, public lang: LanguageService) {}

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  toggleLanguage() {
    this.lang.toggleLanguage();
  }
}
