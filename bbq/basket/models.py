from django.db import models

from authapp.models import CustomUser


# Import User model


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    def __str__(self):
        return self.name



class   Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Added total price

    def __str__(self):
        if self.user:
            return f"Cart for user {self.user}"
        else:
            return "Guest Cart" # Indicate it's a guest cart

    def update_total_price(self):
        try:  # Important error handling
          total = sum(item.total_price for item in self.items.all())
          self.total_price = total
          self.save()
        except Exception as e:
          print(f"Error updating cart total price: {e}")

class CartItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def total_price(self):
        return self.product.price * self.quantity


class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    products = models.CharField(max_length=1024, null=True, blank=True)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Ожидается'),
        ('processing', 'В обработке'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменен'),
    ], default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def update_total_price(self):
        try:
            total = sum(item.total_price for item in self.items.all())
            self.total_price = total
            self.save()
        except Exception as e:
            print(f"Error updating order total price: {e}")

    def __str__(self):
      return f"Order #{self.id} for {self.user} ({self.status})"

