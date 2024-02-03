

const serialize = require('./serializer.js');

describe('Testing RESP Serialization', () => {
    describe('Deserializing Integers', () => {
        test('should correctly serialize positive integers', () => {
            const result = serialize(55);
            expect(result).toBe(':55\r\n');
        });

        test('should correctly serialize negative integers', () => {
            const result = serialize(-4);
            expect(result).toBe(':-4\r\n');
        });

        test('should correctly serialize Errors', () => {
            const result = serialize(new Error('ErrorMessage'));
            expect(result).toStrictEqual('-ErrorMessage\r\n');
        });

        test('should correctly serialize NULLS', () => {
            const result = serialize(null);
            expect(result).toBe('$-1\r\n');
        });

        test('should correctly serialize complex strings', () => {
            const result = serialize('Huss');
            expect(result).toBe('$4\r\nHuss\r\n');
        });

        test('should correctly serialize lists of different data types', () => {
            const result = serialize([1, 2, 'Huss', 3, 'OK']);
            expect(result).toStrictEqual('*5\r\n:1\r\n:2\r\n$4\r\nHuss\r\n:3\r\n$2\r\nOK\r\n');
        });

        test('should correctly serialize nested lists with nulls inside', () => {
            const result = serialize([[1, 2, 3], ['Hello', new Error('World'), null]]);
            expect(result).toStrictEqual('*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*3\r\n$5\r\nHello\r\n-World\r\n$-1\r\n');
        });
    });
});