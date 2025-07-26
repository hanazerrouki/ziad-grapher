
        document.addEventListener('DOMContentLoaded', function() {
            // Mobile Menu Toggle
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const navMenu = document.getElementById('nav-menu');
            
            mobileMenuBtn.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                mobileMenuBtn.innerHTML = navMenu.classList.contains('active') ? 
                    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
            
            // Close mobile menu when clicking on a link
            const navLinks = document.querySelectorAll('#nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
            
            // Header scroll effect
            const header = document.getElementById('header');
            
            window.addEventListener('scroll', function() {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
            
            // Hero Slider
            const slides = document.querySelectorAll('.slide');
            let currentSlide = 0;
            
            function nextSlide() {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }
            
            setInterval(nextSlide, 5000);
            
            // Portfolio Filter
            const filterBtns = document.querySelectorAll('.filter-btn');
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active class from all buttons
                    filterBtns.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    const filter = this.getAttribute('data-filter');
                    
                    portfolioItems.forEach(item => {
                        if (filter === 'all' || item.getAttribute('data-category') === filter) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
            
            // Testimonial Slider
            const testimonialSlides = document.querySelectorAll('.testimonial-slide');
            const testimonialDots = document.querySelectorAll('.testimonial-dot');
            let currentTestimonial = 0;
            
            function showTestimonial(index) {
                testimonialSlides.forEach(slide => slide.classList.remove('active'));
                testimonialDots.forEach(dot => dot.classList.remove('active'));
                
                testimonialSlides[index].classList.add('active');
                testimonialDots[index].classList.add('active');
                currentTestimonial = index;
            }
            
            testimonialDots.forEach((dot, index) => {
                dot.addEventListener('click', () => showTestimonial(index));
            });
            
            // Auto slide testimonials
            setInterval(() => {
                let nextTestimonial = (currentTestimonial + 1) % testimonialSlides.length;
                showTestimonial(nextTestimonial);
            }, 5000);
            
            // Back to Top Button
            const backToTopBtn = document.getElementById('backToTop');
            
            window.addEventListener('scroll', function() {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('active');
                } else {
                    backToTopBtn.classList.remove('active');
                }
            });
            
            backToTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Contact Form Submission
            const contactForm = document.getElementById('contactForm');
            
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Here you would typically send the form data to a server
                // For this example, we'll just show an alert
                alert('شكرًا لتواصلك معنا! سنرد عليك في أقرب وقت ممكن.');
                contactForm.reset();
            });
            
            // Animation on Scroll
            const animateElements = document.querySelectorAll('.about-img, .about-content, .contact-info, .contact-form');
            
            function checkAnimation() {
                animateElements.forEach(element => {
                    const elementPosition = element.getBoundingClientRect().top;
                    const windowHeight = window.innerHeight;
                    
                    if (elementPosition < windowHeight - 100) {
                        element.style.animationPlayState = 'running';
                    }
                });
            }
            
            window.addEventListener('scroll', checkAnimation);
            window.addEventListener('load', checkAnimation);
            
            // Language Switcher
            const langBtns = document.querySelectorAll('.lang-btn');
            
            langBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    langBtns.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // In a real implementation, this would change the language of the website
                    alert('سيتم تغيير اللغة إلى ' + this.textContent);
                });
            });
        });