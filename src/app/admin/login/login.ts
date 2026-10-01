import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SiteService } from '../../core/services/site.service';
import { mensajeDeError } from '../../core/util/errores';
import { EnfocarAlCrear, enfocarPrimerInvalido } from '../shared/foco';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, EnfocarAlCrear],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly site = inject(SiteService);

  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(60)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });

  constructor() {
    if (this.auth.autenticado()) {
      void this.router.navigate(['/admin']);
    }
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerInvalido(this.document, this.form);
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => void this.router.navigate(['/admin']),
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.enviando.set(false);
      },
    });
  }
}
