import axios from "axios";
import axiosRetry from "axios-retry";

const http = axios.create();
axiosRetry(http);

export default http;
