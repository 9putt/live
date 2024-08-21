name: Generate Channel Info

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository content
        uses: actions/checkout@v3

      - name: Set up Node.js environment
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run generate_channel_info_updated.js script
        run: node generate_channel_info_updated.js

      - name: Upload generated channel_info.txt
        uses: actions/upload-artifact@v4
        with:
          name: channel_info.txt
          path: ./dist/channel_info.txt
