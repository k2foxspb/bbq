const incrementButtons = document.querySelectorAll('.increment');
const decrementButtons = document.querySelectorAll('.decrement');

decrementButtons.forEach(button => {
  button.addEventListener('click', function() {
    const quantity = parseInt(this.dataset.quantity);
    const productId = this.dataset.product;
    if (quantity > 1){
        updateQuantity(productId, quantity - 1);
    }

  });
});

incrementButtons.forEach(button => {
  button.addEventListener('click', function() {
    const quantity = parseInt(this.dataset.quantity);
    const productId = this.dataset.product;
    updateQuantity(productId, quantity + 1);
  });
});

function updateQuantity(productId, newQuantity) {
  const form = document.querySelector(`form[action$="/${productId}/"]`);

  const quantityInput = form.querySelector('input[name="new_quantity"]');

    quantityInput.value = newQuantity;

  form.submit();
}