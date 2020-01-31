# Simple Billing Application

## Overview:
SASSYPRODUCTS is a simple SaaS product that is offering 50% off the first month to all new customers. The following is a description of the user flow:

**Home** 
1. User lands on “Home” to learn about each pricing plan.
2. User chooses a plan to navigate to the checkout page for that plan.

**Payment**

3. User enters email address, credit card information, and optional coupon code
4. User clicks “Subscribe Now”

**Confirmation**

5. User sees confirmation with amount of first charge, Stripe charge ID, and the charge object
 
## Stripe Products and APIs:
SAASYPRODUCT’s subscription management is built using Stripe’s Billing Product and APIs. To begin, I created a Product to represent the service. I then attached three Plans to the product that represent each of SAASYPRODUCT’s pricing plans. When creating the plans, I set the price and billing interval. You can create Products and Plans via the API or in the Dashboard. Because I was creating these plans once, I decided to create them in the Dashboard. 

Upon plan creation, plan IDs are generated that uniquely identify the plans so you can attach them to Customers. The association between a plan and a customer is a Subscription. 

## Approach:
To set up subscriptions on SAASYPRODUCT’s website, I followed the instructions in Stripe’s developer docs.  Here are the high-level steps for implementing this:

**Client Side**
1.    Setup Stripe Elements using Publishable API key and use Elements to create payment form
2.    Use createPaymentMethods to convert the payment information received in Elements to a PaymentMethod
3.    Send the PaymentMethod to the Server

**Server Side**:

4. Using the PaymentMethod received from Client, create a Customer using Stripe’s Secret Key. This attaches the credit card submitted as the default payment method method for the customer
5. To sign a Customer up for a Plan, create a Subscription using Stripe’s Secret Key. This will charge the customer’s default payment method at the beginning of each billing cycle. 
6. Send subscription information back to Client to display confirmation

![Billing Diagram](/Billing-diagram.png)

Stripe Elements made development very simple because of the pre-built UI components. Using Stripe Elements avoids bearing the burden of PCI compliance by not needing to handle the credit card data on my server and instead sending it directly to Stripe from the client. 

Using Stripe’s Billing product allows me to manage both the payment and subscription cycles all in Stripe. Stripe can automatically bill my customers and I can receive notifications to contact customers or take action on subscriptions if there is ever an issue with the payment. Leveraging Stripe Billing will also allow me to easily add features to my subscriptions (see Extensions section below for ideas). 

## Framework:
I picked Sinatra because I wanted a lightweight framework that would allow me to run a simple web application without spending too much time setting up the architecture.

## Extensions:
If I were to build a more robust version of this application, there are a few things I could add:
1. Free trials: For any of the plans, provide the user an option of having a free trial before paying for their first month.
2. Change plans: After a user selects a plan, provide a user the ability to sign in and change their plan. This would charge them the prorated amount according to their billing cycle. 
3. Stripe Invoicing: Use invoices to bill customers for services. This would allow me to add one time line items and even allow a customer to pay via check. 
4. Add new plan types: Allow customers to subscribe to multiple plans or select a usage based plan. 

