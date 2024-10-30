import { Injectable } from '@angular/core';
// import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
// import { Web3Modal } from '@web3modal/html'
import {   createConfig, fetchBalance, getBalance, getChainId, injected, reconnect, simulateContract, 
  watchAccount, watchChainId, watchConnections, writeContract } from '@wagmi/core';
import {aurora, auroraTestnet, arbitrum, Chain, fantom, base, baseSepolia, fantomTestnet, goerli, mainnet, 
  sepolia, polygon, bsc, bscTestnet, celo, celoAlfajores, 
  hardhat, metisGoerli, etherlinkTestnet, shardeumSphinx } from '@wagmi/core/chains';
import { getAccount, readContract,    getPublicClient, getWalletClient} from '@wagmi/core';

import {erc20Abi} from 'viem'


import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';


import { FallbackTransport, formatUnits, http, parseUnits } from 'viem';
import {  type GetChainIdReturnType } from '@wagmi/core'
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { Web3Modal, authConnector, createWeb3Modal } from '@web3modal/wagmi';

const projectId = environment.walletConnectProjectId;

const metadata = {
  name: 'ZarPay',
  description: 'Web3Modal Example',
  url: 'https://hp-zarpay.zarclays.com', // url must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const supportedChains:[Chain, ...Chain[]] = [aurora, auroraTestnet, hardhat,  ]//mainnet, sepolia, baseSepolia, base, etherlinkTestnet, shardeumSphinx
//@ts-ignore
export const wagmiConfig = createConfig({
  chains: supportedChains ,
  connectors: [
    walletConnect({ projectId: projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    }),
    authConnector({
      chains: supportedChains,
      options: { projectId },
      email: true, // default to true
      socials: ['google', 'x', 'github', 'discord', 'apple'],
      showWallets: true, // default to true
      walletFeatures: true // default to true
    })
  ],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [etherlinkTestnet.id]: http(),
    [shardeumSphinx.id]: http(),
    [aurora.id]: http(),
    [auroraTestnet.id]: http(),
  },
})

