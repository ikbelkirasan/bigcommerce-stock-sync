import _ from "lodash";
import pMap from "p-map";
import config from "../config.js";
import axios from "../axios.js";
import { BigCommerceAPI } from "../api/bigcommerce.js";
import { parseCSV } from "../parser/parser.js";

function debug(...args) {
  if (process.env.NODE_ENV?.startsWith("test")) {
    return;
  }
  return console.debug(...args);
}

class StockProcessor {
  constructor(rows, products) {
    this.rows = rows;
    this.products = products;
  }

  process() {
    return this.getStock();
  }

  getStock() {
    const countStock = (items, key) => {
      return _.reduce(
        items,
        (count, item) => {
          const stock = Number(item[key]);
          return count + stock;
        },
        0,
      );
    };

    const items = _.chain(this.rows)
      .groupBy(item => item["Drug_id"])
      .mapValues(groupItems => countStock(groupItems, "Stock"))
      .map((stock, sku) => {
        const product = _.find(this.products, product => product.sku === sku);
        if (!product) {
          return null;
        }

        return {
          id: product.id,
          sku,
          inventory_level: stock,
        };
      })
      .filter(Boolean)
      .value();

    return items;
  }
}

export class Workflow {
  constructor({ csvFileUrl }) {
    this.bigCommerceAPI = new BigCommerceAPI({
      storeHash: config.bigCommerce.storeHash,
      authToken: config.bigCommerce.accessToken,
    });

    this.csvFileUrl = csvFileUrl;
    this.csvFile = null;
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
      } = await this.bigCommerceAPI.products.list({ limit, page });

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
        const { data } = await this.bigCommerceAPI.products.batchUpdates(batch);
        return data;
      },
      {
        stopOnError: true,
        concurrency,
      },
    );

    return _.flatten(responses);
  }

  formatResults(updatedProducts) {
    return _.map(updatedProducts, product =>
      _.pick(product, ["id", "name", "sku", "inventory_level"]),
    );
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
    debug("Downloading the CSV file...");
    await this.downloadFile();
    debug("Downloaded the CSV file. Length: %d bytes", this.csvFile.length);

    // Parse updates from the CSV file
    debug("Parsing CSV file...");
    const rows = this.getRows();
    debug("Parsed CSV file, %d rows.", rows.length);

    // Get all the products from BigCommerce store
    debug("Fetching products...");
    const products = await this.getAllProducts();
    debug("Fetched products -> %d products found", products.length);

    // Process the updates
    debug("Processing...");
    const processor = new StockProcessor(rows, products);
    const updates = processor.process();
    debug("Processing done.");

    // Send updates in batches
    debug("Will updates %d products...", updates.length);
    const updatedProducts = await this.updateAllProducts(updates, 10);
    debug("Updated %d products...", updates.length);

    // Reduce the number of returned fields
    const result = this.formatResults(updatedProducts);
    debug("Results: %d products...", result.length);

    return result;
  }
}
