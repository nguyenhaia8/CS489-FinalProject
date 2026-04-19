import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from './auth.service';
import { User } from './types';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  map,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
} from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  template: `
    <div class="wrap-signup">
      <h1 class="title">Sign up</h1>
      <form [formGroup]="form" (ngSubmit)="handleSignUp()">
        <div>
          <input type="text" placeholder="Username" [formControl]="username" />
          @if(username.invalid && username.touched) { @if(username.hasError('required')) {
          <p class="error">Username is required</p>
          } }
        </div>

        <div>
          <div class="verify-email">
            <input type="email" placeholder="Email" [formControl]="email" />
            <span [aria-busy]="isLoadingVerify()" class="verify-loading"></span>
          </div>
          @if(email.invalid && email.touched) { @if(email.hasError('required')) {
          <p class="error">Email is required</p>
          } @if(email.hasError('email')) {
          <p class="error">Value must be an email address</p>
          } @if(email.hasError('accountExist')) {
          <p class="error">Email is already used</p>
          } }
        </div>

        <div>
          <input type="password" placeholder="Password" [formControl]="password" />
          @if(password.invalid && password.touched) { @if(password.hasError('required')) {
          <p class="error">Password is required</p>
          } @if(password.hasError('minlength')) {
          <p class="error">Password must be at least 6 characters</p>
          } }
        </div>

        <div>
          <input
            type="password"
            placeholder="Please re-enter your password"
            [formControl]="password2"
          />
          @if(password2.invalid && password2.touched) { @if(password2.hasError('required')) {
          <p class="error">Please re-enter your password</p>
          } @if(password2.hasError('minlength')) {
          <p class="error">Password must be at least 6 characters</p>
          } @if(form.hasError('passwordMismatch') && form.touched) {
          <p class="error">Passwords do not match</p>
          } }
        </div>

        <button type="submit" [aria-busy]="isLoading()">Sign Up</button>

        @if(errorMessage) {
        <p class="error">{{ errorMessage }}</p>
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
      background: white;
    }
    
    input.ng-invalid.ng-touched {
      border-color: red;
    }
    
    button {
      padding: 15px;
      background-color: #007bff;
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

    .verify-email {
      position: relative;
      .verify-loading {
        position: absolute;
        top: 18px;
        right: 15px;
      }
    }
  `,
})
export class SignupComponent {
  #authService = inject(AuthService);
  #router = inject(Router);
  formbuilder = inject(FormBuilder);
  isLoading = signal(false);
  isLoadingVerify = signal(false);

  errorMessage: string = '';

  verifyEmail = (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return control.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap((email) => {
        if (!email) {
          return of(null);
        }
        this.isLoadingVerify.set(true);
        return this.#authService.verifyAccount(email).pipe(
          map((res) => {
            this.isLoadingVerify.set(false);
            if (res.success) {
              return null;
            } else {
              return { accountExist: true };
            }
          }),
          catchError(() => {
            this.isLoadingVerify.set(false);
            return of(null);
          })
        );
      }),
      take(1)
    );
  };

  passwordMatch = (controls: AbstractControl): ValidationErrors | null => {
    const password = controls.get('password')?.value;
    const password2 = controls.get('password2')?.value;
    if (password === password2) {
      return null;
    } else {
      return { passwordMismatch: true };
    }
  };

  form = this.formbuilder.nonNullable.group(
    {
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email], [this.verifyEmail]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required, Validators.minLength(6)]],
    },
    {
      validators: [this.passwordMatch],
    }
  );

  get username() {
    return this.form.controls.username;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get password2() {
    return this.form.controls.password2;
  }

  handleSignUp() {
    this.errorMessage = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.#authService.signup(this.form.value as User).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          // redirect to sign in
          this.#router.navigate(['', 'signin']);
        } else {
          this.errorMessage = 'Sign up failed. Please try again.';
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      },
    });
  }
}
