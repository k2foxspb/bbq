from django import forms
from .models import Order

class OrderForm(forms.ModelForm):
    shipping_address = forms.CharField(max_length=255, required=True,
                                       widget=forms.TextInput(attrs={'placeholder': 'Адрес доставки'}))
    phone_number = forms.CharField(max_length=20, required=True,
                                   widget=forms.TextInput(attrs={'placeholder': 'Номер телефона'}))

    class Meta:
        model = Order
        fields = ['shipping_address', 'phone_number']  # Important: 'cart' field
        widgets = {'cart': forms.HiddenInput()}  # Consistent with Model


