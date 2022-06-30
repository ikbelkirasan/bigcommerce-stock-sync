import _ from "lodash";
import pMap from "p-map";
import config from "../config.js";
import axios from "../axios.js";
import { BigCommerceAPI } from "../api/bigcommerce.js";
import { debug } from "../helpers.js";
import { parseCSV } from "../parser/parser.js";
import { StockProcessor } from "./stock.processor.js";

export class Workflow {
  constructor({ csvFileUrl, csvFile }) {
    this.bigCommerceAPI = new BigCommerceAPI({
      storeHash: config.bigCommerce.storeHash,
      authToken: config.bigCommerce.accessToken,
    });

    this.csvFileUrl = csvFileUrl;
    this.csvFile = csvFile;
    this.result = null;
  }

  async downloadFile() {
    try {
      const response = await axios.get(this.csvFileUrl);
      this.csvFile = response.data;
    } catch (error) {
      error.message = `Failed to download the CSV file. ${error.message}`;
      throw error;
    }
  }

  async downloadFileIfMissing() {
    if (!this.csvFile && this.csvFileUrl) {
      await this.downloadFile();
    }
  }

  getRows() {
    const { data: rows } = parseCSV(this.csvFile);
    return rows;
  }

  async getAllProducts() {
    let page = 1;
    let total = 0;

    const limit = 250;
    const allProducts = [];

    do {
      const {
        data: products,
        meta: { pagination },
      } = await this.bigCommerceAPI.products.list({
        limit,
        page,
        include: "custom_fields",
        include_fields: ["id", "sku", "name", "custom_fields"].join(","),
      });

      allProducts.push(...products);

      page += 1;
      total = pagination.total;
    } while (page <= total);

    return allProducts;
  }

  async updateAllProducts(updates = [], concurrency = 1) {
    const batches = _.chunk(updates, 10);

    const responses = await pMap(
      batches,
      async batch => {
        const { data } = await this.bigCommerceAPI.products.batchUpdates(
          batch,
          {
            include_fields: [
              "id",
              "sku",
              "name",
              "inventory_level",
              "custom_fields",
            ].join(","),
          },
        );
        return data;
      },
      {
        stopOnError: true,
        concurrency,
      },
    );

    return _.flatten(responses);
  }

  async start() {
    try {
      const result = await this.perform();
      this.result = {
        status: "success",
        data: result,
      };
    } catch (error) {
      this.result = {
        status: "error",
        error: {
          message: error.message,
          stack: error.stack,
        },
      };
    }

    return this.result;
  }

  async perform() {
    // Download the file
    try {
      debug("Downloading the CSV file...");
      await this.downloadFileIfMissing();
      debug("Downloaded the CSV file. Length: %d bytes", this.csvFile.length);
    } catch (error) {
      debug("Failed to download the CSV file.", error.message);
      throw error;
    }

    // Parse updates from the CSV file
    let rows;
    try {
      debug("Parsing CSV file...");
      rows = this.getRows();
      debug("Parsed CSV file, %d rows.", rows.length);
    } catch (error) {
      debug("Failed to parse the CSV file.", error.message);
      throw error;
    }

    // Get all the products from BigCommerce store
    let products;
    try {
      debug("Fetching products...");
      products = await this.getAllProducts();
      debug("Fetched products -> %d products found", products.length);
    } catch (error) {
      debug("Failed to fetch products", error.message);
      throw error;
    }

    // Process the updates
    let updates;
    try {
      debug("Processing...");
      const processor = new StockProcessor(rows, products);
      updates = processor.process();
      debug("Processing done.");
    } catch (error) {
      debug("Failed to process the products.", error.message);
      throw error;
    }

    // Send updates in batches
    let updatedProducts;
    try {
      debug("Will update %d products...", updates.length);
      updatedProducts = await this.updateAllProducts(updates, 10);
      debug("Updated %d products...", updatedProducts.length);
    } catch (error) {
      debug("Failed to update products.", error.message);
      throw error;
    }

    return updatedProducts;
  }
}
