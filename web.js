var util = require('util'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    port = Number(process.env.PORT || 2222),
    app = connect();

app.use(serveStatic(__dirname));
app.listen(port);

util.puts('Listening on ' + port + '...');
util.puts('Press Ctrl + C to stop.');

