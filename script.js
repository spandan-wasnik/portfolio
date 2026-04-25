/* ============================================
   PORTFOLIO — Main Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundCanvas();
    initCursorGlow();
    initScrollReveal();
    initSmoothNavigation();
    initMobileNav();
    initCounterAnimation();
    initSkillBars();
    initActiveNavHighlight();
    initParallaxOrbs();
});

/* ============================================
   BACKGROUND CANVAS — Mesh / Particle Network
   ============================================ */
function initBackgroundCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles, animFrame;
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 160;
    const MOUSE = { x: -9999, y: -9999 };
    const MOUSE_RADIUS = 200;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
                    ctx.strokeStyle = `rgba(0, 242, 234, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw and update particles
        particles.forEach(p => {
            // Mouse interaction
            const mdx = p.x - MOUSE.x;
            const mdy = p.y - MOUSE.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - mdist) / MOUSE_RADIUS;
                p.vx += (mdx / mdist) * force * 0.02;
                p.vy += (mdy / mdist) * force * 0.02;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Damping
            p.vx *= 0.999;
            p.vy *= 0.999;

            // Wrap edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 234, ${p.opacity})`;
            ctx.fill();
        });

        animFrame = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    window.addEventListener('mousemove', e => {
        MOUSE.x = e.clientX;
        MOUSE.y = e.clientY;
    });
}

/* ============================================
   CURSOR GLOW — Follows mouse
   ============================================ */
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    let mx = 0, my = 0, gx = 0, gy = 0;

    window.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    function animate() {
        gx += (mx - gx) * 0.08;
        gy += (my - gy) * 0.08;
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================================
   SCROLL REVEAL — IntersectionObserver
   ============================================ */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-up');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(el => observer.observe(el));
}

/* ============================================
   SMOOTH NAVIGATION — Scroll to sections
   ============================================ */
function initSmoothNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebarEl = document.getElementById('sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const toggle = document.getElementById('mobileNavToggle');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Close mobile nav
            if (window.innerWidth <= 768) {
                sidebarEl?.classList.remove('open');
                overlay?.classList.remove('active');
                toggle?.classList.remove('active');
            }
        });
    });

    // CTA buttons smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        if (a.classList.contains('nav-link')) return;
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ============================================
   MOBILE NAVIGATION
   ============================================ */
function initMobileNav() {
    const toggle = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-overlay');
    document.body.appendChild(overlay);

    function openNav() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        toggle.classList.add('active');
    }

    function closeNav() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
    }

    toggle.addEventListener('click', () => {
        sidebar.classList.contains('open') ? closeNav() : openNav();
    });

    overlay.addEventListener('click', closeNav);
}

/* ============================================
   ACTIVE NAV HIGHLIGHT — On scroll
   ============================================ */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.dataset.section === id);
                    });
                }
            });
        },
        { threshold: 0.1, rootMargin: '-5% 0px -50% 0px' }
    );

    sections.forEach(section => observer.observe(section));
}

/* ============================================
   COUNTER ANIMATION — About stats
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isFloat = target % 1 !== 0;
    const duration = 1800;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        const current = eased * target;

        if (isFloat) {
            el.textContent = current.toFixed(2);
        } else {
            el.textContent = Math.round(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = isFloat ? target.toFixed(2) : target;
        }
    }

    requestAnimationFrame(update);
}

/* ============================================
   SKILL BARS — Animate width on scroll
   ============================================ */
function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const w = bar.dataset.width || 50;
                    bar.style.setProperty('--bar-width', w + '%');
                    // Small delay for visual effect
                    setTimeout(() => bar.classList.add('animated'), 200);
                    observer.unobserve(bar);
                }
            });
        },
        { threshold: 0.3 }
    );

    bars.forEach(b => observer.observe(b));
}

/* ============================================
   PARALLAX ORB RINGS — Subtle mouse parallax
   ============================================ */
function initParallaxOrbs() {
    const rings = document.querySelectorAll('.orb-ring');
    if (!rings.length) return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    heroSection.addEventListener('mousemove', e => {
        const rect = heroSection.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;

        rings.forEach((ring, i) => {
            const factor = (i + 1) * 8;
            ring.style.transform = `translate(${cx * factor}px, ${cy * factor}px) rotate(${cx * factor * 3}deg)`;
        });
    });
}

/* ============================================
   TYPING EFFECT — Hero greeting (optional)
   ============================================ */
(function initTypingEffect() {
    const greeting = document.querySelector('.hero-greeting');
    if (!greeting) return;

    const originalText = greeting.textContent;
    greeting.textContent = '';
    greeting.style.opacity = '1';
    greeting.style.transform = 'none';
    greeting.style.animation = 'none';

    let i = 0;
    function type() {
        if (i < originalText.length) {
            greeting.textContent += originalText[i];
            i++;
            setTimeout(type, 50);
        }
    }

    // Start after a short delay
    setTimeout(type, 600);
})();
