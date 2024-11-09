export default function jsonToBlueprint(text) {
    const compressed = zlibEncode(text);
    return '0' + compressed;
    function zlibEncode(text) {
        const encoder = new TextEncoder();
        const inputBytes = encoder.encode(text);
        const chunkSize = 8 * 1024; // Размер чанка, например, 8 КБ
        const deflator = new pako.Deflate({ level: 9 });
        for (let i = 0; i < inputBytes.length; i += chunkSize) {
            const chunk = inputBytes.subarray(i, i + chunkSize);
            // Указываем, что это последняя часть, только если это последний чанк
            deflator.push(chunk, i + chunkSize >= inputBytes.length);
        }
        if (deflator.err) {
            throw new Error(deflator.msg);
        }
        // Преобразуем сжатый результат в Base64 безопасным способом
        const compressedArray = deflator.result;
        let binaryString = '';
        for (let i = 0; i < compressedArray.length; i += chunkSize) {
            binaryString += String.fromCharCode.apply(null, compressedArray.subarray(i, i + chunkSize));
        }
        const compressedBase64 = btoa(binaryString);
        return compressedBase64;
    }
}
//# sourceMappingURL=blueprintEncoder.js.map