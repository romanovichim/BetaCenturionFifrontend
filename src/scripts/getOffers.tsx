import { Address, Cell, Slice } from '@ton/core';

type OffersValue = {
    nft_address: string;
    nft_index: string ;
    content_cell: string;
    in_msg_created_at: Date;
    offer_owner: string;
}

type OffersGet = {
  status: string;
  data: Array<OffersValue>;
}

export type ParsedValue = {
  offer_address: string;
  offer_index: number;
  check: number;
  status: string;
  offer_value: number; //TON
  start_loan: number | undefined;
  in_msg_created_at: Date;
  offer_owner: string;
  prev_owner: Address | undefined;
  sender_adress: Address | undefined; //nft Adress
}


export type EnrichedResult = {
  best_offer_value: ParsedValue | undefined,
  last_taken_offer: ParsedValue | undefined,
  taken_count: number | undefined,
  active_loans: Array<ParsedValue> | undefined,
  active_loans_sum: number | undefined,
  active_offers: Array<ParsedValue> | undefined,
  active_offers_sum: number | undefined,
  all_offers: Array<ParsedValue> | undefined,
}

async function getOffersData(testnet: boolean) {
    //const endpoint = `https://${testnet ? 'testnet.' : ''}dton.io/graphql`;
    //console.log(endpoint);
    const endpoint = testnet ? 'https://testnet.dton.io/graphql/' : 'https://dton.io/graphql/';
    console.log(endpoint);

    const needed_queries = 5;
    const page_size = 150;

    //const addr_prod = '"EQDy9MAb0FQN0WpDi8NVio2rEDcK2cSDNDeEJOEW9PIyImL6"'; // random nft col TBD
    const addr_testnet = '"kQCLNjNkqOtHaOeKEU6FC_FhPmpP7ZmPaeUa10eHZhW_msPk"';

    //const addr = testnet ? addr_testnet : addr_prod;
    const addr = addr_testnet

    let queryStr="";
	for (let page = 0; page < needed_queries; page++) {
	  queryStr+= `q${page}: raw_account_states( gen_utime__gt: "2024-04-22T23:59:59" account_state_state_init_code_method_name: "get_nft_data" parsed_nft_collection_address_address__friendly: ${addr} order_by: "parsed_nft_index" order_desc: true parsed_nft_true_nft_in_collection: 1 account_deleted: 0 page_size: ${page_size} page: ${page} ){ nft_address: address nft_index: parsed_nft_index content_cell: parsed_nft_content_boc in_msg_created_at offer_owner: parsed_nft_owner_address_address }` +`\n`
    }
	
	const finalQuery = `query {`+queryStr+`}`


    try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
             Accept: 'application/json'
          },
          body: JSON.stringify({ query: finalQuery })
        });
        console.log(response.status)
        if (response.ok) {
          const jsonResponse = await response.json();
          const resArray = Object.values(jsonResponse.data).flat() as Array<OffersValue>;
          //console.log(resArray);
          return { status: 'success', data: resArray } as OffersGet;
        } else {
          return { status: 'error', data: [] } as OffersGet;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return { status: 'error', data: [] } as OffersGet;
      }
}

