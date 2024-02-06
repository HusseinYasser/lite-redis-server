const net = require('net');
const readline = require('readline');
const kleur = require('kleur');
const serializer = require('./serializer.js');
const deserializer = require('./deserializer.js');
const {help, getCommand, readCommandFile} = require('./help.js');


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
    if(typeof(data) === 'number' )
    {
        //integer data
        return kleur.blue('(integer)') + ` ${data}`;
    }
    else if(data instanceof Error)
    {
        return kleur.red('(error)') + ` ${data.message}`;
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
    process.stdin.setRawMode(true);
    // Start reading user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: hint_completer
    });

    function hint_completer(line) {
        let originalLine = line;
        line = line.trim().split(' ');
        const jsonData = readCommandFile(line[0].toLowerCase().trim());
        let command = getCommand(line[0].trim(), jsonData);
        console.log(' ' + command.slice(line.length).join(' '));
        rl.line = '';
        rl.prompt();
        return [[], originalLine];
    };
    

    rl.setPrompt(kleur.green('he_') + `${host}:${port}>`);
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

    client.on('end', () => {
        process.exit();
    });
}
);