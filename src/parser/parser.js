import Papa from "papaparse";
import _ from "lodash";

export function parseCSV(csv) {
  const { data: items, errors } = Papa.parse(csv, {
    header: true,
    transformHeader(header) {
      return header.trim();
    },
    transform(value) {
      let val = _.trim(value);
      if (val === "NULL") {
        val = null;
      }
      return val;
    },
  });

  const data = _.reject(items, item =>
    _.values(item).every(value => _.startsWith(value, "--")),
  );

  return {
    data,
    errors,
  };
}
