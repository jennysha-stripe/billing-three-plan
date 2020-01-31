// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = Stripe('pk_test_TCWH81Eszey63xKHKnHMYeTW00Y6nY3yh4');
var elements = stripe.elements();


// Set up Stripe.js and Elements to use in checkout form
var style = {
  base: {
    color: "#32325d",
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#aab7c4"
    }
  },
  invalid: {
    color: "#fa755a",
    iconColor: "#fa755a"
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");

card.addEventListener('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

document.querySelector('#submit').addEventListener('click', function(evt) {
  evt.preventDefault();
  document.querySelector('button').disabled = true;
  // create the payment method using card details entered in Elements
  createPaymentMethod(stripe, card);
});

var createPaymentMethod = function(stripe, card) {

  // Create a token with the card details
  var cardholderEmail = document.querySelector('#email').value;
  var coupon = document.querySelector('#coupon').value;
  stripe
    .createPaymentMethod('card', card, {
      billing_details: {
        email: cardholderEmail
      }
    })
    .then(function(result) {
      if (result.error) {
        showError(result.error.message);
      } else {

        return fetch('/create-customer', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: cardholderEmail,
            payment_method: result.paymentMethod.id,
            plan: 'ent',
            coupon: coupon
          })
          });
        }
      })
    .then(function(result) {
      return result.json();
    })
    .then(function(subscription) {
      if (subscription.error) {
        // The card was declined by the bank
        // Show error and request new card
        showError(subscription.error);
      } else {
        handleSubscription(subscription);
      }
    });
};


function handleSubscription(subscription) {
  const { latest_invoice } = subscription;
  const { payment_intent } = latest_invoice;

  if (payment_intent) {
    const { client_secret, status } = payment_intent;

    if (status === 'requires_action' || status === 'requires_payment_method') {
      stripe.confirmCardPayment(client_secret).then(function(result) {
        if (result.error) {
          // Display error message in your UI.
          // The card was declined (i.e. insufficient funds, card has expired, etc)
          
          showError(result.error.message);
        } else {
          // Now that payment method is confirmed,
          // retrieve charge object from the subscription ID
          fetch('/charge-from-sid', {
            method: 'post',
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify({
              subscriptionId: subscription.id
            })
          })
            .then(function(response) {
              return response.json();
            })
            .then(function(charge) {
                displayCharge(charge);
            });
        }
      });
    } else {
      // No additional information was needed
      // Show a success message to your customer
      displayCharge(payment_intent.charges['data'][0]);
    }
  } else {
    displayCharge(subscription.latest_invoice['payment_intent']['charges']['data'][0]);
  }
}

/* Shows the success message, chargeid, and charge amount */
var displayCharge = function(charge) {
  var chargeJson = JSON.stringify(charge, null, 2);
  document.querySelectorAll('.payment-view').forEach(function(view) {
    view.classList.add('hidden');
  });
  document.querySelectorAll('.completed-view').forEach(function(view) {
    view.classList.remove('hidden');
  });
  document.querySelector('.order-amount').textContent = (parseFloat(charge.amount)/100).toFixed(2);
  document.querySelector('.order-charge').textContent = charge.id;
  document.querySelector('code').textContent = chargeJson;
};

/* Shows any error messages to the customer (declines, input errors, coupon errors) */
var showError = function(errorMsgText) {
  document.querySelector('button').disabled = false;
  var errorMsg = document.querySelector(".field-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function() {
    errorMsg.textContent = "";
  }, 10000);
};
