import { Pipe, PipeTransform } from '@angular/core';
import { resourceMapper } from './base-path';

@Pipe({
  name: 'resourceMap'
})
export class ResourceMapPipe implements PipeTransform {
  transform(value: string, moduleName: string): string {
    if (!moduleName) {
      throw new Error('The module name is required');
    }
    return resourceMapper(moduleName, value);
  }
}
