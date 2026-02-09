export class TeAmoAnimation {
    constructor(canvasId, leftBearId, rightBearId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.leftBear = document.getElementById(leftBearId);
        this.rightBear = document.getElementById(rightBearId);
        
        this.fullText = ["Ti Amo"]; // lowercase 'amo' like demo
        this.fontSize = 100;
        this.lineHeight = 120;
        this.heartScale = 15; // Match demo
        
        this.stars = [];
        this.shootingStars = [];
        this.dots = [];
        this.targetDotsQueue = [];
        this.currentCharIndex = 0;
        this.animationDone = false;
        this.shooterToggle = true; 
        
        this.animationFrameId = null;
        this.shootIntervalId = null;
        this.starIntervalId = null;
        
        this.bearGif = "./src/assets/images/bear-shooting.gif";
        this.celebrationGif = "./src/assets/images/bear-celebration.gif";
        
        // Bind methods
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        this.shootDot = this.shootDot.bind(this);
        this.createShootingStar = this.createShootingStar.bind(this);
    }

    init() {
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    start(onComplete) {
        this.onComplete = onComplete;
        this.canvas.style.display = 'block';
        this.resize();
        this.resetAnimation();
        
        // Start Loops
        this.animate();
        this.shootIntervalId = setInterval(this.shootDot, 20);
        this.starIntervalId = setInterval(this.createShootingStar, 1500);
        
        // Initialize bears
        if(this.leftBear) this.leftBear.src = this.bearGif;
        if(this.rightBear) this.rightBear.src = this.bearGif;
    }

    stop() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.shootIntervalId) clearInterval(this.shootIntervalId);
        if (this.starIntervalId) clearInterval(this.starIntervalId);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.display = 'none';
    }

    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const scaleFactor = Math.min(1, this.canvas.width / 700);
        this.fontSize = 90 * scaleFactor;
        this.lineHeight = 110 * scaleFactor;
        this.heartScale = 14 * scaleFactor;

        // Positioning bears is handled by CSS now, we just need their coordinates
        this.stars.length = 0;
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                delta: (Math.random() * 0.02) + 0.005
            });
        }
    }

    resetAnimation() {
        this.dots = [];
        this.targetDotsQueue = [];
        this.currentCharIndex = 0;
        this.animationDone = false;
        this.generateAllTargetDots();
        
        if(this.leftBear) this.leftBear.src = this.bearGif;
        if(this.rightBear) this.rightBear.src = this.bearGif;
    }

    getBearPosition(bear) {
        if (!bear) return { x: 0, y: 0 };
        const rect = bear.getBoundingClientRect();
        
        let x = rect.left + rect.width / 2;
        // Adjust for "shooting" hand/gun position
        // Assuming they face inwards
        if (bear.id === 'kitten-left') {
             x = rect.right - (rect.width * 0.2); // Towards right edge
        } else if (bear.id === 'kitten-right') {
             x = rect.left + (rect.width * 0.2); // Towards left edge
        }

        return {
            x: x,
            y: rect.top + rect.height / 2 
        };
    }

    generateHeartDots() {
        const heartDots = [];
        const scale = this.heartScale; 
        const pointsCount = 150;
        const offsetX = this.canvas.width / 2;
        const offsetY = this.canvas.height / 2 + (this.fontSize * 1.5); // Match demo offset

        for (let i = 0; i < pointsCount; i++) {
            const t = (i / pointsCount) * 2 * Math.PI;
            const x = scale * 16 * Math.pow(Math.sin(t), 3);
            const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            heartDots.push({ x: offsetX + x, y: offsetY + y });
        }
        return heartDots;
    }

    generateAllTargetDots() {
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.font = `bold ${this.fontSize}px Arial`; // Match demo font
        
        // Match demo startY calculation
        const startY = (this.canvas.height - this.fullText.length * this.lineHeight) / 2 + this.fontSize / 2 - (this.fontSize * 1.1);

        this.fullText.forEach((line, lineIndex) => {
            const lineWidth = tempCtx.measureText(line).width;
            let xCursor = (this.canvas.width - lineWidth) / 2;
            const y = startY + lineIndex * this.lineHeight;

            for (let char of line) {
                if (char === " ") {
                    xCursor += tempCtx.measureText(" ").width;
                    this.targetDotsQueue.push([]);
                    continue;
                }
                const charDots = this.generateCharDots(char, xCursor, y);
                this.targetDotsQueue.push(charDots);
                xCursor += tempCtx.measureText(char).width;
            }
        });

        const heartShapeDots = this.generateHeartDots();
        this.targetDotsQueue.push(heartShapeDots);
    }

    generateCharDots(char, x, y) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `bold ${this.fontSize}px Arial`; // Match demo font
        tempCtx.fillText(char, x, y);

        const imageData = tempCtx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        const charDots = [];
        const density = 5; // Match demo density exactly

        for (let yPos = 0; yPos < this.canvas.height; yPos += density) {
            for (let xPos = 0; xPos < this.canvas.width; xPos += density) {
                const index = (yPos * this.canvas.width + xPos) * 4;
                if (imageData[index + 3] > 128) {
                    charDots.push({ x: xPos, y: yPos });
                }
            }
        }
        return charDots;
    }

    shootDot() {
        if (this.animationDone) return;

        while (this.currentCharIndex < this.targetDotsQueue.length && this.targetDotsQueue[this.currentCharIndex].length === 0) {
            this.currentCharIndex++;
        }

        const currentTargets = this.targetDotsQueue[this.currentCharIndex];
        if (!currentTargets) return;

        const batchSize = (this.currentCharIndex === this.targetDotsQueue.length - 1) ? 3 : 1; // Match demo batch logic

        for (let i = 0; i < batchSize; i++) {
            if (currentTargets.length === 0) break;
            
            const target = currentTargets.shift();
            if (!target) continue;

            const shooterPos = this.shooterToggle ? this.getBearPosition(this.leftBear) : this.getBearPosition(this.rightBear);
            this.shooterToggle = !this.shooterToggle;

            this.dots.push({
                x: shooterPos.x,
                y: shooterPos.y - 20, // Match demo y offset
                vx: 0,
                vy: 0,
                targetX: target.x,
                targetY: target.y,
            });
        }

        if (currentTargets.length === 0) {
            this.currentCharIndex++;
            if (this.currentCharIndex >= this.targetDotsQueue.length) {
                if (!this.animationDone) {
                    this.animationDone = true;
                    if(this.leftBear) this.leftBear.src = this.celebrationGif;
                    if(this.rightBear) this.rightBear.src = this.celebrationGif;
                    
                    if (this.onComplete) this.onComplete();
                }
            }
        }
    }

    drawBackground() {
        // Match demo background explicitly
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, "#0a0a23");
        gradient.addColorStop(1, "#2c014e");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStars() {
        this.stars.forEach(star => {
            star.alpha += star.delta;
            if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1;
            this.ctx.save();
            this.ctx.globalAlpha = star.alpha;
            this.ctx.fillStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    createShootingStar() {
        const startX = Math.random() * this.canvas.width;
        const startY = Math.random() * this.canvas.height / 2;
        this.shootingStars.push({
            x: startX,
            y: startY,
            length: Math.random() * 300 + 100,
            speed: Math.random() * 10 + 6,
            angle: Math.PI / 4,
            opacity: 1
        });
    }

    drawShootingStars() {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            const endX = s.x - Math.cos(s.angle) * s.length;
            const endY = s.y - Math.sin(s.angle) * s.length;

            const gradient = this.ctx.createLinearGradient(s.x, s.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();

            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.opacity -= 0.01;

            if (s.opacity <= 0) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.drawBackground();
        this.drawStars();
        this.drawShootingStars();

        this.dots.forEach(dot => {
            const dx = dot.targetX - dot.x;
            const dy = dot.targetY - dot.y;
            // Match demo physics exactly
            dot.vx += dx * 0.0025; 
            dot.vy += dy * 0.0025;
            dot.vx *= 0.96;
            dot.vy *= 0.96;
            dot.x += dot.vx;
            dot.y += dot.vy;
            
            this.ctx.fillStyle = "rgba(255, 105, 180, 0.9)"; // Match demo color
            const size = 14 * Math.min(1, this.canvas.width / 400); // 13 vs 14? Demo says 14 in animate()
            this.ctx.font = `${size}px Arial`;
            this.ctx.textAlign = "center";
            this.ctx.fillText("❤️", dot.x, dot.y);
        });
    }
}
