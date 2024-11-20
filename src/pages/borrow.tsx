import { Container, Table, Image, Spinner, OverlayTrigger, Popover, Button, Modal, Row, Col, Carousel } from "react-bootstrap";

import { CHAIN } from '@tonconnect/ui';

import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'

//Deployers info
import { fetchDeployers,deployerArr, OneDeployer } from "../scripts/getDeployers";
import { getEnrichedOffersData, EnrichedResult,ParsedValue} from "../scripts/getOffers";
import { SetStateAction, useEffect, useState } from "react";
import { Address, beginCell, toNano } from "@ton/core";

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";

//getEnrichedOffersData(true)

/*
const fetchBalance = async (address: string,testnet: boolean): Promise<{ ok: boolean; result: string }> => {
  let urlTonCenter = testnet ? `https://testnet.toncenter.com/api/v2/getAddressBalance?address=${address}` : `https://toncenter.com/api/v2/getAddressBalance?address=${address}`;

  const res = await fetch(urlTonCenter);
  return await res.json();
};
*/

type NftItem = {
  address: string;
  init: boolean;
  index: string;
  collection_address: string;
  owner_address: string;
  content: {
      uri: string;
  };
  last_transaction_lt: string;
  code_hash: string;
  data_hash: string;
  collection: {
      address: string;
      owner_address: string | null;
      last_transaction_lt: string;
      next_item_index: string;
      collection_content: {
          uri: string;
      };
      data_hash: string;
      code_hash: string;
  };
};

type AddressBookEntry = {
  user_friendly: string;
};

type ApiResponse = {
  nft_items: NftItem[];
  address_book: Record<string, AddressBookEntry>;
};

const fetchNFTOwned = async (owner_address:string, nft_collection_address: string,testnet: boolean) =>{
  let urlTonCenterv3 = testnet ? "https://testnet.toncenter.com/api/v3/nft/items" : "https://toncenter.com/api/v3/nft/items";
  const params = new URLSearchParams({
    owner_address: owner_address,
    collection_address: nft_collection_address,
    limit: "1000",
    offset: "0"
  });

  const res = await fetch(`${urlTonCenterv3}?${params.toString()}`);
  //console.log("NFT fetch",await res.status)
  //console.log("NFT fetch",await res.json())
  return await res.json() as ApiResponse
}








const fetchNextOfferITem = async (address: string,testnet: boolean) => {
  const endpoint = testnet ? await getHttpEndpoint({ network: 'testnet' }) :  await getHttpEndpoint(); // get the decentralized RPC endpoint
  const client = new TonClient({ endpoint }); // initialize ton library
  const DeployerAddress = Address.parse(address); // TBD change to prod
  const res = await client.runMethod(DeployerAddress, "get_collection_data")

  return await Number(res.stack.readBigNumber())
};





//const TON_VALUE = 1e9;


function createTXtransfer(chain: string,index: number, nftArray: NftItem[],best_offer: string | undefined) {
  const preAddress = nftArray[index].address;
  //console.log(preAddress);
  //const preAddress_Addr = Address.parseRaw(preAddress)
  const new_owner_address_friendly = chain === 'testnet' ? Address.parseRaw(preAddress).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parseRaw(preAddress).toString({ bounceable: true, urlSafe: true, testOnly: false });
  //    
  const offer_address = best_offer === undefined ? undefined : Address.parse(best_offer);
  //
  const createOfferMessageBody = beginCell()
  .storeUint(0x5fcc3d14, 32) // op
  .storeUint(0, 64) // query id
  .storeAddress(offer_address) //new owner
  .storeAddress(undefined)
  .storeBit(false) // custom payload
  .storeCoins(toNano('0.03')) // for ownership assigned 
  .storeMaybeRef()
  .endCell()

  const create_offer_transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    messages: [
        {
            address: new_owner_address_friendly , //deployer deployer_arr[0].deployer_address
            amount: "50000000", 
            payload: createOfferMessageBody.toBoc().toString('base64'),
        }
    ]
  }

  return create_offer_transaction
}

/*
const  CreateOfferMessageBody = beginCell()
.storeUint(1, 32) // opcode (reference TODO)
.storeUint(0, 64) // queryid
.storeUint(itemIndex, 64)
.storeCoins(toNano('0')) // gas fee
.storeRef(
  beginCell().storeAddress(ownerOfferAddress).storeRef(beginCell().endCell())
)
.endCell()

// create_offer_transaction
const create_offer_transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
  messages: [
      {
          address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA", //deployer
          amount: "20000000",
          payload: CreateOfferMessageBody.toBoc().toString('base64'),
      }
  ]
}

*/

