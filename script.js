// --- 1. 定制谜题、答案和密码碎片 ---
const clues = [
    { id: 0, question: "动物园里,我们第一个喂的动物是?", answer: "卡皮巴拉", fragment: "1" },
    { id: 1, question: "在顾村公园，我们在哪里一起放松聊天", answer: "湖边", fragment: "3" },
    { id: 2, question: "在游乐园坐跳楼机时,我说了什么?", answer: "不爱你才不和你一起坐", fragment: "1" },
    { id: 3, question: "我们第一次在大宁公园散步后，分别时月亮是什么样的", answer: "满月", fragment: "4" },
    { id: 4, question: "看日出时，我们共同的感受是（一部电影名称）", answer: "爱在黎明破晓时", fragment: "5" },
    { id: 5, question: "去苏州听黑屋乐队的live house前，我们几点集合", answer: "5点20", fragment: "2" },
    { id: 6, question: "还记得我们第一次看电影后做了什么疯狂的事情嘛", answer: "骑行回家", fragment: "0" },
    { id: 7, question: "骑行的时候，是谁在前领路", answer: "潇潇", fragment: "8" },
    { id: 8, question: "10月7日潇潇会在哪里见到玲玲呢", answer: "苏州", fragment: "8" }
];
const finalPassword = "131452088";

