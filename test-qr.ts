import * as fs from 'fs';
import { readBuQrCode } from './src/qrReader';

async function test() {
    const buffer = fs.readFileSync('mock-bu-qrcode.png');
    console.log("Read buffer size:", buffer.length);
    const result = await readBuQrCode(buffer);
    console.log("Result:", result);
}

test().catch(console.error);
