from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, 
    CartItemSerializer, OrderSerializer, UserSerializer
)
from basket.models import Category, Product, Cart, CartItem, Order
from authapp.models import CustomUser


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            products = Product.objects.filter(category_id=category_id)
        else:
            products = Product.objects.all()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]  # Allow any user, including unauthenticated
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Cart.objects.filter(user=self.request.user)
        else:
            # For guest users, try to get cart from session
            cart_id = self.request.session.get('cart_id')
            if cart_id:
                return Cart.objects.filter(id=cart_id)
            return Cart.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # For guest users, create a cart without a user
            cart = serializer.save(user=None)
            self.request.session['cart_id'] = cart.id
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        try:
            cart = self.get_object()
        except:
            # If no cart exists or user doesn't have permission to access it,
            # create a new cart
            cart = Cart.objects.create(user=request.user if request.user.is_authenticated else None)
            if not request.user.is_authenticated:
                request.session['cart_id'] = cart.id
        
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        cart.update_total_price()
        
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        try:
            cart = self.get_object()
        except:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response(
                {'error': 'Item ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            cart.update_total_price()
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def update_item(self, request, pk=None):
        try:
            cart = self.get_object()
        except:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        
        if not item_id or not quantity:
            return Response(
                {'error': 'Item ID and quantity are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response(
                    {'error': 'Quantity must be greater than 0'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'Quantity must be a number'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.quantity = quantity
            cart_item.save()
            cart.update_total_price()
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        try:
            cart = self.get_object()
        except:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        shipping_address = request.data.get('shipping_address')
        phone_number = request.data.get('phone_number')
        
        if not shipping_address or not phone_number:
            return Response(
                {'error': 'Shipping address and phone number are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create order items string
        order_items_string = ", ".join(
            [f"{item.product.name}: {item.quantity} шт" for item in cart.items.all()]
        )
        
        # Create order - set user to None for guest users
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            products=order_items_string,
            shipping_address=shipping_address,
            phone_number=phone_number,
            total_price=cart.total_price,
            status='pending'
        )
        
        # Clear cart
        cart.delete()
        
        # Clear cart_id from session for guest users
        if not request.user.is_authenticated and 'cart_id' in request.session:
            del request.session['cart_id']
        
        return Response(
            {'message': 'Order created successfully', 'order_id': order.id},
            status=status.HTTP_201_CREATED
        )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]  # Allow any user, including unauthenticated
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            # For authenticated users, return their orders
            return Order.objects.filter(user=self.request.user)
        else:
            # For guest users, return orders by phone number if provided
            phone_number = self.request.query_params.get('phone_number')
            if phone_number:
                return Order.objects.filter(phone_number=phone_number, user=None)
            return Order.objects.none()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
