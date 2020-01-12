import util from "util";

export const prettyPrintResponse = (response: object) => {
  console.log(util.inspect(response, { colors: true, depth: 4 }));
};
