import logging

from django.contrib import messages
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST

from .forms import OrderForm
from .models import Product, Cart, CartItem, Order
from .telegram import send_message


def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return render(request, 'product_detail.html', {'product': product})


def product_list(request):
    products = Product.objects.all()
    try:
        if request.user.is_authenticated:
            cart = Cart.objects.get(user=request.user)
        else:
            cart_id = request.session.get('cart_id')  # Check for session cart
            if cart_id is None:
                cart = Cart.objects.create()
                request.session['cart_id'] = cart.id
            else:
                cart = Cart.objects.get(id=cart_id)
    except Cart.DoesNotExist:
        # Handle case where a cart with the session ID does not exist.
        cart = Cart.objects.create()
        if request.user.is_authenticated:
            cart.user = request.user
            cart.save()
        request.session['cart_id'] = cart.id
    cart_items = cart.items.all()
    cart_count = sum(item.quantity for item in cart_items)
    # cart_count = request.session.get('cart_count', 0)
    return render(request, 'product_list.html', {'products': products, 'cart_count': cart_count})


def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            cart = Cart.objects.create(user=request.user)
            request.session['cart_id'] = cart.id
    else:
        try:
            cart_id = request.session.get('cart_id')
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            cart = Cart.objects.create()
            request.session['cart_id'] = cart.id

    try:
        cart_item = CartItem.objects.get(product=product, cart=cart)
        cart_item.quantity += 1
        cart_item.save()
    except CartItem.DoesNotExist:
        cart_item = CartItem.objects.create(product=product, cart=cart)
        cart_item.save()
    cart.update_total_price()
    cart_count = request.session.get('cart_count', 0)
    request.session['cart_count'] = cart_count + 1

    response = HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
    response['cart-count'] = str(cart_count)  # Add the cart count to the response headers

    return response


def update_cart(request, product_id):
    if request.method == 'POST':
        try:
            new_quantity = int(request.POST.get('new_quantity'))

            if new_quantity < 1:
                return redirect('basket:cart_detail')  # Redirect to cart if quantity is invalid.

            if request.user.is_authenticated:
                cart, _ = Cart.objects.get_or_create(user=request.user)
            else:
                # Get or create cart based on session if not logged in.
                cart_id = request.session.get('cart_id')
                if cart_id:
                    cart = Cart.objects.get(id=cart_id)
                else:
                    cart = Cart.objects.create(user=None)
                    request.session['cart_id'] = cart.id
            try:
                cart_item = CartItem.objects.get(product_id=product_id, cart=cart)
                cart_item.quantity = new_quantity
                cart_item.save()
                cart.update_total_price()
                return redirect('basket:cart_detail')
            except CartItem.DoesNotExist:
                # Handle the case where the cart item doesn't exist
                product = Product.objects.get(id=product_id)
                new_cart_item = CartItem(cart=cart, product=product, quantity=new_quantity)
                new_cart_item.save()
                cart.update_total_price()
                return redirect('basket:cart_detail')

        except (ValueError, Product.DoesNotExist) as e:  # Catch more specific errors
            print(f"Invalid input or product not found: {e}")
            return redirect('cart_detail')  # Redirect to cart detail page
    else:
        return redirect('basket:cart_detail')


def remove_from_cart(request, product_id):
    try:
        # Check if the user is logged in.
        if request.user.is_authenticated:
            cart = Cart.objects.get(user=request.user)  # Use .get for checking if user is authenticated
        else:
            # Guest User Handling (important)
            cart_id = request.session.get('cart_id')
            if not cart_id:
                return redirect('basket:cart_detail')  # Redirect to cart if no cart found for guest
            cart = Cart.objects.get(id=cart_id)

        cart_item = CartItem.objects.get(product_id=product_id, cart=cart)
        cart_item.delete()
        cart.update_total_price()  # Important: Update the cart total.
        return redirect('basket:cart_detail')
    except ObjectDoesNotExist:
        return redirect('basket:cart_detail')


