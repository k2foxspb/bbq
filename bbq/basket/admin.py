from django.contrib import admin

from basket.models import Product, Order, Cart, CartItem, Category


# Register your models here.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields = ('product',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    search_fields = ('__all__',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    search_fields = ('__all__',)

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    search_fields = ('__all__',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ('__all__',)