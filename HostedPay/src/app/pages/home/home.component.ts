import { AsyncPipe, CommonModule, isPlatformBrowser, Location, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, inject, PLATFORM_ID, signal, TemplateRef, ViewChild } from '@angular/core';
import { Web3ModalCoreButtonWrapperModule } from '../../web3modal-module/web3modal.module';
import { ActivatedRoute, Params, Router, RouterOutlet } from '@angular/router';
import { connect, getAccount, injected, readContract, reconnect, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { ApiService } from '../../services/api.service';
import { wagmiConfig, Web3Service } from '../../services/web3.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsComponent } from '../../toasts/toasts.component';
import { AppToastService } from '../../services/app-toast.service';
import { QrCode } from '../../qr';


const qrCode = new QrCode(); 

//@ts-ignore
const PayProcessorAbi = require('../../../assets/abis/pay-processor.json');

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet,ToastsComponent, Web3ModalCoreButtonWrapperModule, NgxSpinnerModule, AsyncPipe, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NgbActiveModal ]
})
export class HomeComponent {
  @ViewChild('tokenApprovalModal', {static: false}) tokenApprovalModal!: TemplateRef<any>;

  transactionReference?: string

  order: any;



  storeId: any;

  blockChains: any;
  selectedBlockchain: any;

  selectedCurrency: any;
  allCurrencies: any[]|undefined;
  supportedCurrencies: any[]|undefined;
  fiatCurrencies: any;

  
  amountToPay?: bigint;
  nftMetadataUrl?: string;

