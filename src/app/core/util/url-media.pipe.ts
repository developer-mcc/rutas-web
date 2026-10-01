import { Pipe, PipeTransform } from '@angular/core';
import { urlMedia } from './media';

/** Uso en plantillas: [src]="imagen | urlMedia". */
@Pipe({ name: 'urlMedia' })
export class UrlMediaPipe implements PipeTransform {
  transform(ruta: string | null | undefined): string {
    return urlMedia(ruta);
  }
}
