//import { useEffect, useState } from "react";
//import * as fs from 'fs';

import { CHAIN, useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import { Container, Spinner, Table, Image, Button } from "react-bootstrap";

import { getFilteredLoansData,ParsedValue} from "../scripts/getOffers";
import { Address, beginCell } from "@ton/core";
import { deployerArr, fetchDeployers } from "../scripts/getDeployers";

const TON_VALUE = 1e9;



function createTXreturnNFT(offer_address: string,inputLoanString:string) {
  // TBD привести адрес в нормальный формат -УЖЕЕЕЕ
  //const chained_offer_address = (chain === 'testnet') ? Address.parse(offer_address).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parse(offer_address).toString({ bounceable: true, urlSafe: true, testOnly: false });;
  const returnNFTMessageBody = beginCell()
  .storeUint(3, 32) // op
  .storeUint(0, 64) // query id
  .endCell()

  const create_offer_transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    messages: [
        {
            address: offer_address, 
            amount: inputLoanString, // TON
            payload: returnNFTMessageBody.toBoc().toString('base64'),
        }
    ]
  }

  return create_offer_transaction
}

/*
function createTXclaimNFT( offer_address: string) {
  //const [tonConnectUI, setOptions] = useTonConnectUI();
  // op == 4
  // TBD привести адрес в нормальный формат УЖЕ
  //const chained_offer_address = (chain === 'testnet') ? Address.parse(offer_address).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parse(offer_address).toString({ bounceable: true, urlSafe: true, testOnly: false });;
  const claimNFTOfferMessageBody = beginCell()
  .storeUint(4, 32) // op
  .storeUint(0, 64) // query id
  .endCell()

  const create_offer_transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    messages: [
        {
            address: offer_address , //deployer deployer_arr[0].deployer_address
            amount: "20000000", //0.02 TON
            payload: claimNFTOfferMessageBody.toBoc().toString('base64'),
        }
    ]
  }

  return create_offer_transaction
}

*/


