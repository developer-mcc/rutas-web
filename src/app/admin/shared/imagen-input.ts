import { Component, inject, input, output, signal } from '@angular/core';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { UrlMediaPipe } from '../../core/util/url-media.pipe';

/** Campo de imagen: vista previa, subida de archivo (JPG/PNG/WebP) o URL https escrita a mano. */
@Component({
  imports: [UrlMediaPipe],
  selector: 'app-imagen-input',
  templateUrl: './imagen-input.html',
})
export class ImagenInput {
  private readonly api = inject(AdminApiService);

  readonly valor = input('');
  readonly cambio = output<string>();

  protected readonly subiendo = signal(false);
  protected readonly error = signal('');

  protected subir(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    if (!archivo) {
      return;
    }
    this.subiendo.set(true);
    this.error.set('');
    this.api.subirImagen(archivo).subscribe({
      next: (imagen) => {
        this.cambio.emit(imagen.url);
        this.subiendo.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.subiendo.set(false);
      },
    });
    campo.value = '';
  }

  protected editarTexto(evento: Event): void {
    this.cambio.emit((evento.target as HTMLInputElement).value.trim());
  }
}
