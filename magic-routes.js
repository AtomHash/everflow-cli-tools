var path = require('path');
var fs = require('fs-extra');
var camelCase = require('./camel-case')


// Generate Module routes.ts
modulesPath = "./src/modules";
moduleRoutes = path.join(path.resolve(modulesPath));
globalRoutesPath = './src/router';
routesFile = './src/router/index.ts';
globalStorePath = './src/store/';
storeFile = './src/store/index.ts';
let routeImportNames = [];
let storeImportNames = [];
const routesStream = fs.createWriteStream(routesFile);
const storesStream = fs.createWriteStream(storeFile);

// start route file write
routesStream.write("import { RouteConfig } from 'vue-router';\n");

// start store file write
storesStream.write("import Vue from 'vue';\n");
storesStream.write("import Vuex from 'vuex';\n");

for (let storeFolder of fs.readdirSync(path.resolve(globalStorePath)))
{
    // for each folder in ./src/store/* convert to store module
    if (fs.statSync(path.join(path.resolve(globalStorePath), storeFolder)).isDirectory())
    {
        let storePath = path.join(path.resolve(globalStorePath), storeFolder, 'index.ts');
        let importName = camelCase(storeFolder);
        
        // store write import
        if (fs.existsSync(storePath))
        {
            storeImportNames.push(importName);
            storesStream.write("import " + importName + 'Store' + " from \"./" + storeFolder + "\";\n");
        }
    }
}

if (fs.existsSync(path.join(path.resolve(globalRoutesPath), 'routes.ts')))
{
    let importName = 'rootGlobal';
    routeImportNames.push(importName);
    routesStream.write("import " + importName + 'Routes' + " from \"./routes\";\n");
}

for (let folder of fs.readdirSync(path.resolve(modulesPath)))
{
    if (fs.statSync(path.join(path.resolve(modulesPath), folder)).isDirectory())
    {
        let modulePath = path.join(path.resolve(modulesPath), folder);
        let routesPath = path.join(modulePath, 'routes.ts');
        let storePath = path.join(modulePath, 'store', 'index.ts');
        let importName = camelCase(folder);

        // Routes write import
        if (fs.existsSync(routesPath))
        {
            routeImportNames.push(importName);
            routesStream.write("import " + importName + 'Routes' + " from \"../modules/" + folder + "/routes\";\n");
        }

        //Store write import
        if (fs.existsSync(storePath))
        {
            storeImportNames.push(importName);
            storesStream.write("import " + importName + 'Store' + " from \"../modules/" + folder + "/store\";\n");
        }
    }
}

function buildRoutes(importName, index)
{
    if (importName == routeImportNames[0]+ "Routes") {
        return;
    }
    if (index === routeImportNames.length)
    {
        routesStream.write(importName);
    } else
    {
        routesStream.write(importName + ",\n");
    }
}

function buildStores(importName, index)
{
    if (index === storeImportNames.length)
    {
        storesStream.write(importName + ": "+importName+ "Store}\n");
    } else
    {
        storesStream.write(importName + ": "+importName+ "Store,\n");
    }
}

// handle routes array
if (routeImportNames.length > 1)
{
    routesStream.write("const routes: Array<RouteConfig> = "+routeImportNames[0]+ "Routes" + ".concat(");
}
if (routeImportNames.length == 1)
{
    routesStream.write("const routes: Array<RouteConfig> = "+routeImportNames[0]+ "Routes;");
}

var routeCounter = 0;
for (let importName of routeImportNames)
{
    routeCounter++;

    // build route list
    if (routeImportNames.length > 1){
        buildRoutes(importName + "Routes", routeCounter);
    }
}

// finish routes file
if (routeImportNames.length > 1)
{
    routesStream.write(");\n");
}
routesStream.write("\nexport default routes;");
routesStream.end();

// write vue vuex init
storesStream.write("Vue.use(Vuex);\n\n");
// start vuex write
storesStream.write("export default new Vuex.Store({\n");
storesStream.write("modules: {\n");

var storeCounter = 0;
for (let importName of storeImportNames){
    storeCounter++;
    // build store list
    buildStores(importName, storeCounter);
}

// finish stores file
storesStream.write("});");
storesStream.end();