
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

const helpAction = (actionName, json) => {
    let ans = '';
    actionName = actionName.toUpperCase();
    ans += actionName.toUpperCase() + ' ';
    //arguments
    if(json[actionName].arguments){
        json[actionName].arguments.forEach(element => {
            ans += helpArgument(element);
        });
    }
    ans += '\n';
    ans += kleur.yellow('summary:') + ' ' + json[actionName].summary + '\n';
    ans += kleur.yellow('since:') + ' ' + json[actionName].since + '\n';
    ans += kleur.yellow('group:') + ' ' + json[actionName].group + '\n';
    return ans;
};

const help = (data) => {
    let command_name = data.toLowerCase().trim();
    if(command_name === '')
        return 'hy-cli\nTo get help about Redis commands type:\n"help <command>" for help on <command>\n"exit" to exit';
    
    const actionPath = path.resolve(__dirname, `./help_commands/${data}.json`);

    if (fs.existsSync(actionPath)) 
    { 
        try {
            const file = fs.readFileSync(actionPath, 'utf8');
            
            const jsonData = JSON.parse(file);
            return helpAction(command_name, jsonData);
                
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    }
    else
    {
        return new Error('Unsupported action in the current version');
    }
};

module.exports = help;
