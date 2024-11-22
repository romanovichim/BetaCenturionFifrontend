import { Container, Table, Image, Spinner, OverlayTrigger, Popover, Button, Modal, Row, Col, Form, Tooltip } from "react-bootstrap";

//import { CHAIN } from '@tonconnect/ui';

import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'

//Deployers info
import { fetchDeployers,deployerArr, OneDeployer } from "../scripts/getDeployers";
import { getEnrichedOffersData, EnrichedResult,ParsedValue} from "../scripts/getOffers";
import { ChangeEvent, useEffect, useState } from "react";
import { Address, beginCell, toNano } from "@ton/core";

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";

//getEnrichedOffersData(true)

const fetchBalance = async (address: string,testnet: boolean): Promise<{ ok: boolean; result: string }> => {
  let urlTonCenter = testnet ? `https://testnet.toncenter.com/api/v2/getAddressBalance?address=${address}` : `https://toncenter.com/api/v2/getAddressBalance?address=${address}`;

  const res = await fetch(urlTonCenter);
  return await res.json();
};



const fetchNextOfferITem = async (address: string,testnet: boolean) => {
  const endpoint = testnet ? await getHttpEndpoint({ network: 'testnet' }) :  await getHttpEndpoint(); // get the decentralized RPC endpoint
  const client = new TonClient({ endpoint }); // initialize ton library
  const DeployerAddress = Address.parse(address); // TBD change to prod
  const res = await client.runMethod(DeployerAddress, "get_collection_data")

  return await Number(res.stack.readBigNumber())
};





const TON_VALUE = 1e9;


