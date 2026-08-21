const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPinLock.tsx', 'utf-8');
content = content.replace(/const \[pin, setPin\] = useState\(''\);/, '// useState removed');
content = content.replace(/const \[error, setError\] = useState\(false\);/, '// error removed');
fs.writeFileSync('src/components/SettingsPinLock_test.tsx', content);
