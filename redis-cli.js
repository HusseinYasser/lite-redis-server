const net = require('net');

const readline = require('readline');

const serializer = require('./serializer.js');

const deserializer = require('./deserializer.js');

const help = require('./help.js');

const hostIndex = process.argv.indexOf('-h');
const portIndex = process.argv.indexOf('-p');

const host = hostIndex !== -1 ? process.argv[hostIndex + 1] : 'localhost';
const port = portIndex !== -1 ? parseInt(process.argv[portIndex + 1], 10) : 6379;

const showList = (data, spaces) => {
    let i = 1;
    let ret = '';
    data.forEach((x) => {
        if(Array.isArray(x))
        {
            showList(x, spaces+1);
        }
        else
        {
            let initialSpaces = '';
            for (let j = 0; j < spaces; ++j) initialSpaces += ' ';
            ret += initialSpaces + `${i}) ${showData(x)}\n`;
            i++;
        }
    });
    return ret;
};

const showData = (data) => {
    if(typeof(data) === 'Number' )
    {
        //integer data
        return `(integer) ${data}`;
    }
    else if(data instanceof Error)
    {
        return `(error) ${data.message}`;
    }
    else if(Array.isArray(data))
    {
        return showList(data, 0);
    }
    else
    {
        return data;
    }
};

const client = net.createConnection({
    host: host,
    port: port 
},
() => 
{
    // Start reading user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.setPrompt(`${host}:${port}>`);
    rl.prompt();

    rl.on('line', (inputData) => {
        if(inputData.toLowerCase().trim() === 'exit')
        {
            client.end(() => {
                process.exit();
            });
        }
        else
        {
            inputData = inputData.split(' ');
            if(inputData[0].toLowerCase() === 'help')
            {
                console.log(help(inputData.slice(1).join(' ')));
                rl.prompt();
            }
            else{
                let serializedData = serializer(inputData);
                client.write(serializedData);
            }
        }
    });

    client.on('data', (data) => {
        data = data.toString();
        const desarilizedData = deserializer(data);
        console.log(showData(desarilizedData));
        rl.prompt();
    });


    
}
);