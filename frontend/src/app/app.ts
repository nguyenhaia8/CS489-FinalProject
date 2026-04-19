import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { InitState } from './auth/types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-brand">
          <h1>{{ title() }}</h1>
        </div>

        <div class="nav-links">
          @if(authService.appState().accessToken) { @if(authService.isAdmin()) {
          <a [routerLink]="['', 'manage']" routerLinkActive="active">{{
            'nav.manage' | translate
          }}</a>
          }
          <a [routerLink]="['', 'learning']" routerLinkActive="active">{{
            'nav.learning' | translate
          }}</a>
          <a [routerLink]="['', 'history']" routerLinkActive="active">{{
            'nav.history' | translate
          }}</a>
          <a [routerLink]="['', 'profile']" routerLinkActive="active">{{
            'nav.profile' | translate
          }}</a>
          <button (click)="logout()" class="logout-btn">{{ 'nav.logout' | translate }}</button>

          } @else {
          <a [routerLink]="['', 'signin']" routerLinkActive="active">{{
            'nav.signin' | translate
          }}</a>
          <a [routerLink]="['', 'signup']" routerLinkActive="active">{{
            'nav.signup' | translate
          }}</a>
          }
        </div>
      </div>
    </nav>

    <div class="container">
      <router-outlet />
    </div>
  `,
  styles: `
    .navbar {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      margin-bottom: 40px;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 42px;
      width: 100%;
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: white;
      font-family: 'Montserrat';
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 48px;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 10px 20px;
      border-radius: 0.5rem;
      transition: all 0.3s;
      position: relative;
      font-size: 19px
    }

    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.25);
      font-weight: 600;
    }

    .logout-btn {
      padding: 10px 22px;
      min-width: auto;
      font-size: 18px;
    }
  `,
})
export class App {
  protected readonly title = signal('prepInterview');
  authService = inject(AuthService);
  #router = inject(Router);

  logout() {
    this.authService.appState.set(InitState);
    this.#router.navigate(['', 'signin']);
  }
}
