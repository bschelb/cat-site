#!/bin/zsh
# Prompts for the site password (hidden), saves it to macOS Keychain and the GitHub secret.
read -s "?Choose the site password: " PW; echo
security add-generic-password -U -a "$USER" -s cat-site-password -w "$PW" && echo "Saved to Keychain (service: cat-site-password)"
printf %s "$PW" | gh secret set SITE_PASSWORD && echo "Saved to GitHub secret"
