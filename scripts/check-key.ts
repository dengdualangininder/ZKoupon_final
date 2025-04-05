import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY || '';

function checkPrivateKey(key: string) {
    console.log('Private Key 長度:', key.length);
    console.log('是否包含 0x 前綴:', key.startsWith('0x'));
    console.log('是否只包含有效的十六進制字符:', /^[0-9a-fA-F]+$/.test(key));
    console.log('是否包含空格:', key.includes(' '));
    console.log('是否包含換行符:', key.includes('\n'));
}

checkPrivateKey(privateKey); 