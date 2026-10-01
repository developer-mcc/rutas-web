import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Faq } from '../../core/models/api.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { EnfocarAlCrear, RetornarFoco, enfocarPrimerInvalido } from '../shared/foco';

@Component({
  selector: 'app-faqs-admin',
  imports: [ReactiveFormsModule, EnfocarAlCrear, RetornarFoco],
  templateUrl: './faqs-admin.html',
})
export class FaqsAdmin {
  private readonly api = inject(AdminApiService);
  private readonly document = inject(DOCUMENT);

  protected readonly faqs = signal<Faq[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  /** Faq que se edita, "nueva" para crear, o nulo si el formulario está cerrado. */
  protected readonly editando = signal<Faq | 'nueva' | null>(null);
  protected readonly confirmando = signal<number | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    pregunta: ['', [Validators.required, Validators.maxLength(300)]],
    respuesta: ['', [Validators.required, Validators.maxLength(4000)]],
    orden: [0, Validators.min(0)],
    activo: [true],
  });

  constructor() {
    this.cargar();
  }

  protected nueva(): void {
    const siguiente = Math.max(0, ...this.faqs().map((faq) => faq.orden)) + 1;
    this.form.reset({ pregunta: '', respuesta: '', orden: siguiente, activo: true });
    this.editando.set('nueva');
  }

  protected editar(faq: Faq): void {
    this.form.reset({
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      orden: faq.orden,
      activo: faq.activo,
    });
    this.editando.set(faq);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerInvalido(this.document, this.form);
      return;
    }
    const valores = this.form.getRawValue();
    const solicitud = { ...valores, orden: Number(valores.orden) };
    const actual = this.editando();
    const operacion =
      actual === 'nueva' || actual === null
        ? this.api.crearFaq(solicitud)
        : this.api.actualizarFaq(actual.id, solicitud);
    this.error.set('');
    operacion.subscribe({
      next: () => {
        this.editando.set(null);
        this.cargar();
      },
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  protected eliminar(faq: Faq): void {
    this.confirmando.set(null);
    this.api.eliminarFaq(faq.id).subscribe({
      next: () => this.cargar(),
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  private cargar(): void {
    this.api.listarFaqs().subscribe({
      next: (faqs) => {
        this.faqs.set(faqs);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }
}
