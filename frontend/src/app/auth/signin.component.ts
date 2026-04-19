import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  template: `
    <div class="wrap-signup">
      <h1 class="title">Sign in</h1>
      <form [formGroup]="form" (ngSubmit)="handleSignin()">
        <div>
          <input type="email" placeholder="Email" [formControl]="email" />

          @if(email.invalid && email.touched) { @if(email.hasError('required')) {
          <p class="error">Email is required</p>
          } @if(email.hasError('email')) {
          <p class="error">Value must be an email address</p>
          } }
        </div>

        <div>
          <input type="password" placeholder="Password" [formControl]="password" />
          @if(password.invalid && password.touched) { @if(password.hasError('required')) {
          <p class="error">Password is required</p>
          } }
        </div>

        <button type="submit" [disabled]="form.invalid" [aria-busy]="isLoading()">Sign in</button>

        @if(errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
        }
      </form>
    </div>
  `,
  styles: `
   .wrap-signup {
      margin-top: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center
    }

    .title {
      margin-bottom: 50px;
      color: white;
      font-family: 'Montserrat';
    }

    .error {
      color: red;
      font-size: 16px;
      margin-top: 5px;
      margin-bottom: 5px;
    }
    
    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 400px;
    }
    
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 5px;
      background-color: white;
    }
    
    input.ng-invalid.ng-touched {
      border-color: red;
    }
    
    button {
      padding: 15px;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid white;
      margin-bottom: 0;
    }
    
    button:disabled {
      background: gray;
      pointer-events: auto;
      cursor: not-allowed;
      border: 2px solid white;
    }

  `,
})
export class SigninComponent {
  errorMessage = signal('');
  #router = inject(Router);
  #authService = inject(AuthService);
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  isLoading = signal(false);

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  handleSignin() {
    this.isLoading.set(true);
    this.#authService.signin({ email: this.email.value, password: this.password.value }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.#authService.appState.set(res.data);
          this.#router.navigate(['', 'learning']);
        } else {
          this.errorMessage.set('Sign up failed. Please try again.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Something went wrong');
        }
      },
    });
  }
}
