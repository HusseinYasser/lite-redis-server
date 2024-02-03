
function isArray(myArray) {
    return Array.isArray(myArray);
}

const serializeInt = (data) => {
    return `:${data}\r\n`;
};

const serializeBulkString = (data) => {
    return `$${data.length}\r\n${data}\r\n`;
};

const serializeArray = (data) => {
    return data.reduce((cum, x) => {
        return cum + serialize(x);
    }, `*${data.length}\r\n`);
};

const serializeError = (data) => {
    return `-${data.message}\r\n`;
};

const serialize = (data) => {
    const type = typeof(data);
    if(data === null)
    {
        return '$-1\r\n';
    } 
    if(data instanceof Error)
    {
        return serializeError(data);
    }
    if(isArray(data) == true)
    {
        return serializeArray(data);
    }
    
    switch(type)
    {
        case 'number': return serializeInt(data);
        case 'string': return serializeBulkString(data);
        default: return new Error('Unsupported datatype');
    }
};

module.exports = serialize;