var path = require('path');
var fs = require('fs-extra');

function camelCase(str){
  let arr = str.split('-');
  let capital = arr.map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item);
  // ^-- change here.
  let capitalString = capital.join("");
  return capitalString;
}

// Generate Module routes.ts
modulesPath = "./src/modules";
moduleRoutes = path.join(path.resolve(modulesPath));
routesFile = './src/router/routes.ts';
storeFile = './src/store/index.ts';
var importNames = [];
var routesStream = fs.createWriteStream(routesFile);
var storesStream = fs.createWriteStream(storeFile);
routesStream.write("import { RouteConfig } from 'vue-router';\n");

// Vue store setup
storesStream.write("import Vue from 'vue';\n");
storesStream.write("import Vuex from 'vuex';\n");
for (let folder of fs.readdirSync(path.resolve(modulesPath)))
{
    if (fs.statSync(path.join(path.resolve(modulesPath), folder)).isDirectory())
    {
        var importName = camelCase(folder);
        importNames.push(importName);

        // Routes write import
        routesStream.write("import " + importName + 'Routes' + " from \"../modules/" + folder + "/routes\";\n");

        //Store write import
        storesStream.write("import " + importName + 'Store' + " from \"../modules/" + folder + "/store\";\n");
    }
}

// Finish vue vuex init
storesStream.write("Vue.use(Vuex);\n\n");

counter = 0;

//Handle Routes
if (importNames.length > 1)
{
    routesStream.write("const routes: Array<RouteConfig> = "+importNames[0]+ "Routes" + ".concat(");
}
if (importNames.length == 1)
{
    routesStream.write("const routes: Array<RouteConfig> = "+importNames[0]+ "Routes;");
}

// Start vuex write
storesStream.write("export default new Vuex.Store({\n");
storesStream.write("modules: {\n");

for (let importName of importNames)
{
    counter++;

    // Build route list
    if (importNames.length > 1){
        buildRoutes(importName + "Routes");
    }

    // Build store list
    buildStores(importName);
}

// Finish routes file
if (importNames.length > 1)
{
    routesStream.write(");\n");
}
routesStream.write("\nexport default routes;");
routesStream.end();

// Finish stores file
storesStream.write("});");


function buildRoutes(importName)
{
    if (importName == importNames[0]+ "Routes") {
        return;
    }
    if (counter === importNames.length)
    {
        routesStream.write(importName);
    } else
    {
        routesStream.write(importName + ",\n");
    }
}

function buildStores(importName)
{
    if (counter === importNames.length)
    {
        storesStream.write(importName + ": "+importName+ "Store}\n");
    } else
    {
        storesStream.write(importName + ": "+importName+ "Store,\n");
    }
}