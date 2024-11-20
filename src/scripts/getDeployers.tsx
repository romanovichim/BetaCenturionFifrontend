//network config for frontend
var current_network: string = 'testnet';


export type OneDeployer = {
    nft_col_name: string;
    nft_col_img_url:  string;
    deployer_address:  string;
    apy:  string;
    duration:  string;
    nft_col_address: string;
}

export type deployerArr = OneDeployer[];

export function fetchDeployers() {
    //
   var deployer_arr = [] as deployerArr;
   if(current_network=="mainnet") {
    // TBD change to real data after deploy
    deployer_arr.push({nft_col_name: "Testnet NFT Col",nft_col_img_url: "https://nft.fragment.com/usernames.svg", deployer_address: "kQCLNjNkqOtHaOeKEU6FC_FhPmpP7ZmPaeUa10eHZhW_msPk",apy: "220%", duration: "16d",nft_col_address:""});
   }
   else {
    deployer_arr.push({nft_col_name: "Testnet NFT Col",nft_col_img_url: "https://nft.fragment.com/usernames.svg", deployer_address: "kQCLNjNkqOtHaOeKEU6FC_FhPmpP7ZmPaeUa10eHZhW_msPk",apy: "220%", duration: "16d",nft_col_address:"kQDsONllLoFp_-WLJl2-TBQhZNz25a1TyDBICadMJM3f-W6W"});
   }

   return deployer_arr;

}