export async function getEnrichedOffersData(testnet: boolean) {
  const offersData = await getOffersData(testnet) as OffersGet;
  if(offersData.status =='error') {
    return { status: 'error', data: undefined }
  } else {
    // вычитываем начало ячейки
    /*
    store_ref(nft_item_code).
    store_slice(nft_collection_addr
    store_ref(royalty_params)
    store_uint(0,64)
    store_coins(msg_value).
    */
    // пример как привести в формат beginCell().endCell()
    //let cell = Cell.fromBase64('te6ccuEBAQEAFgAsAChyZXYvMTYwMi4zNTNkamMuanNvbpBTdzI=');

    // научимся читать ячейку, а потом считать есть ли еще данные
    /*
    let cell1 = beginCell().storeUint(123456789, 34).endCell();
    let reader1 = cell1.beginParse();
    let parsedInt1 = reader1.loadInt(34);
    console.log(parsedInt1);
    console.log(reader1.remainingBits)
    let cell2 = beginCell().storeUint(123456789, 34).storeUint(123456789, 34).endCell();
    // вторая ячейка
    console.log('--------------------------------');
    let reader2 = cell2.beginParse();
    let parsedInt2 = reader2.loadInt(34);
    console.log(parsedInt2);
    console.log(reader2.remainingBits)
    */
    // цикл по данным
    const parsed_arr: ParsedValue[] = [];

    const zero_check_arr: ParsedValue[] = [];
    const one_check_arr: ParsedValue[] = []

    for(let i=0; i<offersData.data.length; i++){
      // развилка testnet bounceable=true  testOnly: true  , urlSafe: true 
    
      let nft_address_parsed  = testnet ? Address.parseRaw('0:' + offersData.data[i].nft_address).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parseRaw('0:' + offersData.data[i].nft_address).toString({ bounceable: true, urlSafe: true, testOnly: false });
      let offer_owner = testnet ? Address.parseRaw('0:' + offersData.data[i].offer_owner).toString({ bounceable: true, urlSafe: true, testOnly: true }) : Address.parseRaw('0:' + offersData.data[i].offer_owner).toString({ bounceable: true, urlSafe: true, testOnly: false });
      
      // достаем первые 5 переменных
      let contentCell = Cell.fromBase64(offersData.data[i].content_cell);
      let reader = contentCell.beginParse() as Slice;
  
      let nft_item_code = reader.loadRef() as Cell;
      let nft_collection_addr = reader.loadAddress() as Address;

      let royalty_params = reader.loadRef() as Cell;
      console.log(nft_item_code,nft_collection_addr,royalty_params);
      let check = reader.loadInt(64) as Number;
      //console.log("check",check);
      let offer_value = Number(reader.loadCoins())/1000000000; // TON price
      //console.log(full_price);
      // check op, than parse 
      

      // op == 0 Inited or Loop Action loop action (8)
      if(check == 0) {
        if(reader.remainingBits==0) {
          //inited 0
          let temp_dict = {
            'offer_address': nft_address_parsed,
            'offer_index': Number(offersData.data[i].nft_index), // string
            'check': check, // check numbver
            'status': "Not yet taken",
            'offer_value': offer_value, // number | undefined; //TON
            'start_loan': undefined, // string | undefined;
            'in_msg_created_at': offersData.data[i].in_msg_created_at,
            'offer_owner': offer_owner,
            'prev_owner': undefined,
            'sender_adress': undefined
          } as unknown as ParsedValue;

          parsed_arr.push(temp_dict);
          zero_check_arr.push(temp_dict);

        } else {  
          // in loop 8
          let temp_dict = {
            'offer_address': nft_address_parsed,
            'offer_index': Number(offersData.data[i].nft_index), // string
            'check': 8, // check numbver
            'status': "NFT is checked",
            'offer_value': offer_value, // number | undefined; //TON
            'start_loan': undefined, // string | undefined;
            'in_msg_created_at': offersData.data[i].in_msg_created_at,
            'offer_owner': offer_owner,
            'prev_owner': undefined,
            'sender_adress': undefined
          } as unknown as ParsedValue;

          parsed_arr.push(temp_dict);
        }
      } 
      else if(check == 1) {
        //loop finished
        // take data
        let prev_owner = reader.loadAddress() as Address;
        let sender_address = reader.loadAddress() as Address;
        let start_loan = reader.loadInt(32) as Number;
        let temp_dict = {
          'offer_address': nft_address_parsed,
          'offer_index': Number(offersData.data[i].nft_index), // string
          'check': 1, // check numbver
          'status': "Loan started(NFT already in)",
          'offer_value': offer_value, // number | undefined; //TON
          'start_loan': start_loan, // string | undefined;
          'in_msg_created_at': offersData.data[i].in_msg_created_at,
          'offer_owner': offer_owner,
          'prev_owner': prev_owner,
          'sender_adress': sender_address
        } as unknown as ParsedValue;

        parsed_arr.push(temp_dict);
        one_check_arr.push(temp_dict);
       
      } else if(check == 10) {
        //canceled
        let temp_dict = {
          'offer_address': nft_address_parsed,
          'offer_index': Number(offersData.data[i].nft_index), // string
          'check': 10, // check numbver
          'status': "Offer canceled",
          'offer_value': offer_value, // number | undefined; //TON
          'start_loan': undefined, // string | undefined;
          'in_msg_created_at': offersData.data[i].in_msg_created_at,
          'offer_owner': offer_owner,
          'prev_owner': undefined,
          'sender_adress': undefined
        } as unknown as ParsedValue;

        parsed_arr.push(temp_dict);

      } else if(check == 3) {
        // NFT to prev_owner, money with loan percentage to offer owner
        // take data
        let prev_owner = reader.loadAddress() as Address;
        let sender_address = reader.loadAddress() as Address;
        let start_loan = reader.loadInt(32) as Number;
        let temp_dict = {
          'offer_address': nft_address_parsed,
          'offer_index': Number(offersData.data[i].nft_index), // string
          'check': 3, // check numbver
          'status': "Loan finished(money returned)", 
          'offer_value': offer_value, // number | undefined; //TON
          'start_loan': start_loan, // string | undefined;
          'in_msg_created_at': offersData.data[i].in_msg_created_at,
          'offer_owner': offer_owner,
          'prev_owner': prev_owner,
          'sender_adress': sender_address
        } as unknown as ParsedValue;

        parsed_arr.push(temp_dict);

      } else if(check == 4) {
        // NFT to offer owner => borrower не вернул деньги
        // take data
        let prev_owner = reader.loadAddress() as Address;
        let sender_address = reader.loadAddress() as Address;
        let start_loan = reader.loadInt(32) as Number;
        let temp_dict = {
          'offer_address': nft_address_parsed,
          'offer_index': Number(offersData.data[i].nft_index), // string
          'check': 4, // check numbver
          'status': "Loan finished(claim NFT)", 
          'offer_value': offer_value, // number | undefined; //TON
          'start_loan': start_loan, // string | undefined;
          'in_msg_created_at': offersData.data[i].in_msg_created_at,
          'offer_owner': offer_owner,
          'prev_owner': prev_owner,
          'sender_adress': sender_address
        } as unknown as ParsedValue;

        parsed_arr.push(temp_dict);
      } else {
        // do nothing
      }

    }

    //const all_offers_length = parsed_arr.length as Number;
    //1) Best Offer Free - MAX offer_value   самый дорогой оффер 0.74 TON
    // check if there are values
    const bestOffer = zero_check_arr.length > 0 ? zero_check_arr.reduce((a,b)=>a.offer_value>b.offer_value?a:b) : undefined;
    //var maxA = one_check_arr.reduce((a,b)=>a.offer_value>b.offer_value?a:b) // error
    //console.log(maxA);

    //3) Availble pool - сумма не взятых - Сумма c 0
    const availblePool = zero_check_arr.length > 0 ?  zero_check_arr.map(item => item.offer_value).reduce((prev, next) => prev + next) : undefined;  
    //4) Taken  245 of 429 txaken - Количество все - !=0
    const taken = parsed_arr.length - zero_check_arr.length
    //6) Active offers + Sum - сортировка от большего к меньшему == 0
    // sum = availiable pool
    const sorted_zero_arr = zero_check_arr.length > 0 ? zero_check_arr.sort((a,b) => b.offer_value - a.offer_value) : undefined;
    //console.log(sorted_zero_arr);
    //2) Последний взятый оффер 0.73 TON last loan taken - 1 c максимальным start_loan
    const lastTaken = one_check_arr.length > 0 ? one_check_arr.reduce((a,b)=>a.start_loan!>b.start_loan!?a:b) : undefined;  
      
    //5) Active loans + Sum - сортировка от большего к меньшему active loans == 1
    const one_sum = one_check_arr.length > 0 ?  one_check_arr.map(item => item.offer_value).reduce((prev, next) => prev + next) : one_check_arr;
    const sorted_one_arr = one_check_arr.length > 0 ? one_check_arr.sort((a,b) => b.offer_value - a.offer_value) : undefined;
    
    let res_dict = {
      best_offer_value: bestOffer,
      last_taken_offer: lastTaken,
      taken_count: taken,
      active_loans: sorted_one_arr,
      active_loans_sum: one_sum,
      active_offers: sorted_zero_arr,
      active_offers_sum: availblePool,
      all_offers: parsed_arr 
    }  as EnrichedResult

    return { status: 'success', data: res_dict }
  }
}


