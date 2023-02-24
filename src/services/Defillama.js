import axios from "axios";

const Defillama = axios.create({
  baseURL: "https://coins.llama.fi/",
});

export default Defillama;