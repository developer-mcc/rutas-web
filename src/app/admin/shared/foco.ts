import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EnvironmentInjector,
  OnDestroy,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

/** Lleva el foco al elemento cuando aparece (confirmaciones, formularios que se abren en pantalla). */
@Directive({ selector: '[admEnfocar]' })
export class EnfocarAlCrear implements AfterViewInit {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    this.elemento.nativeElement.focus();
  }
}

/**
 * Al desaparecer el elemento (se cancela o termina una acción), devuelve el foco al control con ese id.
 * Si ya no existe (por ejemplo, se borró su fila), el foco va al contenido principal.
 */
@Directive({ selector: '[admRetorno]' })
export class RetornarFoco implements OnDestroy {
  readonly admRetorno = input.required<string>();
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);

  ngOnDestroy(): void {
    const id = this.admRetorno();
    afterNextRender(
      () =>
        (this.document.getElementById(id) ?? this.document.getElementById('contenido'))?.focus(),
      { injector: this.injector },
    );
  }
}

/** Enfoca el primer campo inválido de un formulario (por su formControlName) tras un envío fallido. */
export function enfocarPrimerInvalido(documento: Document, formulario: FormGroup): void {
  const nombre = Object.keys(formulario.controls).find(
    (clave) => formulario.controls[clave].invalid,
  );
  if (nombre) {
    documento.querySelector<HTMLElement>(`[formcontrolname="${nombre}"]`)?.focus();
  }
}
