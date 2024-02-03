
const parseSimpleString = (data) => {
    return content.trim();
};

const parseError = (data) => {
    return new Error(data.trim());
};

const parseIntegers = (data) => {
    return parseInt(data.trim(), 10);
};

const parseBulkString = (data) => {
    arr = data.split('\r\n');
    if(arr[0] === '-1')
        return null;
    return arr[1].trim();
};

const parseArray = (arr, start, length) => {
    
    //NOW I have the number
    // 2\r\n$4\r\necho\r\n$11\r\nhello world\r\n
    let res = [];
    for (let i = start; i < arr.length; ++i)
    {
        if(length == 0)
        {
            return {array: res, end: i};
        }
        if(arr[i][0] == '$')
        {
            //collect the BULK string
            res.push(desarilize(arr[i] + '\r\n' + arr[i+1] + '\r\n'));
            i++;
        }
        else if(arr[i][0] == '*')
        {
            let subarray_length = parseInt(arr[i].slice(1).trim(), 10);
            let {array, end} = parseArray(arr, i+1, subarray_length);
            res.push(array);
            i = end-1;
            
        }
        else{
            res.push(desarilize(arr[i]+'\r\n'));
        }
        length--;
    }
    if(length == 0)
    {
        return {array: res, end: arr.length};
    }
    return new Error('Wrong Input Format');
};

const desarilize = (data) => {
    content = data.slice(1);
    switch(data[0])
    {
        case '+': return parseSimpleString(content);
        case '-': return parseError(content);
        case ':': return parseIntegers(content);
        case '$': return parseBulkString(content);
        case '*':
            let arr = data.split('\r\n');
            let length = parseInt(arr[0].slice(1).trim(), 10); 
            return parseArray(arr, 1, length).array;
        default : return new Error('Unsupported Type');
    }

};

message = '*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n'

//message = '*2\r\n$4\r\necho\r\n$11\r\nhello world\r\n'
//console.log(desarilize(message))

module.exports = desarilize;