function createTXofferdeploy(nextItem: number, address: string, deployer_address: string,inputOfferString:string) {
  const createOfferMessageBody = beginCell()
  .storeUint(1, 32) // opcode (reference TODO)
  .storeUint(0, 64) // queryid
  .storeUint(nextItem, 64)
  .storeCoins(toNano('0')) // gas fee
  .storeRef(
    beginCell().storeAddress(Address.parse(address)).storeRef(beginCell().endCell())
  )
  .endCell()

  const create_offer_transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    messages: [
        {
            address: deployer_address, //deployer deployer_arr[0].deployer_address
            amount: inputOfferString, // подставить значение  inputOfferString
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



const formatBalance = (balance: string) => `${(+balance / TON_VALUE).toFixed(2)}`;

const Lend = () => {
  const [tonConnectUI] = useTonConnectUI();
  // Form Logic 
  const [inputTON, setInputTON] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // 👇 Store the input value to local state
    setInputTON(e.target.value);
  };

  const interest: string = (inputTON === "") ? "0 TON" : (parseFloat(inputTON) * 0.042).toFixed(5);
  
  const inputOfferNumber: number = (inputTON === "") ? 0 : parseFloat(inputTON) * TON_VALUE;
  
  const inputOfferString: string = inputOfferNumber.toFixed(0);


  // for modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  // Balance for card
  const [balance, setBalance] = useState('');
  const address = useTonAddress();

  // Interest hover tooltip
  const renderTooltip = (props: any) => (
    <Tooltip id="button-tooltip" {...props}>
      5.2 % Interest for 14d = 160% APY weekly
    </Tooltip>
  );

  useEffect(() => {
    if (address) {
      //setAddress(address);
      fetchBalance(address,false).then((response) => {
        if (response.ok) setBalance(formatBalance(response.result));
        if (!response.ok && response.result) console.log(response.result);
      });
    }
  }, [address]);
  
  //sleep for Tick
  const sleep = (time: number) =>
      new Promise((resolve) => setTimeout(resolve,time));

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ status: string; data: undefined; } | { status: string; data:  EnrichedResult}>();
  

  const wallet = useTonWallet();  // 
  //const connected  = !!wallet?.account.address; // auth/not auth
  
  const network = wallet?.account.chain;
  //const chain = network === CHAIN.MAINNET ? "mainnet" : "testnet";
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
      fetchNextOfferITem(deployer_arr[0].deployer_address,false).then((response) => {
        setnextItem(response)
      });
    }
  }, [deployer_arr[0].deployer_address]);

  /////////////////////Payload  ///////////////////////
  console.log(nextItem);

  //////////////////////////////// TRANSACTION /////////
  const handleClick = async () => {
		

		setShow(false)
    //() => tonConnectUI.sendTransaction(createTXofferdeploy(nextItem,address,deployer_arr[0].deployer_address,inputOfferString))
		tonConnectUI.sendTransaction(createTXofferdeploy(nextItem,address,deployer_arr[0].deployer_address,inputOfferString))
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
        const data = await getEnrichedOffersData(false);
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
    <h2 style={{color: '#D9D9D9' }} className="py-3">Make loan offers on NFT collections.</h2>
    <p style={{color: '#D9D9D9' }} className="py-2">Browse collections below, and name your price. The current best offer will be shown to borrowers. To take your offer, they lock in an NFT from that collection to use as collateral. You will be repaid at the end of the loan, plus interest. If they fail to repay, you get to keep the NFT.</p>


    <p>NO DATA</p>

    </Container>

    </div>




  
  }
  else {

    //////////////////////// FOR MODAL /////////////////////
    let nftCollectionName = (deployer_arr[0].nft_col_name == 'undefined') ? '-' : deployer_arr[0].nft_col_name;
    let nftCollectionUrl = deployer_arr[0].nft_col_img_url;
    let lendApy = deployer_arr[0].apy;
    ////////////////////////           /////////////////////
    
    let bestOfferValue = (typeof data.data.best_offer_value?.offer_value == 'undefined') ? '-' : data.data.best_offer_value.offer_value.toString();
    let lastTakenOffer = (typeof data.data.last_taken_offer?.offer_value == 'undefined') ? '-' : data.data.last_taken_offer?.offer_value.toString();
    let takenCount = (typeof data.data.taken_count == 'undefined') ? 0 : data.data.taken_count;
    let activeLoans = (typeof data.data.active_loans == 'undefined') ? [] : data.data.active_loans; 
    //let activeLoansSum = (typeof data.data.taken_count == 'undefined') ? 0 : data.data.taken_count.toFixed(2).toString();
    let activeOffers = (typeof data.data.active_offers == 'undefined') ? [] : data.data.active_offers;
    let activeOffersSum = (typeof data.data.active_offers_sum == 'undefined') ? '0' : data.data.active_offers_sum.toFixed(2).toString();
    
    let loansMore = activeLoans.length - 3 > 0 ? activeLoans.length : 0;

    let offersMore = activeOffers.length - 3 > 0 ? activeLoans.length : 0;
    

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
          <td>{row.apy}</td>
          <td>{row.duration}</td>
          <td>
            <Button variant="primary" disabled={network  ? false : true} onClick={handleShow}>
              LEND
            </Button>  
          </td>
       </tr> 
       </OverlayTrigger>

        
        

      );
    
    });
    


  ////////// MAIN BODY ////////////
  return (
    <div className="vh-100 bg-dark">
          <Container>
      <h2 style={{color: '#D9D9D9' }} className="py-3">Make loan offers on NFT collections.</h2>
      <p style={{color: '#D9D9D9' }} className="py-2">Browse collections below, and name your price. The current best offer will be shown to borrowers. To take your offer, they lock in an NFT from that collection to use as collateral. You will be repaid at the end of the loan, plus interest. If they fail to repay, you get to keep the NFT.</p>

      <Table striped hover variant="dark"  >
      <thead>
        
          <tr>
            <th style={{color: '#D9D9D9' }}>Collection</th>
            <th style={{color: '#D9D9D9' }}>Available Pool</th>
            <th style={{color: '#D9D9D9' }}>Best Offer</th>
            <th style={{color: '#D9D9D9' }}>APY</th>
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
        <Container fluid className="text-center" data-bs-theme="dark">
          <Modal.Title className="justify-content-md-center"><Image src={nftCollectionUrl} roundedCircle width={60} height={60}/></Modal.Title>
        </Container>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white"> 
        <p className="text-white text-center">{nftCollectionName} - 16d</p>
        <Container>
        <Table  hover variant="dark" size="sm" borderless>
        <thead>
          <tr>
            <th style={{color: '#D9D9D9' }} >APY</th>
            <th style={{color: '#D9D9D9' }}><div style={{float: "right" }}>Floor Price</div> </th>
          </tr>
        </thead>
        <tbody>     
          <tr> 
            <td   style={{color: "#15a272" }}>{lendApy}</td>
            <td><div style={{float: "right" }}>~4.9 <Image src="https://ton.org/download/ton_symbol.svg" roundedCircle width={20} height={20}/></div></td>
          </tr>
        </tbody>
        </Table>
        </Container>
        <Container>
        <Form data-bs-theme="dark">
          <Row>
            <Col>
            <Form.Group className="mb-3" controlId="enterTON" >
              <Form.Label>Offer Amount</Form.Label>
              <Form.Control placeholder="Enter TON amount" type="number" onChange={handleInputChange} value={inputTON} />
              <Form.Text className="text-muted">
                Best offer {bestOfferValue} Value
              </Form.Text>
          </Form.Group>
            </Col>
            <Col>
            <Form.Group className="mb-3" controlId="youGet">
              <Form.Label>Total Interest 
              <OverlayTrigger
                  placement="right"
                  overlay={renderTooltip}
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                </OverlayTrigger>
            </Form.Label>
              <Form.Control id="disabledTextInput" placeholder={interest}  plaintext/>
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
          </Form.Group>
            
            </Col>
          </Row>
        </Form>
      </Container>
          <div className="text-white text-center">Your balance {balance}</div>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-center">
          <Button variant="primary" disabled={network  ? false : true} onClick={handleClick } >
            Place offer
          </Button>
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


  return (
    <div className="vh-100 bg-dark">
      <Container fluid className="py-4 text-center" data-bs-theme="dark">
        <h1 style={{ fontSize: "30px", fontWeight: "175"  }} className="text-white">An error occurred while loading data, wait 10 seconds and reload page - this is beta so we use free indexer.</h1>
        <p style={{ fontSize: "20px", fontWeight: "150"  }} className="text-white">P.S Our community: <a href="https://t.me/ton_learn">here</a>.</p>
      </Container>
    </div>
  ); 
  }


export default Lend;



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