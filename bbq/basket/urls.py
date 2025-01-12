from django.urls import path

from basket.apps import BasketConfig

app_name = BasketConfig.name
from django.urls import path
from . import views

urlpatterns = [
    path('add_to_cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('update_cart/<int:product_id>/', views.update_cart, name='update_cart'),
    path('remove_from_cart/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('cart/', views.cart_detail, name='cart_detail'),
    path('', views.product_list, name='product_list'),
    path('products/<int:product_id>/', views.product_detail, name='product_detail'),
    # ... other URL patterns ...

    path('checkout/', views.checkout, name='checkout'),
    path('show-checkout-form/', views.show_checkout_form, name='show_checkout_form'),  # Crucial
    # path('success/', views.success, name='success'),
    path('success_guest/', views.success_guest, name='success_guest'),
    path('about/', views.about, name='about'),
    path('yandex_f49a296cc9471a63', views.yandex, name='yandex_metrica'),
]