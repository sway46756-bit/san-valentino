/**
 * Background Component
 * Animated hearts background for Valentine's Day
 */

export class Background {
  static DEFAULT_PALETTE = [
    "255, 0, 85",    // Hot Pink
    "255, 77, 136",  // Lighter Pink
    "255, 153, 187", // Soft Pink
    "220, 20, 60",   // Crimson
    "148, 0, 211",   // Dark Violet accent
  ];

  static DEFAULT_SETTINGS = {
    starCount: 80, 
    starSize: { min: 8, max: 20 },
    moveSpeed: 0.5,
    pulsatingStars: {
      enabled: true,
      speed: 2.0,
      intensity: 0.15,
    },
    shootingStars: {
        enabled: false
    },
    mouseInteraction: {
      enabled: true,
      distance: 150,
    },
    animations: {
      pulseEffect: true,
      breathingEffect: true,
      twinkleStars: false,
    },
     colorMode: {
      backgroundIntensity: 0.2,
    }
  };

  static TWO_PI = Math.PI * 2;

  constructor(canvasId, palette, userSettings = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas)
      throw new Error(`Canvas with id '${canvasId}' not found.`);

    this.ctx = this.canvas.getContext("2d");

    this.settings = { ...Background.DEFAULT_SETTINGS, ...userSettings };
    this.rawPalette = palette || Background.DEFAULT_PALETTE;
    
    // Process colors
    this.colors = this.rawPalette.map(color => `rgba(${color}, 1)`);

    this.time = 0;
    this.mouse = { x: 0, y: 0, active: false };
    this.items = [];         // Hearts
    this.stars = [];         // Demo Stars
    this.shootingStars = []; // Demo Shooting Stars

    this.showHearts = false; 
    this.heartOpacity = 0;   
    this.demoOpacity = 1;    // Full visibility for demo effects initially
    
    this._initialize();
  }

  setShowHearts(visible) {
      this.showHearts = visible;
      this.heartOpacity = visible ? 1 : 0;
      this.demoOpacity = visible ? 0 : 1;
  }

  fadeInHearts(duration = 2000) {
      this.showHearts = true;
      
      const startTime = performance.now();
      
      const animateFade = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          this.heartOpacity = progress;
          this.demoOpacity = 1 - progress; // Fade out demo effects
          
          if (progress < 1) {
              requestAnimationFrame(animateFade);
          }
      };
      
      requestAnimationFrame(animateFade);
  }

  _initialize() {
    this.handleResize = this._setupCanvas.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);

    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("mousemove", this._handleMouseMove);
    this.canvas.addEventListener("mouseleave", this._handleMouseLeave);

    this._setupCanvas();

    // Start shooting star interval
    setInterval(() => this._createShootingStar(), 1500);

    this.animate();
  }

  _handleMouseMove(e) {
    this.mouse = { ...this.mouse, x: e.clientX, y: e.clientY, active: true };
  }

  _handleMouseLeave() {
    this.mouse.active = false;
  }

  _setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._generateItems(); // Hearts
    this._generateStars(); // Demo Stars
  }

  _generateStars() {
      this.stars = [];
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

  _drawStars() {
      // Skip if fully transparent
      if (this.demoOpacity <= 0) return;

      this.stars.forEach(star => {
        star.alpha += star.delta;
        if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1;
        
        this.ctx.save();
        this.ctx.globalAlpha = star.alpha * this.demoOpacity; // Apply cross-fade
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
  }

  _generateItems() {
    this.items = Array.from({ length: this.settings.starCount }, () => {
        const size = this.settings.starSize.min + Math.random() * (this.settings.starSize.max - this.settings.starSize.min);
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height, // Start random height
            size: size,
            speed: (Math.random() * 0.5 + 0.5) * this.settings.moveSpeed,
            phase: Math.random() * Background.TWO_PI,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: 0.4 + Math.random() * 0.6,
            wiggle: (Math.random() - 0.5) * 2
        };
    });
  }

  _createShootingStar() {
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

  _drawShootingStars() {
      // Skip if fully transparent
      if (this.demoOpacity <= 0) return;

      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
          const s = this.shootingStars[i];
          const endX = s.x - Math.cos(s.angle) * s.length;
          const endY = s.y - Math.sin(s.angle) * s.length;

          const gradient = this.ctx.createLinearGradient(s.x, s.y, endX, endY);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity * this.demoOpacity})`);
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

  _drawHeart(x, y, size, color, opacity) {
    this.ctx.globalAlpha = opacity * this.heartOpacity;
    this.ctx.fillStyle = color;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    const pulse = 1 + Math.sin(this.time * this.settings.pulsatingStars.speed + x) * this.settings.pulsatingStars.intensity;
    this.ctx.scale(size * pulse * 0.1, size * pulse * 0.1); 

    this.ctx.beginPath();
    this.ctx.moveTo(0, -10);
    this.ctx.bezierCurveTo(-15, -20, -35, -10, -35, 10);
    this.ctx.bezierCurveTo(-35, 30, 0, 50, 0, 55); 
    this.ctx.bezierCurveTo(0, 50, 35, 30, 35, 10);
    this.ctx.bezierCurveTo(35, -10, 15, -20, 0, -10);
    
    this.ctx.fill();
    this.ctx.restore();
    this.ctx.globalAlpha = 1;
  }

  update() {
    this.time += 0.01;
    
    this.items.forEach(item => {
        // float upwards
        item.y -= item.speed;
        item.x += Math.sin(this.time + item.phase) * 0.3; // Gentle sway

        // Reset if off screen (top) 
        // We actually want them to go UP, so y decreases.
        if (item.y < -50) {
            item.y = this.canvas.height + 50;
            item.x = Math.random() * this.canvas.width;
        }
    });

    // Mouse drift
    if (this.mouse.active) {
        // Optional: attract or repel logic could go here
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Gradient Background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0a0a23'); // Demo Blue/Dark
    gradient.addColorStop(1, '#2c014e'); // Demo Purple
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Demo Stars (if visible)
    this._drawStars();
    // Draw Shooting Stars (if visible)
    this._drawShootingStars();

    // Draw Hearts (if visible)
    if (this.showHearts && this.heartOpacity > 0) {
        this.items.forEach(item => {
            this._drawHeart(item.x, item.y, item.size, item.color, item.opacity);
        });
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}
