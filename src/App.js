import "./App.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import moment from "moment";
import Defillama from "./services/Defillama";
import { tokenD } from "./util";
import GNS from "./GNS.js";
import Dollar from "./Dollar";

import contractABI from "./abi.json";
import strategyABI from "./strategy_abi.json";

const contractADDR = "0x035001ddc2f6dcf2006565af31709f8613a7d70c";
const strategyADDR = "0x95e73a6a39940f0b62afe12a4a3468e95fc61ab0";
const gnsADDR = "0xE5417Af564e4bFDA1c483642db72007871397896";

function App() {
  const [balanceOf, setBalanceOf] = useState();
  const [pricePerFullShare, setPricePerFullShare] = useState();
  const [decimals, setDecimals] = useState();
  const [inputAddress, setInputAddress] = useState();
  const [lastHarvest, setLastHarvest] = useState();
  const [feeOnProfits, setFeeOnProfits] = useState();
  const [gnsPrice, setGnsPrice] = useState();
  const storedAddress = JSON.parse(localStorage.getItem("address"));

  const handleOnChange = (event) => {
    setInputAddress(event.target.value);
    localStorage.setItem("address", JSON.stringify(event.target.value));
  };
  useEffect(() => {
    if (!inputAddress && Web3.utils.isAddress(storedAddress)) {
      if (storedAddress) setInputAddress(storedAddress);
    }

    // Initialize web3
    let web3 = new Web3("https://rpc.ankr.com/polygon");

    async function fetchData() {
      // Get the contract instance
      let contract = new web3.eth.Contract(contractABI, contractADDR);

      let balance_of = await contract.methods.balanceOf(inputAddress).call();
      setBalanceOf(balance_of);

      let price_per_full_share = await contract.methods
        .getPricePerFullShare()
        .call();
      setPricePerFullShare(price_per_full_share);

      let _decimals = await contract.methods.decimals().call();
      setDecimals(_decimals);
    }
    if (inputAddress && Web3.utils.isAddress(inputAddress)) {
      fetchData();
    } else {
      setBalanceOf(null);
    }

    // Clear the interval when the component unmounts
  }, [inputAddress, storedAddress]);

  useEffect(() => {
    let web3 = new Web3("https://rpc.ankr.com/polygon");

    async function fetchInputlessData() {
      // Get the contract instance
      let strategy = new web3.eth.Contract(strategyABI, strategyADDR);

      let _lastHarvest = await strategy.methods.lastHarvest().call();
      setLastHarvest(_lastHarvest);

      let _feeOnProfits = await strategy.methods.feeOnProfits().call();
      setFeeOnProfits(_feeOnProfits);

      let llama_gns_addr = "polygon:"+gnsADDR;
      Defillama.get("/prices/current/"+llama_gns_addr)
      .then((response) => setGnsPrice(response.data["coins"][llama_gns_addr]["price"]))
      .catch((err) => {
        console.error("error fetching GNS price" + err);
      });
    }

    fetchInputlessData();
  }, []);

  return (
    <div className="App">
      <h1>Dyson GNS Staking Vault</h1>
      <input
        className={!Web3.utils.isAddress(inputAddress) ? "red-border" : ""}
        type="text"
        onChange={handleOnChange}
        placeholder="Address"
        value={inputAddress}
      />
      {balanceOf && pricePerFullShare && decimals ? (
        <div>
          <GNS />
          <abbr
            title={
              tokenD(balanceOf, decimals) * tokenD(pricePerFullShare, decimals)
            }
          >
            {(
              tokenD(balanceOf, decimals) * tokenD(pricePerFullShare, decimals)
            ).toFixed(4)}
          </abbr>
        </div>
      ) : (
        <div>&nbsp;</div>
      )}
      {gnsPrice && balanceOf && pricePerFullShare && decimals ? (
        <div>
          <Dollar />
          <abbr
            title={
              tokenD(balanceOf, decimals) *
              tokenD(pricePerFullShare, decimals) *
              gnsPrice
            }
          >
            {(
              tokenD(balanceOf, decimals) *
              tokenD(pricePerFullShare, decimals) *
              gnsPrice
            ).toFixed(2)}
          </abbr>
        </div>
      ) : (
        <div>&nbsp;</div>
      )}
      {lastHarvest ? (
        <div>
          <small>
            Last harvest:{" "}
            <abbr
              title={
                moment.unix(lastHarvest).format("LTS") +
                " " +
                moment.unix(lastHarvest).format("L")
              }
            >
              {moment.unix(lastHarvest).fromNow()}
            </abbr>
          </small>
        </div>
      ) : (
        <div>&nbsp;</div>
      )}
      {feeOnProfits ? (
        <div>
          <small>
            Fee: <abbr title="on profits">{feeOnProfits}%</abbr>
          </small>
        </div>
      ) : (
        <div>&nbsp;</div>
      )}
    </div>
  );
}

export default App;
