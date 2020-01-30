require 'sinatra'
require 'sinatra/reloader'
require 'stripe'

Stripe.api_key = 'sk_test_cnQSbFOy820LzLSGVlE9BLYI00h24a4UVr'
PLAN_PERSONAL = 'plan_GdxfhzB62adpRV'
PLAN_SMALL = 'plan_GdxgXimOAAphfg'
PLAN_ENT = 'plan_Gdxg0bGcFGq1fR'

get '/' do
  erb :index
end

get '/personal' do
  erb :personal
end

get '/small' do
  erb :small
end

get '/ent' do
  erb :ent
end

post '/create-customer' do
  puts "create-customer"
  content_type 'application/json'
  data = JSON.parse request.body.read
  begin
    # This creates a new Customer and attaches the PaymentMethod in one API call.
    customer = Stripe::Customer.create(
      payment_method: data['payment_method'],
      email: data['email'],
      invoice_settings: {
        default_payment_method: data['payment_method']
      }
    )
    # Decide what plan the customer should be subscribed to
    case data['plan']
    when 'personal'
      plan = PLAN_PERSONAL
    when 'small'
      plan = PLAN_SMALL
    else
      plan = PLAN_ENT
    end
    #if data['plan'] === 'personal'
    #  plan = ENV['PLAN_PERSONAL']
    subscription = Stripe::Subscription.create(
      customer: customer.id,
      items: [
        {
          plan: plan
        }
      ],
      #coupon: 'bxWVOEbQ',
      expand: ['latest_invoice.payment_intent']
    )
    subscription.to_json
  rescue Stripe::CardError => e
      # Handle "hard declines" e.g. insufficient funds, expired card, etc
      # See https://stripe.com/docs/declines/codes for more
      {
        error: e.message
      }.to_json
    end
end

post '/subscription' do
  puts "subscription"
  content_type 'application/json'
  data = JSON.parse request.body.read

  subscription = Stripe::Subscription.retrieve(data['subscriptionId'])
  subscription.to_json

  puts subscription
end

post '/charge-from-sid' do
  puts "charge-from-sid"
  content_type 'application/json'
  data = JSON.parse request.body.read

  subscription = Stripe::Subscription.retrieve(
    id: data['subscriptionId'],
    expand: ['latest_invoice.payment_intent']
  )
  charge = subscription['latest_invoice']['payment_intent']['charges']['data'][0]

  charge.to_json
end