  private modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);
  ngxSpinner = inject(NgxSpinnerService);

  expireWatchInterval: any;
  isBrowser = signal(false);  // a signal to store if platform is browser

  qrImage: any;

  constructor(public api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public w3s: Web3Service,
    public toastService: AppToastService,
    @Inject(PLATFORM_ID) platformId: object){
    
    this.isBrowser.set(isPlatformBrowser(platformId));  // save isPlatformBrowser in signal
      // console.log("payAbi: ",PayProcessorAbi)
  }

  web3State: {open?: boolean,selectedNetworkId?: number}|undefined

  async ngOnInit(){
    

    this.route.params.subscribe((params: Params) => {
      
      this.transactionReference = params['orderTransactionReference'];
      this.storeId = params['sid'];

      if(!this.transactionReference || !this.storeId){
        return;
      }
      
      this.api.getOrder(this.storeId, this.transactionReference||'none').subscribe({
        next: order=>{
          // console.log('Order:', order)
          this.order=order;

          if(this.order.status!='Expired'){

            if(this.isBrowser()) { // check it where you want to write setTimeout or setInterval
              setInterval(()=> {
                //Todo : stop interval when expired
                //every minute check if order has expired
                this.expireWatchInterval = setInterval(()=>{
                  
                  if(Date.parse(this.order.expiryDate) < Date.now()){
                    this.order.status = 'Expired'
                  }
                }, 1000*60*1)
              }, 10000)
            }
            


          }

          this.w3s.w3mState$.subscribe((state)=>{
            this.web3State=state
          })
          // Start watching for purchased event, for cases where payment is made from external wallet thro qr
        

        
        },
        error: (err)=>{
          console.error('Error loading order: ', err)
          if(this.isBrowser()){
            this.toastService.error('Error','Error loading order', 60000)
          }
          
        },
        complete: ()=>{
          
        }
      
      })
      
      try{
        this.api.getBlockChains().subscribe(chains=>{
          // console.log('chains list:', chains)
          this.blockChains=chains;
        })

        this.api.getAllCurrencies().subscribe((c: any)=>{
          // console.log('currencies:', c)
          this.allCurrencies=c;
        })
      
    
        this.api.getFiatCurrencies().subscribe(c=>{
          this.fiatCurrencies=c;
        })

      }catch(err){
        console.error('Error loading others: ', err)
      }

      
    })

    // //@ts-ignore
    // const storeRes = await readContract(wagmiConfig, {
    //   abi: PayProcessorAbi,
    //   address: '0xA1C16951Ad300Be8D2fb2976303d52ABa5Aa1b25',
    //   functionName: 'getStore',
    //   chainId: 84532,
    //   args: [4
    //   ],
    // })
    // console.log('stores: ', storeRes)

    // setTimeout(async ()=>{

    //   await reconnect(wagmiConfig)
    //   //@ts-ignore
    // const hash = await writeContract(wagmiConfig, {
    //   abi: PayProcessorAbi,
    //   address: '0x9F8FBFb135bfA9233347FA43516E6Ce233EA7e1D',
    //   functionName: 'registerStore',
    //   chainId: 84532,
    //   args: [
    //     'Store1',
    //     '0x9F8FBFb135bfA9233347FA43516E6Ce233EA7e1D',
    //     'txRef',
    //     '',
    //     1
    //   ],
    // })

    // console.log('regster hash: ', hash)
    // }, 4000)

    
  }

  showW3Modal(){
    this.w3s.w3modal?.open({view: 'Connect'})
  }

  ngOnDestroy() {
    if(this.expireWatchInterval){
      clearInterval(this.expireWatchInterval);
    }
    
  }

  async ngAfterViewInit() {
    // child is set
    //console.log('After view init: ')
    
  }

  getCurrency(currencyId: number){
    if(this.allCurrencies){
      const currency = this.allCurrencies.find(f=>f.id==currencyId)
      return currency;
    }
    return undefined;
  }

  getCurrencySymbol(currencyId: number){
    const currency = this.getCurrency(currencyId)      
    if(currency){
      return currency.symbol;
    }
    return '';
  }
 

  selectBlockchain(chain: any){
    this.selectedBlockchain=chain;
    this.supportedCurrencies = this.allCurrencies?.filter(ff=>ff.blockchainId==chain.id)
  }

  backToBlockChainlist(){
    this.selectedBlockchain=undefined;
  }

  backToCurrencyList(){
    this.selectedCurrency=undefined;
  }

  async previewPayment(currency: any){
    this.selectedCurrency=currency;

    this.api.updateOrderCurrency(this.storeId,this.transactionReference??'', currency.id).subscribe(async (updateResponse: any)=>{
      this.amountToPay = BigInt(updateResponse.amountToBillOnChain.toString()) ; // parseUnits( (currency.rate * this.order.baseAmount).toFixed(18), currency.decimals)
      this.nftMetadataUrl = updateResponse.metadataUrl;
      // console.log('amounto pay: ', amountToPay)
      // console.log('amounto payResp : ', updateResponse.amountToBillOnChain)

      /**
       * address: this.selectedBlockchain.contractAddress,
        functionName: 'submitOrder',
        chainId: this.selectedBlockchain.id,
        args: [
          this.storeId,
          this.transactionReference??'',
          currency.contractAddress,
          //@ts-ignore
          amountToPay,//  parseUnits( (currency.rate * this.order.totalInBaseCurrency).toFixed(18), currency.decimals),
          0,
          updateResponse.metadataUrl
        ],
       */

      const params = {
        // from: '0xF9d3C2Adc0dA3B68621fCcFA7c51B66eAf000a05', // optional
        to: this.selectedBlockchain.contractAddress, // contract address
        value: 0,
        chainId: this.selectedBlockchain.id,
        functionName: 'submitOrder', // smart contract method
        functionArgs: [
          { name: 'storeId', type: 'uint256', value: this.storeId },
          { name: 'transactionReference', type: 'bytes32', value: this.transactionReference??'' },
          { name: 'token', type: 'address', value: currency.contractAddress },
          { name: 'amount', type: 'uint256', value: this.amountToPay },
          { name: 'orderType', type: 'uint256', value: 0 },
          { name: 'orderMetadataUrl', type: 'uint256', value: this.nftMetadataUrl },
        ],
      };
      
      const qrCodeDataURL = await qrCode.generateETHqrCode(params);
      // console.log(qrCodeDataURL);
      this.qrImage=qrCodeDataURL

    })
    
  }

  

  async payWithCurrency(currency: any){

    //Todo
    // Check if order has not expired

    let account = getAccount(wagmiConfig)
      
    if(this.w3s.w3modal && (!account || !account.address)  ){
      const { open, selectedNetworkId } = this.w3s.w3modal.getState()
      if(!selectedNetworkId && open!==true ){
        await this.w3s.w3modal.open({ view: 'Connect' })
      }


      
      const result = await reconnect(wagmiConfig)
      
      account = getAccount(wagmiConfig)
      if(!account || !account.address){
        
        this.toastService.error('Error connecting wallet','Cannot find any Injected Blockchain wallet to use')
        return
      }
      // alert('Cannot find any Injected Blockchain wallet to use')
      // return
    }
    
    this.ngxSpinner.show();
    //allowance
    //@ts-ignore
    const allowance = await readContract(wagmiConfig, {
      abi: erc20Abi,
      address: currency.contractAddress,
      chainId: this.selectedBlockchain.id,
      functionName: 'allowance',
      args: [
        account.address as `0x${string}`,
        this.selectedBlockchain.contractAddress
      ]
    })

    if(allowance < this.amountToPay! ){
      this.ngxSpinner.hide();

      const modalRef = this.modalService.open(this.tokenApprovalModal, { ariaLabelledBy: 'modal-basic-title' }).result

      const mResult = await modalRef.catch(        
        (reason) => {
          // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  
          //console.log('Approval not given: ', reason)
        },
      );

      if(!mResult){
        this.ngxSpinner.hide();
        this.toastService.error('Error!',`Error Approving ${currency.name}`);
        return;
      }
      this.ngxSpinner.show();
      try{
        //@ts-ignore
        const approveHash = await writeContract(wagmiConfig, {
          abi: erc20Abi,
          address: currency.contractAddress,
          functionName: 'approve',
          chainId: this.selectedBlockchain.id,
          args: [
            this.selectedBlockchain.contractAddress,
            this.amountToPay! * 10n
          ],
        })

        const approveTransactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: approveHash,
          chainId: this.selectedBlockchain.id,
        })
        this.ngxSpinner.hide()
        this.toastService.show('Approved', 'Approval Successful')
        this.ngxSpinner.show()
      }catch(errApproving){
        console.error('error approving coin', errApproving)
        this.toastService.error('Payment Failed', 'Order Failed')
        this.ngxSpinner.hide()
        return
      }

    }


    //@ts-ignore
    const {request, response} = await simulateContract(wagmiConfig, {
      abi: PayProcessorAbi,
      address: this.selectedBlockchain.contractAddress,
      functionName: 'submitOrder',
      chainId: this.selectedBlockchain.id,
      args: [
        +this.storeId - 1,
        this.transactionReference??'',
        currency.contractAddress,
        //@ts-ignore
        this.amountToPay,//  parseUnits( (currency.rate * this.order.totalInBaseCurrency).toFixed(18), currency.decimals),
        0,
        this.nftMetadataUrl??''
      ],
    })

    try{
      const hash = await writeContract(wagmiConfig, request);

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: hash,
        chainId: this.selectedBlockchain.id,

      })
      // console.log('tx receipt:', transactionReceipt)
      if(transactionReceipt.status=='success'){
        // inform server
        this.api.notifyOrderSuccess(this.storeId,this.transactionReference??'', transactionReceipt.blockNumber)
          .subscribe({
            next: (resp)=>{
              if(resp){
                this.order.status='Paid'
                this.toastService.show('Success', 'Order Completed')
                this.ngxSpinner.hide()

                if(this.isBrowser()){
                  setTimeout(()=>{
                    this.backToMerchantPage()
                  }, 500)
                }
                
              }else{
                this.toastService.error('Payment Failed', 'Order Failed')
                this.ngxSpinner.hide()
              }
            },
            error:(err)=>{
              // console.error('error notifying server', err)
              this.toastService.error('Unknown Error', 'Something went wrong. Your order might have been submitted successfully though so check in a few minutes')
              this.ngxSpinner.hide()
            }
          })

        

        // //redirect to success page
        // this.router.navigate(['/paid', this.storeId,  this.zOrderId]);
      }else{
        this.toastService.error('Payment Failed', 'Order Failed')
        this.ngxSpinner.hide()
      }
    }catch(err){
      this.toastService.error('Payment Failed', 'Order Failed')
      this.ngxSpinner.hide()
    }
    
    
    
  }


  backToMerchantPage(){
    // this.location.go(`${this.order.callBackUrl}?id=${this.transactionReference}`);

    location.href = `${this.order.callBackUrl}?storeOrderId=${this.order.storeOrderId}&txref=${this.transactionReference}`;
  }

}
