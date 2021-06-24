import * as http from "http";
const host = "localhost";
const port = 5051;

const requestListener = function (req, res) {
  console.log(req.body);

  setTimeout(() => {
    res.writeHead(200);
    res.end("OK");
  },25);
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
