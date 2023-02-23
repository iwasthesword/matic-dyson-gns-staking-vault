import axios from "axios";

const Coingecko = axios.create({
  baseURL: "https://api.coingecko.com/api/v3/simple",
});

export default Coingecko;