//const formatBalance = (balance: string) => `${(+balance / TON_VALUE).toFixed(2)}`;

const Borrow = () => {
  const [tonConnectUI] = useTonConnectUI();


  // for carousel 
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex: SetStateAction<number>) => {
    setIndex(selectedIndex);
  };


  // for modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Balance for card
  //const [balance, setBalance] = useState('');
  const address = useTonAddress();

  // Interest hover tooltip
  /*
  const renderTooltip = (props: any) => (
    <Tooltip id="button-tooltip" {...props}>
      5.2 % Interest for 14d = 160% APY weekly
    </Tooltip>
  );
  */
  // balance
  /*
  useEffect(() => {
    if (address) {
      //setAddress(address);
      fetchBalance(address,true).then((response) => {
        if (response.ok) setBalance(formatBalance(response.result));
        if (!response.ok && response.result) console.log(response.result);
      });
    }
  }, [address]);
  */



  //sleep for Tick
  const sleep = (time: number) =>
      new Promise((resolve) => setTimeout(resolve,time));

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ status: string; data: undefined; } | { status: string; data:  EnrichedResult}>();
  

  const wallet = useTonWallet();  // 
  //const connected  = !!wallet?.account.address; // auth/not auth
  
  const network = wallet?.account.chain;
  const chain = network === CHAIN.MAINNET ? "mainnet" : "testnet";
  //console.log("Net:",wallet?.account.chain); // -239 mainnet -3 testnet wallet.account.chain === CHAIN.MAINNET ? "mainnet" : "testnet";
  //Network change
  //https://github.com/1IxI1/blueprint-scaffold/blob/412b98e59b4b0c0ced814cc538da5ec296c8a3bb/src/dapp/src/genTxByWrapper.ts#L7
  // https://github.com/delab-team/coupons/blob/262e658817bdb967a719ba46b382878f695e270e/src/hooks/useTonAdress.ts#L2


  // Looper https://github.com/romanovichim/tonhotshot/blob/main/src/App.tsx
  // loooper okhman https://github.com/ton-community/tutorials/blob/541d4cf94cf15515724dfc73c7b7fcc75b8ccb30/03-client/index.md

  // Take Deployer - Collection info based on net
  const deployer_arr: deployerArr = fetchDeployers();

  const [nextItem, setnextItem] = useState(0);
  // Take next item from deployer for offer depliy

  useEffect(() => {
    if (deployer_arr[0].deployer_address) {
      //setAddress(address);
      fetchNextOfferITem(deployer_arr[0].deployer_address,true).then((response) => {
        setnextItem(response)
      });
    }
  }, [deployer_arr[0].deployer_address]);

  /////////////////////Payload  ///////////////////////
  console.log(nextItem);

    // nft address
    const [ownedNFTarr, setownedNFTarr] = useState<NftItem[]>([]);

    useEffect(() => {
      if (address) {
        //setAddress(address);
        fetchNFTOwned(address,deployer_arr[0].nft_col_address,true).then((response) => {
          if (response.nft_items) setownedNFTarr(response.nft_items); 
          if (!response.nft_items) console.log(response); 
        });
      }
    }, [address]);

  
    
  //////////////////////////////// TRANSACTION /////////
  const handleClick = async () => {
		

		setShow(false)
    //() => tonConnectUI.sendTransaction(createTXofferdeploy(nextItem,address,deployer_arr[0].deployer_address,inputOfferString))
		tonConnectUI.sendTransaction(createTXtransfer(chain,index, ownedNFTarr,data?.data?.best_offer_value?.offer_address))
	};

  //setInterval(getEnrichedOffersData(true)
  useEffect(() => {
    try {
      // set loading to true before calling API
      const Tick = async () => {

        setLoading(true);
        await sleep(2000);
        //console.log(loading);
        //const data = fetchData() as richArr;
        //setData(data);
        (async () => {
        const data = await getEnrichedOffersData(true);
        //TBD trigger error if status error
        
        setData(data);
        // switch loading to false after fetch is complete
        setLoading(false);
        })();
        
        await sleep(120000);
        Tick();
      }
      
      Tick();

    } catch (error) {
      // add error handling here
      setLoading(false);
      console.log(error);
      
    }
 }, []);



    //console.log(loading);
  // return a Spinner when loading is true
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

  // data will be null when fetch call fails
  if (!data) {
    return (
    <div className="vh-100 bg-dark">
                <Container fluid className="py-4 text-center" data-bs-theme="dark">
        <h1 style={{ fontSize: "30px", fontWeight: "175"  }} className="text-white">An error occurred while loading data, wait 10 seconds and reload page - this is beta so we use free indexer.</h1>
        <p style={{ fontSize: "20px", fontWeight: "150"  }} className="text-white">P.S Our community: <a href="https://t.me/ton_learn">here</a>.</p>
      </Container>
      </div>
  );
  }  

  // нужны обработчики undefined
  //x = (typeof x === 'undefined') ? def_val : x;
  //condition ? exprIfTrue : exprIfFalse
  //let bestOfferValue = data.data === {} ? 'No data' :  (typeof data.data.best_offer_value === 'undefined') ? 'default' : bestOfferValue;

  if(typeof data.data === 'undefined') {
    //TBD NO DATA
    <div className="vh-100 bg-dark">
    <Container>
    <h2 style={{color: '#D9D9D9' }} className="py-3">Borrow against my NFTs</h2>
    <p style={{color: '#D9D9D9' }} className="py-2">Instantly take a loan against your NFTs. Escrow-free loans allows you to keep the collateral NFT in offer smart-contract. When you accept a loan offer, a secure contract is created, freezing the NFT inside. Not repaying by the due date means the lender can repossess your NFT. Successfully pay the loan in full by the expiration date to automatically thaw the NFT.</p>
    <p className="bg-danger text-white"> 
    {network ? (network === CHAIN.MAINNET ? "mainnet" : "testnet") : "Disconnected"}
    </p>

    <p>NO DATA</p>

    </Container>

    </div>




  
  }
  else {

    //////////////////////// FOR MODAL /////////////////////
    let nftCollectionName = (deployer_arr[0].nft_col_name == 'undefined') ? '-' : deployer_arr[0].nft_col_name;
    let nftCollectionUrl = deployer_arr[0].nft_col_img_url;
    //let lendApy = deployer_arr[0].apy;
    ////////////////////////           /////////////////////
    
    let bestOfferValue = (typeof data.data.best_offer_value?.offer_value == 'undefined') ? '-' : data.data.best_offer_value.offer_value.toString();
    let bestOfferAddress = (typeof data.data.best_offer_value?.offer_address == 'undefined') ? undefined : data.data.best_offer_value.offer_address;

    let lastTakenOffer = (typeof data.data.last_taken_offer?.offer_value == 'undefined') ? '-' : data.data.last_taken_offer?.offer_value.toString();
    let takenCount = (typeof data.data.taken_count == 'undefined') ? 0 : data.data.taken_count;
    let activeLoans = (typeof data.data.active_loans == 'undefined') ? [] : data.data.active_loans; 
    //let activeLoansSum = (typeof data.data.taken_count == 'undefined') ? 0 : data.data.taken_count.toFixed(2).toString();
    let activeOffers = (typeof data.data.active_offers == 'undefined') ? [] : data.data.active_offers;
    let activeOffersSum = (typeof data.data.active_offers_sum == 'undefined') ? '0' : data.data.active_offers_sum.toFixed(2).toString();
    
    let loansMore = activeLoans.length - 3 > 0 ? activeLoans.length : 0;

    let offersMore = activeOffers.length - 3 > 0 ? activeLoans.length : 0;
    
    // для borrow нужно посчитать interest - 4.2 % от лучшего оффера
    let interestFromBestOffer = (typeof data.data.best_offer_value?.offer_value == 'undefined') ? '-' : (data.data.best_offer_value.offer_value * 0.042).toFixed(5);

    let fullLoan = (typeof data.data.best_offer_value?.offer_value == 'undefined') ? '-' : (data.data.best_offer_value.offer_value * 1.042).toFixed(5);
    // nft owners
    console.log(ownedNFTarr);
    let ownedNFTarrLenght = ownedNFTarr.length;
    console.log("Length",ownedNFTarrLenght)
    /*
    best_offer_value: number | undefined,
    last_taken_offer: ParsedValue | undefined,  in_msg_created_at
    taken_count: number | undefined,

    active_loans: Array<ParsedValue> | undefined,
    active_loans_sum: number | undefined,
    active_offers: Array<ParsedValue> | undefined,
    active_offers_sum: number | undefined
     And here's some <strong>amazing</strong> content. It's very engaging.
            right?

    
    */

    /////////////////Courousel //////


    const carouselRows = ownedNFTarr.map((row: NftItem) => { 
      //'content': {'uri': 'https://nft.fragment.com/username/zelia.json'},
      const friendly_address = chain === 'testnet' ? Address.parseRaw(row.address).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parseRaw(row.address).toString({ bounceable: true, urlSafe: true, testOnly: false });
      const link_nft = <a href={"https://tonscan.org/address/"+friendly_address} target="_blank" rel="noopener noreferrer">{friendly_address.substring(0,4)+"..."+friendly_address.substring(friendly_address.length - 5,friendly_address.length)}  </a>
      //row.content.uri
      var uri = chain === 'testnet' ? "https://nft.fragment.com/username/durove.json" : row.content.uri;
      var filename = uri.split('/').pop()
      var clean_filename = (typeof filename == 'undefined') ? 'durove' : filename.substring(0, filename.indexOf("."))

      var imageLink = 'https://nft.fragment.com/username/'+ clean_filename +'.webp'

      return (
        <Carousel.Item  className="text-center">
          <Image width="80%" src={imageLink} thumbnail />
            <Carousel.Caption>
              <p>{link_nft}</p>
            </Carousel.Caption>
        </Carousel.Item>
      )
    });







    const loanRows = activeLoans.slice(0,3).map((loanRow: ParsedValue) => { 
              return (
                <tr>
                  <td>{loanRow.offer_value}</td>
                  <td>{loanRow.in_msg_created_at.toString()}</td>
                </tr>
              )
          });
          


    const offerRows = activeOffers.slice(0,3).map((offerRow: ParsedValue) => { 
      return (
        <tr>
          <td>{offerRow.offer_value}</td>
          <td style={{ fontSize: "10px", fontWeight: "100"  }}>not yet taken</td>
        </tr>
      )
       });



    const tableRows = deployer_arr.map((row: OneDeployer) => {

      const popover = (

        

        <Popover id="popover-basic" data-bs-theme="dark" >
          
          <Popover.Header as="h3">{row.nft_col_name} - 16d</Popover.Header>
          <Popover.Body>
            <Table striped bordered hover variant="dark" size="sm">
            <thead>
        
              <tr>
                <th style={{color: '#D9D9D9' }}>Active loans({activeOffersSum})<Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/></th>
                <th style={{color: '#D9D9D9' }}>Taken</th>
              </tr>
        
            </thead>
            <tbody>

            {loanRows}
            <tr>
              <td style={{ fontSize: "10px", fontWeight: "100"  }} colSpan={2}>{loansMore} More </td>
            </tr>
            </tbody>


            </Table>
          </Popover.Body>
          
          <Popover.Body>
            <Table striped bordered hover variant="dark" size="sm">
            <thead>
        
              <tr>
                <th style={{color: '#D9D9D9' }}>Active Offers({activeOffersSum})<Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/></th>
                <th style={{color: '#D9D9D9' }}>Taken</th>
              </tr>
        
            </thead>
            <tbody>

            {offerRows}
            <tr>
              <td style={{ fontSize: "10px", fontWeight: "100"  }} colSpan={2}>{offersMore} More </td>
            </tr>

            </tbody>


            </Table>
          </Popover.Body>
          
        </Popover>
      );


      return (
        <OverlayTrigger trigger="hover" placement="top" overlay={popover}>
        <tr>
          <td>
          <Image src={row.nft_col_img_url} roundedCircle width={45} height={45}/>
          <span style={{ fontSize: "25px", fontWeight: "250"}} >{row.nft_col_name}</span>
          </td>
          <td>{activeOffersSum} <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/><br /> <span style={{ fontSize: "15px", fontWeight: "250"}} className="text-secondary">{takenCount}  of {activeLoans.length} offers taken</span>  </td>
          <td>{bestOfferValue} <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/><br /><span style={{ fontSize: "15px", fontWeight: "250"}} className="text-secondary"> {lastTakenOffer} last loan</span> </td>
          <td style={{color: "#15a272" }}>{interestFromBestOffer} <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/><br /><span style={{ fontSize: "15px", fontWeight: "250",color: "#15a272"}} > 4.2% interest</span>  </td>
          <td>{row.duration}</td>
          <td>
            <Button variant="primary" disabled={network  ? (ownedNFTarrLenght == 0 ) ? true : false : true} onClick={handleShow}>
                {network  ? (ownedNFTarrLenght == 0 ) ? "You have no NFT"  : "Borrow" : "Borrow"}
            </Button>  
          </td>
       </tr> 
       </OverlayTrigger>

        
        

      );
    
    });
    

 
  ////////// MAIN BODY //////////// https://nft.fragment.com/username/durove.webp
  return (
    <div className="vh-100 bg-dark">
          <Container>
      <h2 style={{color: '#D9D9D9' }} className="py-3">Make loan offers on NFT collections.</h2>
      <p style={{color: '#D9D9D9' }} className="py-2">Browse collections below, and name your price. The current best offer will be shown to borrowers. To take your offer, they lock in an NFT from that collection to use as collateral. You will be repaid at the end of the loan, plus interest. If they fail to repay, you get to keep the NFT.</p>
      <p className="bg-danger text-white"> 
      {network ? (network === CHAIN.MAINNET ? "mainnet" : "testnet") : "Disconnected"}
      </p>
      <Table striped hover variant="dark"  >
      <thead>
        
          <tr>
            <th style={{color: '#D9D9D9' }}>Collection</th>
            <th style={{color: '#D9D9D9' }}>Available Pool</th>
            <th style={{color: '#D9D9D9' }}>Best Offer</th>
            <th style={{color: '#D9D9D9' }}>Interest</th>
            <th style={{color: '#D9D9D9' }}>Duration</th>
            <th>
            </th> 
          </tr>
    
        </thead>
        <tbody>

         {tableRows}

        </tbody>
      </Table>
      
      </Container>


      <>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header className="bg-dark" closeButton>

        <Container data-bs-theme="dark">
          <Row>
            <Col className="text-white" sm={8}><Image src={nftCollectionUrl} roundedCircle width={45} height={45}/><span style={{ fontSize: "25px", fontWeight: "250"}} >{nftCollectionName}</span></Col>
            <Col className="text-white" sm={4}><div style={{float: "right" }}>Floor Price</div><br /><div style={{float: "right" }}>~4.9 <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/></div></Col>
          </Row>
        </Container>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white"> 
        <Container>
        <Table  hover variant="dark" size="sm" borderless>
        <thead>
          <tr>
            <th style={{color: '#D9D9D9' }} >Interest</th>
            <th style={{color: '#D9D9D9' }} >Duration</th>
            <th style={{color: '#D9D9D9' }} ><div style={{float: "right" }}>Available to Borrow</div> </th>
          </tr>
        </thead>
        <tbody>     
          <tr> 
            <td   style={{color: "#15a272" }}>{interestFromBestOffer} </td>
            <td>14d </td>
            <td><div style={{float: "right" }}>{activeOffersSum} <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/></div></td>
          </tr>
        </tbody>
        </Table>
        </Container>
        <Container>
          
          <Carousel activeIndex={index} onSelect={handleSelect}>
            {carouselRows}
          </Carousel>

      </Container>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-center">
        <Container className="bg-dark text-center">
          <Button variant="primary" disabled={(bestOfferAddress === undefined)  ? true : false}  onClick={handleClick}>
            Borrow {bestOfferValue} <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/>
          </Button>
          </Container>
          <Container className="bg-dark text-center">
          <span style={{ fontSize: "8px", fontWeight: "100"  }} className="text-secondary">Repay {fullLoan} in 14 days</span>
          </Container>
        </Modal.Footer>
      </Modal>
      </>
    
      






    </div>
      
  )
  ////////////////////////////////

  }




  // Take All Offers using setInterval
  // function to set https://github.com/romanovichim/tonhotshot/blob/main/src/App.tsx


  // Pop up with create Offer 


  return (// TBD чет тут хрень кастыль
    <div className="vh-100 bg-dark">
        <Container fluid className="py-4 text-center" data-bs-theme="dark">
        <h1 style={{ fontSize: "30px", fontWeight: "175"  }} className="text-white">An error occurred while loading data, wait 10 seconds and reload page - this is beta so we use free indexer.</h1>
        <p style={{ fontSize: "20px", fontWeight: "150"  }} className="text-white">P.S Our community: <a href="https://t.me/ton_learn">here</a>.</p>
      </Container>
      </div>
  ); 
  }


export default Borrow;


/*
      <Table striped bordered hover variant="dark">
      <thead>
          <tr>
            <th>Date</th>
            <th>Telegram Username</th>
            <th>Purchase price, TON</th>
          </tr>
        </thead>
        <tbody>
        {tableRows}
        </tbody>
      </Table>

      <p> {() => tonConnectUI.sendTransaction(createTXofferdeploy())}
      {connected && (
			<h2 className="text-white">Connected</h2>
		  )} 
    {!connected && (
			<h2 className="text-white">DisConnected</h2>
		  )}     
      </p>

      {connected && (
                    
      network ? (network === CHAIN.MAINNET ? "mainnet" : "testnet") : "N/A"
                    
		  )} 
      {!connected && (
			<h2 className="text-white">DisConnected</h2>
		  )}  

*/