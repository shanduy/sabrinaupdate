const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 🔗 Tu repositorio de GitHub
const REPO_URL = 'https://github.com/shanduy/Sabrina.git';
const RAMA = 'main';

function ejecutar(comando) {
    try {
        execSync(comando, { stdio: 'inherit' });
    } catch (e) {
        console.error(`❌ Error ejecutando: ${comando}`);
    }
}

function eliminarReadme() {
    const archivos = fs.readdirSync(__dirname);
    archivos.forEach(archivo => {
        if (archivo.toLowerCase().startsWith('readme')) {
            try {
                fs.unlinkSync(path.join(__dirname, archivo));
            } catch (err) {}
        }
    });
}

console.log('====================================================');
console.log('🚀 INICIANDO AUTO-INSTALADOR Y ACTUALIZADOR');
console.log('====================================================');

// 1. Si el servidor está vacío
if (!fs.existsSync('.git') && !fs.existsSync('sabrina.js')) {
    console.log('📦 Servidor vacío. Descargando repositorio desde GitHub...');
    ejecutar('git init');
    ejecutar(`git remote add origin ${REPO_URL}`);
    ejecutar(`git fetch origin ${RAMA}`);
    ejecutar(`git reset --hard origin/${RAMA}`);
    
    eliminarReadme();

    console.log('📦 Instalando dependencias de Node.js (npm install)...');
    ejecutar('npm install');
    console.log('✅ ¡Instalación completada exitosamente!');
} else {
    // 2. Si ya existen los archivos, buscar actualizaciones en GitHub
    console.log('🔍 Verificando actualizaciones en GitHub...');
    try {
        ejecutar(`git fetch origin ${RAMA}`);
        const commitLocal = execSync('git rev-parse HEAD').toString().trim();
        const commitRemoto = execSync(`git rev-parse origin/${RAMA}`).toString().trim();

        if (commitLocal !== commitRemoto) {
            console.log('🔄 ¡Nueva actualización detectada! Sincronizando con GitHub...');
            ejecutar(`git reset --hard origin/${RAMA}`);
            eliminarReadme();
            ejecutar('npm install');
            console.log('✅ ¡SabrinaBot actualizada con éxito!');
        } else {
            console.log('✅ SabrinaBot ya está en la versión más reciente.');
        }
    } catch (e) {
        console.log('⚠️ No se pudo comprobar las actualizaciones, iniciando bot...');
    }
}

console.log('====================================================');
console.log('⚡ ARRANCANDO SABRINABOT (sabrina.js)');
console.log('====================================================');

// 3. Ejecutar sabrina.js heredando la salida del terminal para mostrar el QR
const bot = spawn('node', ['sabrina.js'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

bot.on('close', (code) => {
    console.log(`Proceso del bot finalizado con código: ${code}`);
    process.exit(code);
});