// --- 游戏逻辑 ---
document.addEventListener('DOMContentLoaded', function() {
    const hotspots = document.querySelectorAll('.hotspot');
    const clueModal = document.getElementById('clue-modal');
    const finalModal = document.getElementById('final-modal');
    const treasureScreen = document.getElementById('treasure-screen');
    const finalSpot = document.getElementById('final-spot');
    const clueQuestion = document.getElementById('clue-question');
    const clueAnswer = document.getElementById('clue-answer');
    const feedbackMessage = document.getElementById('feedback-message');
    const submitClueButton = document.getElementById('submit-clue');
    const finalPasswordInput = document.getElementById('final-password');
    const submitFinalButton = document.getElementById('submit-final');
    const finalError = document.getElementById('final-error');
    const finalMessage = document.getElementById('final-message');
    const debugSkipButton = document.getElementById('debug-skip-button');
    const uploadContainer = document.getElementById('upload-container');

    let activeClueId = null;
    const solvedClues = new Set();
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', () => {
            if (hotspot.id === 'final-spot') { finalModal.classList.remove('hidden'); return; }
            const clueId = parseInt(hotspot.dataset.clueId);
            if (solvedClues.has(clueId)) return;
            activeClueId = clueId;
            const clue = clues.find(c => c.id === activeClueId);
            if (clue) {
                clueQuestion.textContent = clue.question;
                clueAnswer.value = "";
                feedbackMessage.textContent = "";
                clueModal.classList.remove('hidden');
            }
        });
    });
    submitClueButton.addEventListener('click', () => {
        const userAnswer = clueAnswer.value.trim().toLowerCase();
        const correctClue = clues.find(c => c.id === activeClueId);
        if (correctClue && userAnswer === correctClue.answer.toLowerCase()) {
            feedbackMessage.textContent = `太棒了！你获得了一个密码碎片：【${correctClue.fragment}】`;
            feedbackMessage.style.color = 'green';
            solvedClues.add(activeClueId);
            document.querySelector(`[data-clue-id='${activeClueId}']`).classList.add('solved');
            setTimeout(() => { clueModal.classList.add('hidden'); checkAllSolved(); }, 2000);
        } else {
            feedbackMessage.textContent = '答案不对哦，再想想我们的回忆~';
            feedbackMessage.style.color = 'red';
        }
    });
    function checkAllSolved() {
        if (solvedClues.size === clues.length) { finalSpot.classList.remove('hidden'); }
    }
    function showFinalAnimation() {
        finalModal.classList.add('hidden');
        document.getElementById('map-container').style.display = 'none';
        debugSkipButton.style.display = 'none';
        treasureScreen.classList.remove('hidden');
        uploadContainer.classList.remove('hidden');
        startLoveAnimation();
        setTimeout(() => { finalMessage.classList.remove('hidden'); finalMessage.classList.add('visible'); }, 4000);
    }
    submitFinalButton.addEventListener('click', () => {
        if (finalPasswordInput.value.trim() === finalPassword) { showFinalAnimation(); } 
        else { finalError.textContent = '密码错误！再检查一下收集到的碎片哦。'; }
    });
    debugSkipButton.addEventListener('click', showFinalAnimation);
    [clueModal, finalModal].forEach(modal => {
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
    });

    // ==========================================================
    //       最终爱心动画特效
    // ==========================================================
    function startLoveAnimation() {
        const canvas = document.getElementById('love-canvas');
        if (!THREE) { console.error("Three.js 库未能成功加载!"); return; }

        // --- 1. 基础设置与状态管理 ---
        const isMobile = window.innerWidth <= 768;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = isMobile ? 65 : 50;
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const clock = new THREE.Clock();
        const mouse = new THREE.Vector2();
        let animationState = 'heart'; // 'heart', 'exploding', 'formingFace'
        let stateTimeout = null;
        let faceCoords = [];

        // --- 2. 辅助函数与贴图预加载 ---
        const createGlowTexture = () => { 
            const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128; const ctx = canvas.getContext('2d'); const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64); gradient.addColorStop(0, `rgba(255, 105, 180, 1)`); gradient.addColorStop(0.2, `rgba(255, 105, 180, 0.8)`); gradient.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(canvas);
        };
        const createHeartTexture = () => {
            const canvas = document.createElement('canvas'); const size = 64; canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d'); const x = size / 2, y = size / 2.2; ctx.beginPath(); ctx.moveTo(x, y + (size * 0.25)); ctx.bezierCurveTo(x, y + (size * 0.2), x - (size * 0.3), y - (size * 0.2), x - (size * 0.3), y - (size * 0.2)); ctx.bezierCurveTo(x - (size * 0.6), y - (size * 0.6), x, y - (size * 0.5), x, y); ctx.bezierCurveTo(x, y - (size * 0.5), x + (size * 0.6), y - (size * 0.6), x + (size * 0.3), y - (size * 0.2)); ctx.bezierCurveTo(x + (size * 0.3), y - (size * 0.2), x, y + (size * 0.2), x, y + (size * 0.25)); ctx.fillStyle = 'rgba(255, 105, 180, 1)'; ctx.shadowColor = 'rgba(255, 255, 255, 1)'; ctx.shadowBlur = 15; ctx.fill(); return new THREE.CanvasTexture(canvas);
        };
        const createTextTexture = (text) => {
            const canvas = document.createElement('canvas'); const size = 128; canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d'); ctx.fillStyle = 'rgba(255, 255, 255, 1)'; ctx.shadowColor = 'rgba(255, 105, 180, 1)'; ctx.shadowBlur = 20; ctx.font = `bold ${size * 0.8}px 'SimHei', 'Microsoft YaHei', 'sans-serif'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size / 2, size / 2); return new THREE.CanvasTexture(canvas);
        };
        const glowTexture = createGlowTexture();
        const heartTexture = createHeartTexture();
        const textAiTexture = createTextTexture('爱');
        const textNiTexture = createTextTexture('你');

        // --- 3. 创建所有粒子系统 ---
        // 主爱心
        const particleCount = isMobile ? 15000 : 25000;
        const positions = new Float32Array(particleCount * 3);
        const homePositions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const faceTargetPositions = new Float32Array(particleCount * 3);
        const yOffset = isMobile ? -5 : -6, scale = isMobile ? 1.3 : 1.6;
        for (let i = 0; i < particleCount; i++) {
            const idx=i*3; const r=Math.random()*0.1+0.95, t=Math.random()*2*Math.PI; const x_o=12.5*Math.pow(Math.sin(t),3); const y_o=11*Math.cos(t)-4.5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t); const z_f=Math.pow(Math.abs(x_o)/12.5,0.5)*6; const z_s=(Math.random()-0.5)*z_f; const v_s=Math.cbrt(Math.random()); const x=r*x_o*v_s, y=r*y_o*v_s, z=r*z_s*v_s;
            homePositions[idx]=x*scale; homePositions[idx+1]=(y+yOffset)*scale; homePositions[idx+2]=z*scale;
            const rad=100, phi=Math.acos(2*Math.random()-1), theta=Math.random()*2*Math.PI;
            positions[idx]=rad*Math.sin(phi)*Math.cos(theta); positions[idx+1]=rad*Math.sin(phi)*Math.sin(theta); positions[idx+2]=rad*Math.cos(phi);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size: isMobile ? 1.0 : 1.2, map: glowTexture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // 背景效果
        const createRain = (config) => {
            const count = isMobile ? config.mobileCount : config.count; const geometry = new THREE.BufferGeometry(); const positions = new Float32Array(count * 3); const velocities = new Float32Array(count); for (let i = 0; i < count; i++) { positions[i * 3] = (Math.random() - 0.5) * 120; positions[i * 3 + 1] = Math.random() * 100 - 50; positions[i * 3 + 2] = (Math.random() - 0.5) * 120; velocities[i] = Math.random() * config.speed + config.baseSpeed; } geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); const material = new THREE.PointsMaterial({ size: isMobile ? config.mobileSize : config.size, map: config.texture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: config.opacity }); return { points: new THREE.Points(geometry, material), velocities: velocities, count: count };
        };
        const heartRain = createRain({count: 500, mobileCount: 250, texture: heartTexture, size: 1.0, mobileSize: 0.8, opacity: 0.7, speed: 0.15, baseSpeed: 0.05});
        const textRainAi = createRain({count: 50, mobileCount: 25, texture: textAiTexture, size: 3.0, mobileSize: 2.5, opacity: 0.9, speed: 0.3, baseSpeed: 0.2});
        const textRainNi = createRain({count: 50, mobileCount: 25, texture: textNiTexture, size: 3.0, mobileSize: 2.5, opacity: 0.9, speed: 0.3, baseSpeed: 0.2});
        scene.add(heartRain.points); scene.add(textRainAi.points); scene.add(textRainNi.points);

        // --- 4. 图像处理 ---
        const imageInput = document.getElementById('face-image-input');
        const uploadLabel = document.getElementById('upload-label');
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { const img = new Image(); img.onload = () => { const MAX_WIDTH = isMobile ? 200 : 300; const aspect = img.height / img.width; const width = MAX_WIDTH; const height = width * aspect; const tempCanvas = document.createElement('canvas'); tempCanvas.width = width; tempCanvas.height = height; const ctx = tempCanvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); const data = ctx.getImageData(0, 0, width, height).data; faceCoords = []; const sampling = isMobile ? 6 : 4; for (let y = 0; y < height; y += sampling) { for (let x = 0; x < width; x += sampling) { const i = (y * width + x) * 4; const brightness = (data[i] + data[i+1] + data[i+2]) / 3; if (brightness > 50) { faceCoords.push({ x: (x - width / 2) * 0.2, y: (-y + height / 2) * 0.2, }); } } } uploadLabel.textContent = '照片已加载，点击触发'; }; img.src = e.target.result; }; reader.readAsDataURL(file);
        });

        // --- 5. 动画循环与事件监听 ---
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // 主爱心动画
            let targetPositions = homePositions;
            let forceFactor = 0.0015;
            if (animationState === 'formingFace') { targetPositions = faceTargetPositions; forceFactor = 0.002; }
            else if (animationState === 'exploding') { targetPositions = null; }
            const beatScale = (animationState === 'heart') ? (1.0 + 0.1 * Math.sin(elapsedTime * 2.5)) : 1.0;
            for (let i = 0; i < particleCount; i++) {
                const idx = i * 3;
                if (targetPositions) {
                    const targetX = targetPositions[idx] * beatScale; const targetY = targetPositions[idx+1] * beatScale; const targetZ = targetPositions[idx+2] * beatScale;
                    const dx = targetX - positions[idx], dy = targetY - positions[idx+1], dz = targetZ - positions[idx+2];
                    velocities[idx] += dx * forceFactor; velocities[idx+1] += dy * forceFactor; velocities[idx+2] += dz * forceFactor;
                }
                positions[idx] += velocities[idx]; positions[idx+1] += velocities[idx+1]; positions[idx+2] += velocities[idx+2];
                velocities[idx] *= (animationState === 'exploding' ? 0.98 : 0.97); velocities[idx+1] *= (animationState === 'exploding' ? 0.98 : 0.97); velocities[idx+2] *= (animationState === 'exploding' ? 0.98 : 0.97);
            }
            geometry.attributes.position.needsUpdate = true;

            // 背景动画
            const updateRain = (rain) => {
                const posAttr = rain.points.geometry.attributes.position; for (let i = 0; i < rain.count; i++) { posAttr.array[i * 3 + 1] -= rain.velocities[i]; if (posAttr.array[i * 3 + 1] < -50) { posAttr.array[i * 3 + 1] = 50; posAttr.array[i * 3] = (Math.random() - 0.5) * 120; } } posAttr.needsUpdate = true;
            };
            updateRain(heartRain); updateRain(textRainAi); updateRain(textRainNi);

            camera.position.x += (mouse.x * 5 - camera.position.x) * 0.05;
            camera.position.y += (-mouse.y * 5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        }
        
        // 事件监听
        window.addEventListener('mousemove', e => { mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; });
        window.addEventListener('touchmove', e => { if(e.touches.length>0){ mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1; } }, { passive: true });
        window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
        
        window.addEventListener('click', () => {
            if (animationState !== 'heart') return;
            if (stateTimeout) clearTimeout(stateTimeout);

            if (faceCoords.length > 0) { // --- 照片模式 ---
                animationState = 'formingFace';
                material.map = glowTexture;
                material.size = isMobile ? 1.0 : 1.2;
                
                let shuffledCoords = [...faceCoords].sort(() => 0.5 - Math.random());
                for (let i = 0; i < particleCount; i++) {
                    const idx = i * 3; const target = shuffledCoords[i % shuffledCoords.length];
                    faceTargetPositions[idx] = target.x; faceTargetPositions[idx+1] = target.y; faceTargetPositions[idx+2] = (Math.random() - 0.5) * 10;
                }
                
                stateTimeout = setTimeout(() => { animationState = 'heart'; }, 8000); // 脸部形态持续8秒后直接恢复
            } else { // --- 爆炸模式 ---
                animationState = 'exploding';
                material.map = heartTexture;
                material.size = isMobile ? 1.8 : 2.2;
                
                const explosionStrength = isMobile ? 2.5 : 2.2;
                for(let i=0; i < particleCount; i++){
                    const idx = i*3;
                    const direction = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5)).normalize().multiplyScalar(explosionStrength * (Math.random()*0.5 + 1.0));
                    velocities[idx] += direction.x; velocities[idx+1] += direction.y; velocities[idx+2] += direction.z;
                }
                
                stateTimeout = setTimeout(() => {
                    animationState = 'heart';
                    material.map = glowTexture; // 恢复为光点
                    material.size = isMobile ? 1.0 : 1.2;
                }, 5000); // 5秒后恢复
            }
        });

        animate();
    }
});