def cart_detail(request):
    # Handle both logged-in and guest users
    try:
        if request.user.is_authenticated:
            cart = Cart.objects.get(user=request.user)
        else:
            cart_id = request.session.get('cart_id')  # Check for session cart
            if cart_id is None:
                cart = Cart.objects.create()
                request.session['cart_id'] = cart.id
            else:
                cart = Cart.objects.get(id=cart_id)
    except Cart.DoesNotExist:
        # Handle case where a cart with the session ID does not exist.
        cart = Cart.objects.create()
        if request.user.is_authenticated:
            cart.user = request.user
            cart.save()
        request.session['cart_id'] = cart.id

    cart_items = cart.items.all()
    total_price = sum(item.total_price for item in cart_items)

    return render(request, 'cart.html', {'cart_items': cart_items, 'total_price': total_price})


logger = logging.getLogger(__name__)


def show_checkout_form(request):
    try:
        # Check if a cart exists in the session.
        cart_id = request.session.get('cart_id')

        # If the cart_id exists and is valid, retrieve the cart.
        if cart_id:
            cart = Cart.objects.get(pk=cart_id)
        else:  # If no cart_id, create a new one for the logged-in user.
            if request.user.is_authenticated:
                try:
                    cart = Cart.objects.get(user=request.user)
                except Cart.DoesNotExist:
                    cart = Cart.objects.create(user=request.user)
                    request.session['cart_id'] = cart.id
            else:
                messages.error(request, "Ошибка: Корзина не найдена. Пожалуйста, добавьте товары в корзину.")
                return redirect('basket:cart_detail')  # Redirect to the cart page


    except Cart.DoesNotExist:
        messages.error(request, "Ошибка: Корзина не найдена. Пожалуйста, добавьте товары в корзину.")
        return redirect('basket:cart_detail')  # Redirect to the cart page

    if not cart.items.exists():
        messages.warning(request, "Ваша корзина пуста. Пожалуйста, добавьте товары.")
        return redirect('basket:cart_detail')

    form = OrderForm(initial={'cart': cart.id})
    return render(request, 'order.html', {'form': form})


@require_POST
def checkout(request):
    if request.method == 'POST':
        form = OrderForm(request.POST)
        if form.is_valid():
            try:
                cart = Cart.objects.get(pk=request.POST.get('cart'))
            except Cart.DoesNotExist:
                messages.error(request, "Ошибка: Корзина не найдена.")
                return redirect('basket:show_checkout_form')

            if not cart.items.exists():
                messages.error(request, "Ваша корзина пуста. Пожалуйста, добавьте товары.")
                return redirect('basket:show_checkout_form')
            cleaned_data = form.cleaned_data

            ord = str()
            for item in cart.items.all():
                ord += f'{item.product.name}: {item.quantity} шт || '
            print(ord)

            # Order.objects.create(user=request.user if request.user.is_authenticated else None,
            #                     products=ord,
            #                     status='pending',
            #                     total_price=cart.total_price,
            #                     shipping_address=cleaned_data.get('shipping_address', '').strip(),
            #                     phone_number=cleaned_data.get('phone_number', '').strip(),
            #                     )

            order = form.save(commit=False)

            order.user = request.user if request.user.is_authenticated else None
            order.products = ord  # Assign cart to Order

            order.shipping_address = cleaned_data.get('shipping_address', '').strip()
            order.phone_number = cleaned_data.get('phone_number', '').strip()
            order.total_price = cart.total_price
            order.status = 'Ожидается'  # Initialize status
            print(Order.objects.all())
            order.save()

            send_message(
               f'Имя: {order.user}\n'
               f'Номер заказа: {order.pk} '
               f'Телефон: {order.phone_number}\n'
               f'Адрес: {order.shipping_address}\n'
               f'заказ: {ord}\n'
               f'Общая сумма{cart.total_price}'
            )
            cart.delete()

            messages.success(request, "Ваш заказ успешно оформлен!")

            return redirect('basket:success_guest')

    return redirect('basket:show_checkout_form')


def success_guest(request):
    return render(request, 'success_order.html')
