import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelViewerComponent } from './model-viewer/model-viewer.component';

const routes: Routes = [
  { path: '', component: ModelViewerComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
