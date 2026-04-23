const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");

let CONFIG = {};
try {
  CONFIG = JSON.parse(
    fs.readFileSync(path.join(__dirname, "config.json"), "utf8"),
  );
  if (!CONFIG.clientId || !CONFIG.clientSecret) {
    console.warn(
      "config.json missing clientId or clientSecret - token refresh disabled.",
    );
  }
} catch (e) {
  console.warn(
    "config.json not found or invalid - token refresh disabled. (" +
      e.message +
      ")",
  );
}
const PORT = 3000;

function basecampRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        // Handle pagination - return headers too
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Basecamp-Token, X-Basecamp-Account",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve static files
  if (!req.url.startsWith("/api/")) {
    let filePath = path.join(
      __dirname,
      "public",
      parsedUrl.pathname === "/" ? "index.html" : parsedUrl.pathname,
    );
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      const mime =
        { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[
          ext
        ] || "text/plain";
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
    });
    return;
  }
  // Token refresh endpoint

  if (req.url === "/api/auth/refresh" && req.method === "POST") {
    if (!CONFIG.clientId || !CONFIG.clientSecret || !CONFIG.redirectUri) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Server config missing clientId/clientSecret/redirectUri",
        }),
      );
      return;
    }
    try {
      const bodyStr = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
      const { refresh_token } = JSON.parse(bodyStr || "{}");
      if (!refresh_token) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing refresh_token" }));
        return;
      }
      const params = new URLSearchParams({
        type: "refresh",
        refresh_token,
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        redirect_uri: CONFIG.redirectUri,
      }).toString();
      const refreshResult = await basecampRequest({
        hostname: "launchpad.37signals.com",
        path: "/authorization/token?" + params,
        method: "POST",
        headers: {
          "User-Agent": "BasecampCommandCenter (personal-dashboard)",
          "Content-Length": 0,
        },
      });
      res.writeHead(refreshResult.status, {
        "Content-Type": "application/json",
      });
      res.end(refreshResult.body);
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  // Proxy API calls to Basecamp
  const token = req.headers["x-basecamp-token"];
  const accountId = req.headers["x-basecamp-account"];

  if (!token || !accountId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing token or account ID" }));
    return;
  }

  // Strip /api prefix and build Basecamp URL path
  let bcPath = req.url.replace("/api", "");
  // If path doesn't start with account id, prepend it
  if (!bcPath.startsWith("/" + accountId)) {
    bcPath = "/" + accountId + bcPath;
  }

  const options = {
    hostname: "3.basecampapi.com",
    path: bcPath,
    method: req.method,
    headers: {
      Authorization: "Bearer " + token,
      "User-Agent": "BasecampCommandCenter (personal-dashboard)",
      "Content-Type": "application/json",
    },
  };

  try {
    const result = await basecampRequest(options);
    const headers = { "Content-Type": "application/json" };
    if (result.headers.link) headers["Link"] = result.headers.link;
    res.setHeader("Access-Control-Expose-Headers", "Link");
    res.writeHead(result.status, headers);
    res.end(result.body);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, () => {
  console.log("\n Sibest Central is online");
  console.log(` Porting at: ${PORT}\n`);
});
