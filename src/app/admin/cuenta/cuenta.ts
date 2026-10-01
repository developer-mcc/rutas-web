import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/admin.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { enfocarPrimerInvalido } from '../shared/foco';

const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'RUC'];
/** Mismos formatos que valida la API (ValidacionPatrones). */
const PATRON_DOCUMENTO = /^[A-Za-z0-9-]{4,20}$/;
const PATRON_TELEFONO = /^\+?\d[\d ()-]{5,29}$/;

/** El tipo y el número de documento van juntos y el número debe tener el formato de su tipo. */
function documentoCoherente(grupo: AbstractControl): ValidationErrors | null {
  const tipo = grupo.get('tipoDocumento')?.value as string;
  const numero = ((grupo.get('numeroDocumento')?.value as string) ?? '').trim();
  if (!tipo && !numero) {
    return null;
  }
  if (!tipo || !numero) {
    return { documento: 'Indica el tipo y el número de documento, o deja ambos vacíos' };
  }
  if (tipo === 'DNI' && !/^\d{8}$/.test(numero)) {
    return { documento: 'El DNI debe tener 8 dígitos' };
  }
  if (tipo === 'RUC' && !/^\d{11}$/.test(numero)) {
    return { documento: 'El RUC debe tener 11 dígitos' };
  }
  return null;
}

@Component({
  selector: 'app-cuenta',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './cuenta.html',
})
export class Cuenta {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly tiposDocumento = TIPOS_DOCUMENTO;

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly errorPerfil = signal('');
  protected readonly guardandoPerfil = signal(false);
  protected readonly errorGuardado = signal('');
  protected readonly mensajePerfil = signal('');

  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  protected readonly formPerfil = this.fb.group(
    {
      nombres: ['', [Validators.required, Validators.maxLength(120)]],
      apellidos: ['', [Validators.required, Validators.maxLength(120)]],
      tipoDocumento: [''],
      numeroDocumento: ['', [Validators.maxLength(20), Validators.pattern(PATRON_DOCUMENTO)]],
      email: ['', [Validators.maxLength(160), Validators.email]],
      telefono: ['', [Validators.maxLength(30), Validators.pattern(PATRON_TELEFONO)]],
    },
    { validators: documentoCoherente },
  );

  protected readonly form = this.fb.group({
    actual: ['', [Validators.required, Validators.maxLength(128)]],
    nueva: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
    repetir: ['', Validators.required],
  });

  constructor() {
    this.api.perfil().subscribe({
      next: (perfil) => this.mostrar(perfil),
      error: (fallo: unknown) => this.errorPerfil.set(mensajeDeError(fallo)),
    });
  }

  /** Mensaje de la validación conjunta tipo/número de documento (solo tras tocar sus campos). */
  protected errorDocumento(): string {
    const { tipoDocumento, numeroDocumento } = this.formPerfil.controls;
    const tocado = tipoDocumento.touched || numeroDocumento.touched;
    return tocado ? ((this.formPerfil.errors?.['documento'] as string | undefined) ?? '') : '';
  }

  protected guardarPerfil(): void {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      enfocarPrimerInvalido(this.document, this.formPerfil);
      if (this.formPerfil.errors?.['documento']) {
        this.document.querySelector<HTMLElement>('[formcontrolname="tipoDocumento"]')?.focus();
      }
      return;
    }
    const valores = this.formPerfil.getRawValue();
    this.guardandoPerfil.set(true);
    this.errorGuardado.set('');
    this.mensajePerfil.set('');
    this.api
      .actualizarPerfil({
        ...valores,
        tipoDocumento: valores.tipoDocumento || null,
      })
      .subscribe({
        next: (perfil) => {
          this.mostrar(perfil);
          this.auth.actualizarNombre(perfil.persona.nombreCompleto);
          this.mensajePerfil.set('Perfil actualizado.');
          this.guardandoPerfil.set(false);
        },
        error: (fallo: unknown) => {
          this.errorGuardado.set(mensajeDeError(fallo));
          this.guardandoPerfil.set(false);
        },
      });
  }

  protected cambiar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerInvalido(this.document, this.form);
      return;
    }
    const { actual, nueva, repetir } = this.form.getRawValue();
    if (nueva !== repetir) {
      this.error.set('La contraseña nueva y su repetición no coinciden');
      this.document.querySelector<HTMLElement>('[formcontrolname="repetir"]')?.focus();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.api.cambiarPassword(actual, nueva).subscribe({
      next: () => {
        this.mensaje.set('Contraseña actualizada.');
        this.form.reset();
        this.enviando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.enviando.set(false);
      },
    });
  }

  private mostrar(perfil: Perfil): void {
    this.perfil.set(perfil);
    this.formPerfil.reset({
      nombres: perfil.persona.nombres,
      apellidos: perfil.persona.apellidos,
      tipoDocumento: perfil.persona.tipoDocumento ?? '',
      numeroDocumento: perfil.persona.numeroDocumento ?? '',
      email: perfil.persona.email ?? '',
      telefono: perfil.persona.telefono ?? '',
    });
  }
}
