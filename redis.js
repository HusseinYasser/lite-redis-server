
const net  = require('net');

const serialize = (data) => {

};

const desarilize = (data) => {
    data = data.toString('utf-8');
    console.log(data);
    return data;

};

const takeAction = (command) => {
    return undefined;
}

const handleClient = (client) => {
    console.log('Here we go');

    client.on('data', (data) => {
        const decodedCommand = desarilize(data);
        const response = takeAction(decodedCommand);
        
        if(response !== undefined)
        {
            const serializedResponse = serialize(response);
            client.write(serializedResponse);
        }
        else
            client.write('+OK\r\n');
    });

    client.on('end', () => {
        console.log('Connection closed');
    })
}

server = net.createServer(handleClient);






server.listen(6380, '127.0.0.1', () => {
    console.log('Redis Lite server listening on 127.0.0.1:6379');
});