const Loans = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();  // 
  const connected  = !!wallet?.account.address; // auth/not auth
  
  const network = wallet?.account.chain;
  const chain = network === CHAIN.MAINNET ? "mainnet" : "testnet";

  // Balance for card
  //const [balance, setBalance] = useState('');
  const address = useTonAddress();

  const deployer_arr: deployerArr = fetchDeployers();
  // Parse address for query


  // take data
  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve,time));

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ status: string; data: undefined; } | { status: string; data:  ParsedValue[]}>();

  useEffect(() => {
    try {
      if (address) {
        // привести адрес
      const formatedAddress = (chain === 'testnet') ? Address.parse(address).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parse(address).toString({ bounceable: true, urlSafe: true, testOnly: false });
      // set loading to true before calling API
        const Tick = async () => {

          setLoading(true);
          await sleep(2000);
          //console.log(loading);
          //const data = fetchData() as richArr;
          //setData(data);
          (async () => {
            
          const data = await getFilteredLoansData(true,formatedAddress);
          //TBD trigger error if status error
            
          setData(data);
          // switch loading to false after fetch is complete
          setLoading(false);
          })();
          
        }
        
        Tick();
      }
    } catch (error) {
      // add error handling here
      setLoading(false);
      console.log(error);
      
    }
 }, [address]);





  // развилка connected или нет 
  // в connected развилка по есть данные или нет + loader


  if(connected){

    if(loading) return (
      <div className="vh-100 bg-dark">
          <Container fluid className="py-4 text-center" data-bs-theme="dark">
          <p style={{ fontSize: "30px", fontWeight: "190"  }} className="text-white">Loading data...</p>
          <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-secondary">Collecting data from blockchain - 3 seconds left</p>
        </Container>
      </div>
  
    );

    if (!data?.data) {
      return (
      <div className="vh-100 bg-dark">
        <Container fluid className="py-4 text-center" data-bs-theme="dark">
          <h1 style={{ fontSize: "30px", fontWeight: "175"  }} className="text-white">An error occurred while loading data, wait 10 seconds and reload page - this is beta so we use free indexer.</h1>
          <p style={{ fontSize: "20px", fontWeight: "150"  }} className="text-white">P.S Our community: <a href="https://t.me/ton_learn">here</a>.</p>
        </Container>
        </div>
    );
    } 

    //console.log(data.data)
    // Таблица данных
    const tableRows = data.data.map((row: ParsedValue) => {
      const nft_col_img_url = deployer_arr[0].nft_col_img_url
      const nft_col_name = deployer_arr[0].nft_col_name
      //const loan_date = (typeof row.start_loan == 'undefined') ? '-' : row.start_loan.toLocaleString();



      var nft_address_friendly = (typeof row.sender_adress == 'undefined') ? '-' :  chain === 'testnet' ? row.sender_adress.toString({ bounceable: true, urlSafe: true, testOnly: true }) : row.sender_adress.toString({ bounceable: true, urlSafe: true, testOnly: false });; 
      var tonscan_nft_link = (nft_address_friendly === '-') ? '-' : <a href={"https://tonscan.org/address/"+nft_address_friendly} target="_blank" rel="noopener noreferrer">{nft_address_friendly.substring(0,4)+"..."+nft_address_friendly.substring(nft_address_friendly.length - 5,nft_address_friendly.length)}  </a>

      // признак закончился ли кредит  - 14 дней прибавить к Date Date.now()
      //var fortnightAway = new Date(row.start_loan + 12096e5);
      //console.log("time example:",'2024-11-04T02:15:21'.toLocaleString())
      //console.log("datetime formats",(new Date('2024-11-04T02:15:21')).toLocaleString())
      //console.log((new Date(Date.now()+ 12096e5)).toLocaleString())
      //console.log(row.offer_address)
      //var loanEnd = (typeof row.start_loan == 'undefined') ? '-' :  (new Date(new Date(row.start_loan)).getTime() + 12096e5).toLocaleString();

      var loanEnd = (typeof row.start_loan == 'undefined') ? '-' :  new Date((row.start_loan+1209600) * 1000).toLocaleString();// new Date(row.start_loan).toLocaleString();


      var loanFullSum = (typeof row.offer_value == 'undefined') ? '-' : (row.offer_value*1.052).toFixed(4)
    
      var txesLoanFullSum = ((row.offer_value*1.06+0.03) * TON_VALUE).toFixed(0);

      var loanStatus = ( row.check == 1) ? 'NFT can be returned' : ( row.check == 4) ? 'Loan finished' : ( row.check == 3) ? 'Loan finished' : '-'

      //var nowDate = new Date(Date.now());
      //var button_div = ( row.check == 0 || row.check == 4 ) ? ( row.check == 0) ? <Button variant="primary" disabled={network  ? false : true} onClick={() => tonConnectUI.sendTransaction(createTXcanceloffer(row.offer_address, chain))}>Cancel Offer</Button>  :  new Date(new Date('2024-11-04T02:15:21').getTime() + 12096e5).toISOString()  > nowDate.toISOString() ? <Button variant="primary" disabled={network  ? false : true} onClick={() => tonConnectUI.sendTransaction(createTXclaimNFT(row.offer_address, chain))}>Claim NFT</Button> : 'wait for loan end'  :  '-';
      var button_div = ( row.check == 1)  ? <Button variant="primary" disabled={false} onClick={() => tonConnectUI.sendTransaction(createTXreturnNFT(row.offer_address,txesLoanFullSum))}>Return NFT</Button> : <Button variant="primary" disabled={true}>Return NFT</Button>
      
      //onClick={() => tonConnectUI.sendTransaction()}
      // Cancel offfer createTXcanceloffer(row.offer_address, chain)
      // onClick={() => tonConnectUI.sendTransaction(reateTXcanceloffer(row., chain))}

      // Claim NFT  createTXclaimNFT(row.offer_address, chain)
      // onClick={() => tonConnectUI.sendTransaction(createTXclaimNFT(row.offer_address, chain))}

      // в зависимости от развилки 
      //( (new Date(new Date('2024-11-04T02:15:21')).getTime() + 12096e5)).toISOString() > nowDate.toISOString() )  ? <Button variant="primary" disabled={network  ? false : true}>Cancel Offer</Button>  :  <Button variant="primary" disabled={network  ? false : true}>Claim NFT</Button>

      // new Date(new Date('2024-11-04T02:15:21').getTime() + 12096e5).toISOString()  > nowDate.toISOString() ? <Button variant="primary" disabled={network  ? false : true}>Claim NFT</Button> : 'wait for loan end' 
               

      return(
        <tr>
          <td>
          <Image src={nft_col_img_url} roundedCircle width={45} height={45}/>
          <span style={{ fontSize: "18px", fontWeight: "250"}} >{nft_col_name}</span>
          </td>
          <td>
          {tonscan_nft_link}
          </td>
          <td>
            {loanFullSum} TON 
          </td>
          <td>{loanStatus}</td>
          <td>{loanEnd}</td>
          <td>{button_div}</td>

        </tr>
      )
    });


    return(
      <div className="vh-100 bg-dark">
        <Container>
          <h2 style={{color: '#D9D9D9' }} className="py-3">My loans</h2>
          <p style={{color: '#D9D9D9' }} className="py-2">Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT..</p>
          <p className="bg-danger text-white"> 
          {network ? (network === CHAIN.MAINNET ? "mainnet" : "testnet") : "Disconnected"}
          </p>
          <Table striped hover variant="dark"  >
          <thead>
            
              <tr>
                <th style={{color: '#D9D9D9' }}>NFT Collection</th>
                <th style={{color: '#D9D9D9' }}>NFT in Loan</th>
                <th style={{color: '#D9D9D9' }}>Loan Value</th>
                <th style={{color: '#D9D9D9' }}>Status</th>
                <th style={{color: '#D9D9D9' }}>Return NFT before</th>
                <th>
                </th> 
              </tr>

            </thead>
            <tbody>

            {tableRows}

            </tbody>
          </Table>
        
        </Container>
  
      </div>
    )
  } else {
    return(
      <div className="vh-100 bg-dark">
      <Container>
      <h2 style={{color: '#D9D9D9' }} className="py-3">My loans</h2>
      <p style={{color: '#D9D9D9' }} className="py-2">Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT..</p>
      <p className="bg-danger text-white"> 
      {network ? (network === CHAIN.MAINNET ? "mainnet" : "testnet") : "Disconnected"}
      </p>
  
      <p>NO DATA</p>
  
      </Container>
  
      </div>
    )
  }







  }


export default Loans;