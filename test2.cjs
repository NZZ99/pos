const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPinLock.tsx', 'utf-8');
content = content.replace(/const \[pin, setPin\] = useState\(''\);/, '// removed pin');
content = content.replace(/const \[error, setError\] = useState\(false\);/, '// removed error');
fs.writeFileSync('src/components/SettingsPinLock.tsx', content);
