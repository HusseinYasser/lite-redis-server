
const desarilize = require('./deserializer.js');

describe('Testing RESP Desrialization', () => {
    describe('Deserializing Integers', () => {
        test('should correctly deserialize positive integers', () => {
            const result = desarilize(':55\r\n');
            expect(result).toBe(55);
        });

        test('should correctly deserialize negative integers', () => {
            const result = desarilize(':-4\r\n');
            expect(result).toBe(-4);
        });

        test('should correctly deseralize simple strings', () => {
            const result = desarilize('+OK\r\n');
            expect(result).toBe('OK');
        });

        test('should correctly deseralize simple strings of digits', () => {
            const result = desarilize('+34510\r\n');
            expect(result).toBe('34510');
        });

        test('should correctly deseralize Errors', () => {
            const result = desarilize('-ErrorMessage\r\n');
            expect(result).toStrictEqual(new Error('ErrorMessage'));
        });

        test('should correctly deseralize NULLS', () => {
            const result = desarilize('$-1\r\n');
            expect(result).toBe(null);
        });

        test('should correctly deseralize complex strings', () => {
            const result = desarilize('$4\r\nHuss\r\n');
            expect(result).toBe('Huss');
        });

        test('should correctly deseralize lists of different data types', () => {
            const result = desarilize('*5\r\n:1\r\n:2\r\n$4\r\nHuss\r\n:3\r\n+OK\r\n');
            expect(result).toStrictEqual([1, 2, 'Huss', 3, 'OK']);
        });

        test('should correctly deseralize nested lists with nulls inside', () => {
            const result = desarilize('*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*3\r\n+Hello\r\n-World\r\n$-1\r\n');
            expect(result).toStrictEqual([[1, 2, 3],
            ['Hello', new Error('World'), null]]);
        });
    });
});