export const chains: Record<number, Chain> = {
  1: mainnet,
  84532: baseSepolia,
  8453: base,
  11155111: sepolia,
  128123: etherlinkTestnet,
  8082: shardeumSphinx,
  31337: hardhat,
  1313161554: aurora,
  1313161555: auroraTestnet


} 

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  
  w3modal?: Web3Modal;

  private _chainId$ = new BehaviorSubject<number|undefined>(undefined);
  
  public chainId$ = this._chainId$.asObservable()

  public get chainId(){
    
    return this._chainId$.value;
  }

  private _account$ = new BehaviorSubject<string|undefined>(undefined);
  
  public account$ = this._account$.asObservable()

  public get account(){
    
    return this._account$.value;
  }

  private _w3mState$ = new BehaviorSubject<{open?: boolean,selectedNetworkId?: number}|undefined>(undefined);
  
  public w3mState$ = this._w3mState$.asObservable()

  public get w3mState(){
    
    return this._w3mState$.value;
  }

  unwatchAccount : any;

  unwatchNetwork : any;

  
  constructor() {
    setTimeout(() => {
      // reconnect(wagmiConfig).then((reconnected)=>{
      //   console.log('Recoon: ', reconnected)
      //   setTimeout(async ()=>{
      //     try{
            
    
            
      //       const {address, isConnected} = getAccount(wagmiConfig);
      //       if(isConnected){
      //         this._account$.next(address)
      //       }else{
      //         await this.w3modal.open();
      //       }
            
      //       const chainId   = getChainId(wagmiConfig);
      //       if(chainId ){
              
      //         this._chainId$.next(chainId );
      //       }
    
      //       //Update chainId on change
      //       this.unwatchNetwork = watchChainId(wagmiConfig,      
      //         {
      //           onChange:  async (chainId) => {
      //             console.log('Chain ID changed!', chainId)
      //             if(chainId ){
                    
      //               this._chainId$.next(chainId );
    
      //             }else{
      //               this._chainId$.next(undefined);
      //             }
      //           },
      //         }
      //       ); 
            
      //       this.unwatchAccount = watchAccount(wagmiConfig, {
      //         onChange: (account) => {
      //           if(account && account.isConnected){
      //             this._account$.next(account.address);
      //           }else{
      //             this._account$.next(undefined);
      //           }
                
      //         }
      //       })
      //     }catch(err){
      //       console.error('Error intializing web3service', err)
      //     }
          
            
      //   }, 150)
      // }).catch((err)=>{
      //   console.error('Err reconn:', err)
      // })
      this.w3modal = createWeb3Modal({
        wagmiConfig: wagmiConfig,
        projectId: projectId,
        enableAnalytics: true, // Optional - defaults to your Cloud configuration
        enableOnramp: true, // Optional - false as default
  
      })
      
      this.w3modal.subscribeState(newState => {
        console.log('New w3m state: ', newState)
        this._w3mState$.next(newState)
      })

      setTimeout(async ()=>{
        
          
        const {address, isConnected} = getAccount(wagmiConfig);
        if(isConnected){
          this._account$.next(address)
        }
        
        
        const chainId   = getChainId(wagmiConfig);
        if(chainId ){
          
          this._chainId$.next(chainId );
        }
  
        //Update chainId on change
        this.unwatchNetwork = watchChainId(wagmiConfig,      
          {
            onChange:  async (chainId) => {
              
              if(chainId ){
                
                this._chainId$.next(chainId );
  
              }else{
                this._chainId$.next(undefined);
              }
            },
          }
        ); 
        
        this.unwatchAccount = watchAccount(wagmiConfig, {
          onChange: (account) => {
            if(account && account.isConnected){
              this._account$.next(account.address);
            }else{
              this._account$.next(undefined);
            }
            
          }
        })
          
      }, 250)

    }, 300);

    
  



  }


  async getAccountInfo() {
    return getAccount(wagmiConfig);
  }

  getCurrentChainId() {
    const c: GetChainIdReturnType = getChainId(wagmiConfig);
    return c;
  }

  getChainName(chainId: number){
    const chain = chains[chainId]
    if(chain){
      return chain.name
    }else{
      return undefined
    }

  }

  getChain(chainId: number){
    const chain = chains[chainId]
    if(chain){
      return chain
    }else{
      return undefined
    }

  }

  
  async getERC20Balance(tokenAddress?: string, account?: string) {
    
    return await getBalance(wagmiConfig, {
      address: account as `0x${string}`,      
      token: tokenAddress as `0x${string}`
    });
  }
 


  async getERC20Allowance(tokenAddress: string|`0x${string}`, contractToApprove: string|`0x${string}`, account?: string|`0x${string}`,
   chainId? :any) {

    if(!account){
      account=this.account;
    }
    
    
    //@ts-ignore
    const allowance = await readContract(wagmiConfig, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,      
      functionName: 'allowance',
      args: [account as `0x${string}`, contractToApprove as `0x${string}`],
      chainId
    })
    
    return allowance;
  }


  async approveERC20Contract(tokenAddress: string, contractToApprove: string, 
    account: string, amount: bigint, chainId? :any){

    
    //@ts-ignore
    // const simu = await simulateContract(wagmiConfig, {
    //   address: tokenAddress as `0x${string}`,
    //   abi: erc20Abi,      
    //   account: account as `0x${string}`,
    //   functionName: 'approve',
    //   args: [ contractToApprove as `0x${string}`, amount],
    //   chainId
    // })
 
    //@ts-ignore
    return await writeContract(wagmiConfig,{
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,      
      account: account as `0x${string}`,
      functionName: 'approve',
      args: [ contractToApprove as `0x${string}`, amount],
      chainId
    });

    
  }

  

  // async fetchTotalSupply(tokenAddress: string){
  //   const t= await this.getTokenInfo(tokenAddress as `0x${string}`)
  //   if(t){
  //     return t.totalSupply.value
  //   }

  //   return undefined
  // }
}



