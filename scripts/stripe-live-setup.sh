#!/usr/bin/env bash
# Flips PrepareAI's Stripe integration to LIVE mode.
# Reads STRIPE_SECRET_KEY from .env (must be sk_live_...), then:
#   1. Validates the account can accept charges
#   2. Creates live Pro ($29/mo) and Enterprise ($99/mo) products + prices
#   3. Registers the live webhook for prepareai.co
#   4. Writes price IDs + webhook secret back into .env
# No secrets are printed. Run from the repo root: bash scripts/stripe-live-setup.sh
set -euo pipefail

SK=$(grep '^STRIPE_SECRET_KEY' .env | cut -d= -f2- | tr -d '"')

if [[ ! "$SK" == sk_live_* ]]; then
  echo "❌ STRIPE_SECRET_KEY in .env is not a live key (expected sk_live_...). Aborting."
  exit 1
fi

ACCT=$(curl -s https://api.stripe.com/v1/account -u "$SK:")
CHARGES=$(echo "$ACCT" | grep -oE '"charges_enabled": [a-z]*' | awk '{print $2}')
if [[ "$CHARGES" != "true" ]]; then
  echo "❌ Stripe account is not activated for live charges yet (charges_enabled=$CHARGES)."
  echo "   Complete activation at https://dashboard.stripe.com then re-run."
  exit 1
fi
echo "✅ Live account verified, charges enabled"

PRO_PRICE=$(curl -s https://api.stripe.com/v1/prices -u "$SK:" \
  -d "unit_amount=2900" -d "currency=usd" -d "recurring[interval]=month" \
  -d "product_data[name]=PrepareAI Pro" | grep -oE '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
ENT_PRICE=$(curl -s https://api.stripe.com/v1/prices -u "$SK:" \
  -d "unit_amount=9900" -d "currency=usd" -d "recurring[interval]=month" \
  -d "product_data[name]=PrepareAI Enterprise" | grep -oE '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Live prices created: $PRO_PRICE / $ENT_PRICE"

WH_JSON=$(curl -s https://api.stripe.com/v1/webhook_endpoints -u "$SK:" \
  -d "url=https://prepareai.co/api/stripe/webhook" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted")
WH_SECRET=$(echo "$WH_JSON" | grep -oE '"secret": "whsec_[^"]*"' | cut -d'"' -f4)
if [[ -z "$WH_SECRET" ]]; then
  echo "❌ Webhook creation failed"; exit 1
fi
echo "✅ Live webhook registered for prepareai.co"

sed -i "s|^STRIPE_PRO_PRICE_ID=.*|STRIPE_PRO_PRICE_ID=\"$PRO_PRICE\"|; s|^STRIPE_ENTERPRISE_PRICE_ID=.*|STRIPE_ENTERPRISE_PRICE_ID=\"$ENT_PRICE\"|; s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=\"$WH_SECRET\"|" .env
echo "✅ .env updated — deploy to go live: npx firebase-tools deploy --project prepareai-777"
