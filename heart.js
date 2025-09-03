/**
 * 红色爱心鼠标跟随特效
 * 使用方法：在HTML中引入此JS文件即可
 * <script src="heart-cursor-effect.js"></script>
 */

(function() {
    'use strict';
    
    // 检查是否已经初始化，避免重复加载
    if (window.heartCursorInitialized) {
        return;
    }
    window.heartCursorInitialized = true;

    /**
     * 红色爱心鼠标跟随特效类
     */
    function HeartCursorEffect(options) {
        // 默认配置
        this.config = {
            colors: ["#FF1744", "#E91E63", "#C2185B", "#AD1457", "#880E4F"],
            density: 0.5,        // 爱心生成密度 (0-1)
            frequency: 50,       // 生成频率 (ms)
            lifeSpan: 150,      // 爱心生命周期
            character: "♥",      // 爱心字符
            fontSize: "20px",    // 字体大小
            enableOnTouch: false // 是否在触屏设备上启用
        };
        
        // 合并用户配置
        if (options) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    this.config[key] = options[key];
                }
            }
        }
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.cursor = { x: this.width / 2, y: this.height / 2 };
        this.particles = [];
        this.lastTime = 0;
        this.container = null;
        
        this.init();
    }

    HeartCursorEffect.prototype = {
        init: function() {
            // 检查是否在触屏设备上
            if (!this.config.enableOnTouch && 
                ('ontouchstart' in window || navigator.msMaxTouchPoints)) {
                return;
            }
            
            this.createContainer();
            this.bindEvents();
            this.loop();
        },

        createContainer: function() {
            // 创建容器元素
            this.container = document.createElement('div');
            this.container.className = 'heart-cursor-container';
            this.container.style.cssText = [
                'position: fixed',
                'top: 0',
                'left: 0',
                'width: 100%',
                'height: 100%',
                'pointer-events: none',
                'z-index: 9999',
                'overflow: hidden'
            ].join(';');
            
            // 等待DOM加载完成后添加容器
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(this.container);
                });
            } else {
                document.body.appendChild(this.container);
            }
        },

        bindEvents: function() {
            var self = this;
            
            document.addEventListener('mousemove', function(e) {
                self.onMouseMove(e);
            });
            
            window.addEventListener('resize', function(e) {
                self.onWindowResize(e);
            });
        },

        onWindowResize: function(e) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        },

        onMouseMove: function(e) {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
            
            var currentTime = new Date().getTime();
            
            // 频率控制
            if (currentTime - this.lastTime < this.config.frequency) {
                return;
            }
            
            // 密度控制
            if (Math.random() > this.config.density) {
                return;
            }
            
            // 随机选择颜色
            var color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
            
            this.addParticle(this.cursor.x, this.cursor.y, color);
            this.lastTime = currentTime;
        },

        addParticle: function(x, y, color) {
            var particle = new this.Particle(x, y, color, this.config, this.container);
            this.particles.push(particle);
        },

        updateParticles: function() {
            // 更新所有粒子
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
            }

            // 移除生命周期结束的粒子
            for (var i = this.particles.length - 1; i >= 0; i--) {
                if (this.particles[i].lifeSpan <= 0) {
                    this.particles[i].die();
                    this.particles.splice(i, 1);
                }
            }
        },

        loop: function() {
            var self = this;
            requestAnimationFrame(function() {
                self.loop();
            });
            this.updateParticles();
        },

        // 销毁方法
        destroy: function() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            this.particles = [];
            window.heartCursorInitialized = false;
        }
    };

    /**
     * 爱心粒子类
     */
    HeartCursorEffect.prototype.Particle = function(x, y, color, config, container) {
        this.lifeSpan = config.lifeSpan;
        this.initialLifeSpan = config.lifeSpan;
        this.container = container;
        
        // 随机速度
        this.velocity = {
            x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
            y: 1 + Math.random() * 0.5
        };
        
        this.position = { 
            x: x - 10, 
            y: y - 10 
        };
        
        // 创建DOM元素
        this.element = document.createElement('span');
        this.element.innerHTML = config.character;
        
        // 设置样式
        this.element.style.cssText = [
            'position: fixed',
            'display: inline-block',
            'top: 0px',
            'left: 0px',
            'pointer-events: none',
            'touch-action: none',
            'z-index: 10000000',
            'fontSize: ' + config.fontSize,
            'will-change: transform',
            'text-shadow: 0 0 6px rgba(255, 23, 68, 0.8)',
            'user-select: none',
            'color: ' + color
        ].join(';');
        
        this.update();
        
        if (this.container) {
            this.container.appendChild(this.element);
        }
    };

    HeartCursorEffect.prototype.Particle.prototype = {
        update: function() {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.lifeSpan--;

            // 添加轻微的摆动效果
            var wobble = Math.sin((this.initialLifeSpan - this.lifeSpan) * 0.1) * 2;
            
            // 计算缩放和透明度
            var progress = this.lifeSpan / this.initialLifeSpan;
            var scale = Math.max(0, progress);
            var opacity = Math.max(0, progress);

            this.element.style.transform = "translate3d(" + 
                (this.position.x + wobble) + "px," + 
                this.position.y + "px, 0) scale(" + scale + ")";
            this.element.style.opacity = opacity;
        },

        die: function() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    };

    // 自动初始化（可选配置）
    function autoInit() {
        // 可以通过全局变量配置
        var config = window.heartCursorConfig || {};
        window.heartCursor = new HeartCursorEffect(config);
    }

    // DOM加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // 导出到全局
    window.HeartCursorEffect = HeartCursorEffect;

})();
