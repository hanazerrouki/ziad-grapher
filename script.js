document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuBtn.innerHTML = navMenu.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        document.querySelectorAll('#nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Hero slider
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    if (slides.length) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ============================================
    // FILM STRIP GALLERY - Parallax & Lightbox (NO CHANGES)
    // ============================================
    
    const filmStrip1 = document.querySelector('.film-strip-1');
    const filmStrip2 = document.querySelector('.film-strip-2');
    const filmStrip3 = document.querySelector('.film-strip-3');
    const filmFrames = document.querySelectorAll('.film-frame');
    
    function initParallax() {
        if (!filmStrip1 || !filmStrip2 || !filmStrip3) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollY = window.scrollY;
                    const gallerySection = document.querySelector('.film-gallery');
                    
                    if (gallerySection) {
                        const galleryTop = gallerySection.offsetTop;
                        const galleryBottom = galleryTop + gallerySection.offsetHeight;
                        const viewportMiddle = window.scrollY + window.innerHeight / 2;
                        
                        if (viewportMiddle > galleryTop && viewportMiddle < galleryBottom) {
                            const progress = (scrollY - galleryTop) / (gallerySection.offsetHeight);
                            const limitedProgress = Math.min(Math.max(progress, 0), 1);
                            
                            const y1 = limitedProgress * 60;
                            const y2 = limitedProgress * 100;
                            const y3 = limitedProgress * 140;
                            
                            filmStrip1.style.transform = `translateY(${y1}px)`;
                            filmStrip2.style.transform = `translateY(${y2}px)`;
                            filmStrip3.style.transform = `translateY(${y3}px)`;
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    function initLightbox() {
        filmFrames.forEach(frame => {
            frame.addEventListener('click', function(e) {
                if (e.target.closest('.lightbox-overlay')) return;
                
                const img = this.querySelector('.frame-content img');
                if (!img) return;
                
                const imgSrc = img.src;
                const imgAlt = img.alt || 'Gallery image';
                
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox-overlay';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <img src="${imgSrc}" alt="${imgAlt}">
                        <div class="lightbox-close">
                            <i class="fas fa-times"></i>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(lightbox);
                document.body.style.overflow = 'hidden';
                
                const flash = document.createElement('div');
                flash.className = 'flash-effect';
                document.body.appendChild(flash);
                setTimeout(() => {
                    flash.style.opacity = '1';
                    setTimeout(() => {
                        flash.remove();
                    }, 100);
                }, 10);
                
                setTimeout(() => {
                    lightbox.classList.add('active');
                }, 20);
                
                const closeLightbox = () => {
                    lightbox.classList.remove('active');
                    setTimeout(() => {
                        lightbox.remove();
                        document.body.style.overflow = '';
                    }, 300);
                };
                
                lightbox.addEventListener('click', closeLightbox);
                
                const escHandler = (e) => {
                    if (e.key === 'Escape') {
                        closeLightbox();
                        document.removeEventListener('keydown', escHandler);
                    }
                };
                document.addEventListener('keydown', escHandler);
            });
        });
    }
    
    function initLoadingAnimation() {
        filmFrames.forEach((frame, index) => {
            frame.style.opacity = '0';
            frame.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                frame.style.transition = 'all 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
                frame.style.opacity = '1';
                frame.style.transform = 'translateY(0)';
            }, index * 80);
        });
    }
    
    initParallax();
    initLightbox();
    initLoadingAnimation();

    // Back to Top
    const backBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) backBtn.classList.add('active');
        else backBtn.classList.remove('active');
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Scroll reveal animation for camera frames
    const cameraFrames = document.querySelectorAll('.vintage-camera-frame');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                entry.target.style.transition = 'all 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    cameraFrames.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
    
    // Hover animations for camera frames
    const cameraFramesHover = document.querySelectorAll('.vintage-camera-frame');
    cameraFramesHover.forEach(frame => {
        frame.addEventListener('mouseenter', () => {
            frame.style.transform = 'translateY(-5px)';
        });
        frame.addEventListener('mouseleave', () => {
            frame.style.transform = 'translateY(0)';
        });
    });
});