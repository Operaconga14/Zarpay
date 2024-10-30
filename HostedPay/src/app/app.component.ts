import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastsComponent } from './toasts/toasts.component';
import { Web3Service } from './services/web3.service';
import { Web3ModalCoreButtonWrapperModule } from './web3modal-module/web3modal.module';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet,  NgxSpinnerModule, ToastsComponent, Web3ModalCoreButtonWrapperModule, AsyncPipe, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'Zarpay hosted-pay';

  ngxSpinner = inject(NgxSpinnerService);

  

  constructor(private router: Router,public w3s: Web3Service){
    
  }

  // ngOnInit(){
  //   const sid = 1;
  //   const txref = '0x9fea8411d3716a7f9a8e99c3e0ce2e491e2120284d1fa7afbe4fa22341248984';
  //   console.log(`Navigating to /${txref}/${sid}`);
  //   this.router.navigate([`/${txref}/${sid}`]).catch(error => {
  //     console.error('Navigation error:', error);
  //   });
  // }
}
