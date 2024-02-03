const net  = require('net');

const serialize = require('./serializer.js');

const desarilize  = require('./deserializer.js');

const map = {};

const echo = (data) => {
    return data;
};

const ping = () => {
    return 'PONG';
};

const set = (key, val, expiry) => {
    map[key] = val;
    if(expiry !== undefined)
    {
        map[key] = {
            value: val,
            expiry: expiry
        };
    }
    return 'OK';
};

const get = (key) => {
    if(map[key] === undefined)
    {
        return null;
    }
    expiry = map[key].expiry;
    if(expiry)
    {
        //check if it is expired or not
        if(new Date().getTime() > expiry)
        {
            delete map[key];
            return null;
        }
        else{
            return map[key].value;
        }
    }
    return map[key];
};

const takeAction = (command) => {
    //command is array 
    if(command[0] === undefined)
        return;
    switch(command[0].toLowerCase()){
        case 'ping': return ping();
        case 'echo': return echo(command.slice(1).join(' '));
        case 'set':
            let expiry = undefined;
            let currentUnixTimeMillis;
            let currentUnixTimeSeconds;
            let seconds;
            let milliseconds;
            if(command.length > 3)
            {
                if(command.length == 4 || command.length > 5)
                {
                    return new Error("Sytnax Error, Unexpected tokens");
                }
                switch(command[3])
                {
                    case 'EX': seconds = parseInt(command[4]);
                        if(isNaN(seconds))
                        {
                            return new Error("Unexpected option value, it should be integers representing seconds.");
                        }
                        currentUnixTimeMillis = new Date().getTime();
                        currentUnixTimeSeconds = Math.floor(currentUnixTimeMillis / 1000) + seconds;
                        currentUnixTimeMillis = currentUnixTimeSeconds*1000;
                        expiry = currentUnixTimeMillis;
                        break;
                    case 'PX':
                        milliseconds = parseInt(command[4]);
                        if(isNaN(milliseconds))
                        {
                            return new Error("Unexpected option value, it should be integers representing milliseconds.");
                        }
                        currentUnixTimeMillis = new Date().getTime() + milliseconds;
                        expiry = currentUnixTimeMillis;
                        break;
                    case 'EAXT':
                        seconds = parseInt(command[4]);
                        if(isNaN(seconds))
                        {
                            return new Error("Unexpected option value, it should be integer representing UNIX seconds.");
                        }
                        expiry = seconds*1000;
                        break;
                    case 'PXAT':
                        milliseconds = parseInt(command[4]);
                        if(isNaN(seconds))
                        {
                            return new Error("Unexpected option value, it should be integer representing UNIX milliseconds.");
                        }
                        expiry = milliseconds;
                        break;
                    default:
                        return new Error("Unsupported Option type");
                }
            } 
        return set(command[1], command[2], expiry);
        case 'get':
            if(command.length > 2)
            {
                return new Error('Unsupported syntax, get should have key only as a parameter');
            } 
        return get(command[1]);

        default: return new Error('Unsupported Action');
    }
}

const handleClient = (client) => {

    client.on('data', (data) => {
        data = data.toString();
        const decodedCommand = desarilize(data);
        console.log(decodedCommand);
        const response = takeAction(decodedCommand);
        
        if(response !== undefined)
        {
            const serializedResponse = serialize(response);
            client.write(serializedResponse);
        }
    });

    client.on('end', () => {
        console.log('Connection closed');
    })
}


server = net.createServer(handleClient);

server.listen(6380, '127.0.0.1', () => {
    console.log('Redis Lite server listening on 127.0.0.1:6380');
});