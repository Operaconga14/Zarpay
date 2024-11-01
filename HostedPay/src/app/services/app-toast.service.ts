import { Injectable } from '@angular/core';


export interface ToastInfo {
  header: string;
  body: string;
  delay?: number; //delay in ms
  cssClasses?: string; // bg-success text-light
}

@Injectable({ 
  providedIn: 'root' 
})
export class AppToastService {
  toasts: ToastInfo[] = [];

  
  show(header: string, body: string, delay?: number, cssClasses?: string) {
    
    this.toasts.push({ header, body, delay , cssClasses});
  }

  error(header: string, body: string, delay: number=4000, cssClasses: string|undefined=undefined) {
    
    this.toasts.push({ header, body, delay , cssClasses: 'bg-danger text-light' + (cssClasses??'') });
  }

  hide(toast: ToastInfo) {
    this.toasts = this.toasts.filter(t => t != toast);
  }


}
