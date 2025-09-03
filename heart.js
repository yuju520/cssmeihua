/* 红色爱心鼠标跟随效果 */
(function heartCursor() {
    // 创建必要的CSS样式
    function createStyles() {
        var style = document.createElement('style');
        style.textContent = `
            .js-cursor-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            }
        `;
        document.head.appendChild(style);
    }

    // 创建容器元素
    function createContainer() {
        var container = document.createElement('div');
        container.className = 'js-cursor-container';
        document.body.appendChild(container);
        return container;
    }

    // 不同深浅的红色
    var possibleColors = ["#FF1744", "#E91E63", "#C2185B", "#AD1457", "#880E4F"];
    var width = window.innerWidth;
    var height = window.innerHeight;
    var cursor = { x: width / 2, y: width / 2 };
    var particles = [];
    var container;

    function init() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setupCursor();
            });
        } else {
            setupCursor();
        }
    }

    function setupCursor() {
        createStyles();
        container = createContainer();
        bindEvents();
        loop();
    }

    // 绑定事件
    function bindEvents() {
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onWindowResize);
    }

    function onWindowResize(e) {
        width = window.innerWidth;
        height = window.innerHeight;
    }

    function onMouseMove(e) {
        cursor.x = e.clientX;
        cursor.y = e.clientY;

        // 添加爱心粒子
        addParticle(cursor.x, cursor.y, possibleColors[Math.floor(Math.random() * possibleColors.length)]);
    }

    function addParticle(x, y, color) {
        var particle = new Particle();
        particle.init(x, y, color);
        particles.push(particle);
    }

    function updateParticles() {
        // 更新所有粒子
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        // 移除生命周期结束的粒子
        for (var i = particles.length - 1; i >= 0; i--) {
            if (particles[i].lifeSpan < 0) {
                particles[i].die();
                particles.splice(i, 1);
            }
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        updateParticles();
    }

    /**
     * 爱心粒子类
     */
    function Particle() {
        this.character = "♥"; // 使用爱心符号
        this.lifeSpan = 150; // 生命周期
        this.initialStyles = {
            "position": "fixed",
            "display": "inline-block",
            "top": "0px",
            "left": "0px",
            "pointerEvents": "none",
            "touch-action": "none",
            "z-index": "10000000",
            "fontSize": "20px",
            "will-change": "transform",
            "textShadow": "0 0 6px rgba(255, 23, 68, 0.8)",
            "userSelect": "none"
        };

        // 初始化粒子
        this.init = function (x, y, color) {
            // 设置随机速度
            this.velocity = {
                x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
                y: 1 + Math.random() * 0.5 // 稍微向下飘落
            };

            this.position = { x: x - 10, y: y - 10 };
            this.initialStyles.color = color;

            this.element = document.createElement('span');
            this.element.innerHTML = this.character;
            applyProperties(this.element, this.initialStyles);
            this.update();

            container.appendChild(this.element);
        };

        this.update = function () {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.lifeSpan--;

            // 添加轻微的摆动效果
            var wobble = Math.sin((150 - this.lifeSpan) * 0.1) * 2;
            
            // 计算缩放和透明度
            var scale = Math.max(0, this.lifeSpan / 150);
            var opacity = Math.max(0, this.lifeSpan / 150);

            this.element.style.transform = "translate3d(" + 
                (this.position.x + wobble) + "px," + 
                this.position.y + "px, 0) scale(" + scale + ")";
            this.element.style.opacity = opacity;
        };

        this.die = function () {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        };
    }

    /**
     * 工具函数
     */
    function applyProperties(target, properties) {
        for (var key in properties) {
            target.style[key] = properties[key];
        }
    }

    // 只在非触屏设备上启用
    if (!('ontouchstart' in window || navigator.msMaxTouchPoints)) {
        init();
    }
})();
