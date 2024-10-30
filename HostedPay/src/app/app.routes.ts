import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PaySuccessfulComponent } from './pages/pay-successful/pay-successful.component';
import { TestComponent } from './pages/test/test.component';

export const routes: Routes = [
    { path: ':sid/:orderTransactionReference',title:"Pay with ZarPay", component: HomeComponent }, 
    // { path: 'test',title:"Test", component: TestComponent }, 
    // { path: '',title:"", component: TestComponent, pathMatch: 'full' }, 
    // { path: 'paid/:sid/:orderId',title:"Payment Sucessful", component: PaySuccessfulComponent }, 
    
];