//getEnrichedOffersData(true)


export async function getFilteredOffersData(testnet: boolean,offer_owner_address: string) {
  const offersEnrichedData = await getEnrichedOffersData(testnet);
  if(offersEnrichedData.status =='error') {
    return { status: 'error', data: undefined }
  } else { 
    if(offersEnrichedData.data?.all_offers === undefined) {

    } else {
      //const res_arr: ParsedValue[] = [];
      var res_arr: ParsedValue[] = offersEnrichedData.data?.all_offers.filter(obj => {
        return obj.offer_owner === offer_owner_address
      })

      return { status: 'success', data: res_arr }
    }

    
  }
 }



export async function getFilteredLoansData(testnet: boolean,loan_owner_address: string) {
  const offersEnrichedData = await getEnrichedOffersData(testnet);
  if(offersEnrichedData.status =='error') {
    return { status: 'error', data: undefined }
  } else { 
    if(offersEnrichedData.data?.all_offers === undefined) {

    } else {
      //const res_arr: ParsedValue[] = [];
      var res_arr: ParsedValue[] = offersEnrichedData.data?.all_offers.filter(obj => {
        let prev_owner_string = (typeof obj.prev_owner === 'undefined') ? '' : testnet ? obj.prev_owner.toString({ bounceable: true, urlSafe: true, testOnly: true }) : obj.prev_owner.toString({ bounceable: true, urlSafe: true, testOnly: false });
      
        return prev_owner_string === loan_owner_address
      })

      return { status: 'success', data: res_arr }
    }

    
  }
 }