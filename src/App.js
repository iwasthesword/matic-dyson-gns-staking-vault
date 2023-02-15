import "./App.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import moment from "moment";
import { tokenD } from "./util";
import GNS from "./GNS.js";

import contractABI from "./abi.json";
import strategyABI from "./strategy_abi.json";

const contractADDR = "0x035001ddc2f6dcf2006565af31709f8613a7d70c";
const strategyADDR = "0x95e73a6a39940f0b62afe12a4a3468e95fc61ab0";

function App() {
  const [balanceOf, setBalanceOf] = useState();
  const [pricePerFullShare, setPricePerFullShare] = useState();
  const [decimals, setDecimals] = useState();
  const [inputAddress, setInputAddress] = useState();
  const [lastHarvest, setLastHarvest] = useState();
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

    async function fetchInputlessData() {
      // Get the contract instance
      let strategy = new web3.eth.Contract(strategyABI, strategyADDR);

      let _lastHarvest = await strategy.methods.lastHarvest().call();
      setLastHarvest(_lastHarvest);
    }
    if (inputAddress && Web3.utils.isAddress(inputAddress)) {
      fetchData();
    } else {
      setBalanceOf(null);
    }
    fetchInputlessData();

    // Clear the interval when the component unmounts
  }, [inputAddress, storedAddress]);

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
          </abbr>{" "}
          GNS
        </div>
      ) : (
        <div></div>
      )}
      {lastHarvest ? (
        <div>
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
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default App;
