const net  = require('net');

const serialize = require('./serializer.js');

const desarilize  = require('./deserializer.js');

const LinkedList = require('./linkedlist.js');

const map = new Map();

const echo = (data) => {
    return data;
};

const ping = () => {
    return 'PONG';
};

const set = (key, val, expiry) => {
    
    map.set(key, {
        value: val,
        expiry: expiry
    });
    return 'OK';
};

const get = (key) => {
    if(!map.has(key)) return null;

    let obj = map.get(key);
    expiry = obj.expiry;

        //check if it is expired or not
    if(expiry && new Date().getTime() > expiry)
    {
        map.delete(key);
        return null;
    }
    else{
        //if(obj.value instanceof LinkedList) return new Error("Arrays are not simple datatype, use LRANEG instead");
        return obj.value;
    }
};

const exists = (keys) => {
    return keys.reduce((cum, key) => {
        return cum + ( map.has(key) ? 1:0);
    }, 0);
};

const del = (keys) => {
    return keys.reduce((cum, key) => {
        let add = ( map.has(key) ? 1:0);
        map.delete(key);
        return cum + add;
    }, 0);
}

const incr = (key, i) => {
    if(!map.has(key))
    {
        map.set(key, {
            value: '0',
            expiry: undefined
        });
    }
    let val = parseInt(map.get(key).value);
    if(val === undefined)
    {
        return new Error("Value of this key can't be represented as integer");
    }
    let expir = map.get(key).expiry; 
    val += i;
    map.set(key,  {value: val.toString(), expiry: expir});
    return val;
};

const push = (key, values, isLeft) => {
    if(!map.has(key))
    {
        //new element
        map.set(key, {
            value: new LinkedList(),
            expiry: undefined
        }); 
    }
    if(!(map.get(key).value instanceof LinkedList))
    {
        return new Error("The datatype stored is not copmpatible with this command");
    }
    values.forEach((val) => 
    {
        if(isLeft)
            map.get(key).value.appendLeft(val);
        else
            map.get(key).value.appendRight(val);
    });
    return map.get(key).value.size;
};


const lrange = (key, start, end) => {
    if(!map.has(key)) return [];
    if(!(map.get(key).value instanceof LinkedList))
    {
        return new Error("The datatype stored is not copmpatible with this command");
    }
    start = parseInt(start);
    end = parseInt(end);
    if(start === undefined || end === undefined) return new Error("The start and end should be integers");
    return map.get(key).value.lrange(start, end);
}




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
            if(command.length < 3)
            {
                return new Error('Insufficient number of arguments');
            }
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
        
        case 'exists':
            if(command.length == 1)
            {
                return new Error("There has to be at least one argument to this comamnd.");
            }
            return exists(command.slice(1));
        case 'del':
            if(command.length == 1)
            {
                return new Error("There has to be at least one argument to this comamnd.");
            }
            return del(command.slice(1));
        case 'decr':
        case 'incr':
            if(command.length == 1){
                return new Error("There has to be one argument to this command.");
            }
            if(command.length > 2)
            {
                return new Error("This command takes only one argument.");
            }
            return (command[0].toLowerCase() == 'incr')? incr(command[1], 1):incr(command[1], -1);
        
        case 'lpush':
        case 'rpush':
            if(command.length <= 2)
            {
                return new Error("Insufficient number of arguments to this command");
            }
            return (command[0].toLowerCase() == 'lpush')? push(command[1], command.slice(2), true) : push(command[1], command.slice(2), false);
        
        case 'lrange':
            if(command.length != 4)
            {
                return new Error("Insufficient number of arguments to the action");
            }
            return lrange(command[1], command[2], command[3]);

        default: return new Error('Unsupported Action');
    }
}

const handleClient = (client) => {

    client.on('data', (data) => {
        data = data.toString();
        const decodedCommand = desarilize(data);
        const response = takeAction(decodedCommand);
        
        if(response !== undefined)
        {
            const serializedResponse = serialize(response);
            client.write(serializedResponse);
        }
    });
}


server = net.createServer(handleClient);

server.listen(6379, '127.0.0.1');