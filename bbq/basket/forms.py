from django import forms
from .models import Order

class OrderForm(forms.ModelForm):
    shipping_address = forms.CharField(max_length=255, required=True,
                                       widget=forms.TextInput(attrs={'placeholder': 'Адрес доставки'}))
    phone_number = forms.CharField(max_length=20, required=True,
                                   widget=forms.TextInput(attrs={'placeholder': 'Номер телефона'}))
    message = forms.CharField(widget=forms.Textarea(attrs={'paceholder': 'Дополнительная информация'}), required=False,)
    data_processing = forms.BooleanField(widget=forms.CheckboxInput(attrs={'placeholder': 'согласие на обработку данных'}), required=False)

    class Meta:
        model = Order
        fields = ['shipping_address', 'phone_number', 'message', 'data_processing']
        widgets = {'cart': forms.HiddenInput()}  # Consistent with Model


