import { NgModule } from '@angular/core';
import { ResourceMapPipe } from './resource-map.pipe';

@NgModule({
  declarations: [ResourceMapPipe],
  exports: [ResourceMapPipe]
})
export class ResourceMapModule {}
