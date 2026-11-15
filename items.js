const API_URL = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {

    // Φόρτωση δημοφιλών προϊόντων
    if (document.querySelector(".slideshow-container")) {
        showSlides(slideIndex);
        loadPopularProducts();
    }

    // Αυτόματη εναλλαγή διαφανειών κάθε 6 δευτερόλεπτα
        setInterval(() => {
            changeSlide(1);
        }, 6000);
    
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        // Φόρτωση όλων των προϊόντων αρχικά (κενή αναζήτηση)
        fetchProducts("");
        
        // Αλληλεπίδραση 1: Αναζήτηση καθώς ο χρήστης πληκτρολογεί
        searchInput.addEventListener("input", (e) => {
            fetchProducts(e.target.value);
        });
    }
});

// Συνάρτηση για κλήση του endpoint /search
async function fetchProducts(searchQuery) {
    // Στοιχεία DOM για εμφάνιση αποτελεσμάτων και μηνύματος "Δεν βρέθηκαν αποτελέσματα"
    const productsList = document.getElementById("products-list");
    const noResultsMsg = document.getElementById("no-results");
    
    // Εμφάνιση μηνύματος φόρτωσης
    try {
        const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(searchQuery)}`);
        const products = await response.json();
        
        // Εκαθάριση του loading message ή των προηγούμενων αποτελεσμάτων
        productsList.innerHTML = "";
        
        if (products.length === 0) {
            noResultsMsg.style.display = "block";
        } else {
            noResultsMsg.style.display = "none";
            // Δημιουργία HTML για κάθε προϊόν
            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.className = "product-card";
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="product-image clickable-image" onclick="addLike('${product._id}', this)">
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="product-price" style="font-weight:bold; color:var(--primary-color);">${product.price}€</span>
                            <div class="product-likes">
                                <span class="like-icon" onclick="addLike('${product._id}', this)">❤️</span>
                                <span class="likes-count">${product.likes}</span>
                            </div>
                        </div>
                    </div>
                `;
                productsList.appendChild(productCard);
            });
        }
    // Αν υπάρχει σφάλμα κατά την αναζήτηση, εμφανίζεται μήνυμα λάθους
    } catch (error) {
        console.error("Σφάλμα κατά την αναζήτηση:", error);
        productsList.innerHTML = "<p>Υπήρξε πρόβλημα με τη φόρτωση των προϊόντων.</p>";
    }
}

// Συνάρτηση για τα Likes (POST request to /like)
async function addLike(productId, element) {
    try {
        const response = await fetch(`${API_URL}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: productId })
        });
        
        if (response.ok) {
            // Αν γίνει like, βρες το στοιχείο στο οποίο έγινε κλικ και ενημέρωσε τον αριθμό των likes
            const card = element.closest('.product-card') || element.closest('.slide');
            if (card) {
                const likesCountElement = card.querySelector('.likes-count');
                if (likesCountElement) {
                    let currentLikes = parseInt(likesCountElement.innerText);
                    likesCountElement.innerText = currentLikes + 1;
                }
            }
            // Οπτικό εφέ επιτυχίας
            element.style.transform = "scale(1.2)";
            setTimeout(() => { element.style.transform = "scale(1)"; }, 200);
        }
    } catch (error) {
        console.error("Σφάλμα κατά την προσθήκη like:", error);
    }
}

let slideIndex = 1;

// Συνάρτηση για κλήση του endpoint /popular
async function loadPopularProducts() {
    try {
        const response = await fetch(`${API_URL}/popular`);
        const popularItems = await response.json();
        const slides = document.querySelectorAll('.slide');
        
        // Ενημέρωση των στατικών με τα πραγματικά δεδομένα
        popularItems.forEach((item, index) => {
            if (slides[index]) {
                const img = slides[index].querySelector('img');
                const title = slides[index].querySelector('h3');
                
                img.src = item.image;
                img.alt = item.name;
                // Προσθήκη onclick για like και στην αρχική σελίδα
                img.classList.add('clickable-image');
                img.setAttribute('onclick', `addLike('${item._id}', this)`);
                
                title.innerHTML = `${item.name} <br> <span style="font-size: 0.8em; font-weight: normal;"><span class="likes-count">${item.likes}</span> ❤️ Likes</span>`;
            }
        });
        
        // Αρχικοποίηση Slideshow
        showSlides(slideIndex);
        
    } catch (error) {
        console.error("Σφάλμα κατά τη φόρτωση δημοφιλών:", error);
    }
}

// Λογική Slideshow

// Συνάρτηση για αλλαγή διαφάνειας
function changeSlide(n) {
    showSlides(slideIndex += n);
}

// Συνάρτηση για μετάβαση σε συγκεκριμένη διαφάνεια
function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Συνάρτηση για εμφάνιση της τρέχουσας διαφάνειας και ενημέρωση των nav dots
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (!slides.length) return;
    
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none"; // Απόκρυψη όλων των διαφανειών
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", ""); // Αφαίρεση της κλάσης "active" από όλα τα nav dots
    }
    
    slides[slideIndex - 1].style.display = "block"; // Εμφάνιση της τρέχουσας διαφάνειας
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].className += " active"; // Προσθήκη της κλάσης "active" στο αντίστοιχο nav dot
    }
}