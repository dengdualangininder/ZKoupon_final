require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY || '';

function checkPrivateKey(key) {
    console.log('=== 私鑰格式檢查 ===');
    console.log('Private Key 長度:', key.length, '(應為 64)');
    console.log('前兩個字符:', key.slice(0, 2));
    console.log('是否包含 0x 前綴:', key.startsWith('0x'));
    console.log('是否只包含有效的十六進制字符:', /^[0-9a-fA-F]+$/.test(key));
    console.log('是否包含空格:', key.includes(' '));
    console.log('是否包含換行符:', key.includes('\n'));
    
    // 檢查環境變量是否正確讀取
    console.log('\n=== 環境變量檢查 ===');
    console.log('是否有讀取到 PRIVATE_KEY:', !!process.env.PRIVATE_KEY);
    console.log('.env 文件中的變量數量:', Object.keys(process.env).filter(key => ['PRIVATE_KEY', 'SEPOLIA_RPC_URL', 'ETHERSCAN_API_KEY'].includes(key)).length);
    
    // 顯示字符類型分布（不顯示實際私鑰）
    console.log('\n=== 字符分析 ===');
    const charTypes = key.split('').reduce((acc, char) => {
        if (/[0-9]/.test(char)) acc.numbers++;
        else if (/[a-f]/.test(char)) acc.lowerHex++;
        else if (/[A-F]/.test(char)) acc.upperHex++;
        else acc.other++;
        return acc;
    }, { numbers: 0, lowerHex: 0, upperHex: 0, other: 0 });
    
    console.log('數字個數:', charTypes.numbers);
    console.log('小寫十六進制字母個數:', charTypes.lowerHex);
    console.log('大寫十六進制字母個數:', charTypes.upperHex);
    console.log('其他字符個數:', charTypes.other);
}

checkPrivateKey(privateKey); 