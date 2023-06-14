// gpr-hack.js
const { writeFileSync, readFileSync } = require("fs");

const file = readFileSync("./package.json", {
  encoding: "utf-8",
});

const json = JSON.parse(file);

json.name = "@bibinantony1998/react-table-column-resizer";

writeFileSync("./package.json", JSON.stringify(json, undefined, 2));
