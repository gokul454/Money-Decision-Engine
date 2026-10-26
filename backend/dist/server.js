"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const database_js_1 = require("./config/database.js");
const environment_js_1 = require("./config/environment.js");
const demoData_js_1 = require("./seed/demoData.js");
async function startServer() {
    await (0, database_js_1.connectDB)();
    await (0, demoData_js_1.seedDemoData)();
    app_js_1.app.listen(environment_js_1.ENV.PORT, () => {
        console.log(`===========================================`);
        console.log(`  Money OS Backend Server Running`);
        console.log(`  Port: http://localhost:${environment_js_1.ENV.PORT}`);
        console.log(`  Environment: ${environment_js_1.ENV.NODE_ENV}`);
        console.log(`===========================================`);
    });
}
startServer().catch((err) => {
    console.error('[Server Error]', err);
    process.exit(1);
});
