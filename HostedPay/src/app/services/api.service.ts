import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const BaseAPIUrl = environment.BaseAPiUrl

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {

    
   }

  getBlockChains(){
    return this.http.get(`${BaseAPIUrl}/blockchains`)
  }

  getBlockChain(chainId: number){
    return this.http.get(`${BaseAPIUrl}/blockchains/${chainId}`)
  }

  getCurrencies(chainId?: number){
    const blockChainQuery2 = chainId? `blockchainId:${chainId}`:undefined
    const where2 = blockChainQuery2? `?where=${blockChainQuery2}`:''
    
    return this.http.get(`${BaseAPIUrl}/currency${where2}`)
  }

  getFiatCurrencies(){
    const where = `where=currencyType:FIAT`
    return this.http.get(`${BaseAPIUrl}/currency?${where}`)
  }

  getAllCurrencies(){
    return this.http.get(`${BaseAPIUrl}/currency`)
  }

  getOrder(storeId: any, orderTransactionReference: string){
    // let options = {
    //   headers: new HttpHeaders(
    //       // { 'Accept': 'application/json' },
    //       { 'rejectUnauthorized': 'false' }
    //       )
    //   };
    return this.http.get(`${BaseAPIUrl}/orders/by-reference/${storeId}/${orderTransactionReference}`)
  }

  updateOrderCurrency(storeId: any, orderTransactionReference: string, chosenCurrencyId: number){
    return this.http.post(`${BaseAPIUrl}/orders/update-order-currency/${storeId}/${orderTransactionReference}`, {
      currencyId: chosenCurrencyId
    })
  }

  notifyOrderSuccess(storeId: any, orderTransactionReference: string, blockNumber: any){
    return this.http.post(`${BaseAPIUrl}/orders/update-order-successful/${storeId}`, {
      blockNumber: blockNumber.toString(),
      orderTransactionReference: orderTransactionReference
    })
  }

}
