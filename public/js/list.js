document.addEventListener('DOMContentLoaded', () => {

    const handleAdd = async (button, endpoint) => {
        const figureId = button.getAttribute('data-id');
        try {
            const response = await fetch(`${endpoint}/${figureId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                button.disabled = true;
            } else {
                throw new Error('Request failed');
            }
        } catch (error) {
            console.error(`Error performing action on ${figureId}:`, error);
            button.disabled = false;
        }
    };

    document.querySelectorAll('.add-to-collection, .add-to-wishlist').forEach(button => {
        const endpoint = button.classList.contains('add-to-collection') ? '/addToCollection' : '/addToWishlist';
        button.addEventListener('click', () => handleAdd(button, endpoint));
    });
});