// setup file
const { configure } = require('enzyme');
let Adapter = require('@cfaester/enzyme-adapter-react-18');

// Handle cases where the module might be an ES module and require returns { default: Adapter }
if (Adapter && Adapter.default) {
  Adapter = Adapter.default;
}

configure({ adapter: new Adapter() });