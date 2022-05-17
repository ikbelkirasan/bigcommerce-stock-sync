import _ from "lodash";

export class StockProcessor {
  constructor(rows, products) {
    this.rows = rows;
    this.products = products;
  }

  process() {
    return this.getStock();
  }

  getStock() {
    const items = _.chain(this.rows)
      .groupBy(item => item["Drug_id"])
      .mapValues(groupItems => ({
        stock: this.countStock(groupItems, "Stock"),
        expiryDate: this.getExpiryDate(groupItems),
      }))
      .map(({ stock, expiryDate }, sku) => {
        const product = this.getProductBySku(this.products, sku);
        if (!product) {
          return null;
        }

        const ExpiryDateCustomField = this.getProductCustomField(
          product,
          "Expiry Date",
        );

        const customFields = _.filter(
          [
            expiryDate && {
              id: ExpiryDateCustomField ? ExpiryDateCustomField.id : undefined,
              name: "Expiry Date",
              value: expiryDate,
            },
          ],
          Boolean,
        );

        return {
          id: product.id,
          inventory_level: stock,
          custom_fields: customFields,
        };
      })
      .filter(Boolean)
      .value();

    return items;
  }

  getProductCustomField = (product, name) => {
    const customField = _.find(
      product.custom_fields,
      customField => customField.name === name,
    );
    return customField;
  };

  getProductBySku(products, sku) {
    const product = _.find(products, product => product.sku === sku);
    return product;
  }

  countStock = (items, key) => {
    return _.reduce(
      items,
      (count, item) => {
        const stock = Number(item[key]);
        return count + stock;
      },
      0,
    );
  };

  getExpiryDate = items => {
    return _.chain(items)
      .sortBy(item => _.toNumber(item["Stock"]))
      .reverse()
      .first()
      .get("ExpDate")
      .value();
  };
}
