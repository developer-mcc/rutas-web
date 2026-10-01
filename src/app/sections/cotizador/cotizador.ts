import { DOCUMENT } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SiteService } from '../../core/services/site.service';

/** Cantidades que acepta la API (el último valor significa "5 o más"). */
const PASAJEROS = ['1', '2', '3', '4', '5+'];

@Component({
  selector: 'app-cotizador',
  imports: [ReactiveFormsModule],
  templateUrl: './cotizador.html',
})
export class Cotizador {
  protected readonly site = inject(SiteService);
  private readonly api = inject(ApiService);
  private readonly document = inject(DOCUMENT);

  protected readonly pasajeros = PASAJEROS;
  protected readonly items = computed(() => this.site.bloquesDe('cotizador'));
  protected readonly hoy = this.fechaLocal(new Date());

  protected readonly form = inject(FormBuilder).nonNullable.group({
    tourId: ['', Validators.required],
    fechaViaje: ['', Validators.required],
    pasajeros: ['', Validators.required],
    recojo: ['', [Validators.required, Validators.maxLength(200)]],
  });

  /** Mensaje de campo obligatorio: editable desde los ajustes; este es el de respaldo. */
  protected get mensajeError(): string {
    return this.site.texto('cotizador.error_obligatorio') || 'Completa este campo para continuar.';
  }

  /** "true" solo cuando el campo es inválido y el usuario ya lo tocó (valor del atributo aria-invalid). */
  protected invalido(nombre: 'tourId' | 'fechaViaje' | 'pasajeros' | 'recojo'): 'true' | null {
    const control = this.form.controls[nombre];
    return control.invalid && control.touched ? 'true' : null;
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // El foco va al primer campo con error para que teclado y lector de pantalla lo encuentren.
      const primero = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]).find(
        (nombre) => this.form.controls[nombre].invalid,
      );
      this.document.querySelector<HTMLElement>(`.form [formcontrolname="${primero}"]`)?.focus();
      return;
    }
    const valores = this.form.getRawValue();
    const tour = this.site.tours().find((candidato) => candidato.id === Number(valores.tourId));
    if (!tour) {
      return;
    }
    // WhatsApp se abre primero y de forma síncrona para que el navegador no bloquee la ventana.
    const mensaje = this.site
      .texto('whatsapp.mensaje_cotizacion')
      .replace('{destino}', tour.nombre)
      .replace('{fecha}', valores.fechaViaje)
      .replace('{pasajeros}', valores.pasajeros)
      .replace('{recojo}', valores.recojo);
    this.document.defaultView?.open(this.site.whatsappUrl(mensaje), '_blank', 'noopener');

    // El registro en el sistema es secundario: si falla, el cliente ya contactó por WhatsApp.
    this.api
      .registrarCotizacion({
        tourId: tour.id,
        fechaViaje: valores.fechaViaje,
        pasajeros: valores.pasajeros,
        recojo: valores.recojo,
      })
      .subscribe({ error: () => undefined });
  }

  /** Fecha local en formato yyyy-MM-dd (la que espera el input de tipo date). */
  private fechaLocal(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
