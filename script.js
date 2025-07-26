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

    // Gallery data
    const galleryData = [
        { category: 'wedding', img: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'ليلة العمر' },
        { category: 'wedding', img: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'أجمل لحظات' },
        { category: 'engagement', img: 'https://images.pexels.com/photos/2372720/pexels-photo-2372720.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'حفل خطوبة' },
        { category: 'portrait', img: 'https://images.pexels.com/photos/3812431/pexels-photo-3812431.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'جلسة شخصية' },
        { category: 'graduation', img: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'فرحة التخرج' },
        { category: 'event', img: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'حفل مميز' },
        { category: 'wedding', img: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'تفاصيل العرس' },
        { category: 'portrait', img: 'https://images.pexels.com/photos/3771831/pexels-photo-3771831.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'جلسة عائلية' }
    ];

    const galleryGrid = document.getElementById('gallery-grid');
    let currentDisplayCount = 6;
    let currentFilter = 'all';
    
    function renderGallery(filter = 'all', limit = currentDisplayCount) {
        let filtered = filter === 'all' ? galleryData : galleryData.filter(item => item.category === filter);
        const itemsToShow = filtered.slice(0, limit);
        galleryGrid.innerHTML = itemsToShow.map(item => `
            <div class="gallery-item" data-category="${item.category}">
                <img src="${item.img}" alt="${item.title}">
                <div class="gallery-overlay">
                    <h3>${item.title}</h3>
                </div>
            </div>
        `).join('');
        
        // Lightbox
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                const lightbox = document.createElement('div');
                lightbox.style.position = 'fixed';
                lightbox.style.top = '0';
                lightbox.style.left = '0';
                lightbox.style.width = '100%';
                lightbox.style.height = '100%';
                lightbox.style.background = 'rgba(0,0,0,0.95)';
                lightbox.style.zIndex = '2000';
                lightbox.style.display = 'flex';
                lightbox.style.alignItems = 'center';
                lightbox.style.justifyContent = 'center';
                lightbox.style.cursor = 'pointer';
                lightbox.innerHTML = `<img src="${imgSrc}" style="max-width:90%; max-height:90%; border-radius:20px; box-shadow:0 0 30px rgba(0,0,0,0.5);">`;
                lightbox.addEventListener('click', () => lightbox.remove());
                document.body.appendChild(lightbox);
            });
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentDisplayCount = 6;
            renderGallery(currentFilter, currentDisplayCount);
            const loadMoreBtn = document.getElementById('load-more');
            if (loadMoreBtn) loadMoreBtn.style.display = 'inline-flex';
        });
    });

    renderGallery('all', 6);

    // Load More
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentDisplayCount += 6;
            renderGallery(currentFilter, currentDisplayCount);
            const filteredCount = currentFilter === 'all' ? galleryData.length : galleryData.filter(i => i.category === currentFilter).length;
            if (currentDisplayCount >= filteredCount) loadMoreBtn.style.display = 'none';
        });
    }

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

    // Scroll reveal animation
    const revealElements = document.querySelectorAll('.camera-service-card, .extra-camera-card, .gallery-item, .booking-content, .booking-image, .social-invite');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'all 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        observer.observe(el);
    });
});