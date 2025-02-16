from uuid import uuid4

from django.db import models
from django.urls import reverse
from pytils.translit import slugify

from authapp.models import CustomUser


# Import User model
def unique_slugify(instance, slug):
    """
    Генератор уникальных SLUG для моделей, в случае существования такого SLUG.
    """
    model = instance.__class__
    unique_slug = slugify(slug)
    while model.objects.filter(slug=unique_slug).exists():
        unique_slug = f'{unique_slug}-{uuid4().hex[:8]}'
    return unique_slug



class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True,blank=True,)
    def __str__(self):
        return self.name
    def save(self, *args, **kwargs):
        """
        Сохранение полей модели при их отсутствии заполнения
        """
        if not self.slug:
            self.slug = unique_slugify(self, self.name)
        super().save(*args, **kwargs)



class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    gram = models.DecimalField(max_digits=10, decimal_places=0, null=True,blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True, related_name='products')

    def __str__(self):
        return self.name
    def get_absolute_url(self):
        return reverse('basket:product_detail', kwargs={'product_id': self.pk})


class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Added total price

    def __str__(self):
        if self.user:
            return f"Cart for user {self.user}"
        else:
            return "Guest Cart"  # Indicate it's a guest cart

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
