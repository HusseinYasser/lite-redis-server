
const fs = require('fs');
const path = require('path');
const kleur = require('kleur');

const helpArgument = (arg) => {
    let ans = '';
    if(arg.optional)
        ans += '[';
    let seperator = (arg.type === 'oneof')? '|' : ' ';
    if(arg.arguments){
        ans += arg.arguments.map(element => {
            return `${element.token} ${element.name}`;
        }).join(seperator);
    }
    if(!arg.arguments)
    {
        ans += arg.name + ' ';
        if(arg.multiple)
        {
            ans += `[${arg.name} ...]`;
        }
    }
    if(arg.optional)
        ans += ']';
    
    return kleur.grey(ans);
};

const getCommand = (actionName, json) => {
    let command = [];
    actionName = actionName.toUpperCase();
    command.push(actionName);
    
    //arguments
    if(json[actionName] && json[actionName].arguments){
        json[actionName].arguments.forEach(element => {
            command.push( helpArgument(element) );
        });
    }
    return command;
};

const helpAction = (actionName, json) => {
    let ans = '\n';
    actionName = actionName.toUpperCase();
    ans += getCommand(actionName, json).join(' ') + '\n';
    ans += kleur.yellow('summary:') + ' ' + json[actionName].summary + '\n';
    ans += kleur.yellow('since:') + ' ' + json[actionName].since + '\n';
    ans += kleur.yellow('group:') + ' ' + json[actionName].group + '\n';
    return ans;
};

const readCommandFile = (data) => {

    const actionPath = path.resolve(__dirname, `./help_commands/${data}.json`);

    if (fs.existsSync(actionPath)) 
    { 
        try {
            const file = fs.readFileSync(actionPath, 'utf8');

            return JSON.parse(file);

        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    }
    else
    {
        return new Error('Unsupported action in the current version');
    }
};

const help = (data) => {
    let command_name = data.toLowerCase().trim();
    if(command_name === '')
        return '\nhy-cli\nTo get help about Redis commands type:\n"help <command>" for help on <command>\n"exit" to exit\n';
    
    return helpAction(command_name, readCommandFile(command_name));
};

module.exports = {help, getCommand, readCommandFile};