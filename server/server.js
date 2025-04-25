/*
 * @license
 * Copyright 2025 Designø Group ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
"use strict";
import express from 'express';
import cors from "cors";
import { predictCaptchaFromImage } from './captcha.js';
import bodyParser from "body-parser";

const jsonParser = bodyParser.json({ limit: "10mb" });

const  ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';

const app = express();

try {   
    app.disable("x-powered-by");

    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'))

    app.use(cors({ origin: "*" }));
    
    /**
     * Parse incoming JSON data from the request body
     * + Global Middleware to protect from invalid json (i.e: null)  -- mv to global error handler?
     */
    app.use(express.json());
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError) {
            res.status(400).send('Invalid JSON');
        } else {
            next();
        }
    });
    
    app.post("/data", jsonParser, async (req, res) => {
        try {
          const { base64 } = req.body;
          console.log("Received data:", base64);
          if (!base64) {
            return res.status(400).send("Missing base64 image data.");
          }
          const result = await predictCaptchaFromImage(base64);
          return res.send({ result });
        } catch (err) {
          console.error("Prediction error:", err);
          return res.status(500).send("Prediction failed.");
        }
    });      
      
   
    app.get(/(.*)/, (req, res) => {
        return res.status(400).send("Not Found.");
    });

    app.use((req, res, next) => {
        if (!req.secure && ENABLE_HTTPS) {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    });

    const host = '0.0.0.0'; //'127.0.0.1';
    const port = process.env.PORT ? null : 8080;
    process.env.ORIGIN = `https://${process.env.HOSTNAME}`;

    const server = app.listen(port || process.env.PORT, () => {
        console.log('Server started in HTTP');
        console.log('Your app is listening on host ' + JSON.stringify(server.address()));
        console.log('Your app is listening on port ' + server.address().port);
    });
    
} catch (error) {
    console.log("server.js", `server failed to start and caught error: ${error}`);
    console.log("server.js", error);
    process.exit(1);
} finally {
    process.on('SIGINT' || 'exit', async () => {
        console.log('Server is shutting down...');
        process.exit(0);
    });
    // Uncaught Exception is when you throw an error and did not catch anywhere.
    process.on('uncaughtException', async (error) => {
        console.log("server.js", `UncaughtException: ${error}`);
        process.exit(1);
    });
    // Unhandled promise rejection is similar, when you fail to catch a Promise.reject.
    process.on('unhandledRejection', async (reason, promise) => {
        console.log("server.js", `UhandledRejection: ${reason}`);
        process.exit(1);
    });
}