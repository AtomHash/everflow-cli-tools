var path = require('path');
var fs = require('fs-extra');

// Generate Module routes.ts
modulesPath = "./src/modules";
moduleRoutes = path.join(path.resolve(modulesPath));
routesFile = './src/router/routes.ts';
routesFileText = "";
var importNames = [];
var stream = fs.createWriteStream(routesFile);
stream.write("import { RouteConfig } from 'vue-router';\n");
for (let folder of fs.readdirSync(path.resolve(modulesPath)))
{
    if (fs.statSync(path.join(path.resolve(modulesPath), folder)).isDirectory())
    {
        moduleRoutesName = folder + 'Routes';
        importNames.push(moduleRoutesName);
        stream.write("import " + moduleRoutesName + " from \"../modules/" + folder + "/routes\";\n");
    }
}
counter = 0;
if (importNames.length > 1){
    stream.write("const routes: Array<RouteConfig> = "+importNames[0]+".concat(");
    for (let importName of importNames)
{
    counter++;
    if (importName == importNames[0]) {
        continue;
    }
    if (counter === importNames.length)
    {
        stream.write(importName);
    } else
    {
        stream.write(importName + ",\n");
    }
}
stream.write(");\n");
} else{
    stream.write("const routes: Array<RouteConfig> = "+importNames[0]+";");
}
stream.write("\nexport default routes;");
stream.end();